const sh = require('./util').sh
const fs = require('fs')
const path = require('path')
const filePath = path.resolve('./app')

function uglifyJs(filePath) {
  fs.readdir(filePath, function (err, files) {
    if (err) {
      console.warn(err)
    } else {
      files.forEach(function (filename) {
        const filedir = path.join(filePath, filename)
        fs.stat(filedir, function (error, stats) {
          const isFile = stats.isFile()
          const isDir = stats.isDirectory()
          if (isFile) {
            sh(`npx uglify-js ${filedir} \
              -c hoist_funs,hoist_vars \
              -m \
              -o ${filedir}`)
          }
          if (isDir && filename.indexOf('typings') !== 0) {
            uglifyJs(filedir)
          }
        })
      })
    }
  })
}

async function build() {
  await sh('npm run clean && npx rollup -c scripts/rollup.config.js')
  uglifyJs(filePath)
}

build()
