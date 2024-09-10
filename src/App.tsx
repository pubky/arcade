import React, { useState } from 'react';
import './App.css';
import { ClientWrapper } from './client';
import Battleships from './games/battleships/App';

enum Page {
  main = 'main',
  battleships = 'battleships',
  tictactoe = 'tictactoe'
}

type GamePageComponent = (props: { setCurrentPage: React.Dispatch<React.SetStateAction<Page>> }) => JSX.Element;

const games: Record<string, Page> = {
  battleships: Page.battleships,
  tictactoe: Page.tictactoe,
}

function route(currentPage: Page): GamePageComponent {
  switch (currentPage) {
    case Page.main:
      return MainMenu
    case Page.battleships:
      return Battleships;
    default:
      return MainMenu
  }
}

const MainMenu: GamePageComponent = (props) => {
  const { setCurrentPage } = props;
  return (<div>
    <h1>Arcade</h1>
    <ul className='flex'>
      {Object.keys(games).map(game_key => {
        const game_page = games[game_key];
        return (
          <li className='flex' key={game_page}><button onClick={() => setCurrentPage(game_page)}>{game_page}</button></li>
        )
      })}
    </ul>
  </div>)
}

function App() {
  const [CurrentPage, setCurrentPage] = useState<Page>(Page.main);

  return (
    <ClientWrapper>
      {route(CurrentPage)({ setCurrentPage })}
    </ClientWrapper>
  )
}

export default App
