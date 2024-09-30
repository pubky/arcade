
export enum GameState {
    LOBBY = 'LOBBY',
    MATCH = 'MATCH',
}

export enum LobbyMode {
    CREATE = 'CREATE',
    JOIN = 'JOIN',
}

export enum Actor {
    X = 'X',
    O = 'O',
    PASSIVE = 'PASSIVE',
}

export enum MatchState {
    MOVE = 'MOVE',
    WAIT = 'WAIT',
    FINISH = 'FINISH',
}

export enum Square {
    X = 'X',
    O = 'O',
    EMPTY = 'EMPTY'
}

export type TBoard = Square[][];

export type TRes = { board: TBoard, matchState: MatchState };