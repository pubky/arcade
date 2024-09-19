"use client";

import { useState } from "react";
import { MainMenu } from "./MainMenu";
import { Board } from "./Board";

function App() {
  const [state, setState] = useState("menu");
  return (
    <div className="App w-full relative">
      {state === "menu" ? (
        <MainMenu setState={setState} />
      ) : (
        <Board setState={setState} />
      )}
    </div>
  );
}

export default App;
