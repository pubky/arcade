
export enum GameState {
    MAIN = 'MAIN',
    LOBBY = 'LOBBY',
    MATCH = 'MATCH',
}

export enum LobbyMode {
    CREATE = 'CREATE',
    JOIN = 'JOIN',
}

export enum MatchState {
    WARM_UP = 'WARM_UP',
    MOVE = 'MOVE',
    RES = 'RES',
    CONF = 'CONF',
    WAIT = 'WAIT'
}

export enum Tile {
    WATER = 'WATER',
    SHIP = 'SHIP',
    HIT = 'HIT',
    MISS = 'MISS',
    PENDING = 'PENDING',
}

// Board keys are '{row}-{column}' and map to a Tile. 
// The board only keeps values apart from Tile.WATER and if a key does not exist, it equals a Tile.WATER.
export type TBoard = Record<string, Tile>


export type ShipAlignment = 'horizontal' | 'vertical'

export enum ShotResult {
    MISS = 'MISS',
    HIT = 'HIT',
    SUNK = 'SUNK',
}

// Ship has a bunch of points which are the board's keys.
// The items are sorted from left to right for horizontal and top to bottom for vertical ones.
export interface Ship {
    tiles: string[],
    hits: string[]
}