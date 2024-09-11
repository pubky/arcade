'use client';
import { GameState } from '.';
import { Game } from './Game';
import { Lobby } from './Lobby';
import { MainMenu } from './MainMenu';
import { useSharedState } from './state';

function App() {
  const sharedState = useSharedState();
  const { gameState } = sharedState.states;

  const pageMap = {
    [GameState.MAIN]: <MainMenu sharedStates={sharedState} />,
    [GameState.LOBBY]: <Lobby sharedStates={sharedState} />,
    [GameState.MATCH]: <Game sharedStates={sharedState} />
  };

  return (
    <div className="App">
      {pageMap[gameState]}
    </div>
  );
}

export default App;