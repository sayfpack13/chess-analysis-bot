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









var last_request = 1



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



app.get("/getBestMove", (req, res) => {
    var fen = req.query.fen
    var depth = req.query.depth || 10
    var movetime = req.query.movetime || 500
    var use_lichess_api = req.query.lichess || false
    var turn = req.query.turn || "w"
    var engine_type = req.query.engine_type || VARS.ENGINE_TYPES[0]
    var engine_name = req.query_engine_name || VARS.ENGINE_NAMES[0]

    if (depth > 20) {
        depth = 20
    }


    getLichessBestMove(use_lichess_api, fen, turn, (data) => {
        if (data != false) {
            return res.send(data)
        }

        // using stockfish engine

        if (req.session.req_id == undefined) {
            req.session.req_id = 1
        } else {
            req.session.req_id++
        }
        last_request = req.session.req_id


        if (engine_type == VARS.ENGINE_TYPES[0]) {
            // use .js engines
            const chessEngine2 = new ChessEngine2()
            chessEngine2.getBestMove(fen, turn, depth, movetime, last_request, req, res)
        }
        else if (engine_type == VARS.ENGINE_TYPES[1]) {
            // use .exe engines
            const chessEngine = new ChessEngine(turn, depth, engine_name, fen)


            chessEngine.start().then((result) => {
                if (req.session.req_id != last_request) {
                    return res.send(false)
                }
                res.send({
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









// ======================================= SELENIUM ======================================= //

/*
const { Builder, By, Key, until
    , Browser,
    WebElement } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');


const options = new chrome.Options()
options.addArguments("--user-data-dir=C:/Users/sayfr/AppData/Local/Google/Chrome/User Data/Profile 1/")
options.addArguments("--disable-gpu")
options.windowSize({width:300,height:650})
const driver = new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();
var driver_ready = false
Start()





async function getDepth(callback) {
    console.log("getting depth")
    var found = false
    var depth_text = ""
    do {
        await driver.wait(until.elementLocated(By.className("info")))
        await driver.findElement(By.className("info")).getText().then((text) => {
            if (text.includes("Depth")) {
                found = true
                depth_text = text
            }

        })
        await delay(100)
    } while (!found)

    depth_text = (depth_text.split(' ')[1]).slice(0, -1)
    console.log("depth: " + depth_text)
    callback(depth_text)
}


async function enableEngine(callback) {
    var loading_engine = true
    var loading_text = ""


    console.log("checking engine")
    await driver.wait(until.elementLocated(By.id("analyse-toggle-ceval")))
    await driver.wait(until.elementLocated(By.tagName("help")), 100).then(() => {
        console.log("enabling engine")
        driver.executeScript("document.querySelector('.cmn-toggle.cmn-toggle--subtle').click();")

    }).catch(() => {

    }).finally(async () => {
        do {
            await driver.wait(until.elementLocated(By.className("info")))
            await driver.findElement(By.className("info")).getText().then((text) => {
                loading_text = text

                if (!text.includes("Loading")) {
                    loading_engine = false

                }

            })
            await delay(100)
        } while (loading_engine)

        console.log("engine is loaded !!")
        callback()

    })




}

async function getBestMove(callback) {
    console.log("getting best move")

    await driver.wait(until.elementLocated(By.className("pv pv--nowrap")))
    await driver.findElement(By.className("pv pv--nowrap")).getAttribute("data-uci").then((text) => {

        console.log("best move: " + text)
        callback(text)
    })



}


async function getThreat(callback) {
    console.log("getting threat level")

    await driver.wait(until.elementLocated(By.tagName("pearl")))
    await driver.findElement(By.tagName("pearl")).getText().then((text) => {

        console.log("threat level: " + text)
        callback(Number(text))
    })



}


async function sendFenPgn(fen, callback) {
    var depth = ""
    var bestmove = ""
    var threat = 0
    try {
        console.log("sending Fen/Pgn")

        //driver.get("https://lichess.org/analysis/fromPosition/" + fen)
        await driver.wait(until.elementLocated(By.tagName("textarea")))
        await driver.executeScript("document.querySelector('textarea').value='" + fen + "';document.querySelector('.button.button-thin.action.text').click();")


        enableEngine(() => {
            getDepth((val) => {
                depth = val
                getBestMove((val) => {
                    bestmove = val
                    getThreat((val) => {
                        threat = val
                        callback({ "depth": depth, "bestMove": bestmove, "threat": threat })
                    })

                })
            })
        })

    } catch (err) {
        callback(false)
    }
}

function clickSettings(callback) {
    driver.wait(until.elementsLocated(By.className("fbt")))
    driver.executeScript("document.querySelector('[data-act=\"menu\"]').dispatchEvent( new MouseEvent('mousedown', { 'view': window, 'bubbles': true, 'cancelable': false }) );")
    callback()
}

async function Start() {
    try {
        await driver.get('https://lichess.org/analysis');



        enableEngine(() => {
            clickSettings(() => {
                driver.executeScript("document.querySelector('#analyse-multipv').value = 1;document.querySelector('#analyse-multipv').dispatchEvent(new Event('input'));document.querySelector('#analyse-threads').value = 3;document.querySelector('#analyse-threads').dispatchEvent(new Event('input'));document.querySelector('#analyse-memory').value = 10;document.querySelector('#analyse-memory').dispatchEvent(new Event('input'));").then(() => {
                    clickSettings(() => {
                        driver_ready = true
                        console.log("driver is ready !!")
                    })
                })
            })
        })



    } catch (err) {


    }
}


async function checkDriver(callback) {
    do {
        await delay(100)
    } while (!driver_ready)
    callback()
}

app.get("/sendFenPgn", (req, res) => {
    checkDriver(() => {
        sendFenPgn(req.query.pf, (data) => {
            res.send(data)
        })
    })
})

*/
// ======================================= SELENIUM ======================================= //

