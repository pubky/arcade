import { useContext, useState } from "react";
import { Actor, GameState, LobbyMode, MatchState, Square, TBoard } from ".";
import { ClientContext } from "../../client";
import { TicTacToeClient } from "./client";

// board always starts emptry for every square
const newBoard = (): TBoard => {
    return Array<Square>(3).fill(Square.EMPTY).map(() => Array<Square>(3).fill(Square.EMPTY));
}

export const useSharedState = () => {
    const [gameState, setGameState] = useState(GameState.LOBBY);
    const [lobbyMode, setLobbyMode] = useState(LobbyMode.CREATE);
    const [matchState, setMatchState] = useState<MatchState>(MatchState.MOVE);
    // TODO: Actor is determined once in modal before the game starts
    const [actorState, setActorState] = useState<Actor>();
    // TODO: pubky of player X is determined once in modal before the game starts
    const [xPubky, setXPubky] = useState<string>();
    // TODO: pubky of player 0 is determined once in modal before the game starts
    const [oPubky, setOPubky] = useState<string>();

    const [id, setId] = useState<string | null>(null);
    const [uri, setUri] = useState<string | null>(null);
    // const [nonce, setNonce] = useState<string | null>(null);
    const [enemyPubky, setEnemyPubky] = useState<string | null>(null);
    const [board, setBoard] = useState<TBoard>(newBoard());
    const [currentPlayer, setCurrentPlayer] = useState<Square>(Square.X);
    // const [boardHash, setBoardHash] = useState<string | null>(null);

    // settings in lobby
    // const [boardSize, setBoardSize] = useState<number>(10);
    // const [availableShipSizes, setAvailableShipSizes] = useState<number[]>([2, 2, 3, 3]);
    // const [placedShips, setPlacedShips] = useState<Ship[]>([]);

    // const [enemyBoard, setEnemyBoard] = useState<TBoard>(newBoard());
    // const [enemyBoardHash, setEnemyBoardHash] = useState<string | null>(null);

    // a tuple in this format [ships I have destroyed, ships the enemy has destroyed]
    // const [score, setScore] = useState<[number, number]>([0, 0]);

    // const [enemyLastSig, setEnemyLastsig] = useState<string | null>(null);
    // const [myLastSig, setMyLastSig] = useState<string | null>(null);

    const context = useContext(ClientContext);
    const client = new TicTacToeClient(context);

    return {
        client,
        context,
        states: {
            gameState,
            matchState,
            lobbyMode,
            actorState,
            xPubky,
            oPubky,
            id,
            uri,
            enemyPubky,
            board,
            currentPlayer,
        },
        setStates: {
            setGameState,
            setMatchState,
            setLobbyMode,
            setActorState,
            setXPubky,
            setOPubky,
            setId,
            setUri,
            setEnemyPubky,
            setBoard,
            setCurrentPlayer,
        }
    }
}

