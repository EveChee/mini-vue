let id = 0
export default class Dep {
  /* 
  其实就是一个决定集合
  就是 A依赖了B  所以B的更新 会导致A的更新 称作A依赖于B B决定A
  subs里面就是所有当前dep决定的对象
  */
    constructor() {
        this.id = id++
        this.subs = []
    }
    target = null
    addSub(watcher) {
        this.subs.push(watcher)
    }
    depend() {
        // 观察者模式
        // 让watcher记住当前这个dep 阻止重复依赖
        Dep.target.addDep(this)
    }
    notify() {
        this.subs.forEach((watcher) => watcher.update())
    }
}
const stack = []
export function pushTarget(watcher) {
    Dep.target = watcher
    stack.push(watcher)
}

export function popTarget() {
    stack.pop()
    Dep.target = stack[stack.length - 1]
}
