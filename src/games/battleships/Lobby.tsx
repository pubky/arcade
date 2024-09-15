import { useEffect, useState } from "react";
import { GameState, LobbyMode, Ship, ShipAlignment, Tile } from ".";
import { Board } from "./Board";
import { useSharedState } from "./state";

import ShipEndDownTile from './assets/ship-end-down.png';
import ShipEndLeftTile from './assets/ship-end-left.png';
import ShipEndRightTile from './assets/ship-end-right.png';
import ShipEndUpTile from './assets/ship-end-up.png';
import ShipMidHorizontalTile from './assets/ship-mid-horizontal.png';
import ShipMidVerticalTile from './assets/ship-mid-vertical.png';

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
        align,
        tiles,
        hits: []
    }
}

function ShipSelectDropDown({ onSelect, options, selectedValue }: { onSelect: (option: string) => void, options: string[], selectedValue: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative w-full h-fit rounded bg-neutral-blue" onClick={() => setIsOpen(!isOpen)}>
            <div
                className="flex items-center cursor-pointer px-1 py-1"
            >
                <div className="flex flex-wrap justify-between items-center w-11/12">
                    <p className="leading-loose text-sm font-semibold">
                        {selectedValue ? `Ship ${selectedValue}` : 'Select a ship size'}
                    </p>
                    {selectedValue && <ShipComponent renderSize={6} ship={{ align: 'horizontal', hits: [], tiles: Array<string>(Number(selectedValue)).fill('1-1') }}></ShipComponent>}
                </div>
                <div className="flex w-1/12">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                </div>
            </div>

            {isOpen && (
                <div
                    className="absolute w-full border mt-1 z-10 bg-neutral-blue rounded divide-y text-sm font-semibold"
                >
                    {options.map(option => (
                        <div
                            key={option}
                            className="flex justify-between items-center px-2 py-1"
                            onClick={() => { setIsOpen(false); onSelect(option); }}
                        >
                            <p className="leading-loose">{`Ship ${option}`}</p>
                            <ShipComponent renderSize={4} ship={{ align: 'horizontal', hits: [], tiles: Array<string>(Number(option)).fill('1-1') }}></ShipComponent>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


export function ShipComponent({ ship, renderSize = 8 }: { ship: Ship, renderSize?: number }) {
    const { tiles, align } = ship;
    function ShipTile({ image, isHit }: { image: string; isHit: boolean }) {
        return (
            <div className={`min-w-${renderSize} w-${renderSize} flex flex-grow-0 relative`}>
                <img className={`w-fit`} src={image} />
                <div className={`w-1/2 h-1/2 absolute ${isHit ? 'bg-primary-pink' : 'bg-primary-blue'} 
                ${isHit ? 'border-primary-pink' : 'border-action-blue'}
                    top-1/4 start-1/4 rounded-full border`}></div>
            </div>
        )
    }

    return (<div className={`flex p-1 w-fit ${align === 'vertical' ? 'flex-col' : ''}`}>
        {
            tiles.map((tile, index) => {
                if (index === 0) {
                    return (
                        <ShipTile isHit={false} key={index} image={align === 'vertical' ? ShipEndUpTile : ShipEndLeftTile} />
                    )
                } else if (index === tiles.length - 1) {
                    return (
                        <ShipTile isHit={false} key={index} image={align === 'vertical' ? ShipEndDownTile : ShipEndRightTile} />
                    )
                } else {
                    return (
                        <ShipTile isHit={false} key={index} image={align === 'vertical' ? ShipMidVerticalTile : ShipMidHorizontalTile} />
                    )
                }
            })
        }
    </div >)
}

export function Lobby({ sharedStates }: { sharedStates: ReturnType<typeof useSharedState> }) {
    const { client, context, states, setStates } = sharedStates;
    const { board, boardSize, availableShipSizes, uri, lobbyMode, enemyPubky, placedShips } = states;
    const { setBoardHash, setId, setUri, setNonce, setGameState, setEnemyPubky,
        setBoardSize, setEnemyBoardHash, setAvailableShipSizes, setPlacedShips, setBoard } = setStates;

    const [placementAlignment, setPlacementAlignment] = useState<ShipAlignment>('horizontal');
    const [selectedShipIndex, setSelectedShipIndex] = useState<number | null>(null);
    const [dropDownSelectedShip, setDropDownSelectedShip] = useState<string>('2');
    const [remainingShips, setRemainingShips] = useState<number[]>(availableShipSizes);

    const [yourFleet, setYourFleet] = useState<Ship[]>(
        availableShipSizes.map(size => ({ align: 'horizontal', hits: [], tiles: Array(size).fill('1-1') }))
    );

    useEffect(() => {
        setYourFleet(availableShipSizes.map(size => ({ align: 'horizontal', hits: [], tiles: Array(size).fill('1-1') })))
    }, [availableShipSizes])

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

        client.get(`matches/${id}/init`, new TextEncoder().encode(enemyPk)).then((enemyInit => {
            if (enemyInit === null) return;
            setBoardSize(Number(enemyInit.data.size))
            setEnemyBoardHash(enemyInit.data.boardHash)
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
                }).then((() => {
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

    const placeShip = (row: number, col: number): void => {
        const shipStart = `${row}-${col}`;
        const align = placementAlignment;
        const ship = newShip({ align, size: remainingShips[remainingShips.length - 1], start: shipStart });
        for (const tile of ship.tiles) {
            board[tile] = Tile.SHIP;
        }
        setBoard(board);
        setPlacedShips(placedShips.concat(ship));
        setRemainingShips(remainingShips.slice(0, remainingShips.length - 1));
    }

    const calculateRemainingShips = (placed: number[], available: number[]): number[] => {
        const counts: Record<number, number> = {};
        available.forEach(item => {
            const current = counts[item] || 0;
            counts[item] = current + 1;
        })
        placed.forEach(item => {
            const current = counts[item] || 0;
            counts[item] = current - 1;
        })

        const remaining = Object.keys(counts).map(key => counts[Number(key)] !== 0 ?
            Array<number>(Math.abs(counts[Number(key)])).fill(Number(key)) : []).flat();
        return remaining
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
                            <p className="overflow-hidden">
                                {uri || 'babeothunetohuntoehuntoehnuthonetuhntoeuheabba'}
                            </p>
                            <p>...</p>
                        </div>
                        <div className="w-6 pt-1 px-1">
                            <button>
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
                    /> : <p>{enemyPubky}</p>}
                </label>

                {/* Size field */}
                <label className="mb-2 flex flex-col">
                    Size: (5-20)
                    <div
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
                    </div>
                </label>

                {/* Ships input */}
                {lobbyMode === LobbyMode.CREATE && (<label className="mb-2 flex flex-col">
                    Select Ship:
                    <div className="flex w-full mt-2 border rounded">
                        <ShipSelectDropDown
                            selectedValue={dropDownSelectedShip}
                            onSelect={option => {
                                const newAvailableShipSizes = availableShipSizes.concat(Number(option));
                                setAvailableShipSizes(newAvailableShipSizes);
                                setDropDownSelectedShip(option);
                                setRemainingShips(calculateRemainingShips(placedShips.map(ship => ship.tiles.length), newAvailableShipSizes));
                            }}
                            options={['2', '3', '4', '5', '6']}
                        />
                    </div>
                </label>)}
            </div>
        )
    }

    return (
        <div className="sm:w-11/12 md:w-full lg:w-3/4 mx-auto py-4 px-1 lg:py-12 text-white">
            <div className="flex flex-col items-center">
                <div className="flex flex-col-reverse md:flex-row md:w-5/6 w-full gap-8 md:gap-0">
                    <Board onCellClick={availableShipSizes.length !== placedShips.length ? placeShip : undefined} board={board} size={boardSize} />
                    <LobbySettings />
                </div>

                {/* Your Fleet */}
                <div className="flex flex-col w-5/6 pt-10">
                    <p className="font-bold text-xl">Your Fleet</p>
                    <div className="flex flex-wrap shrink-0 gap-8">
                        {yourFleet.map((fleetShip, index) => (
                            <div className="w-fit relative gap-1 flex-col" key={index}>
                                <p>Ship {fleetShip.tiles.length}</p>
                                <div className="flex">
                                    <ShipComponent ship={fleetShip}></ShipComponent>
                                    <div className="absolute -end-4 bottom-0">
                                        <button className="w-4" onClick={() => {
                                            const newAvailableShipSizes = availableShipSizes.slice(0, index).concat(availableShipSizes.slice(index + 1))
                                            setAvailableShipSizes(newAvailableShipSizes);
                                            setRemainingShips(calculateRemainingShips(placedShips.map(ship => ship.tiles.length), newAvailableShipSizes));
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
                    disabled={placedShips.length !== availableShipSizes.length}
                    className={`m-2 px-6 py-3 rounded-full text-white font-semibold shadow-md 
                        ${placedShips.length !== availableShipSizes.length ? 'bg-secondary-blue' : 'bg-primary-pink hover:opacity-80'}`}
                >
                    {lobbyMode === LobbyMode.CREATE ? 'START' : 'JOIN'}
                </button>
            </div>
        </div>
    )
}
