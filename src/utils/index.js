const LIFECYCLE_HOOKS = [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeDestroy',
    'destroyed',
    'activated'
]

let strats = {}

LIFECYCLE_HOOKS.forEach((_) => (strats[_] = mergeHook))

function mergeAssets(parentVal, childVal) {
    const res = Object.create(parentVal)
    // 相当于res.__proto__ = parentVal
    if (childVal) {
        for (let key in childVal) {
            res[key] = childVal[key]
        }
    }
    return res
}
// 组件合并策略
strats.components = mergeAssets

function mergeHook(parentVal, childVal) {
    if (childVal) {
        if (parentVal) {
            return parentVal.concat(childVal)
        } else {
            return [childVal]
        }
    } else if (parentVal) {
        return parentVal
    }
}

export function mergeOptions(parent, child) {
    const options = {}
    for (let key in parent) {
        mergeField(key)
    }
    for (let key in child) {
        if (!parent.hasOwnProperty(key)) {
            mergeField(key)
        }
    }
    function mergeField(key) {
        // 处理生命周期
        if (strats[key]) {
            return (options[key] = strats[key](parent[key], child[key]))
        }
        if (isObject(parent[key]) && isObject(child[key])) {
            options[key] = {
                ...parent[key],
                ...child[key]
            }
        } else if (child[key] === undefined) {
            options[key] = parent[key]
        } else {
            options[key] = child[key]
        }
        console.log(key, child[key])
    }
    return options
}
export function callHook(vm, hook) {
    const handlers = vm.$options[hook]
    if (handlers) {
        handlers.forEach((handler) => {
            handler.call(vm)
        })
    }
}

export function isObject(target) {
    return typeof target === 'object'
}
const RESERVED_TAGS = [
    'p',
    'div',
    'span',
    'input',
    'button',
    'select',
    'option',
    'textarea',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'li',
    'ol',
    'dl',
    'dt',
    'dd',
    'a',
    'img',
    'form',
    'label',
    'table',
    'tr',
    'th',
    'td',
    'tbody',
    'thead',
    'tfoot',
    'iframe',
    'video',
    'audio',
    'canvas',
    'svg',
    'map',
    'area',
    'text',
    'style',
    'script',
    'link',
    'meta',
    'title',
    'head',
    'body',
    'html'
]
export function isReservedTag(tag) {
    return RESERVED_TAGS.includes(tag)
}
