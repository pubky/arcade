import { GameState, LobbyMode } from ".";
import PubkyArcadeLogo from "./assets/pubky-arcade.png";
import TicTacToe from "./assets/TicTacToe.png";
import { useSharedState } from "./state";

interface MainMenuProps {
  sharedState: ReturnType<typeof useSharedState>
}

export function MainMenu({ sharedState }: MainMenuProps) {
  const { context } = sharedState
  const { setGameState, setLobbyMode, setUri, setId, setEnemyPubky } = sharedState.setStates
  const { uri, enemyPubky } = sharedState.states


  const startMatch = (mode: LobbyMode) => {
    setGameState(GameState.MATCH)
    setLobbyMode(mode)
    if (mode === LobbyMode.JOIN) {
      const parts = (uri as string).split('/')
      const id = parts[parts.length - 1]
      const enemyPk = parts[2]
      setId(id)
      setEnemyPubky(enemyPk)
    } else {
      context.randomBytes(8).then((randomBytes => {
        context.z32_encode(randomBytes).then((id => {
          setId(id);
          setUri(`pubky://${context.pubky}/pub/tictactoe.app/matches/${id}`);
        })).catch(error => {
          console.log('error encoding a new game id', error)
        });
      })).catch(error => {
        console.log('error creating a new game id', error)
      });
    }
  };

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
      <form
        onSubmit={() => { startMatch(LobbyMode.CREATE); }}
        className="w-full mt-2 gap-2 flex flex-col items-center justify-center"
      >
        <input
          type="text"
          id="enemy-pubky"
          onChange={(e) => {
            setEnemyPubky(e.target.value);
          }}
          placeholder="Enter enemy pubky"
          className="w-full p-2 border rounded outline-none"
        />
        <button
          type="submit"
          disabled={!enemyPubky || enemyPubky?.length === 0}
          className={`m-2 px-6 py-3 
             ${(!enemyPubky || enemyPubky?.length === 0) ? 'bg-secondary-blue' : 'bg-primary-pink hover:opacity-80 active:opacity-60'}
              text-white font-semibold rounded-full shadow-md hover:opacity-80 active:opacity-60`}
        >
          PLAY GAME
        </button>
      </form>
      <p className="text-white opacity-60"> Or </p>
      <form
        onSubmit={() => { startMatch(LobbyMode.JOIN); }}
        className="w-full mt-2 gap-2 flex flex-col items-center justify-center"
      >
        <input
          type="text"
          id="uri"
          onChange={(e) => {
            setUri(e.target.value);
          }}
          placeholder="Enter match URI"
          className="w-full p-2 border rounded outline-none"
        />
        <button
          type="submit"
          disabled={!uri || uri?.length === 0}
          className={`m-2 px-6 py-3 rounded-full 
            ${(!uri || uri?.length === 0) ? 'bg-secondary-blue' : 'bg-primary-pink hover:opacity-80 active:opacity-60'}
            text-white font-semibold shadow-md `}
        >
          JOIN GAME
        </button>
      </form>
    </div>
  );
}
