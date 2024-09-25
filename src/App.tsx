import { useContext, useEffect, useRef, useState } from "react";
import "./App.css";
import { ClientContext, ClientWrapper } from "./client";
import Battleships from "./games/battleships/App";
import TicTacToe from "./games/tictactoe/App";

import batthleships from "./assets/Battleships.png";
import Games from "./assets/games.png";
import Overview from "./assets/Overview.png";
import overviewImg from "./assets/overviewImg.png";
import PubkyArcadeLogo from "./assets/pubky-arcade.png";
import PUBKY from "./assets/PUBKY.png";
import TicTacToeLogo from "./assets/TicTacToeLogo.png";

enum Page {
  main = "main",
  game = "game",
}

interface Game {
  name: string;
  component: () => JSX.Element;
}

const games: Record<string, Game> = {
  battleships: {
    name: "Battleships",
    component: Battleships,
  },
  tictactoe: {
    name: "TicTacToe",
    component: TicTacToe,
  },
};

const GamePage = ({
  exitToMain,
  gameKey,
}: {
  gameKey: string;
  exitToMain: () => void;
}) => {
  const game = games[gameKey];
  const GameComponent = game.component;

  return (
    <div className="left-0 top-0">
      <Header exitToMain={exitToMain} game={game}></Header>
      <div className="fixed w-screen h-full left-0 top-12">
        <div className="overflow-y-scroll h-full">
          <GameComponent />
        </div>
      </div>
    </div>
  );
};

const MainMenu = ({ selectGame }: { selectGame: (key: string) => void }) => {
  const context = useContext(ClientContext);
  const gamesSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    context.signUp().
      then(pubky => console.log("successfully signed up, your key is ", pubky)).
      catch(() => console.log("error signing up"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToGames = () => {
    if (gamesSectionRef.current) {
      gamesSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div>
      <div className="flex w-[1200px] mx-auto p-12 py-40 mt-24 flex-col items-center justify-center">
        <img
          className="sticky top-[40px] p-4 rounded-2xl backdrop-blur-[14px]"
          src={PubkyArcadeLogo}
        />

        <p className="px-52 text-center text-white text-3xl font-light py-[40px]">
          Enjoy thrilling turn-based games with real-time data updates using the{" "}
          <span className="font-bold">PUBKY protocol</span>. Classic arcade fun
          meets modern tech!
        </p>
        <button
          onClick={scrollToGames}
          className="m-2 px-6 py-4 bg-primary-pink text-white font-semibold rounded-full shadow-md hover:opacity-80"
        >
          PLAY GAMES
        </button>
        <div ref={gamesSectionRef} id="games" />
        <div className="mt-64 flex flex-col justify-center items-center gap-6">
          <img src={Games} />
          <p className="text-center text-white text-opacity-80 text-2xl font-normal leading-[30px] tracking-wide">
            Dive into the Action with Our Exciting Arcade Games!
          </p>
          <div className="w-full flex justify-between mt-12">
            <div className="bg-[url('./assets/battleshipBg.png')] bg-cover bg-center w-[524px] h-[300px] flex items-center justify-center">
              <div className="cursor-pointer flex flex-col justify-center items-center w-[324px] h-48 rounded-[11px] border border-white border-opacity-60 backdrop-blur-[14px]">
                <img src={batthleships} />
                <button
                  onClick={() => selectGame("battleships")}
                  className="mt-8 px-6 py-4 bg-primary-pink text-white font-semibold rounded-full shadow-md hover:opacity-80"
                >
                  PLAY NOW
                </button>
              </div>
            </div>
            <div className="bg-[url('./assets/ticTacToeBg.png')] bg-cover bg-center w-[524px] h-[300px] flex items-center justify-center">
              <div className="cursor-pointer flex flex-col justify-center items-center w-[324px] h-48 rounded-[11px] border border-white border-opacity-60 backdrop-blur-[14px]">
                <img src={TicTacToeLogo} />
                <button
                  onClick={() => selectGame("tictactoe")}
                  className="mt-8 px-6 py-4 bg-primary-pink text-white font-semibold rounded-full shadow-md hover:opacity-80"
                >
                  PLAY NOW
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-40 flex gap-24 px-12">
          <div className="w-full flex flex-col gap-6 justify-center">
            <img className="w-[220px]" src={Overview} />
            <p className="text-white text-opacity-60 text-2xl font-normal leading-[30px] tracking-wide">
              Pubky Arcade offers exciting turn&#8209;based gameplay, seamlessly
              integrating Pubky Core for secure data creation, updates, reading,
              and deletion. Each move is powered by decentralized technology,
              ensuring a transparent and interactive experience.
            </p>
          </div>
          <div className="w-full flex flex-col gap-6">
            <img className="w-[363px] h-[451px]" src={overviewImg} />
          </div>
        </div>
        <div className="mt-40 flex flex-col justify-center items-center">
          <img src={PUBKY} />
          <p className="px-28 text-opacity-60 text-center text-white text-2xl font-normal py-[40px]">
            Pubky Core is the decentralized engine behind Pubky Arcade Games,
            providing secure, transparent, and user-controlled data management
            for every action you take. Whether you're creating, updating, or
            sharing data. Want to explore how Pubky Core can power your own
            projects?
          </p>
          <button className="m-2 px-12 py-4 bg-primary-pink text-white font-semibold rounded-full shadow-md hover:opacity-80">
            LEARN MORE
          </button>
        </div>
      </div>
    </div>
  );
};

const Header = ({
  game,
  exitToMain,
}: {
  game: Game;
  exitToMain: () => void;
}) => {
  const context = useContext(ClientContext);

  return (
    <div className='fixed flex top-0 left-0 z-10 w-screen h-12 bg-primary-blue'>
      <div className='flex w-full justify-between items-center border-white border-opacity-60 border-b'>
        <h2 className='font-bold m-2 text-white leading-loose text-opacity-80'>{game.name}</h2>
        <div className='flex w-1/2 gap-2 items-center justify-between text-white border px-2 py-1 rounded-full'>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
          </svg>
          <p className='font-bold text-center w-3/4 overflow-hidden overflow-ellipsis'>{context.pubky}</p>
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
        </button >
      </div >
    </div >
  );
};

function App() {
  const [currentPage, setCurrentPage] = useState<Page>(Page.main);
  const [gameKey, setGameKey] = useState<string | null>(null);

  return (
    <ClientWrapper>
      {currentPage === Page.main ? (
        <MainMenu
          selectGame={(key) => {
            setCurrentPage(Page.game);
            setGameKey(key);
          }}
        />
      ) : (
        <GamePage
          exitToMain={() => setCurrentPage(Page.main)}
          gameKey={gameKey as string}
        />
      )}
    </ClientWrapper>
  );
}

export default App;
