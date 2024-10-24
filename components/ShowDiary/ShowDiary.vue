<template>
  <view
    v-html="content"
    class="s-container">
  </view>
</template>

<script setup>
import { watchEffect, computed, onMounted } from 'vue'
import MarkdownIt from '../../lib/index'
import {
  abbr_plugin,
  container_plugin,
  deflist_plugin,
  emoji_plugin,
  footnote_plugin,
  ins_plugin,
  ins_plugin$1,
  sub_plugin,
  sup_plugin
} from '../../utils/markdown-plugins'
let md = MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})
const mdInit = () => {
  md = md
    .use(abbr_plugin)
    .use(container_plugin, 'warning')
    .use(deflist_plugin)
    .use(emoji_plugin)
    .use(footnote_plugin)
    .use(ins_plugin$1)
    .use(ins_plugin)
    .use(sub_plugin)
    .use(sup_plugin)
  // Beautify output of parser for html content
  md.renderer.rules.table_open = function () {
    return '<table class="table table-striped">\n'
  }
  function injectLineNumbers(tokens, idx, options, env, slf) {
    let line
    if (tokens[idx].map && tokens[idx].level === 0) {
      line = tokens[idx].map[0]
      tokens[idx].attrJoin('class', 'line')
      tokens[idx].attrSet('data-line', String(line))
    }
    return slf.renderToken(tokens, idx, options, env, slf)
  }
  md.renderer.rules.paragraph_open = md.renderer.rules.heading_open = injectLineNumbers
}
onMounted(() => {
  mdInit()
})
const props = defineProps(['content'])
// const content = computed(() => marked.parse(props.content))
const content = computed(() => md.render(props.content))
console.log('content', content)
watchEffect(() => {
  console.log('effect:', content, props.content)
})
</script>

<style lang="less">
@import './index.less';
</style>
