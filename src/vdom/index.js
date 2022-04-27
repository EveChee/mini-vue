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
