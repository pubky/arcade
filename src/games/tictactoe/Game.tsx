import { Square, TBoard } from ".";

// triggered on click event to make a valid move on the board
// return the board
export const makeMove = (board: TBoard, move: [number, number], square: Square): TBoard => {
  if (board[move[0]][move[1]] !== Square.EMPTY) {
    return board;
  } else {
    board[move[0]][move[1]] = square;
    return board;
  };
};

// // TODO: Implement function to handle polling for opponent's move
// const poll = () => {
//   // If player's turn, do not proceed
//   // TODO get actor and matchState from context
//   if (actor === Actor.X && matchState === MatchState.X_MOVE ||
//     actor === Actor.O && matchState === MatchState.O_MOVE) return null;

//   // TODO: use context state to determine opponent's pubky
//   const opponentPubky = actor === Actor.X ? oPubky : xPubky;
//   const opponentUrl = `pubky://${opponentPubky}/pub/tictactoe.app/`;
//   // If passive observer, always GET game state from current player (bit of a hack)
//   if (Actor.PASSIVE) {
//     // TODO: use matchState from context
//     matchState === MatchState.X_MOVE
//       ? opponentUrl = `pubky://${xPubky}/pub/tictactoe.app/`
//       : opponentUrl = `pubky://${oPubky}/pub/tictactoe.app/`;
//   };
//   // GET game state from opponent's url at interval
//   const opponentState = client.get(opponentUrl) as TRes;
//   // Validate opponent's game state
//   if (!isValidMove({ board, matchState }, opponentState)) throw new Error("Invalid move: Opponent's game state is invalid");
//   // overwrite own board and match state with opponent's
//   board = opponentState.board;
//   matchState = opponentState.matchState;
//   // Check for winner, update board accordingly and disable further moves and polling
//   if (checkWin(board)) {
//     // TODO: set state and rerender
//     matchState = MatchState.FINISH;
//     // TODO: end the game (block further moves, provide option for replay, return to menu etc)
//   };
//   // Update game state, board and turn
// };

// Check for a win
// to be used after every own and opponent move
export const checkWin = (board: TBoard): Square => {
  const lines = [
    [[0, 0], [0, 1], [0, 2]],
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
    [[0, 0], [1, 0], [2, 0]],
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
    [[0, 0], [1, 1], [2, 2]],
    [[0, 2], [1, 1], [2, 0]],
  ];

  for (const line of lines) {
    const [a, b, c] = line;
    // TODO read board state from context
    if (board[a[0]][a[1]] && board[a[0]][a[1]] === board[b[0]][b[1]] && board[a[0]][a[1]] === board[c[0]][c[1]]) {
      return board[a[0]][a[1]];
    }
  }
  // EMPTY means no winner yet
  return Square.EMPTY;
}

// export const isValidMove = (localGameState: TRes, otherGameState: TRes) => {
//   if (typeof otherGameState !== 'object' || otherGameState === null) return false;
//   if (!Array.isArray(otherGameState.board) || otherGameState.board.length !== 3) return false;
//   for (const row of otherGameState.board) {
//     if (!Array.isArray(row) || row.length !== 3) return false;
//     for (const cell of row) {
//       if (cell !== Square.X && cell !== Square.O && cell !== Square.EMPTY && cell !== null) return false;
//     }
//   };
//   //if (otherGameState.currentPlayer !== Actor.X && otherGameState.currentPlayer !== Actor.O) return false;
//   if (typeof otherGameState.gameOver !== 'boolean') return false;

//   function countNulls(board) {
//     return board.flat().filter(cell => cell === null).length;
//   }

//   const localNullCount = countNulls(localGameState.board);
//   const otherNullCount = countNulls(otherGameState.board);

//   // Ensure the received game state has exactly one less null than the local game state
//   return otherNullCount === localNullCount - 1;
// };

