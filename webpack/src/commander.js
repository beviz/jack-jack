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

    source = _.omitBy(source, (value) => {
      return value === undefined || value === '' || value === null || value === NaN
    })

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
      env: this.env,
      shell: this.shell || false,
      windowsHide: true
    }, _.isUndefined)
  }

  async handleCascade(toRun) {
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

  async run(cascade = true) {
    if (this.running) {
      return
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
    if (cascade === true) {
      this.handleCascade(true)
    }

    this.processor.stdout.on('data', (data) => {
      this.info(data.toString().trim())
    })

    this.processor.stderr.on('data', (data) => {
      this.info(data.toString().trim())
    })

    this.processor.on('close', (code) => {
      this.running = false
      this.warning('exit')
    })

    this.processor.on('error', (code, signal) => {
      this.error(signal + code.toString())
    })
  }

  runOrStop() {
    if (!this.running) {
      this.run()
    } else {
      this.stop()
    }
  }

  async stop(cascade = true) {
    if (this.running && this.processor && !this.processor.killed) {
      this.processor.kill('SIGINT')
      if (cascade === true) {
        this.handleCascade(false)
      }
    }
  }

  log(content, type) {
    this.logs.push({ content, type: type })
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

  static get autoruns() {
    return _.filter(this.all, (commander) => {
      const config = _.compact(commander.autorun.toString().split(' '))
      return !!_.find(config, (one) => {
        return ['true', remote.process.platform].includes(one.toLowerCase())
      })
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
