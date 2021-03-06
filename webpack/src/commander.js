import osHomedir from 'os-homedir'
import store from './store'
import vue from './vue'

export default class Commander {
  static _running = []

  constructor(source, additional) {
    const defaults = {
      tags: '',
      dir: '~',
      env: null,
      autorun: false,
      shell: null,
      encoding: null,
      filePath: ''
    }

    source = _.omitBy(source, (value) => _.trim(value) === '' )

    _.assign(this, defaults, source, additional, {
      processor: null,
      logs: [],
      running: false,
      source: source
    })

    this.tags = this.tags.toLowerCase()
  }

  get valid() {
    return !(_.isEmpty(this.name) || _.isEmpty(this.command))
  }

  get tagList() {
    return _.compact(this.tags.split(' '))
  }

  get implicitTagList() {
    const filePathTags = this.filePath.toLowerCase().split('/')
    const extraTags = [this.running ? 'running' : '']

    return _.compact(filePathTags.concat(extraTags))
  }

  addSwitchCallback(callback) {
    this.switchCallbacks.push(callback)
  }

  hasTag(tag) {
    if (_.isEmpty(tag)) {
      return true
    }

    tag = tag.toLowerCase()
    const unionTags = this.tagList.concat(this.implicitTagList)
    return !!_.find(unionTags, (t) => t.startsWith(tag))
  }

  static get first() {
    return Commander.all[0]
  }

  static filter(keywords) {
    const result = Commander.all
    const formatedKeywords = keywords.trim().toLowerCase().split(' ')

    if (!formatedKeywords.length) {
      return result
    }

    Commander.all.forEach((commander) => {
      formatedKeywords.forEach((keyword) => {
        if (keyword.startsWith('#')) {
          if (!commander.hasTag(keyword.slice(1))) {
            _.remove(result, commander)
          }
        } else {
          if (!commander.queriableString.includes(keyword)) {
            _.remove(result, commander)
          }
        }
      })
    })

    return result
  }

  get queriableString() {
    return [this.command, this.name, this.tags].join(' ').toLowerCase()
  }

  get commandOptions() {
    return _.omit({
      cwd: this.dir.replace(/^~/, Commander.homeDir),
      env: remote.process.env,
      shell: this.shell || false,
      windowsHide: true
    }, _.isUndefined)
  }

  handleCascade(toRun) {
    if (_.isEmpty(this.mode)) {
      return
    }

    const cascade = _.filter(Commander.all, (commander) => {
      return commander !== this && commander.filePath === this.filePath
    })

    switch(this.mode) {
      case 'union':
        cascade.forEach((commander) => {
          toRun ? commander.run(false) : commander.stop(false)
        })
        break
      case 'conflict':
        if (toRun) {
          cascade.forEach((commander) => {
            commander.stop(false)
          })
        }
    }
  }

  run(cascade = true) {
    if (this.running) {
      return
    }

    if (cascade === true) {
      this.handleCascade(true)
    }

    this.clearLogs()

    const commandOptions = this.commandOptions
    if (!Commander.isDirectory(commandOptions.cwd)) {
      return this.error(`${commandOptions.cwd} is not a valid directory`)
    }

    const args = _.compact(this.command.split(' '))
    const file = args.shift()
    this.processor = ChildProcess.spawn(file, args, commandOptions)
    this.running = true
    this.handleProcessorLog()
  }

  handleProcessorLog() {
    this.processor.stdout.setEncoding('utf8')
    this.processor.stdout.on('data', (data) => {
      this.info(data.toString().trim())
    })

    this.processor.stderr.setEncoding('utf8')
    this.processor.stderr.on('data', (data) => {
      this.info(data.toString().trim())
    })

    this.processor.on('close', (code) => {
      this.running = false
      this.warning('exit')
    })

    this.processor.on('error', (code, signal) => {
      this.error(code.toString())
    })
  }

  runOrStop() {
    if (!this.running) {
      this.run()
    } else {
      this.stop()
    }
  }

  stop(cascade = true) {
    if (this.running && this.processor && !this.processor.killed) {
      this.processor.kill('SIGINT')
      if (cascade === true) {
        this.handleCascade(false)
      }
    }
  }

  log(content, type) {
    this.logs.push({ content, type: type })
    this.logs.splice(0, this.logs.length - 300)
  }

  clearLogs() {
    this.logs = []
  }

  info(content) {
    this.log(content, 'info')
  }

  error(content) {
    this.log(content, 'error')
  }

  warning(content) {
    this.log(content, 'warning')
  }


  static get homeDir() {
    return remote.app.getPath('home')
  }

  static get tags() {
    let tags = []

    _.each(Commander.all, (one) => {
      tags = tags.concat(one.tags.split(' '))
    })

    _.uniqBy(tags, (tag) => {
      return tag
    })

    return tags
  }

  static get running() {
    return this._running.slice()
  }

  // static find(name) {
  //   return _.find(this.all, (o) => {
  //     return o.name == name
  //   })
  // }

  static get all() {
    if (!this._all) {
      const data = store.load()
      this._all = []
      _.each(data, (config, filePath) => {
        if (!Commander.inSpecityPlatforms(config.platform)) {
          return
        }

        (config.commands || []).forEach((source) => {
          const additional = _.omitBy({
            dir: source.dir || config.dir,
            mode: config.mode,
            filePath
          }, _.isEmpty)

          const command = new Commander(source, additional)

          this._all.push(command)
        })
      })
    }

    return this._all.slice()
  }

  static inSpecityPlatforms(platform) {
    const platforms = _.compact(_.trim(platform).split(' '))
    if (platforms.length === 0) {
      return true
    }
    return !!_.find(platforms, (platform) => {
      return ['all', remote.process.platform].includes(platform.toLowerCase())
    })
  }

  static get autoruns() {
    return _.filter(this.all, (commander) => {
      return Commander.inSpecityPlatforms(commander.autorun)
    })
  }

  static isDirectory(path) {
    if (!fs.existsSync(path)) {
      return false
    }
    return fs.lstatSync(path).isDirectory()
  }

  static get running() {
    return _.filter(this.all, (commander) => commander.running)
  }

  static stopAll() {
    this.running.forEach(function(commander) {
      commander.stop()
    })
  }
}
