# Chess

Unfinished chess game

Missing:
- undo Castling
- undo Promotion
- Update FEN string

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
