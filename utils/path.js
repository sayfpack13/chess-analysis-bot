const path = require('path')
const { VARS } = require('../VARS')



const windowsEnginePath = (name) => {
  return path.resolve(process.cwd(), 'utils/engine', name)
}

const linuxEnginePath = (name = 'stockfish') =>
  name === 'stockfish' ? '../Stockfish/src/stockfish' : '../engine/komodo13'

module.exports = {
  windowsEnginePath,
  linuxEnginePath,
}
