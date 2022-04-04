/*
 a1 = 0,0
 h1 = 0,7
 h8 = 7,7
*/

class Board {
    #board
    constructor() {
        this.#board = []
        for (let index = 0; index < 64; index++) {
            this.#board.push(" ")
        }
    }
    /*
        void setPiece(x, y, piece)
    */
    setPiece(x, y, piece) {
        this.#board[x + y * 8] = piece
    }
    /*
        string getPiece(x, y)
    */
    getPiece(x, y) {
        return this.#board[x + y * 8]
    }
    /*
        void setFEN(fen)
    */
    setFEN(fen) {
        let character
        const fenArray = fen.split("\/")
        for (let y = 7; y >= 0; y--) {
            let delta = 0
            for (let x = 0; x < fenArray[7 - y].length; x++) {
                character = fenArray[7 - y].charAt(x);
                if (!isNaN(character * 1)){
                    delta += parseInt(character) - 1
                } else {
                    this.setPiece(x + delta, y, character)
                }
            }
        }
    }
    /*
        string getFEN()
    */
    getFEN() {
        let result = "", x, amount_empty
        for (let y = 7; y >= 0; y--) {
            x = 0
            amount_empty = 0
            while (x < 8) {
                if (this.getPiece(x, y) === " ") {
                    amount_empty++
                } else {
                    if (amount_empty > 0) {
                        result += amount_empty
                        amount_empty = 0
                    }
                    result += this.getPiece(x, y)
                }
                x++
            }
            if (amount_empty > 0) {
                result += amount_empty
                amount_empty = 0
            }
            result += "/"
        }
        return result.substring(0, result.length - 1)
    }
    /*
        array getBoard(s)
        [["a1", "k"], ["g5", "P"], ...]
    */
    getBoard() {
        // 0 = a8, 63 = h1
        const result = []
        for (let y = 0; y < 8 ; y++) {
            for (let x = 0; x < 8; x++) {
                if (this.getPiece(x, y) !== " ") {
                    switch (this.getPiece(x, y)) {
                    case "r": result.push([`${["a", "b", "c", "d", "e", "f", "g", "h"][x]}${y + 1}`,"♜"]); break
                    case "R": result.push([`${["a", "b", "c", "d", "e", "f", "g", "h"][x]}${y + 1}`,"♖"]); break
                    case "b": result.push([`${["a", "b", "c", "d", "e", "f", "g", "h"][x]}${y + 1}`,"♝"]); break
                    case "B": result.push([`${["a", "b", "c", "d", "e", "f", "g", "h"][x]}${y + 1}`,"♗"]); break
                    case "n": result.push([`${["a", "b", "c", "d", "e", "f", "g", "h"][x]}${y + 1}`,"♞"]); break
                    case "N": result.push([`${["a", "b", "c", "d", "e", "f", "g", "h"][x]}${y + 1}`,"♘"]); break
                    case "q": result.push([`${["a", "b", "c", "d", "e", "f", "g", "h"][x]}${y + 1}`,"♛"]); break
                    case "Q": result.push([`${["a", "b", "c", "d", "e", "f", "g", "h"][x]}${y + 1}`,"♕"]); break
                    case "k": result.push([`${["a", "b", "c", "d", "e", "f", "g", "h"][x]}${y + 1}`,"♚"]); break
                    case "K": result.push([`${["a", "b", "c", "d", "e", "f", "g", "h"][x]}${y + 1}`,"♔"]); break
                    case "p": result.push([`${["a", "b", "c", "d", "e", "f", "g", "h"][x]}${y + 1}`,"♟"]); break
                    case "P": result.push([`${["a", "b", "c", "d", "e", "f", "g", "h"][x]}${y + 1}`,"♙"]); break
                    }
                }
            }
        }
        return result
    }
}
