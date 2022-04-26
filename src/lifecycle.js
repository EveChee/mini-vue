import { createElement, createTextNode } from './vdom/index'
import { patch } from './vdom/patch'
import { callHook, isObject } from './utils/index'
import Watcher from './observe/watcher'
export function lifeCycleMixin(Vue) {
    Vue.prototype._c = function () {
        return createElement(this,...arguments)
    }
    Vue.prototype._v = function () {
        return createTextNode(this,...arguments)
    }
    Vue.prototype._s = function (value) {
        // 将数据转换成符号
        return isObject(value) ? JSON.stringify(value) : value
    }
    Vue.prototype._render = function () {
        const vm = this
        const render = vm.$options.render
        let vnode = render.call(vm)
        return vnode
    }
    Vue.prototype._update = function (vnode) {
        const vm = this
        // 初始化渲染 后续更新也走patch
        vm.$el = patch(vm._vnode || vm.$el, vnode)
    }
}

export function mountComponent(vm, el) {
    // 实现页面的挂载流程
    vm.$el = el // 把el挂载到实例上

    const updateComponent = function () {
        // 调用生成的render函数 获取虚拟节点 -> 生成真实dom
        console.log('更新了')
        const vnode = vm._render()
        vm._update(vnode)
        vm._vnode = vnode
    }
    callHook(vm, 'beforeMount')
    // 如果数据变化 也调用这个函数重新执行
    // 观察者模式/..M,p;
    // true 标识渲染watcher
    new Watcher(vm, updateComponent, () => {}, true)
    // 渲染Watcher 数据变化 自动执行渲染流程
    callHook(vm, 'mounted')
}
