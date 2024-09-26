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
    // Ensure the square is not empty and the three squares match
    if (board[a[0]][a[1]] !== Square.EMPTY &&
        board[a[0]][a[1]] === board[b[0]][b[1]] &&
        board[a[0]][a[1]] === board[c[0]][c[1]]) {
      return board[a[0]][a[1]];
    }
  }
  // No winner found
  return Square.EMPTY;
};

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

