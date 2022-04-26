import { observe } from './observe/index'

export function initState(vm) {
    const options = vm.$options

    // 实现计算属性 watcher props methods
    if (options.data) {
        initData(vm)
    }
}

function initData(vm) {
    let data = vm.$options.data
    data = vm._data = typeof data === 'function' ? data.call(vm) : data
    // 将data转换成响应式的对象 属性劫持 defineProperty
    observe(data)

    // 直接通过vm.xxx 访问属性
    for (let key in data) {
        proxy(vm, '_data', key)
    }
}

function proxy(vm, source, key) {
    Object.defineProperty(vm, key, {
        get() {
            return vm[source][key]
        },
        set(newValue) {
            vm[source][key] = newValue
        }
    })
}
