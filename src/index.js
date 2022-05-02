import initMixin from './init'
import { lifeCycleMixin } from './lifecycle'
import { initGlobalAPI } from './initGlobalAPI/index'
export default function Vue(options) {
    this._init(options)
}

initMixin(Vue)
lifeCycleMixin(Vue)
initGlobalAPI(Vue)
/* 
Vue全流程简述
从new Vue进来  初始化实例中 拿到options也就是传进来的配置
然后把配置项和原型内置的配置项进行合并
比如内置了生命周期的合并  _base的原始构造函数 
在合并策略里面 会把钩子函数合并成数组执行
然后在创建之前执行beforeCreate
在初始化State 进行属性的劫持 
在Observer里面首先区分是否观察过
然后创建一个Dep(每个观察的数据都有)
然后区分数组和对象进行分别劫持
对象的劫持采用Object.defineProperty
数组的劫持采用改写数组原型方法的方式进行监听
然后在劫持里面get的时候查看是否Dep.target是否存在  也就是是否有渲染或者依赖的Watcher
如果有  就把当前这个数据添加到Dep.target的deps中 直白的理解就是
这个数据更新了 就会通知到这个Dep.target对应的Watcher进行更新从而达到响应式
然后就是对数据的深度监听
再在set里面对新设置的数据也设置响应式劫持
劫持完数据之后 就执行created钩子 这也是为什么在这个钩子之后我们可以拿到data的原因
最后在判断是否有el 如果有 就自动挂载
挂载里面会先判断render然后是template 再是el.outerHTML
然后是进行模板编译 
先转换成AST
里面进行一个递进式操作，每次匹配完删除匹配到的字符串
从开始标签 开始匹配  拿到开始标签 然后匹配里面的属性 
匹配到之后就入栈 然后进行递归匹配  下一个栈的父节点就是上一个栈
匹配完之后 最后就匹配结束标签
然后一个个出栈
生成了AST
然后根据AST动态生成字符串代码
对tag，属性，内容 都进行对应的函数拼接
然后递归子元素进行拼接  各指令 属性 标签的创建 文本的创建 都有对应的函数
然后拼接出来的代码字符串放到with注入的一个字符串下面 最后进行new Function执行
而通过with改变了this的指向
所以在模板内部的直接访问data是就相当于在当前实例下访问
*/