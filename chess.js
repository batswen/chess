

let _getPseudoLegalMoves,_evaluate,_nmab,_getLegalMoves,_doMove,_undoMove,_isInCheck,_getPiece
let _isFreeOrEnemy, _isFree,_isEnemy,_testPosition,_minimax

class Chess {
    #board
    #player
    #enpassant
    #castle
    #fen
    #undoList
    constructor(fen = "") {
        this.#fen = fen
        this.#board = setFEN(fen.split(" ")[0])
        this.#player = fen.split(" ")[1] === "w"
        this.#undoList = []
        const castle_str = fen.split(" ")[2]
        this.#castle = {
            "K": castle_str.includes("K"),
            "Q": castle_str.includes("Q"),
            "k": castle_str.includes("k"),
            "q": castle_str.includes("q")
        }
    }
    get board() {
        return this.#board
    }
    get boardReadable() {
        return boardToStringArray(this.#board)
    }
    init() {
        _getPseudoLegalMoves = 0
        _evaluate = 0
        _nmab = 0
        _getLegalMoves = 0
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
        console.log("_getLegalMoves",_getLegalMoves)
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
        let fen = getFEN(this.#board)
        fen += " "
        fen += this.#player ? "w" : "b"
        fen += " "

        fen += this.#castle["K"] ? "K" : ""
        fen += this.#castle["Q"] ? "Q" : ""
        fen += this.#castle["k"] ? "k" : ""
        fen += this.#castle["q"] ? "q" : ""

        return fen
    }
    evaluate(player) {
        _evaluate++
        const opposed_player = player === "white" ? "black" : "white"
        let piece, result = this.getLegalMoves(player).length - this.getLegalMoves(opposed_player).length
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                piece = this.#board[x + y * 8]
                if (piece === " ") {
                    continue
                }
                switch (piece) {
                    case PAWN:
                        result += -10
                    break
                    case PAWN + WHITE:
                        result += 10
                    break
                    case KNIGHT:
                        result += -30
                    break
                    case KNIGHT + WHITE:
                        result += 30
                    break
                    case BISHOP:
                        result += -30
                    break
                    case BISHOP + WHITE:
                        result += 30
                    break
                    case ROOK:
                        result += -50
                    break
                    case ROOK + WHITE:
                        result += 50
                    break
                    case QUEEN:
                        result += -90
                    break
                    case QUEEN + WHITE:
                        result += 90
                    break
                    case KING:
                        result += -900
                    break
                    case KING + WHITE:
                        result += 900
                    break
                }
            }
        }
        return player ? result / 10 : - result / 10
    }
    minimax(player, maxDepth) {
        const opposed_player = player === "white" ? "black" : "white"
        const nmab = (player, depth, alpha, beta) => {
            _nmab++
            const moves = this.getLegalMoves(player)
            let max = alpha, value
            if (depth === 0 || moves.length === 0) {
                return this.evaluate(opposed_player)
            }
            for (const move of moves) {
                this.doMove(move)
                value = nmab(opposed_player, depth - 1, -beta, -max)
                this.undoMove(move)
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
    getLegalMoves(player) {
        _getLegalMoves++
        const result = []
        const moves = this.#getPseudoLegalMoves(player)
        for (const move of moves) {
            this.doMove(move)
            if (!this.isInCheck(player)) {
                result.push([move[0], move[1], move[2], move[3]])
            }
            this.undoMove(move)
        }
        return result
    }
    getMovesReadable(player) {
        const moves = this.getLegalMoves(player)
        const result = []
        for (const move of moves) {
            result.push(`${coordinates(move[0], move[1])}${coordinates(move[2], move[3])}`)
        }
        return result
    }
    doMoveReadable(move) {
        let result = [0,0,0,0]
        result[0] = move.charCodeAt(0) - 97 // a => 0
        result[1] = move.charCodeAt(1) - 49 // 1 => 0
        result[2] = move.charCodeAt(2) - 97 // a => 0
        result[3] = move.charCodeAt(3) - 49 // 1 => 0
        this.doMove(result)
    }
    doMove(move) {
        _doMove++
        const from_x = move[0]
        const from_y = move[1]
        const to_x = move[2]
        const to_y = move[3]

        this.#undoList.push(this.#board[to_x + to_y * 8])

        // console.log("moving:",coordinates(from_x,from_y),coordinates(to_x,to_y))
        const piece = this.#board[from_x + from_y * 8]
        this.#board[from_x + from_y * 8] = 0
        this.#board[to_x + to_y * 8] = piece
        // Promotion
        if (piece === PAWN && y === 0) { this.#board[to_x + to_y * 8] = QUEEN }
        if (piece === PAWN + WHITE && y === 7) { this.#board[to_x + to_y * 8] = QUEEN + WHITE }
        // Castle
        if (from_x === 0 && from_y === 0) { this.#castle["Q"] = false }
        if (from_x === 7 && from_y === 0) { this.#castle["K"] = false }
        if (from_x === 0 && from_y === 7) { this.#castle["q"] = false }
        if (from_x === 7 && from_y === 7) { this.#castle["k"] = false }
        // Rochade, Schwarz, Königseitig
        if (piece === KING && from_x === 4 && from_y === 7 && to_x === 6 && to_y === 7 && this.#castle["k"]) {
            this.#castle["k"] = false
            this.#castle["q"] = false
            this.#board[60] = 0
            this.#board[63] = 0
            this.#board[61] = ROOK
            this.#board[62] = KING
            this.undoList.push(KING)
        } else if (piece === KING && from_x === 4 && from_y === 7 && to_x === 2 && to_y === 7 && this.#castle["q"]) {
            this.#castle["k"] = false
            this.#castle["q"] = false
            this.#board[60] = 0
            this.#board[56] = 0
            this.#board[59] = ROOK
            this.#board[58] = KING
            this.undoList.push(KING)
        } else if (piece === KING + WHITE && from_x === 4 && from_y === 0 && to_x === 6 && to_y === 0 && this.#castle["K"]) {
            this.#castle["K"] = false
            this.#castle["Q"] = false
            this.#board[4] = 0
            this.#board[7] = 0
            this.#board[5] = ROOK + WHITE
            this.#board[6] = KING + WHITE
            this.undoList.push(KING + WHITE)
        } else if (piece === KING + WHITE && from_x === 4 && from_y === 0 && to_x === 2 && to_y === 0 && this.#castle["Q"]) {
            this.#castle["K"] = false
            this.#castle["Q"] = false
            this.#board[4] = 0
            this.#board[0] = 0
            this.#board[2] = ROOK + WHITE
            this.#board[3] = KING + WHITE
            this.undoList.push(KING + WHITE)
        }
    }
    undoMove(move) {
        _undoMove++
        // Inverted to undo the move
        const to_x = move[0]
        const to_y = move[1]
        const from_x = move[2]
        const from_y = move[3]

        const piece = this.#board[from_x + from_y * 8]
        this.#board[from_x + from_y * 8] = this.#undoList.pop()
        this.#board[to_x + to_y * 8] = piece
    }
    isInCheck(player) {
        const opposed_player = player === "white" ? "black" : "white"
        _isInCheck++
        const enemyMoves = this.#getPseudoLegalMoves(opposed_player)
        let king_x = -1, king_y

        // Find King
        for (let x = 0; x < 8 && king_x === -1; x++) {
            for (let y = 0; y < 8 && king_x === -1; y++) {
                if (player === "white" && this.#board[x + y * 8] === KING + WHITE || player === "black" && this.#board[x + y * 8] === KING) {
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
    #getPseudoLegalMoves(player) {
        _getPseudoLegalMoves++
        const result = []
        let sum_delta_x, sum_delta_y, delta, delta_from, delta_to
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = this.#board[x + y * 8]
                if (piece === 0) {
                    continue
                }
                if (player === "white" && piece < 8 || player === "black" && piece >= 8) {
                    continue
                }
                switch (piece) {
                    case PAWN + WHITE:
                    if (y < 7) {
                        // Move forward
                        if (this.#isFree(x, y + 1)) {
                            result.push([x, y, x, y + 1])
                            // First move
                            if (y === 1 && this.#isFree(x, 2) && this.#isFree(x, 3)) {
                                result.push([x, 1, x, 3])
                            }
                        }
                        // Attack
                        if (testPosition(x - 1, y + 1) && this.#isEnemy(x - 1, y + 1, player)) {
                            result.push([x, y, x - 1, y + 1])
                        }
                        if (testPosition(x + 1, y + 1) && this.#isEnemy(x + 1, y + 1, player)) {
                            result.push([x, y, x + 1, y + 1])
                        }
                    }
                    break
                    case PAWN + BLACK:
                    if (y > 0) {
                        // Move
                        if (this.#isFree(x, y - 1)) {
                            result.push([x, y, x, y - 1])
                            // First move
                            if (y === 6 && this.#isFree(x, 5) && this.#isFree(x, 4)) {
                                result.push([x, 6, x, 4])
                            }
                        }
                        // Attack
                        if (testPosition(x - 1, y - 1) && this.#isEnemy(x - 1, y - 1, player)) {
                            result.push([x, y, x - 1,y - 1])
                        }
                        if (testPosition(x + 1, y - 1) && this.#isEnemy(x + 1, y - 1, player)) {
                            result.push([x, y, x + 1, y - 1])
                        }
                    }
                    break
                    case KNIGHT + BLACK:
                    case KNIGHT + WHITE:
                    for (const move of knightMovesArray) {
                        if (testPosition(x + move.x, y + move.y)) {
                            if (this.#isFreeOrEnemy(x + move.x, y + move.y, player)) {
                                result.push([x, y, x + move.x, y + move.y])
                            }
                        }
                    }
                    break
                    case KING + BLACK:
                    case KING + WHITE:
                    for (const move of kingMovesArray) {
                        if (testPosition(x + move.x, y + move.y)) {
                            if (this.#isFreeOrEnemy(x + move.x, y + move.y, player)) {
                                result.push([x, y, x + move.x, y + move.y])
                            }
                        }
                    }
                    if (piece === KING + BLACK && this.#isFree(5, 7) && this.#isFree(6, 7) && this.#castle["k"]) {
                        result.push([4, 7, 6, 7])
                    }
                    if (piece === KING + BLACK && this.#isFree(3, 7) && this.#isFree(2, 7) && this.#isFree(1, 7) && this.#castle["q"]) {
                        result.push([4, 7, 2, 7])
                    }
                    if (piece === KING + WHITE && this.#isFree(5, 0) && this.#isFree(6, 0) && this.#castle["K"]) {
                        result.push([4, 0, 6, 0])
                    }
                    if (piece === KING + WHITE && this.#isFree(3, 0) && this.#isFree(2, 0) && this.#isFree(1, 0) && this.#castle["Q"]) {
                        result.push([4, 0, 2, 0])
                    }
                    break
                    case ROOK + BLACK: case ROOK + WHITE:
                    case BISHOP + BLACK: case BISHOP + WHITE:
                    case QUEEN + BLACK: case QUEEN + WHITE:
                    delta_from = 0
                    delta_to = 7
                    if (piece === ROOK + BLACK || piece === ROOK + WHITE) {
                        delta_to = 3
                    } else if (piece === BISHOP + BLACK || piece === BISHOP + WHITE) {
                        delta_from = 4
                    }

                    for (delta = delta_from; delta <= delta_to; delta++) {
                        sum_delta_x = 0
                        sum_delta_y = 0
                        for (let distance = 0; distance < 8; distance++) {
                            sum_delta_x += deltas[delta].x
                            sum_delta_y += deltas[delta].y
                            if (testPosition(x + sum_delta_x, y + sum_delta_y)) {
                                if (this.#isPlayer(x + sum_delta_x, y + sum_delta_y, player)) {
                                    break
                                }
                                result.push([x, y, x + sum_delta_x, y + sum_delta_y])
                                if (this.#isEnemy(x + sum_delta_x, y + sum_delta_y, player)) {
                                    break
                                }
                            }
                        }
                    } // delta
                } // switch
            } // for x
        } // for y
        return result
    }
    #isFree(x, y) {  return this.#board[x + y * 8] === 0 }
    #isEnemy(x, y, player) {
        return player === "white" && this.#board[x + y * 8] >= PAWN + BLACK && this.#board[x + y * 8] <= KING + BLACK
            || player === "black" && this.#board[x + y * 8] >= PAWN + WHITE && this.#board[x + y * 8] <= KING + WHITE
    }
    #isPlayer(x, y, player) {
        return player === "white" && this.#board[x + y * 8] >= PAWN + WHITE && this.#board[x + y * 8] <= KING + WHITE
            || player === "black" && this.#board[x + y * 8] >= PAWN + BLACK && this.#board[x + y * 8] <= KING + BLACK
    }
    #isFreeOrEnemy(x, y, player) { return this.#isFree(x, y) || this.#isEnemy(x, y, player) }

    // doMove(move) {
    //     _doMove++
    //     const from = move.slice(0, 2)
    //     const to = move.slice(2, 4)
    //
    //     let piece
    //
    //     piece = this.getPiece(from[0], from[1])
    //     this.setPiece(from[0], from[1], " ")
    //     this.setPiece(to[0], to[1], piece)
    //
    //     // Rochade, Schwarz, Königseitig
    //     if (piece === "k" && from[0] === 4 && from[1] === 7 && to[0] === 6 && to[1] === 7 && this.#castle["k"]) {
    //         this.#castle["k"] = false
    //         this.setPiece(7, 7, " ")
    //         this.setPiece(5, 7, "r")
    //         this.lastMove.push([4, 7, 6, 7, 7, 7, 5, 7])
    //         this.lastMovePiece.push("k")
    //     } else if (piece === "k" && from[0] === 4 && from[1] === 7 && to[0] === 2 && to[1] === 7 && this.#castle["q"]) {
    //         this.#castle["q"] = false
    //         this.setPiece(0, 7, " ")
    //         this.setPiece(3, 7, "r")
    //         this.lastMove.push([4, 7, 2, 7, 0, 7, 3, 7])
    //         this.lastMovePiece.push("k")
    //     } else if (piece === "K" && from[0] === 4 && from[1] === 0 && to[0] === 6 && to[1] === 0 && this.#castle["K"]) {
    //         this.#castle["K"] = false
    //         this.setPiece(7, 0, " ")
    //         this.setPiece(5, 0, "R")
    //         this.lastMove.push([4, 0, 6, 0, 7, 0, 5, 0])
    //         this.lastMovePiece.push("K")
    //     } else if (piece === "K" && from[0] === 4 && from[1] === 0 && to[0] === 2 && to[1] === 0 && this.#castle["Q"]) {
    //         this.#castle["Q"] = false
    //         this.setPiece(0, 0, " ")
    //         this.setPiece(3, 0, "R")
    //         this.lastMove.push([4, 0, 2, 0, 0, 0, 3, 0])
    //         this.lastMovePiece.push("K")
    //     } else {
    //         this.lastMove.push(move)
    //         this.lastMovePiece.push(this.getPiece(to[0], to[1]))
    //     }
    // }
    // doMoveReadable(move) {
    //     const from = Chess.#coordinatesToIndex(move.substring(0, 2))
    //     const to = Chess.#coordinatesToIndex(move.substring(2, 4))
    //     this.doMove([from.x, from.y, to.x, to.y])
    // }
    // undoMove() {
    //     _undoMove++
    //     let piece, move
    //     if (this.lastMove.length === 0) {
    //         return
    //     }
    //     move = this.lastMove.pop()
    //     if (move.length > 4) {
    //         piece = this.getPiece(move[2], move[3])
    //         this.setPiece(move[2], move[3], " ")
    //         this.setPiece(move[0], move[1])
    //         if (move[4] === 7 && move[5] === 7) {
    //             this.#castle["k"] = true
    //             this.setPiece(7, 7, "r")
    //         } else if (move[4] === 0 && move[5] === 7) {
    //             this.#castle["q"] = true
    //             this.setPiece(0, 7, "r")
    //         } else if (move[4] === 7 && move[5] === 0) {
    //             this.#castle["K"] = true
    //             this.setPiece(7, 0, "R")
    //         } else if (move[4] === 0 && move[5] === 0) {
    //             this.#castle["Q"] = true
    //             this.setPiece(0, 0, "R")
    //         }
    //     } else {
    //         const from = move.slice(2, 4)
    //         const to = move.slice(0, 2)
    //         piece = this.getPiece(from[0], from[1])
    //         this.setPiece(from[0], from[1], this.lastMovePiece.pop())
    //         this.setPiece(to[0], to[1], piece)
    //     }
    // }

}
