import { GameState, LobbyMode, MatchState, Square } from ".";
import CloseIcon from "../../assets/close.png";
import boardImg from "./assets/boardImg.png";
import { useSharedState } from "./state";

import { useState } from "react";
import { useInterval } from "../../utils";
import OImage from './assets/o.png';
import XImage from './assets/x.png';
import { checkWin, makeMove } from "./Game";
import { GameOver } from "./GameOver";

interface BoardProps {
  sharedState: ReturnType<typeof useSharedState>
}

export function Board({ sharedState }: BoardProps) {
  const { client } = sharedState
  const { lobbyMode, board, id, matchState, enemyPubky, uri } = sharedState.states
  const { setGameState, setBoard, setMatchState, setWinner } = sharedState.setStates

  const [turn, setTurn] = useState(1);

  const handleMove = (row: number, col: number) => {
    // TODO: isValidMove
    const newBoard = makeMove(board, [row, col], lobbyMode === LobbyMode.CREATE ? Square.X : Square.O);
    setBoard([...newBoard]);
    client.put({ path: `matches/${id}/MOVE-${turn}`, payload: { move: `${row}-${col}` } }).then(() => {
      setTurn(turn + 1);
      const result = checkWin(board);
      if (result === Square.EMPTY) {
        setMatchState(MatchState.WAIT)
      } else {
        setMatchState(MatchState.FINISH)
        setWinner(true)
      }
    }).catch(() => {
      console.log('error putting', { id, turn, row, col })
    })
  }

  const waitForOtherPlayerMove = () => {
    client.get(`matches/${id}/MOVE-${turn}`, enemyPubky as string, '').then(value => {
      if (value === null) return
      // setEnemyLastsig(value.sig)
      handleEnemyMove(value.data.move)
    }).catch((error => {
      console.log('error', error)
    }))
  }

  const handleEnemyMove = (move: string) => {
    const [row, col] = move.split('-')
    const newBoard = makeMove(board, [Number(row), Number(col)], lobbyMode === LobbyMode.CREATE ? Square.O : Square.X);
    // TODO: isValidMove
    setBoard([...newBoard]);
    setTurn(turn + 1);
    const result = checkWin(board);
    if (result === Square.EMPTY) {
      setMatchState(MatchState.MOVE)
    } else {
      setMatchState(MatchState.FINISH)
      setWinner(false)
    }
  }

  useInterval(() => {
    switch (matchState) {
      case MatchState.MOVE:
        return
      case MatchState.WAIT:
        return waitForOtherPlayerMove();
    }
  }, 1000)

  return (
    <div className="sm:w-11/12 md:w-full lg:w-3/4 mx-auto mb-20 py-10 md:py-4 px-1 text-white relative">
            <GameOver sharedState={sharedState}></GameOver>
      <div className="flex w-3/4 mx-auto py-12 flex-col items-center justify-center">
        <div className="w-full justify-between flex gap-4">
          <p className="text-white text-[28px] font-semibold">Tic tac toe</p>
          <img
            onClick={() => setGameState(GameState.LOBBY)}
            className="cursor-pointer w-4 h-4"
            src={CloseIcon}
          ></img>
        </div>
        <div className="mt-12 flex-col items-center gap-8 inline-flex">
          <div className="justify-start items-start gap-8 inline-flex">
            <p className={`text-center text-white text-2xl border-action-blue ${matchState === MatchState.MOVE ? 'border-b-4' : ''}`}>You ({lobbyMode === LobbyMode.CREATE ? 'X' : 'O'})</p>
            <p className={`text-center text-white text-2xl border-action-blue ${matchState === MatchState.MOVE ? '' : 'border-b-4'}`}>Opponent ({lobbyMode === LobbyMode.CREATE ? 'O' : 'X'})</p>
          </div>
          {/* <div className="justify-start items-center gap-12 inline-flex">
            <div className="flex-col justify-start items-center inline-flex">
              <div className="text-center text-white text-opacity-30 text-[21px]">
                You
              </div>
              <div className="text-center text-white text-2xl">0</div>
            </div>
            <div className="w-px h-14 bg-white bg-opacity-10" />
            <div className="flex-col justify-start items-center inline-flex">
              <div className="text-center text-white text-opacity-30 text-[21px]">
                Tie
              </div>
              <div className="text-center text-white text-2xl">0</div>
            </div>
            <div className="w-px h-14 bg-white bg-opacity-10" />
            <div className="flex-col justify-start items-center inline-flex">
              <div className="text-center text-white text-opacity-30 text-[21px]">
                Player O
              </div>
              <div className="text-center text-white text-2xl">0</div>
            </div>
          </div> */}
          <div className="mt-6 relative">
            <img src={boardImg} />
            <div className="absolute top-0 start-0 w-full h-full grid grid-cols-3 text-white">
              {board.map((rowItem, row) => {
                return rowItem.map((cellItem, col) => {
                  switch (cellItem) {
                    case Square.EMPTY:
                      return (<div key={`${row}-${col}`}
                        className={`p-6 w-36 h-36 
                          ${matchState === MatchState.MOVE ? 'cursor-pointer' : ''}`}
                        onClick={matchState === MatchState.MOVE ? () => handleMove(row, col) : undefined}></div>);
                    case Square.O:
                      return (<div key={`${row}-${col}`} className="p-6 h-fit"><img className="w-fit h-fit" src={OImage}></img></div>);
                    case Square.X:
                      return (<div key={`${row}-${col}`} className="p-6 h-fit"><img className="w-fit h-fit" src={XImage}></img></div>)
                  }
                })
              }).flat()}
            </div>
          </div>
        </div>
        <p className="mt-12 text-center text-white text-[64px]">{matchState === MatchState.MOVE ? 'Your' : 'Opponent\'s'} turn</p>
        <div className="w-full justify-between flex gap-4">
          <p className="mt-12 text-center text-white text-[12px]">{uri}</p>
        </div>
      </div >
    </div >
  );
}
