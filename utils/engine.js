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

  async start(engine_mode, turn, depth,movetime, engine_name, fen) {
    this.engine_mode = engine_mode
    this.turn = turn
    this.depth = depth
    this.movetime = movetime
    this.engine = engine_name
    this.fen = fen




    if (this.engine_mode == VARS.DEPTH_MODE) {
      console.log("using depth mode")
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
    } else {
      console.log("using movetime mode")

      const engineResult = await executeEngine(
        `position fen ${this.fen}\n`,
        `go movetime ${this.movetime}`,
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
}

module.exports = { ChessEngine }
