module.exports = (api, opts) => {
  api.extendPackage({
    dependencies: {
      'electron-nucleus': 'DRBragg/electron-nucleus#chd_custom'
    }
  })

  api.render(
    { './src/background.js': './templates/default/src/background.js' },
    opts
  )

  api.injectImports(api.entryFile, `import ipcRenderer from 'electron';`)

  const tracker = `\n\n// Send tracking data via ipc channel\n// Allows us to use this.$tracker(action, data) anywhere in the app\nVue.prototype.$tracker = function(action, data={}) {\n\tipcRenderer.ipcRenderer.send('track', { action: action, data: data })\n}`

  api.onCreateComplete(() => {
    // inject to main.js
    const fs = require('fs')
    const ext = api.hasPlugin('typescript') ? 'ts' : 'js'
    const mainPath = api.resolve(`./src/main.${ext}`)

    // get content
    let contentMain = fs.readFileSync(mainPath, { encoding: 'utf-8' })
    const lines = contentMain.split(/\r?\n/g).reverse()

    // inject import
    const lastImportIndex = lines.findIndex(line => line.match(/^import/))
    lines[lastImportIndex] += tracker

    // modify app
    contentMain = lines.reverse().join('\n')
    fs.writeFileSync(mainPath, contentMain, { encoding: 'utf-8' })
  })
}
