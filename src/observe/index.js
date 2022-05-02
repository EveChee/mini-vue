import arrayPrototype from './array'
import Dep from './dep'
class Observer {
    constructor(data) {
        // 如果有__ob__ 说明被观察过了
        Object.defineProperty(data, '__ob__', {
            value: this,
            // 不可枚举 解决死循环 不然一直会循环观察
            enumerable: false
        })
        this.dep = new Dep() // 这个dep单独给数组用
        if (Array.isArray(data)) {
            // 如果是数组遍历会浪费很多性能，很少会通过下标直接修改数组
            // 所以对数组的主要操作方法做劫持 所以修改数组的下标不会被监听
            data.__proto__ = arrayPrototype
            this.observeArray(data)
        } else {
            this.walk(data)
        }
    }

    walk(data) {
        // for in 会遍历原型链
        Object.keys(data).forEach((key) => defineReactive(data, key, data[key]))
    }

    observeArray(data) {
        data.forEach(observe)
    }
}
// 性能不好 所有的属性都被定义了一遍
function defineReactive(data, key, value) {
    let dep = new Dep() // 对象这样可以观察 但数组还需要另外处理
    /* 
    因为value可能是数组也可能是对象
    observe返回Observer的实例，当前这个value对于的Observer
    */
    const childOb = observe(value) // 深度劫持
    Object.defineProperty(data, key, {
        get() {
            // 获取值的时候做一些操作
            // 每个属性都对应自己的watcher
            if (Dep.target) {
                // 如果现在有watcher 把watcher存起来
                /* 
                比如先创建了  渲染A组件的watcher 然后Dep.target存的是A 
                然后 A里面访问了 p1,p2属性 那么此时就会把p1, p2添加到A的依赖里面去
                也就是p1,p2的subs里面添加了A  那么在p1,p2更新的时候 就会调用A的update方法
                */
                dep.depend()
                if (childOb) {
                    // 收集可能是数组的依赖 不做区分 因为已经有依赖去重
                    childOb.dep.depend()
                    /* 如果数组中还有数组 
                    如果数组里面是对象不用单独处理 
                    但是如果是多维数组 就要处理*/
                    if (Array.isArray(value)) {
                        // 数组的依赖
                        dependArray(value)
                    }
                }
            }
            return value
        },
        set(newValue) {
            if (newValue === value) return
            value = newValue
            observe(newValue) // 如果赋值是对象 也进行劫持
            dep.notify() // 通知依赖的watcher 进行更新操作
        }
    })
}
export function observe(data) {
    if (typeof data !== 'object' || data === null) return

    if (data.__ob__) return data

    // 区分是否是响应式对象
    return new Observer(data)
}

function dependArray(value) {
    value.forEach((_) => {
        // 把数组里面的每一个都取出来 数据变化后 也更新视图
        _.__ob__ && _.__ob__.dep.depend()
        Array.isArray(_) && dependArray(_)
    })
}
