<template>
  <div data-controller='exec' class='h-100' style='overflow: hidden'>
    <div class="row h-100">
      <div class="col-auto h-100 pr-0" data-controller='sidebar' style='width: 240px overflow: auto'>
        <Sidebar @switch="switchTo"/>
      </div>
      <div class="col h-100 pl-0">
        <Workspace :commander='commander'/>
      </div>
    </div>
  </div>
</template>

<script>
  import Commander from '../commander'
  import Sidebar from './Sidebar.vue'
  import Workspace from './Workspace.vue'
  import YAML from 'js-yaml'

  export default {
    name: 'App',
    components: {
      Sidebar,
      Workspace
    },
    data() {
      return {
        commander: new Commander({})
      }
    },
    created() {
      if (!this.checkDataSource()) {
        return
      }
      this.handleUnload()
    },
    methods: {
      checkDataSource() {
        const commanders = Commander.all
        let error = null

        if (!commanders.length) {
           error = 'No commander configured, please check.'
        } else {
          const invalid = _.find(commanders, (commander) => !commander.valid)
          if (invalid) {
            const source = YAML.dump(invalid.source)
            error = `Invalid config, please check below: \n---\n${source}`
          }
        }

        if (error) {
          alert(error)
          remote.getCurrentWindow().close()
        }

        return !error
      },

      handleUnload() {
        let closable = false

        window.onbeforeunload = (event) => {
          const runningCommanders = Commander.running
          if (runningCommanders.length) {
            setTimeout(function() {
              if (closable === true) {
                return
              }
              if (confirm(`${runningCommanders.length} processes will be exited, are you sure?`)) {
                Commander.stopAll()

                closable = true
                remote.getCurrentWindow().close()
              }
            })

            if (closable === false) {
              event.returnValue = closable
            }
          }
        }

        remote.getCurrentWindow().on('reload', function() {
          const runningCommanders = Commander.running
          if (runningCommanders.length) {
            if (confirm(`${runningCommanders.length} processes will be exited, are you sure?`)) {
              Commander.stopAll()
            } else {
              return false
            }
          }

          remote.getCurrentWindow().reload()
        })
      },
      switchTo(commander) {
        this.commander = commander
      }
    }
  }
</script>
