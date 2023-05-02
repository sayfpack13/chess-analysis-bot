const { spawn, exec } = require('child_process')
const path = require('path')
const fs = require('fs');


const EnginePath = (engine_name) => {
  var engine_path = path.resolve(process.cwd(), 'utils/engine', engine_name)

  if (!fs.existsSync(engine_path)) {
    console.log("engine not found: " + engine_name)
    return false
  }
  return engine_path
}

const executeEngine = (command, engineCmd = 'go depth 10', engine_name) => {
  const executableEnginePath = EnginePath(engine_name)



  return new Promise((resolve, reject) => {
    if (!executableEnginePath) {
      return resolve(false)
    }

    console.log("using engine: " + engine_name)

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



    try {
      engine.stdin.write(`${command}\n`)
      engine.stdin.write(`${engineCmd}\n`)
    } catch (error) {
      console.log("Fixing engine file permession, if this happen again run this command: chmod +x utils/engine/engine_name");
      exec("chmod +x " + executableEnginePath, (error, stdout, stderr) => {
        if (!error) {
          engine.stdin.write(`${command}\n`)
          engine.stdin.write(`${engineCmd}\n`)
        }
      })
    }


  })
}

module.exports = {
  executeEngine,
}
