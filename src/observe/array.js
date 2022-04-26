const oldArrayPrototype = Array.prototype

const arrayPrototype = Object.create(oldArrayPrototype)

const methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']
methods.forEach((method) => {
    arrayPrototype[method] = function (...args) {
        // 调用原生数组方法
        const res = oldArrayPrototype[method].call(this, ...args)
        let inserted
        let ob = this.__ob__
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args
                break
            case 'splice':
                // [].splice(index, num, insert)
                inserted = args.slice(2)
            default:
                break
        }
        inserted && ob.observeArray(inserted) // 新增的属性继续观测
        ob.dep.notify() // 调用更新通知
        return res
    }
    
})

export default arrayPrototype
