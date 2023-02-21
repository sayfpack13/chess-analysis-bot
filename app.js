const express = require('express');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const app = express();
const request = require('request');
const { ChessEngine2 } = require('./utils/engine2')
const { ChessEngine } = require("./utils/engine")
const { VARS } = require("./VARS")

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.listen(VARS.PORT, () => console.log(`Listening on port ${VARS.PORT}`));

//session middleware
app.use(sessions({
    secret: VARS.SESSION_SECRET,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },    // 24 hour session
    resave: false
}));
app.use(cookieParser());








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
                    opposite_move: false,
                    turn: turn,
                    score: body.pvs[0].cp,
                    depth: body.depth,
                    provider: "lichess"
                })
            }
        });

    }
}

const chessEngine = new ChessEngine()
const chessEngine2 = new ChessEngine2()
var counter=0

app.get("/getBestMove", (req, res) => {
    var fen = req.query.fen
    var depth = req.query.depth || 10
    var movetime = req.query.movetime || 500
    var use_lichess_api = req.query.lichess || false
    var turn = req.query.turn || "w"
    var engine_type = req.query.engine_type || VARS.ENGINE_TYPES[0]
    var engine_name = req.query.engine_name

    if (depth > 20) {
        depth = 20
    }

    counter++
    console.log(counter+")")
    getLichessBestMove(use_lichess_api, fen, turn, (data) => {
        if (data != false) {
            return res.send(data)
        }

        // using stockfish engine



        if (engine_type == VARS.ENGINE_TYPES[0]) {
            // use .js engines
            
            chessEngine2.getBestMove(fen, turn, depth, movetime, res)
        }
        else if (engine_type == VARS.ENGINE_TYPES[1]) {
            // use local system engines

            chessEngine.start(turn, depth, engine_name, fen).then((result) => {
                
                    res.send({
                        fen:result.fen,
                        move: result.bestMove,
                        opposite_move: false,
                        turn: result.turn,
                        depth: result.engineDepth,
                        score: depth,
                        provider: engine_name
                    })
                

            })

        }

    })
})




