import { useContext, useEffect, useState } from 'react';
import './App.css';
import { ClientContext, ClientWrapper } from './client';
import Battleships from './games/battleships/App';

import CloseIcon from './assets/close.png';
import PublicKeyIcon from './assets/key.png';

enum Page {
  main = 'main',
  game = 'game',
}

interface Game {
  name: string
  component: () => JSX.Element
}

const games: Record<string, Game> = {
  battleships: {
    name: "Battleships",
    component: Battleships
  },
}


const GamePage = ({ exitToMain, gameKey }: { gameKey: string, exitToMain: () => void }) => {
  const game = games[gameKey];
  const GameComponent = game.component

  return (<div className='left-0 top-0'>
    <ClientWrapper>
      <Header exitToMain={exitToMain} game={game}></Header>
      <div className='fixed w-screen h-full left-0 top-12'>
        <div className='overflow-y-scroll h-full'>
          <GameComponent />
        </div>
      </div>
    </ClientWrapper>
  </div>)
}


const MainMenu = ({ selectGame }: { selectGame: (key: string) => void }) => {
  const context = useContext(ClientContext);

  useEffect(() => {
    context.signUp().catch(() => console.log('error signing up',))
  }, [])

  return (<div className='text-white'>
    <h1>Arcade</h1>
    <ul className='flex'>
      {Object.keys(games).map(game_key => {
        const game = games[game_key];
        return (
          <li className='flex' key={game_key}><button onClick={() => selectGame(game_key)}>{game.name}</button></li>
        )
      })}
    </ul>
  </div>)
}


const Header = ({ game, exitToMain }: { game: Game, exitToMain: () => void }) => {
  const context = useContext(ClientContext);

  return (
    <div className='fixed top-0 left-0 z-10 w-screen h-12 bg-primary-blue'>
      <div className='flex justify-between items-center border-white border-opacity-60 border-b'>
        <h2 className='font-bold m-2 text-white leading-loose text-opacity-80'>{game.name}</h2>
        <div
          className='flex gap-2 items-center justify-center'

        >
          <img className='w-6 h-6 mt-1' src={PublicKeyIcon}></img>
          <p className='text-white font-bold'>{context.pubky?.slice(0, 4) + '...' + context.pubky?.slice(context.pubky.length - 5)}</p>
        </div>
        <button
          onClick={exitToMain}
          className="flex m-2 p-1 bg-transparent items-center justify-center w-fit"
        >
          <img
            className='w-4 h-4'
            src={CloseIcon}>
          </img>
        </button>
      </div>
    </div>
  )
}


function App() {
  const [currentPage, setCurrentPage] = useState<Page>(Page.main);
  const [gameKey, setGameKey] = useState<string | null>(null);

  return (
    <ClientWrapper>
      {currentPage === Page.main ?
        <MainMenu selectGame={(key) => { setCurrentPage(Page.game); setGameKey(key) }} /> :
        <GamePage exitToMain={() => setCurrentPage(Page.main)} gameKey={gameKey as string} />}
    </ClientWrapper>
  )
}

export default App
