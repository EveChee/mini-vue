import { parseHTML } from './parser-html'
import { genCode } from './generate'

export function compileToFunction(template) {
    // 将template转换成AST语法树 -> 再把语法树转换成字符串拼接
    // ast是用来描述语言本身的
    // vdom是描述dom结构的

    let ast = parseHTML(template)
    let code = genCode(ast)
    const render = new Function(`with(this) { return ${code} }`)
    return render
}
