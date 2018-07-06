import yaml from 'js-yaml'
import commander from './commander'

class Store {
  constructor(path) {
    this.path = path
  }

  readFile(path) {
    try {
      return yaml.safeLoad(fs.readFileSync(path, 'utf8')) || []
    } catch (e) {
      return []
    }
  }

  load() {
    return this.readDirectory(this.path)
  }

  write(data) {
    const text = yaml.safeDump(commands)
    fs.writeFileSync(this.path, text, (error) => {
      throw new Error(`保存数据到文件 ${this.path} 出错`)
    })
  }

  readDirectory(dirname) {
    const result = {}

    fs.readdirSync(dirname).forEach((filename) => {
      const path = [dirname, filename].join('/')
      const name = filename.replace(/\.[^/.]+$/, "")

      if (fs.lstatSync(path).isDirectory()) {
        _.assign(result, this.readDirectory(path))
      } else {
        const key = [dirname, name].join('/').substring(this.path.length + 1)
        result[key] = this.readFile(path)
      }
    })

    return result
  }
}

export default new Store(appConfig.commandsPath)

