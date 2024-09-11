import { useEffect, useState } from "react";
import { LobbyMode, MatchState, Ship, ShotResult, TBoard, Tile } from ".";
import { Board } from "./Board";
import { useSharedState } from "./state";

const placeShot = (input: { hit: string, board: TBoard, ships: Ship[] }): ShotResult => {
    const { board, hit, ships } = input;
    const tile = board[hit];

    if (tile === undefined || tile !== Tile.SHIP) {
        return ShotResult.MISS
    }

    const hitShip = ships.find(ship => ship.tiles.includes(hit)) as Ship;
    hitShip.hits.push(hit)
    board[hit] = Tile.HIT;

    return hitShip.hits.length === hitShip.tiles.length ? ShotResult.SUNK : ShotResult.HIT
}

const poll = (pollFunction: () => void) => {
    const intervalId = setInterval(pollFunction, 1000);
    return () => clearInterval(intervalId);
}

export function Game({ sharedStates }: { sharedStates: ReturnType<typeof useSharedState> }) {
    const { states, client, setStates } = sharedStates;
    const { lobbyMode, id, enemyPubky, board, boardSize, enemyBoard, uri, score, placedShips } = states;
    const { setEnemyBoardHash, setBoard, setScore } = setStates;

    const [matchState, setMatchState] = useState<MatchState>(lobbyMode === LobbyMode.CREATE ? MatchState.WARM_UP : MatchState.WAIT);
    const [currentTurn, setCurrentTurn] = useState<number>(1);
    const [lastMove, setLastMove] = useState<MatchState | null>(null);

    const [lastEnemySig, setLastEnemysig] = useState<string | null>(null);

    const getStateTitle = (state: MatchState) => {
        switch (state) {
            case MatchState.WARM_UP:
                return 'Waiting for the other player to join...'
            case MatchState.MOVE:
                return 'Attacking the enemy board'
            case MatchState.RES:
                return 'Reporting enemy attempt'
            case MatchState.WAIT:
                return 'Waiting for the other player\'s turn'
        }
    }

    const waitForOtherPlayerJoin = () => {
        client.get(`matches/${id}/join`, new TextEncoder().encode(enemyPubky as string)).then(value => {
            if (value === null) return
            setMatchState(MatchState.MOVE);
            setEnemyBoardHash((value as { data: Record<string, string>, sig: string }).data.boardHash as string)
            setLastEnemysig((value as { data: Record<string, string>, sig: string }).sig)
        })
    }

    const waitForOtherPlayerMove = () => {
        const enemyState = getEnemyState(lastMove);
        const enemyTurnPath = getFilePath(enemyState, currentTurn);
        client.get(`matches/${id}/${enemyTurnPath}`, new TextEncoder().encode(enemyPubky as string)).then(value => {
            if (value === null) return
            setLastEnemysig((value as { data: Record<string, string>, sig: string }).sig)
            handleEnemyMove(enemyState, (value as { data: Record<string, string>, sig: string }).data)
        })
    }

    const handleEnemyMove = (enemyState: MatchState, data: Record<string, string>) => {
        switch (enemyState) {
            case MatchState.MOVE:
                setMatchState(MatchState.RES);
                handleEnemyAttack(data);
                setMatchState(MatchState.WAIT);
                setLastMove(MatchState.RES);
                break;
            case MatchState.RES:
                setMatchState(MatchState.CONF);
                handleEnemyRes(data);
                setMatchState(MatchState.WAIT);
                setLastMove(MatchState.CONF);
                break;
            case MatchState.CONF:
                handleEnemyConf(data);
                setMatchState(MatchState.MOVE);
                break;
            default:
                break;
        }
    }

    const handleEnemyAttack = (data: Record<string, string>) => {
        const { move } = data

        const result = placeShot({ hit: move, board, ships: placedShips });

        // send res
        client.put({
            path: `matches/${id}/${getFilePath(MatchState.RES, currentTurn)}`, payload: {
                res: String(result)
            }, preSig: lastEnemySig as string
        })
        setBoard(board)
    }

    const attackEnemy = (row: number, col: number) => {
        const key = `${row}-${col}`
        const payload = {
            move: key
        }

        enemyBoard[key] = Tile.PENDING;
        client.put({ path: `matches/${id}/${getFilePath(MatchState.MOVE, currentTurn)}`, payload, preSig: lastEnemySig as string })
        setLastMove(MatchState.MOVE)
        setMatchState(MatchState.WAIT);
    }

    const handleEnemyConf = (data: Record<string, string>) => {
        const { confirmation } = data
        setCurrentTurn(currentTurn + 1);
        if (confirmation === 'false') {
            alert('enemy did not confirm');
        }
    }

    const sendEnemyConfirmation = () => {
        client.put({
            path: `matches/${id}/${getFilePath(MatchState.CONF, currentTurn)}`, payload: {
                confirmation: 'true'
            }, preSig: lastEnemySig as string
        })
        setCurrentTurn(currentTurn + 1);
    }

    const handleEnemyRes = (data: Record<string, string>) => {
        const { res } = data
        if (res === ShotResult.MISS) {
            enemyBoard[lastMove as string] = Tile.MISS;
        }
        else {
            enemyBoard[lastMove as string] = Tile.HIT;
            if (res === ShotResult.SUNK) {
                setScore([score[0] + 1, score[1]]);
            }
        }
        sendEnemyConfirmation();
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

    useEffect(() => {
        switch (matchState) {
            case MatchState.WARM_UP:
                return poll(waitForOtherPlayerJoin);
            case MatchState.MOVE:
                return
            case MatchState.RES:
                return
            case MatchState.CONF:
                return
            case MatchState.WAIT:
                return poll(waitForOtherPlayerMove);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchState])

    return (
        <div className="flex flex-col items-center p-8 bg-blue-100 min-h-screen">
            <h2 className="text-2xl font-bold mb-4 text-blue-800">{getStateTitle(matchState)}</h2>
            <div className="flex flex-wrap justify-center gap-8 mb-8">
                <div>
                    <h3 className="text-xl font-semibold mb-2 text-blue-700">Your Board</h3>
                    <Board board={board} size={boardSize} onCellClick={undefined} />
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-2 text-blue-700">Enemy Board @{enemyPubky?.slice(0, 8)}...</h3>
                    <Board board={enemyBoard} size={boardSize} onCellClick={attackEnemy} />
                </div>
            </div>
            <div className='flex flex-col'>
                <div className='flex items-center'>
                    <h1 className="text-2xl font-bold m-2">Game URI:</h1>
                    <p>(click the link to copy)</p>
                </div>
                <button className="text-2xl font-bold bg-blue-200 p-0.5" onClick={() => navigator.clipboard.writeText(uri || '')}>
                    {uri?.slice(0, 10)}...
                </button>
            </div>
        </div>
    );
}
