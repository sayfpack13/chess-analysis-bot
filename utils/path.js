const path = require('path')
const fs = require('fs');



const windowsEnginePath = (name) => {
  var engine_path = path.resolve(process.cwd(), 'utils/engine', name)
 
  if (!fs.existsSync(engine_path)) {
    console.log("engine not found: "+name)
    name="stockfish-15.exe"
    engine_path = path.resolve(process.cwd(), 'utils/engine', name)
  }
  console.log("using engine: "+name)
  return engine_path

}

const linuxEnginePath = (name) =>{
  var engine_path = path.resolve(process.cwd(), 'utils/engine', name)
 
  if (!fs.existsSync(engine_path)) {
    console.log("engine not found: "+name)
    name="stockfish-15"
    engine_path = path.resolve(process.cwd(), 'utils/engine', name)
  }
  console.log("using engine: "+name)
  return engine_path
}

module.exports = {
  windowsEnginePath,
  linuxEnginePath,
}
