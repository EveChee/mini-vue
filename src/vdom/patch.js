// 每次更新页面dom结构是不变的 只是数据在变化

function createElm(vnode) {
    let { tag, children, text } = vnode
    if (typeof tag === 'string') {
        // 实例化组件
        if (createComponent(vnode)) {
            return vnode.componentInstance.$el
        }
        // 元素
        vnode.el = document.createElement(tag)
        children &&
            children.forEach((child) => {
                vnode.el.appendChild(createElm(child))
            })
    } else {
        // 文本
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}

export function patch(oldVnode, vnode) {
    // oldVnode 旧的虚拟节点
    console.log(oldVnode, vnode)
    if (!oldVnode) {
        // 组件的创建 是没有老节点的
        // component.$mount( 这里是没有传节点的)
        // 所以直接创建
        return createElm(vnode)
    }
    // 是否真实dom
    const isRealElement = oldVnode.nodeType
    if (isRealElement) {
        const oldElm = oldVnode
        // 获取父节点  然后获取下一个节点作为参照物
        // 其实就是添加到当前父元素内的兄弟节点的前面
        const parentNode = oldElm.parentNode
        let el = createElm(vnode)
        parentNode.insertBefore(el, oldElm.nextSibling)
        parentNode.removeChild(oldElm)

        return el
    } else {
        // diff
    }
}

function createComponent(vnode) {
    // 初始化创建组件的实例
    let i = vnode.data
    if ((i = i.hook) && (i = i.init)) {
        i(vnode)
    }
    // 执行完后 如果有componentInstance说明是组件
    if (vnode.componentInstance) {
        return true
    }
}
function updatePropertiers(vnode) {
    let newProps = vnode.data || {}
    let el = vnode.el
    console.log(el, newProps)
    for (let key in newProps) {
        if (key === 'style') {
            for (let styleName in newProps.style) {
                el.style[styleName] = newProps.style[styleName]
            }
        } else if (key === 'class') {
            el.className = newProps.class
        } else {
            el.setAttribute(key, newProps[key])
        }
    }
}
