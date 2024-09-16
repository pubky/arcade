import { useState } from "react";
import TicTacToe from "./assets/TicTacToe.png";
import PubkyArcadeLogo from "./assets/pubky-arcade.png";
import ModalTicTacToe from "./Modal/ModalTicTacToe";

interface MainMenuProps {
  setState: React.Dispatch<React.SetStateAction<string>>;
}

export function MainMenu({ setState }: MainMenuProps) {
  const [modalSettings, setModalSettings] = useState(false);
  return (
    <div className="flex w-3/4 md:w-1/3 mx-auto py-12 flex-col items-center justify-center">
      <img src={PubkyArcadeLogo}></img>
      <img className="my-[40px]" src={TicTacToe}></img>
      <div className="mb-4 flex flex-col gap-2 w-fit opacity-60 text-white">
        <p className="text-center">
          Brief introduction about the game and how
          <br /> to start or join to a game
        </p>
      </div>
      <button
        onClick={() => setModalSettings(true)}
        className="m-2 px-6 py-3 bg-primary-pink text-white font-semibold rounded-full shadow-md hover:opacity-80"
      >
        PLAY GAME
      </button>
      <p className="text-white opacity-60"> Or </p>
      <form
        //onSubmit={() => startMatch(LobbyMode.JOIN)}
        className="w-full mt-2 gap-2 flex flex-col items-center justify-center"
      >
        <input
          type="text"
          id="join-url"
          placeholder="Enter match URI"
          //onChange={(e) => {
          //  setUri(e.target.value);
          //}}
          //value={uri || ""}
          className="w-full p-2 border rounded outline-none"
        />
        <button
          type="submit"
          //disabled={!uri || uri?.length === 0}
          onClick={() => setState("board")}
          className={`m-2 px-6 py-3 rounded-full bg-secondary-blue text-white font-semibold shadow-md `}
        >
          JOIN GAME
        </button>
      </form>
      <ModalTicTacToe
        showModal={modalSettings}
        setShowModal={setModalSettings}
      />
    </div>
  );
}
