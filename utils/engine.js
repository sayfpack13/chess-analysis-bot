const { VARS } = require('../VARS')
const { executeEngine } = require('./process')

class ChessEngine {

  constructor() {

  }



  isWhiteTurn() {
    return this.turn === 'w'
  }

  getTurn() {
    return this.turn
  }





  reset() {
    this.turn = 'w'
  }

  async start(turn, depth, engine_name, fen) {
    this.turn = turn
    this.depth = depth
    this.engine = engine_name
    this.fen = fen



    const engineResult = await executeEngine(
      `position fen ${this.fen}\n`,
      `go depth ${this.depth}`,
      this.engine
    )

    return {
      fen: this.fen,
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
