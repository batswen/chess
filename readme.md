# Chess

Unfinished chess game

main.js is the driver, chess.js and helper.js are the "backend"

### Missing:
- update FEN string
- update halfmove_clock

### Bugs
- promotion: always queen

See main.js for single/two player game

## getLegalMoves(player)
player = "white" | "black"

Returns an array of moves

[ [0,0,0,1], ...]

## getMovesReadable(player)
player = "white" | "black"

Returns an array of human readable moves

[ "a2a3", "a2a4", ... ]

## doMove(move) and undoMove(move)
where move = [0,0,0,1]

## doMoveReadable(move)
move = "a1a2"
