import { useState } from "react";
import { GameState, LobbyMode, Ship, ShipAlignment, Tile } from ".";
import { Board } from "./Board";
import { useSharedState } from "./state";

const newShip = (input: { start: string, align: ShipAlignment, size: number }): Ship => {
    const { align, size, start } = input;
    const tiles = [start]
    for (let i = 1; i < size; i++) {
        const previous = tiles[i - 1];
        const [row, col] = previous.split('-').map(i => Number(i));
        const newKey = align === 'horizontal' ? [row, col + 1] : [row + 1, col];
        tiles.push(newKey.join('-'));
    }
    return {
        tiles,
        hits: []
    }
}

export function Lobby({ sharedStates }: { sharedStates: ReturnType<typeof useSharedState> }) {
    const { client, context, states, setStates } = sharedStates;
    const { board, boardSize, availableShipSizes, uri, lobbyMode, enemyPubky, placedShips } = states;
    const { setBoardHash, setId, setUri, setNonce, setGameState, setEnemyPubky,
        setBoardSize, setEnemyBoardHash, setAvailableShipSizes, setPlacedShips } = setStates;

    const [placementAligment,] = useState<ShipAlignment>('horizontal');
    const [remainingShips, setRemainingShips] = useState<number[]>(availableShipSizes);

    const startMatch = () => {
        client.start(JSON.stringify(board)).then((value => {
            if (value === null) return
            const { id, nonce, boardHash } = value
            client.put({
                path: `matches/${id}/init`,
                payload: { boardHash, size: String(boardSize), ships: String(availableShipSizes) }
            }).then((() => {
                setBoardHash(boardHash)
                setId(id)
                setUri(`pubky://${context.pubky}/pub/battleships.app/matches/${id}`);
                setNonce(nonce)
                setGameState(GameState.MATCH);
            }));
        }));
    }

    const joinMatch = () => {
        const parts = (uri as string).split('/')
        const id = parts[parts.length - 1]
        setId(id)
        const enemyPk = parts[2]
        setEnemyPubky(enemyPk)

        client.get(`matches/${id}/init`, new TextEncoder().encode(enemyPk)).then((enemyInit => {
            setBoardSize(Number(enemyInit.data.size))
            setEnemyBoardHash(enemyInit.data.boardHash as string)
            setAvailableShipSizes((enemyInit.data.ships as string).split(',').map(i => Number(i)))

            client.join(JSON.stringify(board)).then((value => {
                if (value === null) {
                    throw new Error("Could not join.")
                }
                setBoardHash(value.boardHash)
                setNonce(value.nonce)

                client.put({
                    path: `matches/${id}/join`,
                    payload: { boardHash: value.boardHash || '' },
                    preSig: enemyInit.sig
                }).then((() => {
                    setGameState(GameState.MATCH)
                }));
            }))
        }))
    }

    const placeShip = (row: number, col: number): void => {
        const shipStart = `${row}-${col}`;
        const align = placementAligment;
        const ship = newShip({ align, size: availableShipSizes[availableShipSizes.length - 1], start: shipStart });
        for (const item in ship) {
            board[item] = Tile.SHIP;
        }
        setPlacedShips(placedShips.concat(ship));
        setRemainingShips(remainingShips.slice(0, remainingShips.length - 1));
    }

    return (
        <div className="flex h-screen bg-blue-100">
            {/* Main content */}
            <div className="flex-grow flex flex-col items-center justify-center p-8">
                <label className="mb-2 text-2xl">
                    Enemy Pubky:
                    {lobbyMode === LobbyMode.CREATE ? <input
                        type="text"
                        value={enemyPubky || ''}
                        onChange={(e) =>
                            setEnemyPubky(e.target.value)}
                        className="w-full p-2 border rounded"
                    /> : <h3>{enemyPubky}</h3>}
                </label>

                {/* Board */}
                <div className="mb-4">
                    <Board onCellClick={availableShipSizes.length !== placedShips.length ? placeShip : undefined} board={board} size={boardSize} />
                </div>

                {/* Start button */}
                <button
                    onClick={lobbyMode === LobbyMode.CREATE ? startMatch : joinMatch}
                    disabled={!enemyPubky || placedShips.length !== availableShipSizes.length}
                    className="disabled:bg-gray-600 disabled:hover:bg-gray-600 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
                >
                    {lobbyMode === LobbyMode.CREATE ? 'Start' : 'Join'}
                </button>
            </div>

            {/* Right sidebar */}
            <div className="w-64 bg-blue-200 p-4 flex flex-col">
                <h3 className="text-lg font-semibold mb-2">Game Settings</h3>

                {/* Size input */}
                <label className="mb-2">
                    Board Size:
                    {lobbyMode === LobbyMode.CREATE ? <input
                        type="number"
                        value={boardSize}
                        onChange={(e) =>
                            setBoardSize(Number(e.target.value))}
                        className="w-full p-2 border rounded"
                    /> : <h3>{boardSize}</h3>}
                </label>

                {/* Ships input */}
                <label className="mb-2">
                    Ships:
                    <div className="flex">
                        {lobbyMode === LobbyMode.CREATE ? <input
                            type="text"
                            value={String(availableShipSizes)}
                            onChange={(e) =>
                                setAvailableShipSizes(e.target.value.split(',').map(i => Number(i)))}
                            className="flex-grow p-2 border rounded-l"
                        /> : <h3>{String(availableShipSizes)}</h3>}
                    </div>
                </label>

                {/* Ships list */}
                <div className="mt-4">
                    <h4 className="font-semibold">Ships:</h4>
                    <ul className="list-disc list-inside">
                        {remainingShips.map((shipSize, index) => (
                            <li key={index}>Ship: {shipSize}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
