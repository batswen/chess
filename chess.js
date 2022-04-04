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
    // #lastMove
    // #lastMovePiece
    constructor(fen = "") {
        this.#board = new Board()
        this.#fen = fen
        this.#reset()
    }
    set player(name) {
        this.#player = name === "w"
    }
    get player() {
        return this.#player ? "White" : "Black"
    }
    get castle() {
        return this.#castle
    }
    get fen() {
        return this.#fen
    }
    set fen(fem) {
        this.#fen = fen
        this.#reset()
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
        _minimax = 0
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
    updateFEN() {
        this.#fen = this.#board.getFEN()
    }
    #reset() {
        this.#player = this.#fen.split(" ")[1] === "w"
        this.#enpassant = ""
        this.#castle = this.#fen.split(" ")[2]
        this.#board.setFEN(this.#fen.split(" ")[0])
        this.lastMove = []
        this.lastMovePiece = []
    }
    getBoard() {
        return this.#board.getBoard()
    }
    evaluate(player = this.#player) {
        _evaluate++
        let piece, result = Math.floor((this.getMoves(player).length - this.getMoves(!player).length) / 10)
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
        let piece, sum_delta_x, sum_delta_y, delta, delta_from, delta_to
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                piece = this.getPiece(x, y)
                if (piece === " ") {
                    continue
                }
                if (player && !Chess.isUpperCase(piece) || !player && Chess.isUpperCase(piece)) {
                    continue
                }
                switch (piece) {
                case "P":
                    if (this.testPosition(x, y + 1)) {
                        if (this.isFree(x, y + 1)) {
                            result.push([x, y, x, y + 1])//`${Chess.#indexToCoordinates(x, y)}${Chess.#indexToCoordinates(x, y + 1)}`)
                        }
                    }
                    if (this.testPosition(x - 1, y + 1)) {
                        if (this.isEnemy(x - 1, y + 1, piece)) {
                            result.push([x,y,x - 1,y + 1])
                        }
                    }
                    if (this.testPosition(x + 1, y + 1)) {
                        if (this.isEnemy(x + 1, y + 1, piece)) {
                            result.push([x, y, x - 1, y + 1])
                        }
                    }

                    if (this.testPosition(x, y + 1) && this.testPosition(x, y + 2) && y === 1) {
                        if (this.isFree(x, y + 1) && this.isFree(x, y + 2)) {
                            result.push([x, y, x, y + 2])
                        }
                    }
                break
                case "p":
                    if (this.testPosition(x, y + 1)) {
                        if (this.isFree(x, y - 1)) {
                            result.push([x, y, x, y - 1])
                        }
                    }
                    if (this.testPosition(x - 1, y - 1)) {
                        if (this.isEnemy(x - 1, y - 1, piece)) {
                            result.push([x, y, x - 1,y - 1])
                        }
                    }
                    if (this.testPosition(x + 1, y - 1)) {
                        if (this.isEnemy(x + 1, y - 1, piece)) {
                            result.push([x, y, x + 1, y - 1])
                        }
                    }

                    if (this.testPosition(x, y - 1) && this.testPosition(x, y - 2) && y === 6) {
                        if (this.isFree(x, y - 1) && this.isFree(x, y - 2)) {
                            result.push([x, y, x, y - 2])
                        }
                    }

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
    // minimax(player, depth) {
    //     _minimax++
    //     let best_move = -1, best_score = player ? Infinity : -Infinity, result
    //     const moves = this.getMoves(player)
    //
    //     if (depth === 0 || moves.length === 0) {
    //         return [this.evaluate(player), best_move]
    //     } else {
    //        for (const move of moves) {
    //            this.doMove(move)
    //            if (player) {
    //                result = this.minimax(!player, depth-1)[0]
    //                if (result > best_score) {
    //                    best_score = result
    //                    best_move = move
    //                }
    //            } else {
    //                result = this.minimax(!player, depth-1)[0]
    //                if (result < best_score) {
    //                    best_score = result
    //                    best_move = move
    //                }
    //            }
    //            this.undoMove()
    //        }
    //     }
    //     return [best_score, best_move]
    // }
    minimax(player, maxDepth) {
        _minimax++

        const nmab = (player, depth, alpha, beta) => {
            _nmab++
            const moves = this.getMoves(player)
            let max = alpha, value
            if (depth === 0 || moves.length === 0) {
                return this.evaluate(player)
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
        this.lastMove.push(move)
        this.lastMovePiece.push(this.getPiece(to[0], to[1]))
        piece = this.getPiece(from[0], from[1])
        this.setPiece(from[0], from[1], " ")
        this.setPiece(to[0], to[1], piece)
        this.updateFEN()
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
        const from = move.slice(2, 4)
        const to = move.slice(0, 2)
        piece = this.getPiece(from[0], from[1])
        this.setPiece(from[0], from[1], this.lastMovePiece.pop())
        this.setPiece(to[0], to[1], piece)

        this.updateFEN()
    }
    isInCheck(player) {
        _isInCheck++
        const enemyMoves = this.#getPseudoLegalMoves(!player)
        let king_x = -1, king_y, king_position_string

        // Find King
        for (let x = 0; x < 8 && king_x === -1; x++) {
            for (let y = 0; y < 8 && king_x === -1; y++) {
                if (player && this.getPiece(x, y) === "K" || !player && this.getPiece(x, y) === "k") {
                    king_x = x; king_y = y
                }
            }
        }

        king_position_string = `${Chess.#indexToCoordinates(king_x, king_y)}`

        for (const move of enemyMoves) {
            // is king in check
            if (move.slice(-2) === king_position_string) {
                return true
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
