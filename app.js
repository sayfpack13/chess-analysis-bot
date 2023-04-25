const express = require('express');
const app = express();
const request = require('request');
//const { ChessEngine2 } = require('./utils/engine2')
//const chessEngine2 = new ChessEngine2()
const { ChessEngine } = require("./utils/engine")
const { VARS } = require("./VARS")
app.listen(VARS.PORT, () => console.log(`Listening on port ${VARS.PORT}`));



// VARS
const chessEngine = new ChessEngine()
var counter = 0







app.get("/getBestMove", (req, res) => {
    var fen = req.query.fen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    var depth = req.query.depth || 10
    var movetime = req.query.movetime || 500

    var turn = req.query.turn || "w"
    //var engine_type = req.query.engine_type || VARS.ENGINE_TYPES[0]
    var engine_name = req.query.engine_name || "stockfish-15.exe"
    var engine_mode = req.query.engine_mode || 0



    if (depth > 20) {
        depth = 20
    }

    counter++
    console.log("\n"+counter + ") turn updated to: "+turn)


    chessEngine.start(engine_mode, turn, depth, movetime, engine_name, fen).then((result) => {
        res.send({
            fen: result.fen,
            move: result.bestMove,
            turn: result.turn,
            depth: depth,
            movetime: movetime,
            score: depth,
            provider: engine_name
        })
    })
})




function getLichessBestMove(use_lichess_api, fen, turn, callback) {
    if (use_lichess_api == "false") {
        callback(false)
    } else {
        request.get(VARS.LICHESS_API + "?fen=" + fen, { json: true }, (err, res, body) => {

            if (body.error != undefined) {
                callback(false)
            } else {


                callback({
                    move: body.pvs[0].moves.split(' ')[0],
                    turn: turn,
                    score: body.pvs[0].cp,
                    depth: body.depth,
                    provider: "lichess"
                })
            }
        });

    }
}