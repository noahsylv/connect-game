import React, { useState, useEffect } from 'react'
import { getAiMove, getAiMoveFromApi } from '../lib/ai';
import { encodeGame } from '../lib/encode';
import { BLACK, canMove, EMPTY, getOtherPlayer, getWinner, isPlayer, makeMove, resetBoard, unmakeMove, WHITE } from '../lib/gameLogic';

// export const AI = WHITE;
// export const AI = BLACK;

function Game( { n, movesToWin, movesPerTurn, firstRoundMoves, humanPlayer, lastReset } ) {

    const [player, setPlayer] = useState();
    const aiPlayer = humanPlayer === WHITE ? BLACK : WHITE;
    const [movesLeft, setMovesLeft] = useState();
    const [board, setBoard] = useState({});
    const [winner, setWinner] = useState(null);
    const [counter, setCounter] = useState(0);
    const [needResultsChecked, setNeedResultsChecked] = useState(false);
    const [moveStack, setMoveStack] = useState([]);
    const SPACING = 5;
    const canUndoMoves = true;
    function setupGame() {
        // alert("resetting game")
        setBoard(resetBoard(board, n));
        setWinner(null);
        setPlayer(BLACK);
        setMovesLeft(firstRoundMoves);
        forceReload();
        // setTimeout(() => {
            //     console.log("curr board");
            //     console.log(board);
            //     console.log(gameStatus());
            // }, 1000)
        }
        
    const forceReload = () => {
        setCounter(counter + 1);
    }    
    useEffect((() => {
        // console.log("resetting");
        // alert("here");
        setupGame();
    }), [lastReset]);

    function handleAi() {
        if (player === null) return;
        // console.log(player);
        // console.log(needResultsChecked);
        if (!needResultsChecked && (player === aiPlayer)) {
            aiMove();
        }

    }

    useEffect(handleAi, [player, needResultsChecked]);

    useEffect(() => {
        const timer = setTimeout(handleAi, 2000);
        return () => clearTimeout(timer);
      }, []);

    function declareWinner(winner) {
        setWinner(winner);
    }

    function gameHasWinner() {
        return winner !== null;
    }

    function boardISEmpty() {
        return Object.values(board).every(x => x === EMPTY);
    }

    function gameStatus() {
        if (gameHasWinner()) {
            return winner + " wins!";
        } else {
            if (player !== aiPlayer) {
                return `It is ${player}'s turn with ${movesLeft} move(s) left`;
            } else {
                return `It is ${player}'s turn with ${movesLeft} move(s) left`;
            }
        }
    }

    function checkResults() {
        console.log("checking results");
        const gameWinner = getWinner(board, n, movesToWin);
        if (gameWinner) return declareWinner(gameWinner);
        setNeedResultsChecked(false);
    };

    function placePieces(moves) {
        if (needResultsChecked) return;
        if (gameHasWinner()) return;
        const movesLeftStart = movesLeft;
        var movesMade = 0;
        moves.forEach((move, i) => {
            if (i < movesLeftStart) {
                if (canMove(board, move)) {
                    makeMove(board, move, player);
                    movesMade++;
                    moveStack.push(move);
                    if (checkResults()) return;
                }
            }
        });
        if (movesLeft == movesMade) {
            setPlayer(getOtherPlayer(player));
            setMovesLeft(movesPerTurn)
        } else {
            setMovesLeft(movesLeft - movesMade);
        }
        console.log(encodeGame(board, n));
    }


    function undoLastMove() {
        if (moveStack.length == 0) return;
        console.log("undoing last move");

        // 
        const wasPreviousPlayer = (movesLeft == movesPerTurn)
        const lastPlayer = wasPreviousPlayer ? getOtherPlayer(player) : player;
        const undoingAiMoves = lastPlayer === aiPlayer;
        const movesToUndo = undoingAiMoves ? movesPerTurn + 1 : 1;
        for (var i = 0; i < movesToUndo; i++) {
            if (moveStack.length == 0) break;
            const lastMove = moveStack.pop();
            unmakeMove(board, lastMove);
        } 
        setWinner(null);

        if (undoingAiMoves) {
            setPlayer(player);
            setMovesLeft(1);
        } else if (wasPreviousPlayer) {
            setPlayer(lastPlayer);
            setMovesLeft(moveStack.length == 0 ? firstRoundMoves : movesPerTurn);
        } else {
            setPlayer(player);
            setMovesLeft(movesLeft + 1);
        }

        // console.log(lastMove);
        // if (movesLeft == movesPerTurn) {
        //     setMovesLeft(1);
        //     setPlayer(getOtherPlayer(player));
        // } else {
        //     setMovesLeft(movesLeft + 1);
        // }
        forceReload();
        // if (isAIPlayer) {
        //     // ai will do same move again so want to get back to human's last move
        //     setTimeout(undoLastMove, 100);
        // }
    }

    function aiMove() {
        if (player !== aiPlayer) return;
        // console.log("requesting move");
        // const moves = getAiMove(board, AI, movesLeft, n, movesToWin);

        getAiMoveFromApi(encodeGame(board, n), player, placePieces);

        // placePieces(moves);
    }

    function tileIsSpecial(row, col) {
        const specialRow = row == Math.floor(n / 2) ||
            row == Math.floor(n / 4) ||
            row == Math.floor(n / 4 * 3) ||
            row == 0 || row == n-1;
        const specialCol = col == Math.floor(n / 2) ||
            col == Math.floor(n / 4) ||
            col == Math.floor(n / 4 * 3) || 
            col == 0 || col == n-1;
        return specialRow && specialCol;
    }

    function getTileColor(row, col) {
        const tile = board[[row, col]];
        if (tile == BLACK) {
            return 'bg-black'
        }
        if (tile == WHITE) {
            return 'bg-white';
        }
        const baseColor = (
            tileIsSpecial(row, col)
            ? 'bg-[#8c613c]'
            : '');
        if (winner === null && player !== aiPlayer) {
            const playerColor = (player === WHITE ? "hover:bg-white" : "hover:bg-black");
            return playerColor + " cursor-pointer " + baseColor
            
        }
        return baseColor;
    }

    const title = () => {
        return ((movesToWin == 3) ? "Tic tac toe" : `Connect ${movesToWin}`);
    }

    const showPlayers = () => {
        return (aiPlayer === WHITE ? "Human=Black AI=White" : "Human=White AI=Black");
    }

    const getAxis = () => {
        // do this to force a reload when board changes
        if (board) {
            return board;
        }
        return [...Array(n).keys()];
    }

    return (
        <div className='flex flex-col items-center space-y-5'>
            <div>
            <h1 className='text-4xl p-3 text-center'>
                {title()}
            </h1>
            <div className='text-xl text-center'>
                {showPlayers()}
            </div>
            <div className='text-xl text-center'>
                {gameStatus()}
            </div>
            </div>     
            {/* Board */}
            <div className={'bg-[#b78256] flex flex-col outline space-y-'+ SPACING + ' p-' + SPACING}>
                {[...Array(n).keys()].map((row, _) => (
                <div key={'row ' + row} className={'flex flex-row space-x-' + SPACING}>
                    {[...Array(n).keys()].map((col, _) => (
                        <div key={'col ' + col} 
                        className={'text-3xl p-5 outline outline-black rounded-full ' + getTileColor(row, col)}
                         onClick={() => {placePieces([[row, col]])}}
                        >
                            {/* {board[row] == 'black' ? 'X' : ' '} */}
                            {/* {board[[row, col]]} */}
                            {' '}
                            
                        </div>
                    ))}
                </div>
                ))}
            </div>
            <div></div>
            <div className='flex flex-row space-x-5'>
                {(canUndoMoves && (moveStack.length > 0)) && (
                <div 
                    className='text-lg outline p-1 select-none cursor-pointer rounded-md hover:bg-gray-50'
                    onClick={undoLastMove}
                    >
                    {'Undo last move'}
                </div>
                )}
                <div 
                    className='text-lg outline p-1 select-none cursor-pointer rounded-md hover:bg-gray-50'
                    onClick={setupGame}
                    >
                    {gameHasWinner() ? 'Play again' : 'Reset Game'}
                </div>
            </div>

    </div>
    )
}

export default Game