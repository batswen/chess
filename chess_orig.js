const deltas = [
    { x: -1, y: 0 }, { x: 1, y: 0 },
    { x: 0, y: -1 }, { x: 0, y: 1 },

    { x: -1, y: -1}, { x: 1, y: -1 },
    { x: -1, y: 1 }, { x: 1, y: 1 }
]
const knightMovesArray = [
    { x: -2, y: 1 }, { x: -2, y: -1 },
    { x: -1, y: 2 }, { x: -1, y: -2 },
    { x: 1, y: 2 }, { x: 1, y: -2 },
    { x: 2, y: 1 }, { x: 2, y: -1 }
]
const kingMovesArray = [
    { x: -1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 1 },
    { x: -1, y: 0}, { x: 1, y: 0 },
    { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 }
]

let _getPseudoLegalMoves,_evaluate,_nmab,_getMoves,_doMove,_undoMove,_isInCheck,_getPiece
let _isFreeOrEnemy, _isFree,_isEnemy,_testPosition,_minimax

class Chess {
    #board
    #player
    #enpassant
    #castle
    #fen
    constructor(fen = "") {
        this.#board = new Board()
        this.#board.setFEN(fen.split(" ")[0])
        this.#player = fen.split(" ")[1] === "w"
        const castle_str = fen.split(" ")[2]
        this.#castle = {
            "K": castle_str.includes("K"),
            "Q": castle_str.includes("Q"),
            "k": castle_str.includes("k"),
            "q": castle_str.includes("q")
        }
        this.#fen = fen
        this.#reset()
    }
    set player(name) {
        this.#player = name === "w"
    }
    get player() {
        return this.#player ? "White" : "Black"
    }
    init() {
        _getPseudoLegalMoves = 0
        _evaluate = 0
        _nmab = 0
        _getMoves = 0
        _doMove = 0
        _undoMove = 0
        _isInCheck = 0
        _getPiece = 0
        _isFreeOrEnemy = 0
        _isFree = 0
        _isEnemy = 0
        _testPosition = 0
    }
    show() {
        console.log("_getPseudoLegalMoves",_getPseudoLegalMoves)
        console.log("_evaluate",_evaluate)
        console.log("_minimax",_minimax)
        console.log("_nmab",_nmab)
        console.log("_getMoves",_getMoves)
        console.log("_doMove",_doMove)
        console.log("_undoMove",_undoMove)
        console.log("_isInCheck",_isInCheck)
        console.log("_getPiece",_getPiece)
        console.log("_isFreeOrEnemy",_isFreeOrEnemy)
        console.log("_isFree",_isFree)
        console.log("_isEnemy",_isEnemy)
        console.log("_testPosition",_testPosition)
    }
    get fen() {
        let fen = this.#board.getFEN()
        fen += " "
        fen += this.#player ? "w" : "b"
        fen += " "

        fen += this.#castle["K"] ? "K" : ""
        fen += this.#castle["Q"] ? "Q" : ""
        fen += this.#castle["k"] ? "k" : ""
        fen += this.#castle["q"] ? "q" : ""

        return fen
    }
    #reset() {
        this.lastMove = []
        this.lastMovePiece = []
    }
    getBoard() {
        return this.#board.getBoard()
    }
    evaluate(player = this.#player) {
        _evaluate++
        let piece, result = this.getMoves(player).length - this.getMoves(!player).length
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                piece = this.getPiece(x, y)
                if (piece === " ") {
                    continue
                }
                switch (piece) {
                    case "p":
                        result += -10
                    break
                    case "P":
                        result += 10
                    break
                    case "n":
                        result += -30
                    break
                    case "N":
                        result += 30
                    break
                    case "b":
                        result += -30
                    break
                    case "B":
                        result += 30
                    break
                    case "r":
                        result += -50
                    break
                    case "R":
                        result += 50
                    break
                    case "q":
                        result += -90
                    break
                    case "Q":
                        result += 90
                    break
                    case "k":
                        result += -900
                    break
                    case "K":
                        result += 900
                    break
                }
            }
        }
        return player ? result / 10 : - result / 10
    }
    #getPseudoLegalMoves(player = this.#player) {
        _getPseudoLegalMoves++
        const result = []
        let sum_delta_x, sum_delta_y, delta, delta_from, delta_to
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = this.getPiece(x, y)
                if (piece === " ") {
                    continue
                }
                if (player && !Chess.isUpperCase(piece) || !player && Chess.isUpperCase(piece)) {
                    continue
                }
                if (piece === "P" && y != 1) {
                    // console.log(x,y,piece)
                }
                switch (piece) {
                case "P":
                    if (y < 7) {
                        // Move forward
                        if (this.isFree(x, y + 1)) {
                            result.push([x, y, x, y + 1])
                            // First move
                            if (y === 1 && this.isFree(x, 2) && this.isFree(x, 3)) {
                                result.push([x, 1, x, 3])
                            }
                        }
                        // Attack
                        if (this.testPosition(x - 1, y + 1) && this.isEnemy(x - 1, y + 1, piece)) {
                            result.push([x,y,x - 1,y + 1])
                        }
                        if (this.testPosition(x + 1, y + 1) && this.isEnemy(x + 1, y + 1, piece)) {
                            result.push([x, y, x + 1, y + 1])
                        }
                    } else {} // Promotion
                break
                case "p":
                if (y > 0) {
                    // Move
                    if (this.isFree(x, y - 1)) {
                        result.push([x, y, x, y - 1])
                        // First move
                        if (y === 6 && this.isFree(x, 5) && this.isFree(x, 4)) {
                            result.push([x, 6, x, 4])
                        }
                    }
                    // Attack
                    if (this.testPosition(x - 1, y - 1) && this.isEnemy(x - 1, y - 1, piece)) {
                        result.push([x, y, x - 1,y - 1])
                    }
                    if (this.testPosition(x + 1, y - 1) && this.isEnemy(x + 1, y - 1, piece)) {
                        result.push([x, y, x + 1, y - 1])
                    }
                } else {} // Promotion
                break
                case "N":
                case "n":
                    for (const move of knightMovesArray) {
                        if (this.testPosition(x + move.x, y + move.y)) {
                            if (this.isFreeOrEnemy(x + move.x, y + move.y, piece)) {
                                result.push([x, y, x + move.x, y + move.y])
                            }
                        }
                    }
                break
                case "k":
                case "K":
                    for (const move of kingMovesArray) {
                        if (this.testPosition(x + move.x, y + move.y)) {
                            if (this.isFreeOrEnemy(x + move.x, y + move.y, piece)) {
                                result.push([x, y, x + move.x, y + move.y])
                            }
                        }
                    }
                    if (piece === "k" && this.isFree(5, 7) && this.isFree(6, 7) && this.#castle["k"]) {
                        result.push([4, 7, 6, 7])
                    }
                    if (piece === "k" && this.isFree(3, 7) && this.isFree(2, 7) && this.isFree(1, 7) && this.#castle["q"]) {
                        result.push([4, 7, 2, 7])
                    }
                    if (piece === "K" && this.isFree(5, 0) && this.isFree(6, 0) && this.#castle["K"]) {
                        result.push([4, 0, 6, 0])
                    }
                    if (piece === "K" && this.isFree(3, 0) && this.isFree(2, 0) && this.isFree(1, 0) && this.#castle["Q"]) {
                        result.push([4, 0, 2, 0])
                    }
                break
                case "r": case "R":
                case "b": case "B":
                case "q": case "Q":
                    delta_from = 0
                    delta_to = 7
                    if (piece === "r" || piece === "R") {
                        delta_from = 0
                        delta_to = 3
                    } else if (piece === "b" || piece === "B") {
                        delta_from = 4
                        delta_to = 7
                    }

                    for (delta = delta_from; delta <= delta_to; delta++) {
                        sum_delta_x = 0
                        sum_delta_y = 0
                        for (let distance = 0; distance < 8; distance++) {
                            sum_delta_x += deltas[delta].x
                            sum_delta_y += deltas[delta].y
                            if (this.testPosition(x + sum_delta_x, y + sum_delta_y)) {
                                if (this.isFree(x + sum_delta_x, y + sum_delta_y)) {
                                    result.push([x, y, x + sum_delta_x, y + sum_delta_y])
                                } else if (this.isEnemy(x + sum_delta_x, y + sum_delta_y, piece)) {
                                    result.push([x, y, x + sum_delta_x, y + sum_delta_y])
                                    break
                                } else {
                                    break
                                }
                            }
                        }
                    }
                break
                }
            }
        }
        return result
    }
    minimax(player, maxDepth) {
        _minimax++

        const nmab = (player, depth, alpha, beta) => {
            _nmab++
            const moves = this.getMoves(player)
            let max = alpha, value
            if (depth === 0 || moves.length === 0) {
                return this.evaluate(!player)
            }
            for (const move of moves) {
                this.doMove(move)
                value = nmab(!player, depth - 1, -beta, -max)
                this.undoMove()
                if (value > max) {
                    max = value
                    if (depth === maxDepth) {
                        best_move = move
                    }
                    if (max >= beta) {
                        break
                    }
                }
            }
            return max
        }

        let best_move = null
        nmab(player, maxDepth, -Infinity, Infinity)
        return best_move
    }
    getMoves(player = this.#player) {
        _getMoves++
        const result = []
        const moves = this.#getPseudoLegalMoves(player)
        for (const move of moves) {
            this.doMove(move)
            if (!this.isInCheck(player)) {
                const from = move.slice(0, 2)
                const to = move.slice(2, 4)
                result.push([from[0], from[1], to[0], to[1]])
            }
            this.undoMove()
        }
        return result
    }
    getMovesReadable(player = this.#player) {
        const result = []
        const moves = this.#getPseudoLegalMoves(player)
        for (const move of moves) {
            this.doMove(move)
            if (!this.isInCheck(player)) {
                const from = move.slice(0, 2)
                const to = move.slice(2, 4)
                result.push(`${Chess.#indexToCoordinates(from[0], from[1])}${Chess.#indexToCoordinates(to[0], to[1])}`)
            }
            this.undoMove()
        }
        return result
    }
    doMove(move) {
        _doMove++
        const from = move.slice(0, 2)
        const to = move.slice(2, 4)

        let piece

        piece = this.getPiece(from[0], from[1])
        this.setPiece(from[0], from[1], " ")
        this.setPiece(to[0], to[1], piece)

        // Rochade, Schwarz, Königseitig
        if (piece === "k" && from[0] === 4 && from[1] === 7 && to[0] === 6 && to[1] === 7 && this.#castle["k"]) {
            this.#castle["k"] = false
            this.setPiece(7, 7, " ")
            this.setPiece(5, 7, "r")
            this.lastMove.push([4, 7, 6, 7, 7, 7, 5, 7])
            this.lastMovePiece.push("k")
        } else if (piece === "k" && from[0] === 4 && from[1] === 7 && to[0] === 2 && to[1] === 7 && this.#castle["q"]) {
            this.#castle["q"] = false
            this.setPiece(0, 7, " ")
            this.setPiece(3, 7, "r")
            this.lastMove.push([4, 7, 2, 7, 0, 7, 3, 7])
            this.lastMovePiece.push("k")
        } else if (piece === "K" && from[0] === 4 && from[1] === 0 && to[0] === 6 && to[1] === 0 && this.#castle["K"]) {
            this.#castle["K"] = false
            this.setPiece(7, 0, " ")
            this.setPiece(5, 0, "R")
            this.lastMove.push([4, 0, 6, 0, 7, 0, 5, 0])
            this.lastMovePiece.push("K")
        } else if (piece === "K" && from[0] === 4 && from[1] === 0 && to[0] === 2 && to[1] === 0 && this.#castle["Q"]) {
            this.#castle["Q"] = false
            this.setPiece(0, 0, " ")
            this.setPiece(3, 0, "R")
            this.lastMove.push([4, 0, 2, 0, 0, 0, 3, 0])
            this.lastMovePiece.push("K")
        } else {
            this.lastMove.push(move)
            this.lastMovePiece.push(this.getPiece(to[0], to[1]))
        }
    }
    doMoveReadable(move) {
        const from = Chess.#coordinatesToIndex(move.substring(0, 2))
        const to = Chess.#coordinatesToIndex(move.substring(2, 4))
        this.doMove([from.x, from.y, to.x, to.y])
    }
    undoMove() {
        _undoMove++
        let piece, move
        if (this.lastMove.length === 0) {
            return
        }
        move = this.lastMove.pop()
        if (move.length > 4) {
            piece = this.getPiece(move[2], move[3])
            this.setPiece(move[2], move[3], " ")
            this.setPiece(move[0], move[1])
            if (move[4] === 7 && move[5] === 7) {
                this.#castle["k"] = true
                this.setPiece(7, 7, "r")
            } else if (move[4] === 0 && move[5] === 7) {
                this.#castle["q"] = true
                this.setPiece(0, 7, "r")
            } else if (move[4] === 7 && move[5] === 0) {
                this.#castle["K"] = true
                this.setPiece(7, 0, "R")
            } else if (move[4] === 0 && move[5] === 0) {
                this.#castle["Q"] = true
                this.setPiece(0, 0, "R")
            }
        } else {
            const from = move.slice(2, 4)
            const to = move.slice(0, 2)
            piece = this.getPiece(from[0], from[1])
            this.setPiece(from[0], from[1], this.lastMovePiece.pop())
            this.setPiece(to[0], to[1], piece)
        }
    }
    isInCheck(player) {
        _isInCheck++
        const enemyMoves = this.#getPseudoLegalMoves(!player)
        let king_x = -1, king_y

        // Find King
        for (let x = 0; x < 8 && king_x === -1; x++) {
            for (let y = 0; y < 8 && king_x === -1; y++) {
                if (player && this.getPiece(x, y) === "K" || !player && this.getPiece(x, y) === "k") {
                    king_x = x; king_y = y
                }
            }
        }

        for (const move of enemyMoves) {
            // is king in check
            if (move[2] === king_x) {
                if (move[3] === king_y) {
                    return true
                }
            }
        }
        return false
    }
    isFreeOrEnemy(x, y, piece) {
        _isFreeOrEnemy++
        const is_white = Chess.isUpperCase(piece)
        if (this.getPiece(x, y) === " ") {
            return true
        }
        if (is_white && !Chess.isUpperCase(this.getPiece(x, y))) {
            return true
        }
        if (!is_white && Chess.isUpperCase(this.getPiece(x, y))) {
            return true
        }
        return false
    }
    isEnemy(x, y, piece) {
        _isEnemy++
        const is_white = Chess.isUpperCase(piece)
        if (this.getPiece(x,y) === " ") {
            return false
        }
        if (is_white && !Chess.isUpperCase(this.getPiece(x, y))) {
            return true
        }
        if (!is_white && Chess.isUpperCase(this.getPiece(x, y))) {
            return true
        }
        return false
    }
    isFree(x, y) {
        _isFree++
        return this.getPiece(x, y) === " "
    }
    getPiece(x, y) {
        _getPiece++
        return this.#board.getPiece(x, y)
    }
    setPiece(x, y, piece) {
        this.#board.setPiece(x, y, piece)
    }
    testPosition(x, y) {
        _testPosition++
        return (x >= 0 && x <= 7 && y >= 0 && y <=  7)
    }
    static #indexToCoordinates(x, y) {
        return `${["a", "b", "c", "d", "e", "f", "g", "h"][x]}${y + 1}`
    }
    static #coordinatesToIndex(coordinates) {
        const left = coordinates.substring(0, 1).toLowerCase().charCodeAt(0) - 97
        const right = parseInt(coordinates.substring(1, 2)) - 1
        return { x: left, y: right }
    }
    static isUpperCase(character) {
        return character === character.toUpperCase()
    }
}