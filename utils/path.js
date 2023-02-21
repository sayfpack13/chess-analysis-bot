const path = require('path')
const fs = require('fs');



const windowsEnginePath = (name) => {
  var engine_path = path.resolve(process.cwd(), 'utils/engine', name)
 
  if (!fs.existsSync(engine_path)) {
    console.log("engine not found: "+name)
    name="stockfish-15.exe"
    engine_path = path.resolve(process.cwd(), 'utils/engine', "stockfish-15.exe")
  }
  console.log("using engine: "+name)
  return engine_path

}

const linuxEnginePath = (name = 'stockfish') =>
  name === 'stockfish' ? '../Stockfish/src/stockfish' : '../engine/komodo13'

module.exports = {
  windowsEnginePath,
  linuxEnginePath,
}
