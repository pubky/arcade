import { useContext, useEffect, useState } from 'react';
import './App.css';
import { ClientContext, ClientWrapper } from './client';
import Battleships from './games/battleships/App';


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
        <div className='flex w-1/2 gap-2 items-center justify-between text-white border px-2 py-1 rounded-full'>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
          </svg>
          <p className='font-bold w-3/4 overflow-hidden overflow-ellipsis'>{context.pubky}</p>
          <button className='flex w-8 px-1 rounded-full py-0.5 border border-transparent hover:border-white active:opacity-40'
            onClick={() => { navigator.clipboard.writeText(context.pubky as string).catch((error) => { console.log(error) }) }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
            </svg>
          </button>
        </div>
        <button
          onClick={exitToMain}
          className="flex m-2 p-1 bg-transparent items-center justify-center w-fit text-white border border-transparent hover:border-white rounded-full active:opacity-40"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
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
