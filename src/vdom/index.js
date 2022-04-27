import { isObject, isReservedTag } from '../utils/index'

export function createElement(vm, tag, data = {}, ...children) {
    let key = data.key
    if (key) {
        delete data.key
    }
    // 要处理原生标签 还要处理组件 名字上下文
    if (isReservedTag(tag)) {
        // 如果是原生标签 直接走创建流程
        return vnode(tag, data, children, key, undefined)
    } else {
        // 组件
        const component = vm.$options.components[tag]

        return createComponent(vm, tag, data, key, children, component)
    }
}

function createComponent(vm, tag, data, key, children, Ctor) {
    /* 
    自定义组件的创建过程梳理：
    首先是获取组件的options 也就是 components:{
        a: {
            template: xxx,
            data: xxx,
            xxx
            这里就是组件的options
        }
    }
    然后再进入extend函数获取一个组件的构造函数  
    里面会把组件的options放在该继承于Vue的构造函数上
    由于Object.create的指向问题所以会把构造函数重新指回到该新建的构造函数上 
    这样就不会和原Vue混淆
    然后再执行_init函数进入模板编译和vnode的创建过程
    而创建了组件的实例之后，就会调用$mount函数生成真实dom
    然后把真实的dom append到正在创建的外部载体作为子元素的一员添加进去
    */
    if (isObject(Ctor)) {
        Ctor = vm.$options._base.extend(Ctor)
    }
    /* 
    组件严格说是没有孩子节点的，这里叫插槽 而不是做子节点处理
    */
    data.hook = {
        init(vnode) {
            // 当前组件的实例就是 componentInstance
            const child = (vnode.componentInstance = new Ctor({
                _isComponent: true
            }))
            console.log(988, child, Ctor)
            // 组件的挂载
            child.$mount()
        }
    }
    return vnode(
        `vue-component-${Ctor.cid}-${tag}`,
        data,
        undefined,
        key,
        undefined,
        {
            Ctor,
            children
        }
    )
}

export function createTextNode(text) {
    return vnode(undefined, undefined, undefined, undefined, text)
}

function vnode(tag, data, children, key, text, componentOptions) {
    return {
        tag,
        data,
        children,
        key,
        text,
        componentOptions
    }
}
