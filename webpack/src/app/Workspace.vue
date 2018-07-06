<template>
  <div class='p-2 h-100 d-flex flex-column'>
    <header class='mb-2'>
      <h6 class='font-weight-normal font-italic mb-0' v-if="commander.name !== ''">
        <span v-if="">{{ commander.name }}</span>
        <br>
        <small>
          <span v-if="commander.mode" class='text-danger'>!{{ commander.mode }}</span>
          @{{ commander.filePath }}
          <span v-for="tag of commander.tagList">
            #{{ tag }}
          </span>
        </small>
      </h6>
      <p class='mb-0 mt-1 dir-command'>
        <code class="text-primary" @keydown.enter.prevent>{{ commander.dir }}</code>
        <small class='text-muted'>$</small>
        <code @keydown.enter.prevent="runOrStop(commander)" class='command'>{{ commander.command }}</code>
      </p>
    </header>
    <section class="small p-2 bg-dark border border-secondary rounded logger">
      <pre v-for="log of commander.logs"
           :class="{ 'text-white': log.type === 'info',
                     'text-warning': log.type === 'warning',
                     'text-danger': log.type === 'error' }" class='mb-0'>{{ log.content }}</pre>
    </section>
  </div>
</template>

<script>
  import Commander from '../commander'

  export default {
    props: ['commander'],
    methods: {
      runOrStop() {
        this.commander.runOrStop()
      }
    }
  }
</script>

<style lang='scss'>
  .logger {
     flex: 1;
     overflow-y: auto;
  }

  pre {
    white-space: pre-wrap !important;
    word-wrap: break-word !important;
    word-break: break-all !important;
  }

  .command-wrapper {
    line-height: 1em;

    .command {
      work-break: break-all;
    }
  }
</style>
