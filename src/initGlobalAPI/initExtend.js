import { mergeOptions } from '../utils/index'

export default function initExtend(Vue) {
    let id = 0
    Vue.extend = function (extendOptions) {
        const Sub = function VueComponent(options) {
            this._init(options)
            // 这里是组件和其他继承的起始点
        }
        Sub.cid = id++
        // 通过prototype create实现继承 但这种方法会改变Sub的构造函数指向
        Sub.prototype = Object.create(this.prototype)
        // 所以这里又把构造函数指回
        Sub.prototype.constructor = Sub
        Sub.options = mergeOptions(this.options, extendOptions)
        return Sub
    }
}
