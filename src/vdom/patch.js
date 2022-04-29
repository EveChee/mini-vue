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
        /* 
        vue diff的特点是平级对比，因为父子互换或跨级操作的情况很少 所以忽略减少复杂度
        
        */
        console.log(33333, oldVnode.tag, vnode.tag)
        if (oldVnode.tag !== vnode.tag) {
            // 标签不一致 直接替换
            oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el)
        }
        if (!oldVnode.tag) {
            // 文本对比 因为文本没有tag
            if (oldVnode.text !== vnode.text) {
                // 新老文本不一致
                oldVnode.el.textContent = vnode.text
            }
        }
        // 说明标签一致 且不是文本
        let el = (vnode.el = oldVnode.el)
        updatePropertiers(vnode, oldVnode.data)

        // 然后比对子元素
        let oldChildren = oldVnode.children || []
        let children = vnode.children || []
        let oldChLen = oldChildren.length
        let chLen = children.length
        if (oldChLen && chLen) {
            // 说明新老节点都有子元素 需要详细比对
            updateChildren(el, oldChildren, children)
        } else if (chLen) {
            // 如果只有新节点有子元素 则直接创建
            for (let i = 0; i < chLen; i++) {
                el.appendChild(createElm(children[i]))
            }
        } else {
            // 如果只有老节点有子元素 则删除
            // for (let i = 0; i < oldChLen; i++) {
            //     el.removeChild(oldChildren[i].el)
            // }
            el.innerHTML = ''
        }
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
function updatePropertiers(vnode, oldProps = {}) {
    let newProps = vnode.data || {}
    let el = vnode.el

    let newStyle = newProps.style || {}
    let oldStyle = oldProps.style || {}

    for (let key in newStyle) {
        if (!oldStyle[key]) {
            el.style[key] = ''
        }
    }

    for (let key in oldProps) {
        if (!newProps[key]) {
            el.removeAttribute(key)
        }
    }
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
function isSameVNode(oldVnode, vnode) {
    if (oldVnode.tag === vnode.tag && oldVnode.key === vnode.key) {
        return true
    }
}
function updateChildren(parent, oldChildren, children) {
    let oldStartIndex = 0
    let oldEndIndex = oldChildren.length - 1
    let newStartIndex = 0
    let newEndIndex = children.length - 1
    let oldStartVnode = oldChildren[oldStartIndex]
    let oldEndVnode = oldChildren[oldEndIndex]
    let newStartVnode = children[newStartIndex]
    let newEndVnode = children[newEndIndex]
    // 双指针比对
    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        // 在比对过程中 新老节点任意一方遍历结束 则结束比对
        if (isSameVNode(oldStartVnode, newStartVnode)) {
            //头头对比 如果是同一个节点 就对比内部的属性
            // 优化向后插入的情况
            patch(oldStartVnode, newStartVnode)
            oldStartVnode = oldChildren[++oldStartIndex]
            newStartVnode = children[++newStartIndex]
        } else if (isSameVNode(oldEndVnode, newEndVnode)) {
            // 尾尾对比 如果是同一个节点 就对比内部的属性
            // 优化向前插入的情况
            patch(oldEndVnode, newEndVnode)
            oldEndVnode = oldChildren[--oldEndIndex]
            newEndVnode = children[--newEndIndex]
        } else if(isSameVNode(oldStartVnode, newEndVnode)){
            // 优化头移动到尾
            patch(oldStartVnode, newEndVnode)
            parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
            oldStartVnode = oldChildren[++oldStartIndex]
            newEndVnode = children[--newEndIndex]
        } else if(isSameVNode(oldEndVnode, newStartVnode)){
            // 优化尾移动到头
            patch(oldEndVnode, newStartVnode)
            parent.insertBefore(oldEndVnode.el, oldStartVnode.el)
            oldEndVnode = oldChildren[--oldEndIndex]
            newStartVnode = children[++newStartIndex]
        }
    }
    if (newStartIndex <= newEndIndex) {
        for (let i = newStartIndex; i <= newEndIndex; i++) {
            // 新增元素 既可以向前插入 也可以向后插入
            const el = children[newEndIndex + 1]
                ? children[newEndIndex + 1].el
                : null
            parent.insertBefore(createElm(children[i]), el)
        }
    }
}
