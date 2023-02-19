const stockfish = require("./stockfish/src/stockfish");


class ChessEngine2{
 
    constructor(){
        this.engine=stockfish()

        this.engine.onmessage = function (msg) {
        }
        this.engine.postMessage("uci")
    }

    getBestMove(fen, turn, depth, movetime, res) {
        this.engine.onmessage = function (msg) {
            if(res.headersSent){
                return;
            }
    
            try {
                if (typeof (msg=="string") && msg.match("bestmove")) {
                    res.send({
                        fen:fen,
                        move: msg.split(' ')[1],
                        opposite_move: msg.split(' ')[3] == undefined ? false : msg.split(' ')[3],
                        turn:turn,
                        depth: depth,
                        score: depth,
                        provider: "stockfish"
                    })
    
                }
            } catch (err) {
                if(res.headersSent){
                    return;
                }
                res.send(false)
            }
        }
    
    
        // run chess engine
        console.log("updated turn: " + turn)
        this.engine.postMessage("ucinewgame");
        this.engine.postMessage("position fen " + fen);
        if (depth != 0) {
            console.log("using depth: " + depth)
    
            this. engine.postMessage("go depth " + depth);
        } else {
            console.log("using movetime: " + movetime)
            this.engine.postMessage("go movetime " + movetime);
        }
    }
    
}





module.exports={ChessEngine2}