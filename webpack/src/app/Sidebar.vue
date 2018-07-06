<template>
  <div class="sidebar card h-100 rounded-0">
    <div class="card-header p-2">
      <input type="text" class="form-control form-control-sm" v-model='filterKeywords' autofocus>
    </div>
    <ul class='list-group list-group-flush'>
      <li class='list-group-item p-0 commander'
          v-for="commander of listingCommanders"
          :class="{ 'bg-light': activeCommander == commander }">
        <div class="px-2 py-1" @click="switchTo(commander)">
          <div class="row">
            <div class="col text-truncate">
              <small class='align-middle'
                v-if="commander.name !== ''"
                :title='commander.name'>{{ commander.name }}</small>
            </div>
            <div class="action-trigger col-auto"
                 :class="{ 'invisible': !commander.running && activeCommander != commander }">
              <a @click="runOrStop(commander)" href='#'
                 :class="{ 'text-danger': commander.running }">
                <font-awesome-icon :icon="commander.running ? 'stop-circle' : 'play-circle'" />
              </a>
            </div>
          </div>
          <div class='text-truncate' :title='commander.tags'>
            <small v-for="tag of commander.tagList" class='text-muted'>
              #{{ tag }}
            </small>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
  import Commander from '../commander'

  export default {
    data() {
      return {
        filterKeywords: '',
        activeCommander: new Commander()
      }
    },

    mounted() {
      this.switchTo(this.listingCommanders[0])
      this.autorun()
    },

    methods: {
      switchTo(commander) {
        this.activeCommander = commander
        this.$emit('switch', commander)
      },
      runOrStop(commander) {
        commander.runOrStop()
      },
      autorun() {
        Commander.autoruns.forEach((commander) => {
          commander.run()
        })
      }
    },
    computed: {
      listingCommanders() {
        return Commander.filter(this.filterKeywords)
      }
    }
  }
</script>

<style lang='scss'>
.sidebar {
  border-width: 0 1px 0 0 !important;

  .list-group {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }
}

.commander:hover .action-trigger {
  visibility: visible !important;
}
</style>
