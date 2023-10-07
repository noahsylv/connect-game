import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react';
import Game from '../components/Game'
import styles from '../styles/Home.module.css'
import { BLACK,  WHITE } from '../lib/gameLogic';

const TicTacToe = (lastReset) => {
  return <Game n={3} movesToWin = {3} movesPerTurn={1} firstRoundMoves={1} lastReset={lastReset} />
};

const Connect6 = (lastReset, player) => {
  return <Game n={19} movesToWin = {6} movesPerTurn={2} firstRoundMoves={1} lastReset={lastReset} humanPlayer={player}/>
}

export default function Home() {
  const [gameType, setGameType] = useState("C6");
  const [player, setPlayer] = useState(WHITE);
  const [lastReset, setLastReset] = useState(new Date());
  const changePlayer = () => {
    setLastReset(new Date());
    setPlayer(player === BLACK ? WHITE : BLACK);
  }
  const changeGameType = () => {
    setLastReset(new Date());
    setGameType("Loading");
    setTimeout(() => {
      setGameType(gameType === "TTT" ? "C6" : "TTT");
    }, 100); 
    // setTimeout(() => {
    //   setLastReset(new Date());
    // }, 20); 
      
  }
  const getGame = () => {
    if (gameType === "TTT") {
      return TicTacToe(lastReset);
    } else if (gameType === "C6") {
      return Connect6(lastReset, player);
    }
  }
  return (
    // 
    <div className="bg-[#d1c290] h-screen overflow-hidden text-black">
     <main>
     <div className='flex flex-col items-center space-y-5 pt-3 pb-2'>
        <h1 className='text-2xl p-3 text-center'>
            {/* <div className='button py-2 px-10 outline hover:opacity-60 rounded-md cursor-pointer select-none' onClick={changeGameType}>
              Change Game Type
            </div> */}
            <div className='button py-2 px-10 outline hover:opacity-60 rounded-md cursor-pointer select-none' onClick={changePlayer}>
              Change Player
            </div>
        </h1>
      </div>
      {/* <Game n={3} movesToWin = {3} movesPerTurn={1} firstRoundMoves={1} /> */}
       {/* {Connect6()} */}
       {getGame()}
     </main>

    </div>
  )
}
