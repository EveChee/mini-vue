const unicodeRegExp =
    /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/
// 匹配属性
const attribute =
    /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const dynamicArgAttribute =
    /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
// 用来描述标签
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp.source}]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
// 标签开头的匹配 捕获的内容是标签名
const startTagOpen = new RegExp(`^<${qnameCapture}`)
// 匹配结束>
const startTagClose = /^\s*(\/?)>/
// 捕获结尾标签
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)




export function parseHTML(html) {
  function advance(n) {
      html = html.substring(n) // 根据每次传入的长度截取字符串
  }
  let root // 树的操作 根据开始和结束标签生成一个树
  // 使用栈构建父子关系
  const stack = []

  function createASTElement(tag, attrs) {
      return {
          tag,
          type: 1,
          attrs,
          children: [],
          parent: null
      }
  }

  function start(tagName, attrs) {
      console.log('开始标签', tagName, attrs)
      const element = createASTElement(tagName, attrs)
      if (!root) root = element
      const parent = stack[stack.length - 1] // 栈顶
      if (parent) {
          element.parent = parent
          parent.children.push(element)
      }
      stack.push(element)
  }
  function end(tagName) {
      console.log('结束标签', tagName)
      stack.pop()
  }
  function chars(text) {
      console.log('文本标签', text)
      text = text.replace(/\s/g, '')
      if (text) {
          let parent = stack[stack.length - 1]
          parent.children.push({
              type: 3,
              text
          })
      }
  }
  while (html) {
      let textEnd = html.indexOf('<')
      if (textEnd === 0) {
          // 解析开始标签 {tag: 'div', attrs: [{name:'id', vlaue: 'app'}]}
          const startTagMatch = parseStartTag()
          if (startTagMatch) {
              start(startTagMatch.tagName, startTagMatch.attrs)
              continue
          }
          let matched
          if ((matched = html.match(endTag))) {
              end(matched[1])
              advance(matched[0].length)
              continue
          }
      }
      let text
      if (textEnd > 0) {
          text = html.substring(0, textEnd)
      }
      if (text) {
          advance(text.length)
          chars(text)
      }
  }
  console.log(111, root)

  function parseStartTag() {
      const matched = html.match(startTagOpen)
      if (matched) {
          const match = {
              tagName: matched[1],
              attrs: []
          }
          advance(matched[0].length)
          console.log(html)
          let end, attr
          // 没有匹配到结束标签，就一直匹配 然后获取中间的属性
          while (
              !(end = html.match(startTagClose)) &&
              (attr = html.match(attribute))
          ) {
              match.attrs.push({
                  name: attr[1],
                  value: attr[3] || attr[4] || attr[5] || true
              })
              advance(attr[0].length)
          }
          end && advance(end[0].length)
          return match
      }
  }

  return root
}
