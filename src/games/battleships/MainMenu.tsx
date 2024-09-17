import { GameState, LobbyMode } from ".";
import { useSharedState } from "./state";

import BattleshipsLogo from './assets/battleships.png';
import PubkyArcadeLogo from './assets/pubky-arcade.png';

export function MainMenu({ sharedStates }: { sharedStates: ReturnType<typeof useSharedState> }) {
    const { states, setStates } = sharedStates;
    const { setUri, setGameState, setLobbyMode, setId, setEnemyPubky } = setStates;
    const { uri } = states;


    const startMatch = (mode: LobbyMode) => {
        setGameState(GameState.LOBBY)
        setLobbyMode(mode)
        if (mode === LobbyMode.JOIN) {
            const parts = (uri as string).split('/')
            const id = parts[parts.length - 1]
            const enemyPk = parts[2]
            setId(id)
            setEnemyPubky(enemyPk)
        }
    };

    return (
        <div className="flex w-3/4 md:w-1/3 mx-auto py-12 flex-col items-center justify-center">
            <img src={PubkyArcadeLogo}></img>
            <img src={BattleshipsLogo}></img>
            <div className="flex flex-col gap-2 w-fit opacity-60 text-white">
                <p className="font-bold">
                    Play the classical game of battleships, using the Pubky Protocol.
                </p>
                <p className="">
                    Click Play Game to start a new game or if you have a link it paste it below and click Join!
                </p>
            </div>
            <button
                onClick={() => startMatch(LobbyMode.CREATE)}
                className="m-2 px-6 py-3 bg-primary-pink text-white font-semibold rounded-full shadow-md hover:opacity-80 active:opacity-40"
            >
                PLAY GAME
            </button>
            <p className="text-white opacity-60"> Or </p>
            <form onSubmit={() => startMatch(LobbyMode.JOIN)} className='w-full mt-2 gap-2 flex flex-col items-center justify-center'>
                <input
                    type="text"
                    id="join-url"
                    placeholder='Enter match URI'
                    onChange={(e) => {
                        setUri(e.target.value);
                    }}
                    value={uri || ''}
                    className="w-full p-2 border rounded" />
                <button
                    type='submit'
                    disabled={(!uri || uri?.length === 0)}
                    className={`m-2 px-6 py-3 rounded-full text-white font-semibold shadow-md
                        ${(!uri || uri?.length === 0) ? 'bg-secondary-blue' : 'bg-primary-pink hover:opacity-80 active:opacity-40'}`}
                >
                    JOIN GAME
                </button>
            </form>
        </div>
    );
}