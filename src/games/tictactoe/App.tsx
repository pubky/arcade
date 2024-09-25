"use client";

import { GameState } from ".";
import { Board } from "./Board";
import { MainMenu } from "./MainMenu";
import { useSharedState } from "./state";

function App() {
  const sharedState = useSharedState();
  return (
    <div className="App w-full relative">
      {sharedState.states.gameState === GameState.LOBBY ? (
        <MainMenu sharedState={sharedState} />
      ) : (
        <Board sharedState={sharedState} />
      )}
    </div>
  );
}

export default App;
