const { VARS } = require('../VARS')
const { executeEngine } = require('./process')

class ChessEngine {
  constructor() {
    this.fen = []
  }

  isWhiteTurn() {
    return this.turn === 'w'
  }

  getTurn() {
    return this.turn
  }

  getLastFen() {
    var pos = this.fen.length == 0 ? 0 : this.fen.length - 1

    return this.fen[pos]
  }



  reset() {
    this.turn = 'w'
  }

  async start(engine_mode, turn, depth, movetime, engine_name, fen) {
    this.engine_mode = engine_mode
    this.turn = turn
    this.depth = depth
    this.movetime = movetime
    this.engine = engine_name
    this.fen.push(fen)


	var engineResult

    if (this.engine_mode == VARS.DEPTH_MODE) {
      console.log("using depth mode")
	  
      engineResult = await executeEngine(
        `position fen ${this.getLastFen()}\n`,
        `go depth ${this.depth}`,
        this.engine
      )
    } else {
      console.log("using movetime mode")

      engineResult = await executeEngine(
        `position fen ${this.getLastFen()}\n`,
        `go movetime ${this.movetime}`,
        this.engine
      )

    }
      return {
        fen: this.getLastFen(),
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
