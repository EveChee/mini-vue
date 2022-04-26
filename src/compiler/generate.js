// 双括号表达式
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
const doctype = /^<!DOCTYPE [^>]+>/i
// #7298: escape - to avoid being passed as HTML comment when inlined in page
const comment = /^<!\--/
const conditionalComment = /^<!\[/
function gen(node) {
    // 这里的Node其实就是ast
    if (node.type === 1) {
        return genCode(node)
    } else {
        let text = node.text
        if (!defaultTagRE.test(text)) {
            return `_v(${node.text})` // 没有表达式
        } else {
            let tokens = []
            let match
            // exec 全局匹配有一个LastInedx 问题 会从上一次之后的位置开始 所以需要重置
            let startIndex = (defaultTagRE.lastIndex = 0)
            while ((match = defaultTagRE.exec(text))) {
                // 匹配到索引 abc {{aa}} {{bb}} cd
                let endIndex = match.index

                if (endIndex > startIndex) {
                    // 常规字符串
                    tokens.push(
                        JSON.stringify(text.slice(startIndex, endIndex))
                    )
                }
                // 变量
                tokens.push(`_s(${match[1].trim()})`)
                startIndex = endIndex + match[0].length
                if (endIndex < text.length) {
                    // ???
                    tokens.push(JSON.stringify(text.slice(startIndex)))
                }
            }
            // 把静态字符串和动态变量拼接
            return `_v(${tokens.join('+')})`
        }
    }
}

function genChildren(ast) {
    const children = ast.children
    return children.map((child) => gen(child)).join(',')
}
function genProps(attrs) {
    let str = ''
    attrs.forEach((attr) => {
        if (attr.name === 'style') {
            let obj = {}
            attr.value.split(';').forEach((_) => {
                let [key, value] = _.split(':')
                obj[key] = value
            })
            // .reduce((pre, cur) => {
            //     let [key, value] = cur.split(':')
            //     pre[key] = value
            //     return obj
            // }, obj)
            attr.value = obj
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`
    })
    return `{${str.slice(0, -1)}}`
}
export function genCode(ast) {
    // 字符串拼接
    let code
    code = `_c('${ast.tag}',${
        ast.attrs.length ? genProps(ast.attrs) : 'undefined'
    }${ast.children ? ',' + genChildren(ast) : ''})`
    return code
}
