import { useState } from "react";
import { LobbyMode, MatchState, Ship, ShotResult, TBoard, Tile } from ".";
import { useInterval } from "../../utils";
import { Board } from "./Board";
import { ShipComponent } from "./Ship";
import { useSharedState } from "./state";

const placeShot = (input: { hit: string, board: TBoard, ships: Ship[] }): ShotResult => {
    const { board, hit, ships } = input;
    const tile = board[hit];

    if (tile === undefined || tile !== Tile.SHIP) {
        board[hit] = Tile.MISS;
        return ShotResult.MISS
    }

    const hitShip = ships.find(ship => ship.tiles.includes(hit)) as Ship;
    hitShip.hits.push(hit)
    board[hit] = Tile.HIT;

    return hitShip.hits.length === hitShip.tiles.length ? ShotResult.SUNK : ShotResult.HIT
}

export function Game({ sharedStates }: { sharedStates: ReturnType<typeof useSharedState> }) {
    const { states, client, setStates } = sharedStates;
    const { lobbyMode, id, enemyPubky, board, boardSize, enemyBoard, uri, score, placedShips, availableShipSizes,
        myLastSig, enemyLastSig } = states;
    const { setEnemyBoardHash, setBoard, setScore, setMyLastSig, setEnemyLastsig, setEnemyBoard } = setStates;

    const [matchState, setMatchState] = useState<MatchState>(lobbyMode === LobbyMode.CREATE ? MatchState.WARM_UP : MatchState.WAIT);
    const [currentTurn, setCurrentTurn] = useState<number>(1);
    const [lastMove, setLastMove] = useState<MatchState | null>(null);
    const [pendingTile, setPendingTile] = useState<string | null>(null);

    const getStateTitle = (state: MatchState, lastMove: MatchState | null) => {
        switch (state) {
            case MatchState.WARM_UP:
                return 'Waiting for the other player to join...'
            case MatchState.MOVE:
                return 'Your Turn: attack the enemy!'
            case MatchState.RES:
                return 'Your Turn: reporting shot result...'
            case MatchState.CONF:
                return 'Your Turn: confirming reported result...'
            case MatchState.WAIT:
                switch (lastMove) {
                    case MatchState.CONF:
                        return 'Enemy\'s Turn: Waiting for the enemy attack'
                    case MatchState.RES:
                        return 'Enemy\'s Turn: Waiting for the enemy to confirm result'
                    case MatchState.MOVE:
                        return 'Enemy\'s Turn: Waiting for the enemy to report shot result'
                    default:
                        return 'Enemy\'s Turn: Waiting for the enemy attack'
                }
        }
    }

    const waitForOtherPlayerJoin = () => {
        client.get(`matches/${id}/join`, enemyPubky as string, myLastSig as string).then(value => {
            if (value === null) return
            setMatchState(MatchState.MOVE);
            setEnemyBoardHash(value.data.boardHash)
            setEnemyLastsig(value.sig)
        }).catch((error => {
            console.log('error', error)
        }))
    }

    const waitForOtherPlayerMove = () => {
        const enemyState = getEnemyState(lastMove);
        const enemyTurnPath = getFilePath(enemyState, currentTurn);
        console.log('in waitForOtherPlayerMove', { enemyState, enemyTurnPath });
        client.get(`matches/${id}/${enemyTurnPath}`, enemyPubky as string, myLastSig as string).then(value => {
            console.log('in .get', { id, enemyTurnPath, value });
            if (value === null) return
            setEnemyLastsig(value.sig)
            handleEnemyMove(enemyState, value.data, value.sig)
        }).catch((error => {
            console.log('error', error)
        }))
    }

    const handleEnemyMove = (enemyState: MatchState, data: Record<string, string>, sig: string) => {
        console.log('in handleEnemyMove', { enemyState });
        switch (enemyState) {
            case MatchState.MOVE:
                // setMatchState(MatchState.RES);
                handleEnemyAttack(data, sig);
                break;
            case MatchState.RES:
                // setMatchState(MatchState.CONF);
                handleEnemyRes(data, sig);
                break;
            case MatchState.CONF:
                handleEnemyConf(data);
                break;
            default:
                break;
        }
    }

    const handleEnemyAttack = (data: Record<string, string>, sig: string) => {
        const { move } = data

        console.log('in handleEnemyAttack', { move });

        const result = placeShot({ hit: move, board, ships: placedShips });

        // send res
        client.put({
            path: `matches/${id}/${getFilePath(MatchState.RES, currentTurn)}`, payload: {
                res: String(result)
            }, preSig: sig
        }).then((value => {
            console.log('in handleEnemyAttack sent a res', { value });
            if (value === null) {
                console.log('failed to send the result of enemy move.');
                return
            }
            const { sig } = value;
            setMyLastSig(sig);
            setBoard(board)
            setLastMove(MatchState.RES);
            setMatchState(MatchState.WAIT);
        })).catch((error => {
            console.log('error', error)
        }))
    }

    const attackEnemy = (row: number, col: number) => {
        const key = `${row}-${col}`
        const payload = {
            move: key
        }
        enemyBoard[key] = Tile.PENDING;
        setPendingTile(key);
        setEnemyBoard(enemyBoard);
        client.put({ path: `matches/${id}/${getFilePath(MatchState.MOVE, currentTurn)}`, payload, preSig: enemyLastSig || undefined }).then((value => {
            if (value === null) {
                console.log('failed to attack enemy');
                return
            };
            const { sig } = value;
            setMyLastSig(sig);
            setLastMove(MatchState.MOVE);
            setMatchState(MatchState.WAIT);
        })).catch((error => {
            console.log('error', error)
        }))
    }

    const handleEnemyConf = (data: Record<string, string>) => {
        const { confirmation } = data
        setCurrentTurn(currentTurn + 1);
        setMatchState(MatchState.MOVE);
        if (confirmation === 'false') {
            alert('enemy did not confirm');
        }
    }

    const sendEnemyConfirmation = (sig: string) => {
        client.put({
            path: `matches/${id}/${getFilePath(MatchState.CONF, currentTurn)}`, payload: {
                confirmation: 'true'
            }, preSig: sig
        }).then((value => {
            if (value === null) {
                console.log('failed to send confirmation.')
                return
            };
            const { sig } = value;
            setMyLastSig(sig);
            setCurrentTurn(currentTurn + 1);
            setLastMove(MatchState.CONF);
            setMatchState(MatchState.WAIT);
        })).catch((error => {
            console.log('error', error)
        }))
    }

    const handleEnemyRes = (data: Record<string, string>, sig: string) => {
        const { res } = data

        if (res as ShotResult === ShotResult.MISS) {
            enemyBoard[pendingTile as string] = Tile.MISS;
        }
        else {
            enemyBoard[pendingTile as string] = Tile.HIT;
            if (res as ShotResult === ShotResult.SUNK) {
                setScore([score[0] + 1, score[1]]);
            }
        }
        setEnemyBoard(enemyBoard);
        sendEnemyConfirmation(sig);
    }

    const getEnemyState = (lastMove: MatchState | null) => {
        switch (lastMove) {
            case MatchState.MOVE:
                return MatchState.RES;
            case MatchState.RES:
                return MatchState.CONF;
            case MatchState.CONF:
                return MatchState.MOVE;
            default:
                return MatchState.MOVE;
        }
    }

    const getFilePath = (state: MatchState, turn: number) => {
        return `${state}-${turn}`;
    }

    useInterval(() => {
        switch (matchState) {
            case MatchState.WARM_UP:
                return waitForOtherPlayerJoin();
            case MatchState.MOVE:
                return
            case MatchState.RES:
                return
            case MatchState.CONF:
                return
            case MatchState.WAIT:
                return waitForOtherPlayerMove();
        }
    }, 1000)

    const isYourTurn = () => {
        if (lastMove === MatchState.CONF && matchState === MatchState.WAIT) {
            return false
        }
        return matchState === MatchState.MOVE
    }

    return (
        <div className="sm:w-11/12 md:w-full lg:w-3/4 mx-auto mb-20 py-10 md:py-4 px-1 text-white relative">
            {/* Match URI Copy */}
            <div className="absolute start-0 top-0 m-4 px-2 py-1 flex w-fit border rounded border-transparent hover:border-white">
                <button className="flex gap-1 active:opacity-40 items-center" onClick={() => { navigator.clipboard.writeText(uri as string).catch(() => { }) }}>
                    Copy URI
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                    </svg>
                </button>
            </div>
            <div className="flex flex-col items-center">
                <div className="flex flex-col w-full items-center">
                    <h2 className="font-bold my-2 py-2">{getStateTitle(matchState, lastMove)}</h2>
                </div>
                <div className="flex flex-wrap justify-between p-2 gap-0 mb-8 w-full">
                    <div className="flex flex-col w-full md:w-1/2 items-center mb-4">
                        <div className={`relative flex p-2 gap-4 mb-2 rounded-xl items-center bg-primary-gray border ${isYourTurn() ? 'border-primary-green' : 'border-transparent'}`}>
                            <p className="text-lg">You</p>
                            <div className={`w-5 h-5 rounded-full border-gray-700 ${isYourTurn() ? 'bg-primary-green' : 'bg-transparent'} border-4`}></div>
                            {isYourTurn() ? <div className="absolute flex -end-1/3 top-1/4 text-primary-green w-fit">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                                </svg>
                            </div> : <></>}
                        </div>
                        <div className={`flex flex-col ${!isYourTurn() ? '' : 'opacity-30'}`}>
                            <Board
                                board={board}
                                size={boardSize}
                                ships={placedShips}
                                onCellClick={undefined}
                                onShipDelete={undefined}
                                onShipReplace={undefined}
                                onShipRotate={undefined}
                            />
                            {/* Your Fleet */}
                            <div className="flex flex-col w-5/6 pt-10">
                                <p className="font-bold text-xl">Your Fleet</p>
                                <div className="flex flex-wrap shrink-0 gap-10">
                                    {placedShips.map((fleetShip, index) => (
                                        <div className="w-fit box-border relative gap-1 flex-col" key={index}>
                                            <p>Ship {fleetShip.tiles.length}</p>
                                            <div className="flex cursor-pointer border border-transparent rounded">
                                                <ShipComponent ship={fleetShip} renderSize={8}></ShipComponent>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col w-full md:w-1/2 items-center mb-4">
                        <div className={`relative flex p-2 gap-4 mb-2 rounded-xl items-center bg-primary-gray border ${!isYourTurn() ? 'border-primary-green' : 'border-transparent'}`}>
                            <p className="text-lg">Enemy</p>
                            <div className={`w-5 h-5 rounded-full border-gray-700 ${!isYourTurn() ? 'bg-primary-green' : 'bg-transparent'} border-4`}></div>
                            {!isYourTurn() ? <div className="absolute flex -start-1/3 top-1/4 text-primary-green w-fit">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
                                </svg>
                            </div> : <></>}
                        </div>
                        <div className={`flex flex-col ${isYourTurn() ? '' : 'opacity-30'}`}>
                            <Board
                                board={enemyBoard}
                                size={boardSize}
                                onCellClick={isYourTurn() ? attackEnemy : undefined}
                                ships={undefined}
                                onShipDelete={undefined}
                                onShipReplace={undefined}
                                onShipRotate={undefined}
                            />
                            {/* Enemy Fleet */}
                            <div className="flex flex-col w-5/6 pt-10">
                                <p className="font-bold text-xl">Enemy Fleet</p>
                                <div className="flex flex-wrap shrink-0 gap-10">
                                    {availableShipSizes.map((shipSize, index) => {
                                        const ship: Ship = { align: 'horizontal', hits: [], tiles: new Array<string>(shipSize).fill('1-1') }
                                        return (
                                            <div className="w-fit box-border relative gap-1 flex-col" key={index}>
                                                <p>Ship {ship.tiles.length}</p>
                                                <div className="flex cursor-pointer border border-transparent rounded">
                                                    <ShipComponent ship={ship} renderSize={8}></ShipComponent>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
