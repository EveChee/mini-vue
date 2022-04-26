export const ASSETS_TYPE = ['component', 'directive', 'filter']

export default function initAssetsRegisters(Vue) {
    // 初始化全局的过滤器 指令 组件
    ASSETS_TYPE.forEach((type) => {
        Vue.options[`${type}s`] = {}
        Vue[type] = function (id, definition) {
            console.log(id, definition)

            if (type === 'component') {
                // 注册全局组件
                // 使用extend方法 将对象变成构造函数
                // 子组件可能也有Vue.component方法
                definition = this.options._base.extend(definition)
            } else if (type === 'filter') {
            } else if (type === 'directive') {
            }
            console.log(29299, this)
            this.options[`${type}s`][id] = definition
            /* 
            这里为什么在vue上挂载了一次还要在options上挂载
            大概是在vue上挂载是为了方便访问 ，而在options上挂载
            是为了给一个命名空间，比如A.options.xxx  
            然后需要的时候直接复制options里面的内容就可以
            */
        }
    })
}
