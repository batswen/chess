let _getPseudoLegalMoves,_evaluate,_nmab,_getLegalMoves,_doMove,_doTempMove, _undoMove,_isInCheck
let _minimax

class Chess {
    #board
    #player
    #enpassant
    #castle
    #fen
    #undoList
    #en_passant
    #halfmove_clock
    #fullmove_number
    constructor(fen = "") {
        this.#fen = fen.split(" ")
        this.#board = setFEN(this.#fen[0])
        this.#player = this.#fen[1] === "w"
        this.#undoList = []
        const castle_str = this.#fen[2]
        this.#castle = {
            "K": castle_str.includes("K"),
            "Q": castle_str.includes("Q"),
            "k": castle_str.includes("k"),
            "q": castle_str.includes("q")
        }
        this.#en_passant = this.#fen[3]
        this.#halfmove_clock = this.#fen[4]
        this.#fullmove_number = this.#fen[5]
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
        _doTempMove = 0
        _undoMove = 0
        _isInCheck = 0
    }
    show() {
        console.log("_getPseudoLegalMoves",_getPseudoLegalMoves)
        console.log("_evaluate",_evaluate)
        console.log("_minimax",_minimax)
        console.log("_nmab",_nmab)
        console.log("_getLegalMoves",_getLegalMoves)
        console.log("_doMove",_doMove)
        console.log("_doTempMove",_doTempMove)
        console.log("_undoMove",_undoMove)
        console.log("_isInCheck",_isInCheck)
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

        fen += " "
        fen += this.#en_passant

        fen += " "
        fen += this.#halfmove_clock
        fen += " "
        fen += this.#fullmove_number
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
                this.doTempMove(move)
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
            this.doTempMove(move)
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
        const en_passant = this.#en_passant
        this.doTempMove(move)
        this.#undoList.pop()
        if (en_passant === this.#en_passant) {
            this.#en_passant = "-"
        }
        if (!this.#player) {
            this.#fullmove_number++
        }
        this.#player = !this.#player

    }
    doTempMove(move) {
        _doTempMove++
        const en_passant = coordinatesToXY(this.#en_passant)
        const from_x = move[0]
        const from_y = move[1]
        const to_x = move[2]
        const to_y = move[3]

        // console.log("moving:",coordinates(from_x,from_y),coordinates(to_x,to_y))
        const piece = this.#board[from_x + from_y * 8]
        this.#board[from_x + from_y * 8] = NONE
        this.#board[to_x + to_y * 8] = piece

        // Promotion
        if (piece === PAWN && to_y === 0) {
            this.#board[to_x + to_y * 8] = QUEEN
            this.#undoList.push({ type: "promotion_p" })
            return
        }
        if (piece === PAWN + WHITE && to_y === 7) {
            this.#board[to_x + to_y * 8] = QUEEN + WHITE
            this.#undoList.push({ type: "promotion_P" })
            return
        }

        // En passant - move
        if (piece === PAWN && from_y === 6 && to_y === 4) {
            this.#undoList.push({ type: "en_passant_move_p", en_passant: this.#en_passant })
            this.#en_passant = `${coordinates(from_x, 5)}`
            return
        }
        if (piece === PAWN + WHITE && from_y === 1 && to_y === 3) {
            this.#undoList.push({ type: "en_passant_move_P", en_passant: this.#en_passant })
            this.#en_passant = `${coordinates(from_x, 2)}`
            return
        }

        // En passant - attac
        if (piece === PAWN && to_x === en_passant[0] && to_y === en_passant[1]) {
            this.#undoList.push({ type: "en_passant_attac_p", en_passant: this.#en_passant })
            this.#en_passant = "-"
            return
        }
        if (piece === PAWN + WHITE && to_x === en_passant[0] && to_y === en_passant[1]) {
            this.#undoList.push({ type: "en_passant_attac_P", en_passant: this.#en_passant })
            this.#en_passant = "-"
            return
        }

        // Disable castle if rook moves
        if (piece === ROOK + WHITE && this.#castle["Q"] && from_x === 0 && from_y === 0) {
            this.#castle["Q"] = false
            this.#undoList.push({ type: "rook_Q" })
            return
        }
        if (piece === ROOK + WHITE && this.#castle["K"] && from_x === 7 && from_y === 0) {
            this.#castle["K"] = false
            this.#undoList.push({ type: "rook_K" })
            return
        }
        if (piece === ROOK && this.#castle["q"] && from_x === 0 && from_y === 7) {
            this.#castle["q"] = false
            this.#undoList.push({ type: "rook_q" })
            return
        }
        if (piece === ROOK && this.#castle["k"] && from_x === 7 && from_y === 7) {
            this.#castle["k"] = false
            this.#undoList.push({ type: "rook_k" })
            return
        }

        // Castling: move KING and ROOK, disable castling
        if (piece === KING && from_x === 4 && from_y === 7 && to_x === 6 && to_y === 7 && this.#castle["k"]) {
            this.#castle["k"] = false
            this.#castle["q"] = false
            this.#board[60] = NONE
            this.#board[63] = NONE
            this.#board[61] = ROOK
            this.#board[62] = KING
            this.#undoList.push({ type: "castle_k" })
            return
        } else if (piece === KING && from_x === 4 && from_y === 7 && to_x === 2 && to_y === 7 && this.#castle["q"]) {
            this.#castle["k"] = false
            this.#castle["q"] = false
            this.#board[60] = NONE
            this.#board[56] = NONE
            this.#board[59] = ROOK
            this.#board[58] = KING
            this.#undoList.push({ type: "castle_q" })
            return
        } else if (piece === KING + WHITE && from_x === 4 && from_y === 0 && to_x === 6 && to_y === 0 && this.#castle["K"]) {
            this.#castle["K"] = false
            this.#castle["Q"] = false
            this.#board[4] = NONE
            this.#board[7] = NONE
            this.#board[5] = ROOK + WHITE
            this.#board[6] = KING + WHITE
            this.#undoList.push({ type: "castle_K" })
            return
        } else if (piece === KING + WHITE && from_x === 4 && from_y === 0 && to_x === 2 && to_y === 0 && this.#castle["Q"]) {
            this.#castle["K"] = false
            this.#castle["Q"] = false
            this.#board[4] = NONE
            this.#board[0] = NONE
            this.#board[3] = ROOK + WHITE
            this.#board[2] = KING + WHITE
            this.#undoList.push({ type: "castle_Q" })
            return
        }
        this.#undoList.push({})
    }
    undoMove(move) {
        _undoMove++
        // Inverted to undo the move
        const to_x = move[0]
        const to_y = move[1]
        const from_x = move[2]
        const from_y = move[3]

        const undo = this.#undoList.pop()
        let undoPiece = NONE, en_passant
        switch (undo.type) {
            case "promotion_p": undoPiece = PAWN; break
            case "promotion_P": undoPiece = PAWN + WHITE; break
            case "en_passant_move_p": this.#en_passant = undo.en_passant; break
            case "en_passant_move_P": this.#en_passant = undo.en_passant; break
            case "en_passant_attack_p":
                this.#en_passant = undo.en_passant
                en_passant = coordinatesToXY(this.#en_passant)
                this.board[en_passant[0] + en_passant[1] * 8] = PAWN + WHITE
            break
            case "en_passant_attack_P":
                this.#en_passant = undo.en_passant
                en_passant = coordinatesToXY(this.#en_passant)
                this.board[en_passant[0] + en_passant[1] * 8] = PAWN
            break
            case "rook_Q": this.#castle["Q"] = true; break
            case "rook_K": this.#castle["K"] = true; break
            case "rook_q": this.#castle["q"] = true; break
            case "rook_k": this.#castle["k"] = true; break
            case "castle_K":
                this.#castle["K"] = true
                this.#castle["Q"] = true
                this.#board[5] = NONE
                this.#board[7] = ROOK + WHITE
            break
            case "castle_k":
                this.#castle["k"] = true
                this.#castle["q"] = true
                this.#board[61] = NONE
                this.#board[63] = ROOK + WHITE
            break
            case "castle_Q":
                this.#castle["K"] = true
                this.#castle["Q"] = true
                this.#board[2] = NONE
                this.#board[0] = ROOK + WHITE
            break
            case "castle_q":
                this.#castle["k"] = true
                this.#castle["q"] = true
                this.#board[59] = NONE
                this.#board[56] = ROOK + WHITE
            break
        }
        const piece = this.#board[from_x + from_y * 8]
        this.#board[from_x + from_y * 8] = undoPiece
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
        const result = [], en_passant = coordinatesToXY(this.#en_passant)
        let sum_delta_x, sum_delta_y, delta, delta_from, delta_to
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = this.#board[x + y * 8]
                if (piece === NONE) {
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
                        if ((en_passant[0] === x + 1 || en_passant[0] === x - 1) &&  en_passant[1] === y) {
                            result.push([x, y, en_passant[0], y])
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
                        if ((en_passant[0] === x + 1 || en_passant[0] === x - 1) &&  en_passant[1] === y) {
                            result.push([x, y, en_passant[0], y])
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
    #isFree(x, y) {  return this.#board[x + y * 8] === NONE }
    #isEnemy(x, y, player) {
        return player === "white" && this.#board[x + y * 8] >= PAWN + BLACK && this.#board[x + y * 8] <= KING + BLACK
            || player === "black" && this.#board[x + y * 8] >= PAWN + WHITE && this.#board[x + y * 8] <= KING + WHITE
    }
    #isPlayer(x, y, player) {
        return player === "white" && this.#board[x + y * 8] >= PAWN + WHITE && this.#board[x + y * 8] <= KING + WHITE
            || player === "black" && this.#board[x + y * 8] >= PAWN + BLACK && this.#board[x + y * 8] <= KING + BLACK
    }
    #isFreeOrEnemy(x, y, player) { return this.#isFree(x, y) || this.#isEnemy(x, y, player) }
}
