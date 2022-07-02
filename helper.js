const PIECES = ["0b", "♟", "♜", "♞", "♝", "♛", "♚", "!", "0w", "♙", "♖", "♘", "♗", "♕", "♔"]
const PIECES_AS_CHARS = ["0b", "p", "r", "n", "b", "q", "k", "!", "0w", "P", "R", "N", "B", "Q", "K"]
const NONE = 0, BLACK = 0, PAWN = 1, ROOK = 2, KNIGHT = 3, BISHOP = 4, QUEEN = 5, KING = 6, WHITE = 8

// Movement: Bishop, Rook, Queen
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
function coordinates(x, y) {
    return `${["a", "b", "c", "d", "e", "f", "g", "h"][x]}${y + 1}`
}
function coordinatesToXY(position) {
    let x, y
    x = position.charCodeAt(0) - 97
    y = position.charCodeAt(1) - 49
    return [x, y]
}
function testPosition(x, y) { return x >= 0 && x <= 7 && y >= 0 && y <= 7 }

function setFEN(fen) {
    const fenArray = fen.split("\/")
    const board = new Array(64).fill(0)
    let token, delta
    for (let y = 7; y >= 0; y--) {
        delta = 0; token = 0
        for (let x = 0; x < fenArray[7 - y].length; x++) {
            const character = fenArray[7 - y].charAt(x)
            switch (character) {
                case "p": token = PAWN; break
                case "P": token = PAWN + WHITE; break
                case "r": token = ROOK; break
                case "R": token = ROOK + WHITE; break
                case "n": token = KNIGHT; break
                case "N": token = KNIGHT + WHITE; break
                case "b": token = BISHOP; break
                case "B": token = BISHOP + WHITE; break
                case "q": token = QUEEN; break
                case "Q": token = QUEEN + WHITE; break
                case "k": token = KING; break
                case "K": token = KING + WHITE; break
                default:  token = 0; delta += parseInt(character) - 1; break
            }
            board[(x + delta) + y * 8] = token
        }
    }
    return board
}
/*
    string getFEN(board)
*/
function getFEN(board) {
    let result = "", x, amount_empty
    for (let y = 7; y >= 0; y--) {
        x = 0
        amount_empty = 0
        while (x < 8) {
            if (board[x + y * 8] === 0) {
                amount_empty++
            } else {
                if (amount_empty > 0) {
                    result += amount_empty
                    amount_empty = 0
                }
                result += PIECES_AS_CHARS[board[x + y * 8]]
            }
            x++
        }
        if (amount_empty > 0) {
            result += "" + amount_empty
            amount_empty = 0
        }
        result += "/"
    }
    return result.substring(0, result.length - 1)
}
/*
    array getBoard(s)
    [["a1", "k"], ["g5", "P"], ...]
    0 = A1, 63 = H8
*/
function boardToStringArray(board) {
    const result = []
    for (let y = 0; y < 8 ; y++) {
        for (let x = 0; x < 8; x++) {
            switch (board[x + 8 * y]) {
            case ROOK: result.push([`${["a", "b", "c", "d", "e", "f", "g", "h"][x]}${y + 1}`, PIECES[ROOK]]); break
            case ROOK + WHITE: result.push([`${["a", "b", "c", "d", "e", "f", "g", "h"][x]}${y + 1}`, PIECES[ROOK + WHITE]]); break
            case BISHOP: result.push([`${["a", "b", "c", "d", "e", "f", "g", "h"][x]}${y + 1}`, PIECES[BISHOP]]); break
            case BISHOP + WHITE: result.push([`${["a", "b", "c", "d", "e", "f", "g", "h"][x]}${y + 1}`, PIECES[BISHOP + WHITE]]); break
            case KNIGHT: result.push([`${["a", "b", "c", "d", "e", "f", "g", "h"][x]}${y + 1}`, PIECES[KNIGHT]]); break
            case KNIGHT + WHITE: result.push([`${["a", "b", "c", "d", "e", "f", "g", "h"][x]}${y + 1}`, PIECES[KNIGHT + WHITE]]); break
            case QUEEN: result.push([`${["a", "b", "c", "d", "e", "f", "g", "h"][x]}${y + 1}`, PIECES[QUEEN]]); break
            case QUEEN + WHITE: result.push([`${["a", "b", "c", "d", "e", "f", "g", "h"][x]}${y + 1}`, PIECES[QUEEN + WHITE]]); break
            case KING: result.push([`${["a", "b", "c", "d", "e", "f", "g", "h"][x]}${y + 1}`, PIECES[KING]]); break
            case KING + WHITE: result.push([`${["a", "b", "c", "d", "e", "f", "g", "h"][x]}${y + 1}`, PIECES[KING + WHITE]]); break
            case PAWN: result.push([`${["a", "b", "c", "d", "e", "f", "g", "h"][x]}${y + 1}`, PIECES[PAWN]]); break
            case PAWN + WHITE: result.push([`${["a", "b", "c", "d", "e", "f", "g", "h"][x]}${y + 1}`, PIECES[PAWN + WHITE]]); break
            default: result.push([`${["a", "b", "c", "d", "e", "f", "g", "h"][x]}${y + 1}`, " "])
            }
        }
    }
    return result
}
