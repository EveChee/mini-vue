import { initState } from './state'
import { compileToFunction } from './compiler/index'
import { mountComponent } from './lifecycle'
import { mergeOptions, callHook } from './utils/index'
import { nextTick } from './utils/next-tick'
export default function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        const vm = this
        vm.$options = mergeOptions(vm.constructor.options, options)
        // 后续所有的扩展都有$options可以获取用户的所有选项

        // 对于实例的数据源 props data methods computed watch 处理
        // props data
        callHook(vm, 'beforeCreate')
        initState(vm)
        callHook(vm, 'created')
        // 初始化状态完毕之后 进行页面挂载
        if (vm.$options.el) {
            vm.$mount(vm.$options.el)
        }
    }
    Vue.prototype.$mount = function (el) {
        const vm = this
        el = document.querySelector(el)
        const options = vm.$options
        if (!options.render) {
            let template = options.template
            if (!template) {
                template = el.outerHTML
            }
            // 将template转换成render函数
            // 创建render => 虚拟dom => 渲染真实dom
            const render = compileToFunction(template) // 开始编译
            options.render = render
        }
        mountComponent(vm, el)
    }
    Vue.prototype.$nextTick = nextTick
    // diff算法 主要是两个虚拟节点的比对 需要根据模板渲染出一个render函数,
    // render创建并返回一个虚拟节点，数据更新则重新调用render 创建新的虚拟节点
}
