// VARS
const PORT = 5000
const LICHESS_API = "https://lichess.org/api/cloud-eval"
const MIN_MOVETIME = 1000
// User files storage


// nodejs imports

const express = require('express');
const app = express();
const request = require('request');
const stockfish = require("./stockfish/src/stockfish");
const engine = stockfish()
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.listen(PORT, () => console.log(`Listening on port ${PORT}`)); //Line 6

const max_console = 5
var console_count = 0



var bestMove = { move: "aaaa", depth: 10, score: 10, provider: "" }
engine.onmessage = function (msg) {

}

engine.postMessage("uci")


function getLichessBestMove(fen, callback) {
    request.get(LICHESS_API + "?fen=" + fen, { json: true }, (err, res, body) => {
        if (body.error != undefined) {
            callback(false)
        } else {
            bestMove.move = body.pvs[0].moves.split(' ')[0]
            bestMove.score = body.pvs[0].cp
            bestMove.depth = body.depth
            bestMove.provider = "lichess"
            callback(bestMove)
        }
    });
}

function getStockfishBestMove(fen, depth, movetime, res) {
    engine.onmessage = function (msg) {
        if (res.headersSent) {
            return;
        }

        try {
            if (typeof (msg == "string") && msg.match("bestmove")) {
                console.log(msg)
                bestMove.depth = depth
                bestMove.move = msg.split(' ')[1]
                bestMove.score = depth
                bestMove.provider = "stockfish"
                res.send(bestMove)
            }
        } catch (err) {
            res.send(false)
        }
    }

    // run chess engine
    engine.postMessage("ucinewgame");
    engine.postMessage("position fen " + fen);
    if (depth != 0) {
        console.log("using depth: " + depth)

        engine.postMessage("go depth " + depth);
    } else {
        console.log("using movetime: " + movetime)
        engine.postMessage("go movetime " + movetime);
    }

}


app.get("/getBestMove", (req, res) => {
    var fen = req.query.fen
    var depth = req.query.depth
    var movetime = req.query.movetime
    if (depth > 40) {
        return res.send(false)
    }
    if (depth == undefined || isNaN(depth) || depth == "") {
        depth = 0
    }

    if (movetime == undefined || isNaN(movetime) || movetime == "") {
        movetime = MIN_MOVETIME
    }

    getLichessBestMove(fen, (data) => {
        if (data != false) {
            return res.send(data)
        }
        getLichessBestMove(fen, (data) => {
            if (data != false) {
                return res.send(data)
            }
            // use stockfish engine in case lichess api fail

            getStockfishBestMove(fen, depth, movetime, res)


        })
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

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
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

