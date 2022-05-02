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

    let map = makeIndexByKey(oldChildren)

    // 双指针比对
    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        // 在比对过程中 新老节点任意一方遍历结束 则结束比对
        if (!oldStartVnode) {
            /* 这里兼容老元素被复用置空的情况  */
            oldStartVnode = oldChildren[++oldStartIndex]
        } else if (!oldEndVnode) {
            oldEndVnode = oldChildren[--oldEndIndex]
        }

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
        } else if (isSameVNode(oldStartVnode, newEndVnode)) {
            // 优化头移动到尾
            patch(oldStartVnode, newEndVnode)
            parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
            oldStartVnode = oldChildren[++oldStartIndex]
            newEndVnode = children[--newEndIndex]
        } else if (isSameVNode(oldEndVnode, newStartVnode)) {
            // 优化尾移动到头
            patch(oldEndVnode, newStartVnode)
            parent.insertBefore(oldEndVnode.el, oldStartVnode.el)
            oldEndVnode = oldChildren[--oldEndIndex]
            newStartVnode = children[++newStartIndex]
        } else {
            // 暴力对比乱序
            // 先根据老节点的Key 做一个映射表 拿新节点的虚拟节点去映射表中查找 如果可以找到 则进行移动操作
            // 移动到当前头指针的前面 如果找不到则直接插入
            let moveIndex = map[newStartVnode.key]
            if (!moveIndex) {
                // 找不到映射  则不需要复用
                // 则插入到当前老的开始指针的前面 因为用的老的节点做的映射表
                parent.insertBefore(createElm(newStartVnode), oldStartVnode.el)
            } else {
                // 需要复用的情况
                /* 
                比如 oldChildren = [a,b,c,e]
                newChildren = [q,a,f,c,n]
                头头尾尾 交叉比对后发现q没有映射 无法复用  直接插入到当前老开始指针的前面也就是a
                然后就变成了q' a b c e
                q a f c n 
                新开始指针往后移动 到a
                这时触发头头复用 再同时把指针往后移动
                就达到了 q' a' b c e
                q a f c n
                这时候f又进行插入
                q' a' f' b c e
                q a f c n
                开始对比c  和 头b 不一样  和尾e 不一样
                但是老节点里面是存在可以复用的c的
                如果在映射表里面找到了复用元素  则直接将该元素移走 并且将该位置置空
                但此时老节点的指针是不动的 只动新的指针
                然后都对比完之后  如果老的还有剩 就全部删除
                如果新的还有剩 就全部插入
                */
                let moveVnode = oldChildren[moveIndex]
                // 这里就是需要复用移动的元素
                oldChildren[moveIndex] = undefined
                // 开始移动到当前开始指针的前面
                parent.insertBefore(moveVnode.el, oldStartVnode.el)
                // 然后比对内部属性
                patch(moveVnode, newStartVnode)
            }
            newStartVnode = children[++newStartIndex]
            // 这里是因为复用和复用都不针对老的开始节点  所以只前进新的指针
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
    if (oldStartIndex <= oldEndIndex) {
        // 如果老的开始和结束之间在一方遍历结束之后 还有元素 则全部直接删除
        for (let i = oldStartIndex; i <= oldEndIndex; i++) {
            const child = oldChildren[i]
            if (child) {
                parent.removeChild(child.el)
            }
        }
    }

    /* 
    为什么不要用index做key？
    因为 index是不变的 就会导致什么呢  key相等 标签相等  就会复用当前元素 然后去比对属性和子元素
    然后对内部进行更新  比如 a b c d | b d c a 
    那么会复用并且把a更新成b  b 更新成d .....
    但是如果key不是index  则只需要判断对应项的位置移动就可以了
    而不需要对每个dom都做变更
    */
}

function makeIndexByKey(children) {
    let map = {}
    children.forEach((item, index) => {
        if (item.key) {
            map[item.key] = index
            // 根据key 创建一个映射表
        }
    })
    return map
}
