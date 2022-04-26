import babel from '@rollup/plugin-babel';
import clear from 'rollup-plugin-clear'
export default {
  input: 'src/index.js',
  output: {
    file: 'dist/vue.js',
    format: 'umd',
    name: 'Vue',
    sourcemap: true
  },
  plugins: [
    clear({
      targets: ['./dist'],
    }),
    babel({
      exclude: './node_modules/**'
    })
  ]
}