const chess = new Chess("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", true)
// const chess = new Chess("rnbqkbnr/pppppppp/8/3rRN2/1K6/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", true)
// const chess = new Chess("3N5/8/8/2K1Nr2/8/n7/6b1/7k w KQkq - 0 1", true)


const chessElement = document.getElementById("chess")
const fenElement = document.getElementById("fen")
const evalElement = document.getElementById("eval")
const strengthElement = document.getElementById("strength")

let pattern = 1, sourceSquare = null

for (let y = 8; y > 0; y--) {
    pattern = 1 - pattern
    for (let x = 0; x < 8;  x++) {

        const div = document.createElement("DIV")
        div.classList.add("square")
        if (x % 2 === pattern) {
            div.classList.add("light")
        } else {
            div.classList.add("dark")
        }
        div.id = `${String.fromCharCode(97 + x)}${y}`
        div.addEventListener("click", click)
        chessElement.append(div)

    }
}

console.time("update")
updateBoard()
markSources()
console.timeEnd("update")

function click(event) {
    let move_ai
    if (event.target.classList.contains("target") && sourceSquare !== null) {
        for (const square of [...document.querySelectorAll(".square")]) {
            square.classList.remove("source")
            square.classList.remove("target")
            square.textContent = ""
        }
        chess.doMoveReadable(`${sourceSquare}${event.target.id}`)

        chess.init()
        console.time("ai")
        move_ai = chess.minimax(!chess.player, parseInt(strengthElement.value), -Infinity, Infinity)
        console.timeEnd("ai")
        chess.show()
        // console.log(chess.getMoves(!chess.player))
        // console.log("move_ai",move_ai)
        chess.doMove(move_ai[1])
        updateBoard()
        markSources()
    }
    for (const square of [...document.querySelectorAll(".square")]) {
        square.classList.remove("target")
    }

    for (const move of chess.getMovesReadable()) {
        const source = move.substring(0, 2)
        const target = move.substring(2, 4)
        if (event.target.id == source) {
            sourceSquare = source
            document.getElementById(source).classList.add("source")
            document.getElementById(target).classList.add("target")
        }
    }
}

function markSources() {
    for (const move of chess.getMovesReadable()) {
        const source = move.substring(0, 2)
        const target = move.substring(2, 4)
        document.getElementById(source).classList.add("source")
    }
}

function updateBoard() {
    for (const entry of chess.getBoard()) {
        document.getElementById(entry[0]).textContent = entry[1]
    }
    fenElement.value = chess.fen
    evalElement.textContent = chess.evaluate()
}
