import initMixin from './init'
import { lifeCycleMixin } from './lifecycle'
import { initGlobalAPI } from './initGlobalAPI/index'
export default function Vue(options) {
    this._init(options)
}

initMixin(Vue)
lifeCycleMixin(Vue)
initGlobalAPI(Vue)
