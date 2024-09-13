import { GameState, LobbyMode } from ".";
import { useSharedState } from "./state";

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
        <div className="flex flex-col items-center justify-center h-screen bg-blue-100">
            <h1 className="text-4xl font-bold mb-8 text-blue-800">Battleships</h1>
            <button
                onClick={() => startMatch(LobbyMode.CREATE)}
                className="m-2 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
            >
                Start Game
            </button>
            <span> Or </span>
            <form onSubmit={() => startMatch(LobbyMode.JOIN)} className='w-full mt-2 flex flex-col items-center justify-center'>
                <input
                    type="text"
                    id="join-url"
                    placeholder='Enter match uri'
                    onChange={(e) => {
                        setUri(e.target.value);
                    }}
                    value={uri || ''}
                    className="w-1/4 p-2 border rounded" />
                <button
                    type='submit'
                    className="m-2 px-6 py-3 bg-blue-800 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
                >
                    Join Game
                </button>
            </form>
        </div>
    );
}