import { useState } from 'react';
import './App.css';
import { ClientWrapper } from './client';
import Battleships from './games/battleships/App';

import CloseIcon from './assets/close.png';

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

function App() {
  const [currentPage, setCurrentPage] = useState<Page>(Page.main);
  const [gameKey, setGameKey] = useState<string | null>(null);

  const MainMenu = () => {
    return (<div>
      <h1>Arcade</h1>
      <ul className='flex'>
        {Object.keys(games).map(game_key => {
          const game = games[game_key];
          return (
            <li className='flex' key={game_key}><button onClick={() => { setCurrentPage(Page.game); setGameKey(game_key) }}>{game.name}</button></li>
          )
        })}
      </ul>
    </div>)
  }

  const Header = (props: { game: Game }) => {
    const { game } = props;
    return (
      <div className='fixed top-0 left-0 z-10 w-full'>
        <div className='flex justify-between items-center bg-primary-blue border-white border-opacity-60 border-b'>
          <h2 className='font-bold m-2 text-white leading-loose text-opacity-80'>{game.name}</h2>
          <button
            onClick={() => setCurrentPage(Page.main)}
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

  const GamePage = (props: { gameKey: string }) => {
    const { gameKey } = props;
    const game = games[gameKey];
    const GameComponent = game.component

    return (<div>
      <Header game={game}></Header>
      <div className='fixed w-full left-0 top-12 z-9'>
        <ClientWrapper>
          <GameComponent />
        </ClientWrapper>
      </div>
    </div>)
  }

  return currentPage === Page.main ? <MainMenu /> : <GamePage gameKey={gameKey as string} />
}

export default App
