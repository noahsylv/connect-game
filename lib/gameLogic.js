

export const WHITE = 'white';
export const BLACK = 'black';
export const EMPTY = 'Empty';
export const getOtherPlayer = (player) => {
    return (player === WHITE ? BLACK : WHITE)
}

export const isPlayer = (tile) => {
    return tile === WHITE || tile === BLACK;
}

export const resetBoard = (board, n) => {
    [...Array(n).keys()].map((row) => {
        [...Array(n).keys()].map((col) => {
            board[[row, col]] = EMPTY;
        });
    });
    return board;
}

export const copyBoard = (board) => {
    return structuredClone(board);
}

export const makeMove = (board, move, player) => {
    board[move] = player;
}

export const unmakeMove = (board, move) => {
    board[move] = EMPTY;
}

export const canMove = (board, move) => {
    return board[move] === EMPTY;
}

export function getWinner(board, n, movesToWin) {
    for (var startRow = 0; startRow < n - movesToWin + 1; startRow++) {
        for (var startCol = 0; startCol < n - movesToWin + 1; startCol++) {
            const rowResults = checkConnectionFromSource(board, movesToWin, startRow, startCol, 0, 1);
            if (rowResults) {
                return rowResults;
            }
            const colResults = checkConnectionFromSource(board, movesToWin, startRow, startCol, 1, 0);
            if (colResults) {
                return colResults;
            }
            const diag1Results = checkConnectionFromSource(board, movesToWin, startRow, startCol, 1, 1);
            if (diag1Results) {
                return diag1Results;
            }
            const diag2Results = checkConnectionFromSource(board, movesToWin, startRow, startCol + movesToWin, 1, -1);
            if (diag2Results) {
                return diag2Results;
            }
        }
    }
    return null;
}

function checkConnectionFromSource(board, movesToWin, startRow, startCol, deltaRow, deltaCol) {
    var currWinner = null;
    for (var i = 0; i < movesToWin; i++) {
        const col = startCol + i * deltaCol;
        const row = startRow + i * deltaRow;
        const tile = board[[row, col]];
        if (!isPlayer(tile)) return false;
        if (currWinner == null) {
            currWinner = tile
        } else if (currWinner !== tile) {
            return false;
        }
    }
    return currWinner;
}