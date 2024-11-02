<template>
  <view
    v-html="content"
    class="s-container">
  </view>
</template>

<script setup>
import { watchEffect, computed, onMounted } from 'vue'
import MarkdownIt from '../../lib/markdown-it/index'
//引入样式
import 'highlight.js/styles/github.min.css'
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
// import hljs from '../../lib/highlight.js/es/index.js' // https://highlightjs.org
import hljs from 'highlight.js'
// Actual default values
let md = MarkdownIt({
	html: true,
	linkify: true,
	typographer: true,
  highlight: function (str, lang) {
	  console.log('highlight',str,lang,lang && hljs.getLanguage(lang))
	 
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre><code class="hljs">' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>';
      } catch (__) {}
    }

    return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
  }
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
// console.log('content', content)
// watchEffect(() => {
//   console.log('effect:', content, props.content)
// })
</script>

<style lang="less" scoped>
@import './index.less';
</style>
