const { spawn } = require('child_process')
const { VARS } = require('../VARS')
const { isWindows } = require('./environment')
const { windowsEnginePath, linuxEnginePath } = require('./path')

const executeEngine = (command,engineCmd = 'go depth 10',engine) => {



  const executableEnginePath = isWindows()
    ? windowsEnginePath(engine)
    : linuxEnginePath(engine)

  return new Promise((resolve, reject) => {
    const engine = spawn(executableEnginePath, { shell: true })

    engine.stdout.on('data', (chunk) => {
      const result = chunk.toString()
      // Get the last line or the best move
      // from the engine
      if (result.includes('bestmove')) {
        engine.kill()

        const depth = result.match(/info\sdepth\s\d+/)
        const seldepth = result.match(/seldepth\s\d+/)
        const bestmove = result.match(/bestmove\s\w+/)
        const ponder = result.match(/ponder\s\w+/)

        resolve({
          depth: depth ? Number(depth[0].match(/\d+/)[0]) : null,
          seldepth: seldepth ? Number(seldepth[0].match(/\d+/)[0]) : null,
          bestmove: bestmove ? bestmove[0].replace('bestmove ', '') : '',
          possible_human_move: ponder ? ponder[0].replace('ponder ', '') : '',
        })
      }
    })

    engine.stdout.on('error', (err) => {
		console.log(err)
		//reject(err)
    })

    engine.stdin.write(`${command}\n`)
    engine.stdin.write(`${engineCmd}\n`)
  })
}

module.exports = {
  executeEngine,
}
