const express = require('express');
const app = express();
const { ChessEngine } = require("./utils/engine")
const { VARS } = require("./VARS")
const cors = require("cors")

try {
    app.listen(VARS.PORT, () => console.log(`Listening on port ${VARS.PORT}`))
    app.use(cors())
} catch (error) {
    console.log("Server is already running !!")
}



// VARS
const chessEngine = new ChessEngine()
var counter = 0





app.get("/getBestMove", (req, res) => {
    var fen = req.query.fen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    var depth = req.query.depth || 10
    var movetime = req.query.movetime || 500

    var turn = req.query.turn || "w"
    //var engine_type = req.query.engine_type || VARS.ENGINE_TYPES[0]
    var engine_name = req.query.engine_name || "stockfish.exe"
    var engine_mode = req.query.engine_mode || 0


    if (depth > 20) {
        depth = 20
    }

    counter++
    console.log("\n#" + counter + " turn updated to: " + (turn === 'w' ? 'White' : 'Black'))


    chessEngine.start(counter, engine_mode, turn, depth, movetime, engine_name, fen).then((result) => {

        const parsedResult = {
            fen: result.fen,
            move: result.bestMove,
            bestMove: result.bestMove,
            ponder: result.ponder,
            turn: result.turn,
            depth: depth,
            movetime: movetime,
            score: depth,
            provider: engine_name
        }


        console.log("#" + result.id + " best move: " + parsedResult.bestMove)
        return res.send({ success: true, data: parsedResult })
    }).catch((error) => {
        console.log("Error: " + error)
        return res.send({ success: false, data: error.message })
    })
})
