import { pushTarget, popTarget } from './dep.js'
import { queueWatcher } from './scheduler'
let id = 0
class Watcher {
    /* 
    一个watcher对应多个dep
    一个dep对应多个watcher
   */
    constructor(vm, expOrFn, callback, options) {
        this.vm = vm
        this.callback = callback
        this.options = options
        this.getter = expOrFn // 将内部传过来的回调函数 放到getter里
        this.id = id++
        this.depIds = new Set()
        this.deps = []
        this.get() // 调用get 执行渲染函数
    }
    addDep(dep) {
        let id = dep.id
        if (!this.depIds.has(id)) {
            // 如果这个dep 已经决定过这个watcher 不再重复决定
            // 不然会 读多少次数据 就收集多少次依赖 然后触发多少次更新
            // 所以watcher会记住dep的ID
            this.depIds.add(id)
            this.deps.push(dep)
            // 而dep也会记住watcher
            /* 
            dep和watcher的关系是M:N的关系
            这种实现方式，会让 dep 和 watcher 保持一种相对的关系：
            如果 watcher 中存过 dep；那么 dep 中一定存过 watcher ；
            如果 watcher 中没存过 dep；那么 dep 中一定没存过 watcher ；
            所以只需要判断一次，就能完成 dep 和 watcher 的查重；
            */
            dep.addSub(this)
        }
    }
    get() {
        pushTarget(this) // 把watcher存起来
        this.getter() // 渲染watch执行
        popTarget() // 移除watcher
    }
    update() {
        // 为了避免多次渲染 所以采用异步队列 只渲染一次
        queueWatcher(this)
    }
    run() {
        this.get()
    }
}

export default Watcher
