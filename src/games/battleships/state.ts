import { useContext, useState } from "react";
import { GameState, LobbyMode, Ship, TBoard } from ".";
import { ClientContext } from "../../client";
import { BattleshipsClient } from "./client";

const newBoard = (): TBoard => {
    return {}
}

export const useSharedState = () => {
    const [gameState, setGameState] = useState(GameState.MAIN);
    const [lobbyMode, setLobbyMode] = useState(LobbyMode.CREATE);

    const [id, setId] = useState<string | null>(null);
    const [uri, setUri] = useState<string | null>(null);
    const [nonce, setNonce] = useState<string | null>(null);
    const [enemyPubky, setEnemyPubky] = useState<string | null>(null);
    const [board, setBoard] = useState<TBoard>(newBoard());
    const [boardHash, setBoardHash] = useState<string | null>(null);

    // settings in lobby
    const [boardSize, setBoardSize] = useState<number>(10);
    const [availableShipSizes, setAvailableShipSizes] = useState<number[]>([2, 2, 3, 3]);
    const [placedShips, setPlacedShips] = useState<Ship[]>([]);

    const [enemyBoard, setEnemyBoard] = useState<TBoard>(newBoard());
    const [enemyBoardHash, setEnemyBoardHash] = useState<string | null>(null);

    // a tuple in this format [ships I have destroyed, ships the enemy has destroyed]
    const [score, setScore] = useState<[number, number]>([0, 0]);

    const [enemyLastSig, setEnemyLastsig] = useState<string | null>(null);
    const [myLastSig, setMyLastSig] = useState<string | null>(null);

    const context = useContext(ClientContext);
    const client = new BattleshipsClient(context);

    return {
        client,
        context,
        states: {
            gameState,
            lobbyMode,
            id,
            uri,
            nonce,
            enemyPubky,
            board,
            boardHash,
            boardSize,
            availableShipSizes,
            placedShips,
            enemyBoard,
            enemyBoardHash,
            score,
            myLastSig,
            enemyLastSig,
        },
        setStates: {
            setGameState,
            setLobbyMode,
            setId,
            setUri,
            setNonce,
            setEnemyPubky,
            setBoard,
            setBoardHash,
            setBoardSize,
            setAvailableShipSizes,
            setPlacedShips,
            setEnemyBoard,
            setEnemyBoardHash,
            setScore,
            setMyLastSig,
            setEnemyLastsig
        }
    }
}

