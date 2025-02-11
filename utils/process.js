const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');



const executeEngine = (command, engineCmd = 'go depth 10', engine_name) => {
  return new Promise((resolve, reject) => {
    const engines_path = path.resolve(process.cwd(), 'utils/engine');
    const engine_path = path.resolve(engines_path, engine_name);

    if (!fs.existsSync(engine_path)) {
      reject("Engine not found: " + engine_name);
    }

    console.log("Using engine: " + engine_name);

    const engine = spawn(engine_path, {
      shell: true,
      cwd: engines_path
    });

    engine.stdin.write(`${command}\n`);
    engine.stdin.write(`${engineCmd}\n`);




    engine.stdout.on('data', (chunk) => {
      const result = chunk.toString();
      if (result.includes('bestmove')) {
        engine.kill();

        const depth = result.match(/info\sdepth\s\d+/);
        const seldepth = result.match(/seldepth\s\d+/);
        const bestmove = result.match(/bestmove\s\w+/);
        const ponder = result.match(/ponder\s\w+/);

        resolve({
          depth: depth ? Number(depth[0].match(/\d+/)[0]) : null,
          seldepth: seldepth ? Number(seldepth[0].match(/\d+/)[0]) : null,
          bestmove: bestmove ? bestmove[0].replace('bestmove ', '') : '',
          possible_human_move: ponder ? ponder[0].replace('ponder ', '') : '',
        });
      }
    });

    engine.on('error', (err) => {
      reject(err);
    });

    engine.stderr.on('data', (data) => {
      reject(data);
    });
  });
}

module.exports = {
  executeEngine,
}
