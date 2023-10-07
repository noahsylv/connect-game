import { canMove, copyBoard, getOtherPlayer, getWinner, isPlayer, makeMove, unmakeMove } from "./gameLogic";

function getAllMoves(board) {
    const rawMoves = Object.keys(board).filter((k) => {return !isPlayer(board[k])});
    return rawMoves.map((move) => {
        const splitMove = move.split(",");
        return [parseInt(splitMove[0]), parseInt(splitMove[1])];
    });
}


export function getAiMoveFromApi(board, player, callback) {
    fetch("api/getAiMoveFromServer?board=" + board + "&player="+player[0])
        .then(res => res.json())
        .then(callback)
}

// general functions
// get all possible moves for k moves

// find best move with max depth
// default valuation function otherwise

function getCenterEvaluationFunction(n) {
    const mid = Math.floor(n / 2);
    const f = (_, fullMove) => {
        // console.log("full move" + fullMove);
        return fullMove.map((move) => {
            return Math.abs(mid - move[0]) + Math.abs(mid - move[1]);
        }).reduce((partialSum, a) => partialSum + a, 0);
    }
    return f;
}

function getBasicValuationFunction(n, movesToWin, player) {
    const centerValuationFunction = getCenterEvaluationFunction(n);
    const aggressionValuationFunction = (board, fullMove) => {
        return fullMove.map((move) => {
            return aggressionValue(board, move, player, movesToWin);
        }).reduce((partialSum, a) => partialSum + a, 0);
    };
    const defensiveValuationFunction = (board, fullMove) => {
        return fullMove.map((move) => {
            return defensiveValue(board, move, player, movesToWin);
        }).reduce((partialSum, a) => partialSum + a, 0);
    };
    const functionsAndWeights = [
        [aggressionValuationFunction, 2],
        [defensiveValuationFunction, 2],
        [centerValuationFunction, 1] 
    ]
    const l = ["aggression", "defense", "center"];

    const val = (board, fullMove) => {
        // console.log("----- full move is " + fullMove);
        // console.log(fullMove);
        return functionsAndWeights.map((x, i) => {
            const f = x[0];
            const w = x[1];
            const value = f(board, fullMove) * w;
            // console.log(l[i]);
            // console.log(l[i] + " value is " + value);
            return value;
        }).reduce((partialSum, a) => partialSum + a, 0);
    }
    return val;
}

function connectionValue(board, move, rowDelta, colDelta, playerFilter, connectionTarget) {
    // need greedy solution...
    var bestNumInConnection = 0;
    for (var startIndex = -connectionTarget+1; startIndex < connectionTarget; startIndex++) {
        var numInConnection = 0;
        const endIndex = startIndex + connectionTarget;
        for (var i = startIndex; i < endIndex; i++) {
            const tile = board[[move[0] + i * rowDelta, move[1] + i * colDelta]];
            if (tile == playerFilter) {
                numInConnection += 1;
            } else if (isPlayer(tile)) {
                numInConnection = 0;
                break;
            } else {
                continue;
            }
        }
        if (numInConnection > bestNumInConnection) {
            bestNumInConnection = numInConnection;
        }
    }
    return bestNumInConnection;
}

function placementValue(board, move, playerFilter, movesToWin) {
    return connectionValue(board, move, 1, 0, playerFilter, movesToWin, playerFilter) + 
    connectionValue(board, move, 0, 1, playerFilter, movesToWin, playerFilter) +
    connectionValue(board, move, 1, 1, playerFilter, movesToWin, playerFilter) +
    connectionValue(board, move, -1, 1, playerFilter, movesToWin, playerFilter);
}

function aggressionValue(board, move, playerFilter, movesToWin) {
   return placementValue(board, move, playerFilter, movesToWin);
} 


function defensiveValue(board, move, playerFilter, movesToWin) {
   return placementValue(board, move, getOtherPlayer(playerFilter), movesToWin);
    
} 

export function getBestMoveRecursive(board, numMoves, movesToWin, AI, maxDepth, baseValuationFunction) {
    // TODO: make general
    const allAvailableMoves = (numMoves == 2) ?
        getAllDoubleMoves(board) :
        getAllMoves(board).map((x) => [x]);
    if (maxDepth == 0 || true) {
        // return optimal using evaluation function
        return allAvailableMoves.reduce((a, b) => baseValuationFunction(board, a) < baseValuationFunction(board, b) ? a : b);
    }
    // otherwise, try every possible move and get results recursively...

}

function getAllDoubleMoves(board) {
    const moves = getAllMoves(board);
    const out = [];
    moves.forEach((moveA, i) => {
        moves.forEach((moveB, j) => {
            if (i < j) {
                out.push([moveA, moveB]);
            }
        });
    });
    return out;
}


export function getAiMove(board, AI, numMoves, n, movesToWin) {
    return getBestMoveRecursive(board, numMoves, movesToWin, AI, 0,
        getBasicValuationFunction(n, movesToWin, AI));
}

const getRandom = (array) => array[Math.floor(Math.random()*array.length)];


export function getAiMoveOld(board, AI, numMoves, n, movesToWin) {
    var moves = getAllMoves(board).map((move) => {
        const splitMove = move.split(",");
        return [parseInt(splitMove[0]), parseInt(splitMove[1])];
    });
    // console.log("all moves");
    // console.log(moves);
    
    const out = [];
    for (var i = 0; i < n * n * n; i++) {
        if (out.length >= numMoves) {
            break;
        }
        var bestMove = getWinningMove(board, moves, AI, n, movesToWin);
        if (!bestMove) {
            bestMove = getRandom(moves);
        }
        // console.log(bestMove);
        if (!out.includes(bestMove)) {
            out.push(bestMove);
        }
        moves = moves.filter((move) => !out.includes(move));
    }
    return out;
}

export function getWinningMove(board, moves, AI, n, movesToWin) {
    // console.log("using moves");
    // console.log(moves);
    const boardCopy = copyBoard(board);
    const results = moves.map((move) => {
        if (!canMove(board, move)) return [-2, move];
        makeMove(boardCopy, move, AI);
        const winner = getWinner(boardCopy, n, movesToWin);
        const outcome = (winner === AI) ? 1 : (isPlayer(winner)) ? -1 : 0;
        unmakeMove(boardCopy, move);
        return [outcome, move];
    });
    const winningResults = results.filter((res) => (res[0] == 1));
    console.log(winningResults);
    if (winningResults.length > 0) {
        // console.log(winningResults);
        return winningResults[0][1];
    };
    const stopLosingResults = results.filter((res) => res[0] == -1);
    if (stopLosingResults.length > 0) return stopLosingResults[0][1];
    return null;
    
}