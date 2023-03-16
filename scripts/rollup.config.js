const typescript = require('rollup-plugin-typescript2')
const pkg = require('../package.json')
const banner = `/*!
* ${pkg.name} v${pkg.version}
* (c) ${new Date().getFullYear()} @ioing
* Released under the ${pkg.license} License.
*/`

module.exports = {
  input: ['./src/launcher.ts'],
  output: {
    banner,
    dir: './app',
    format: 'es'
  },
  plugins: [
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          rootDir: "./src",
          outDir: "./app/",
          declaration: true,
          declarationDir: './app/typings/',
          module: 'esnext',
          target: 'es6',
          sourceMap: true
        }
      },
      useTsconfigDeclarationDir: true
    })
  ],
  external: ['html2canvas', '@webcomponents/webcomponentsjs', 'web-animations-js'],
  onwarn: function (warning) {
    if (warning.code === 'THIS_IS_UNDEFINED') {
      return
    }
    console.error(warning.message)
  }
}