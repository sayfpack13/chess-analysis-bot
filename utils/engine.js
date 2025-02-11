const { VARS } = require('../VARS')
const { executeEngine } = require('./process')

class ChessEngine {
  constructor() {
    this.fen = []
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

  async start(id, engine_mode, turn, depth, movetime, engine_name, fen) {
    this.engine_mode = engine_mode
    this.turn = turn
    this.depth = depth
    this.movetime = movetime
    this.engine = engine_name
    this.fen.push(fen)




    if (this.engine_mode == VARS.DEPTH_MODE) {
      console.log("using depth mode")
      engine_mode = `go depth ${this.depth}`
    } else {
      console.log("using movetime mode")
      engine_mode = `go movetime ${this.movetime}`
    }


    var engineResult

    try {
      engineResult = await executeEngine(
        `position fen ${this.getLastFen()}\n`,
        engine_mode,
        this.engine
      )
    } catch (err) {
      throw (err)
    }


    return {
      ...engineResult,
      id: id,
      fen: this.getLastFen(),
      turn: this.turn,
      depth: this.depth,
      bestMove: engineResult.bestmove,
      ponder: engineResult.possible_human_move
    }
  }
}

module.exports = { ChessEngine }
