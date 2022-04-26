import initMixin from './mixin'
import initAssetsRegisters, { ASSETS_TYPE } from './assets'
import initExtend from './initExtend'

export function initGlobalAPI(Vue) {
    // 整合所有全局相关的内容
    Vue.options = {}
    // 生命周期的合并策略 会合并成一个数组执行
    initMixin(Vue)

    
    // 保存Vue的构造函数
    Vue.options._base = Vue
    // 注册extend
    initExtend(Vue)
    initAssetsRegisters(Vue)
}
