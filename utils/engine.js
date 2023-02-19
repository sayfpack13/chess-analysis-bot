const { VARS } = require('../VARS')
const { executeEngine } = require('./process')

class ChessEngine {
  constructor(
    turn = 'w',
    depth = 10,
    engine = VARS.ENGINE_NAMES[0],
    fen = ''
  ) {
    this.turn = turn
    this.depth = depth
    this.engine = engine
    this.fen = fen
  }

 

  isWhiteTurn() {
    return this.turn === 'w'
  }

  getTurn() {
    return this.turn
  }

 

  setDepth(depth) {
    this.depth = depth
    return this
  }

  reset() {
    this.turn = 'w'

  }

  async start() {
    const engineResult = await executeEngine(
      `position fen ${this.fen}\n`,
      `go depth ${this.depth}`,
      this.engine
    )

    return {
      turn: this.turn,
      setDepth: this.depth,
      engineDepth: engineResult.depth,
      selDepth: engineResult.seldepth,
      bestMove: engineResult.bestmove,
      possibleHumanMove: engineResult.possible_human_move,
    }
  }
}

module.exports = { ChessEngine }
