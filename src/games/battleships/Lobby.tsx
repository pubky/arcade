import { useEffect, useState } from "react";
import { GameState, LobbyMode, Ship, ShipAlignment, Tile } from ".";
import { Board } from "./Board";
import { ShipComponent } from "./Ship";
import { ShipSelectDropDown } from "./ShipsDropDown";
import { useSharedState } from "./state";


const newShip = (input: { start: string, align: ShipAlignment, size: number, boardSize: number }): Ship => {
    const { align, size, start, boardSize } = input;
    const [startRow, startCol] = start.split('-').map(i => Number(i));

    let direction = 1;

    if (align === 'horizontal' && startCol + size > boardSize) {
        direction = -1
    }

    if (align === 'vertical' && startRow + size > boardSize) {
        direction = -1
    }

    const tiles = [start]
    for (let i = 1; i < size; i++) {
        const previous = tiles[i - 1];
        const [row, col] = previous.split('-').map(i => Number(i));
        const newKey = align === 'horizontal' ? [row, col + direction] : [row + direction, col];
        tiles.push(newKey.join('-'));
    }

    return {
        align,
        tiles: direction === 1 ? tiles : tiles.reverse(),
        hits: []
    }
}

export function Lobby({ sharedStates }: { sharedStates: ReturnType<typeof useSharedState> }) {
    const { client, states, setStates } = sharedStates;
    const { board, boardSize, availableShipSizes, uri, lobbyMode, enemyPubky, placedShips, id } = states;
    const { setBoardHash, setId, setNonce, setGameState, setEnemyPubky,
        setBoardSize, setEnemyBoardHash, setAvailableShipSizes, setPlacedShips, setBoard, setMyLastSig, setEnemyLastsig } = setStates;

    const [selectedShipIndex, setSelectedShipIndex] = useState<number | null>(null);
    const [dropDownSelectedShip, setDropDownSelectedShip] = useState<string>('2');
    const [remainingShips, setRemainingShips] = useState<number[]>(availableShipSizes);

    const [yourFleet, setYourFleet] = useState<Ship[]>(
        remainingShips.map(size => ({ align: 'horizontal', hits: [], tiles: Array(size).fill('1-1') }))
    );

    useEffect(() => {
        setYourFleet(remainingShips.map(size => ({ align: 'horizontal', hits: [], tiles: Array(size).fill('1-1') })))
    }, [remainingShips])

    const readyToJoin = (): boolean => {
        return (placedShips.length === availableShipSizes.length) && (!!enemyPubky)
    }

    const startMatch = () => {
        client.start(JSON.stringify(board)).then((value => {
            if (value === null) return
            const { nonce, boardHash } = value
            client.put({
                path: `matches/${id}/init`,
                payload: { boardHash, size: String(boardSize), ships: String(availableShipSizes) }
            }).then(((value) => {
                if (value === null) return
                const { sig } = value
                setMyLastSig(sig);
                setBoardHash(boardHash)
                setNonce(nonce)
                setGameState(GameState.MATCH);
            })).catch((error => {
                console.log('error', error)
            }));
        })).catch((error => {
            console.log('error', error)
        }));
    }

    const joinMatch = () => {
        const parts = (uri as string).split('/')
        const id = parts[parts.length - 1]
        setId(id)
        const enemyPk = parts[2]
        setEnemyPubky(enemyPk)

        client.get(`matches/${id}/init`, enemyPk, '').then((enemyInit => {
            if (enemyInit === null) return;
            const { sig } = enemyInit;
            setBoardSize(Number(enemyInit.data.size))
            setEnemyBoardHash(enemyInit.data.boardHash)
            setEnemyLastsig(sig);
            setAvailableShipSizes((enemyInit.data.ships).split(',').map(i => Number(i)))

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
                }).then(((value) => {
                    if (value === null) return;
                    const { sig } = value;
                    setMyLastSig(sig);
                    setGameState(GameState.MATCH)
                })).catch((error => {
                    console.log('error', error)
                }));
            })).catch((error => {
                console.log('error', error)
            }))
        })).catch((error => {
            console.log('error', error)
        }))
    }

    const checkFleetCollision = (fleet: Ship[]): boolean => {
        const countMap: Record<string, number> = {}
        for (const ship of fleet) {
            for (const tile of ship.tiles) {
                const current = countMap[tile];
                if (current === 1) {
                    return true
                }
                countMap[tile] = 1
            }
        }
        return false
    }

    const placeShip = (row: number, col: number): void => {
        const shipStart = `${row}-${col}`;
        const align = 'horizontal';
        const ship = newShip({ align, size: remainingShips[selectedShipIndex as number], start: shipStart, boardSize });
        const newFleet = placedShips.concat(ship)
        const hasCollision = checkFleetCollision(newFleet)
        if (hasCollision) {
            alert('Ships should not be colliding.')
            return
        }
        for (const tile of ship.tiles) {
            board[tile] = Tile.SHIP;
        }
        setBoard(board);
        setPlacedShips(newFleet);
        setRemainingShips(
            remainingShips.slice(0, selectedShipIndex as number).concat(
                remainingShips.slice(selectedShipIndex as number + 1)
            )
        );
        setSelectedShipIndex(null);
    }

    const removeShip = (index: number): void => {
        const ship = placedShips[index];
        for (const tile of ship.tiles) {
            board[tile] = Tile.WATER;
        }
        setBoard(board);
        setPlacedShips(placedShips.slice(0, index).concat(placedShips.slice(index + 1)));
        setRemainingShips(
            remainingShips.concat(ship.tiles.length)
        );
    }

    const rotateShip = (index: number): void => {
        const ship = placedShips[index];
        const rotatedShip = newShip({ start: ship.tiles[0], size: ship.tiles.length, align: ship.align === 'vertical' ? 'horizontal' : 'vertical', boardSize })
        const newFleet = placedShips.slice(0, index).concat(rotatedShip).concat(placedShips.slice(index + 1));
        const hasCollision = checkFleetCollision(newFleet)
        if (hasCollision) {
            alert('Ships should not be colliding.')
            return
        }
        for (const tile of ship.tiles) {
            board[tile] = Tile.WATER;
        }
        for (const tile of rotatedShip.tiles) {
            board[tile] = Tile.SHIP;
        }
        setBoard(board);
        setPlacedShips(newFleet);
    }

    const replaceShip = (row: number, col: number, index: number): void => {
        const shipStart = `${row}-${col}`;
        const ship = placedShips[index];
        const replacedShip = newShip({ start: shipStart, size: ship.tiles.length, align: ship.align, boardSize })
        const newFleet = placedShips.slice(0, index).concat(replacedShip).concat(placedShips.slice(index + 1));
        const hasCollision = checkFleetCollision(newFleet)
        if (hasCollision) {
            alert('Ships should not be colliding.')
            return
        }
        for (const tile of ship.tiles) {
            board[tile] = Tile.WATER;
        }
        for (const tile of replacedShip.tiles) {
            board[tile] = Tile.SHIP;
        }

        setBoard(board);
        setPlacedShips(newFleet);
    }

    const tryRandomizingFleet = (tryCount: number) => {
        if (tryCount === 10) {
            console.log('Tried 10 times but could not find a random position for ships');
            return []
        }
        let newFleet = [...placedShips];
        for (const shipSize of remainingShips) {
            const row = Math.floor(Math.random() * boardSize);
            const col = Math.floor(Math.random() * boardSize);
            const shipStart = `${row}-${col}`;
            const align = 'horizontal';
            const ship = newShip({ align, size: shipSize, start: shipStart, boardSize });
            newFleet = newFleet.concat(ship)
            const hasCollision = checkFleetCollision(newFleet)
            if (hasCollision) {
                return tryRandomizingFleet(tryCount + 1);
            }
        }
        return newFleet
    }

    const randomizeFleetPlacement = () => {
        const newFleet = tryRandomizingFleet(0);
        for (const ship of newFleet) {
            for (const tile of ship.tiles) {
                board[tile] = Tile.SHIP;
            }
        }
        setBoard(board);
        setPlacedShips(newFleet);
        setRemainingShips([]);
        setSelectedShipIndex(null);
    }

    function LobbySettings() {
        return (
            <div className="bg-secondary-blue p-2 px-4 flex flex-col rounded-md md:w-1/3 w-full">
                <h3 className="text-base pb-2 mb-2 border-b">Game Settings</h3>

                {/* URI field */}
                <label className="mb-2 flex flex-col">
                    URI:
                    <div
                        className="flex justify-between w-full mt-2 p-2 border rounded bg-neutral-blue"
                    >
                        <div className="flex overflow-hidden">
                            <p className="overflow-hidden overflow-ellipsis">
                                {uri}
                            </p>
                        </div>
                        <div className="w-6 pt-1 px-1">
                            <button className="active:opacity-40 border rounded border-transparent hover:border-white" onClick={() => { navigator.clipboard.writeText(uri as string).catch(() => { }) }}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className="size-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </label>

                {/* Enemy Pubky */}
                <label className="mb-2 flex flex-col">
                    Enemy Pubky:
                    {lobbyMode === LobbyMode.CREATE ? <input
                        type="text"
                        defaultValue={enemyPubky || ''}
                        onBlur={(e) =>
                            setEnemyPubky(e.target.value)}
                        className="w-full p-2 border rounded bg-neutral-blue"
                    /> : <p className="w-full p-2 border rounded bg-neutral-blue overflow-x-scroll">{enemyPubky}</p>}
                </label>

                {/* Size field */}
                <label className="mb-2 flex flex-col">
                    {lobbyMode === LobbyMode.CREATE ? 'Size: (5-20)' : 'Size:'}
                    {lobbyMode === LobbyMode.CREATE ? <div
                        className="flex justify-between w-full mt-2 p-2 border rounded bg-neutral-blue"
                    >
                        <button disabled={boardSize === 5} onClick={() => { setBoardSize(boardSize - 1) }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                            </svg>
                        </button>
                        <div className="flex overflow-hidden">
                            <p className="overflow-hidden">
                                {boardSize}
                            </p>
                        </div>
                        <button disabled={boardSize === 20}
                            onClick={() => { setBoardSize(boardSize + 1) }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </button>
                    </div> : <p>{boardSize}</p>}
                </label>

                {/* Ships input */}
                {lobbyMode === LobbyMode.CREATE && (<label className="mb-2 flex flex-col">
                    Add more ships:
                    <div className="flex w-full mt-2 border rounded">
                        <ShipSelectDropDown
                            selectedValue={dropDownSelectedShip}
                            onSelect={option => {
                                const newAvailableShipSizes = availableShipSizes.concat(Number(option));
                                setAvailableShipSizes(newAvailableShipSizes);
                                setDropDownSelectedShip(option);
                                setRemainingShips(remainingShips.concat(Number(option)));
                            }}
                            options={['2', '3', '4', '5', '6']}
                        />
                    </div>
                </label>)}
            </div>
        )
    }

    return (
        <div className="sm:w-11/12 md:w-full lg:w-3/4 mx-auto mt-10 mb-20 py-4 px-1 lg:py-12 text-white">
            <div className="flex flex-col items-center">
                <div className="flex flex-col-reverse md:flex-row md:w-5/6 w-full gap-8 md:gap-0">
                    <Board
                        onCellClick={selectedShipIndex === null ? undefined : placeShip}
                        board={board}
                        size={boardSize}
                        ships={placedShips}
                        onShipDelete={(index) => {
                            removeShip(index);
                        }}
                        onShipRotate={(index) => {
                            rotateShip(index);
                        }}
                        onShipReplace={(row, col, index) => {
                            replaceShip(row, col, index);
                        }}
                    />
                    <LobbySettings />
                </div>

                {/* Your Fleet */}
                <div className="flex flex-col w-5/6 pt-10">
                    <div className="flex gap-10 items-center">
                        <p className="font-bold text-xl">Your Fleet</p>
                        <button
                            className={`bg-neutral-blue px-4 py-1 rounded-full font-semibold 
                                ${remainingShips.length > 0 ? 'active:opacity-40' : ''}`}
                            onClick={() => { randomizeFleetPlacement(); }}
                            disabled={remainingShips.length === 0}
                        >
                            RANDOMIZE
                        </button>
                    </div>
                    <div className="flex flex-wrap shrink-0 gap-10">
                        {yourFleet.map((fleetShip, index) => (
                            <div className="w-fit box-border relative gap-1 flex-col" key={index}>
                                <p>Ship {fleetShip.tiles.length}</p>
                                <div className={`flex cursor-pointer border rounded
                                    ${index === selectedShipIndex ? '' : 'border-transparent'}
                                `} onClick={() => setSelectedShipIndex(index === selectedShipIndex ? null : index)}>
                                    <ShipComponent ship={fleetShip} renderSize={8}></ShipComponent>
                                    <div className="absolute -end-4 bottom-0">
                                        <button className="w-4 rounded border border-transparent hover:border-white active:opacity-40" onClick={() => {
                                            const newAvailableShipSizes = availableShipSizes.slice(0, index).concat(availableShipSizes.slice(index + 1))
                                            setAvailableShipSizes(newAvailableShipSizes);
                                            setRemainingShips(remainingShips.slice(0, remainingShips.length - 1));
                                        }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className="w-full">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <button
                    onClick={lobbyMode === LobbyMode.CREATE ? startMatch : joinMatch}
                    disabled={!readyToJoin()}
                    className={`m-2 px-6 py-3 rounded-full text-white font-semibold shadow-md 
                        ${!readyToJoin() ? 'bg-secondary-blue' : 'bg-primary-pink hover:opacity-80 active:opacity-40'}`}
                >
                    {lobbyMode === LobbyMode.CREATE ? 'START' : 'JOIN'}
                </button>
            </div>
        </div>
    )
}
