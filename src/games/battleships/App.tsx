'use client';
import { useContext, useEffect, useState } from 'react';
import { ClientContext } from '../../client';
import { BattleshipsClient } from './client';

enum GameState {
  MAIN = 'MAIN',
  LOBBY = 'LOBBY',
  MATCH = 'MATCH',
}

enum LobbyMode {
  CREATE = 'CREATE',
  JOIN = 'JOIN',
}

enum MatchState {
  WARM_UP = 'WARM_UP',
  MOVE = 'MOVE',
  RES = 'RES',
  CONF = 'CONF',
  WAIT = 'WAIT'
}

enum Tile {
  WATER = 'WATER',
  SHIP = 'SHIP',
  HIT = 'HIT',
  MISS = 'MISS',
  PENDING = 'PENDING',
}

// Board keys are '{row}-{column}' and map to a Tile. 
// The board only keeps values apart from Tile.WATER and if a key does not exist, it equals a Tile.WATER.
type Board = Record<string, Tile>


type ShipAlignment = 'horizontal' | 'vertical'

enum ShotResult {
  MISS = 'MISS',
  HIT = 'HIT',
  SUNK = 'SUNK',
}

// Ship has a bunch of points which are the board's keys.
// The items are sorted from left to right for horizontal and top to bottom for vertical ones.
interface Ship {
  tiles: string[],
  hits: string[]
}

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

const placeShot = (input: { hit: string, board: Board, ships: Ship[] }): ShotResult => {
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

const newBoard = (): Board => {
  return {}
}

const useSharedState = () => {
  const [gameState, setGameState] = useState(GameState.MAIN);
  const [lobbyMode, setLobbyMode] = useState(LobbyMode.CREATE);

  const [id, setId] = useState<string | null>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [nonce, setNonce] = useState<string | null>(null);
  const [enemyPubky, setEnemyPubky] = useState<string | null>(null);
  const [board, setBoard] = useState<Board>(newBoard());
  const [boardHash, setBoardHash] = useState<string | null>(null);

  // settings in lobby
  const [boardSize, setBoardSize] = useState<number>(10);
  const [availableShipSizes, setAvailableShipSizes] = useState<number[]>([2, 2, 3, 3]);
  const [placedShips, setPlacedShips] = useState<Ship[]>([]);

  const [enemyBoard, setEnemyBoard] = useState<Board>(newBoard());
  const [enemyBoardHash, setEnemyBoardHash] = useState<string | null>(null);

  // a tuple in this format [ships I have destroyed, ships the enemy has destroyed]
  const [score, setScore] = useState<[number, number]>([0, 0]);

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
    }
  }
}

function MainMenu({ sharedStates }: { sharedStates: ReturnType<typeof useSharedState> }) {
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


function Lobby({ sharedStates }: { sharedStates: ReturnType<typeof useSharedState> }) {
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

function Board(input: { board: Board, size: number, onCellClick: ((i: number, j: number) => void) | undefined }) {
  const { onCellClick, board, size } = input

  const drawBoard = (inputBoard: Board, size: number, onCellClick: ((i: number, j: number) => void) | undefined) => {
    const getCellColor = (value: Tile) => {
      switch (value) {
        case Tile.WATER: return 'bg-blue-500';
        case Tile.SHIP: return 'bg-gray-500';
        case Tile.MISS: return 'bg-black';
        case Tile.HIT: return 'bg-red-500';
        default: return 'bg-blue-500'; // Water
      }
    };
    const renderItems = []
    for (let i = 0; i < size; i++) {
      const renderRow = []
      for (let j = 0; j < size; j++) {
        const key = `${i}-${j}`
        renderRow.push(<button
          key={key}
          className={`w-8 h-8 cursor-pointer ${getCellColor(inputBoard[key])} ${onCellClick === undefined && 'pointer-events-none'}`}
          disabled={onCellClick === undefined}
          onClick={onCellClick ? () => onCellClick(i, j) : undefined}
        />)
      }
      renderItems.push(renderRow)
    }
    return <div className={`grid ${'grid-cols-10'} gap-1 bg-gray-700 p-1`}>{renderItems}</div>
  }
  return drawBoard(board, size, onCellClick)
}

const poll = (pollFunction: () => void) => {
  const intervalId = setInterval(pollFunction, 1000);
  return () => clearInterval(intervalId);
}

function Game({ sharedStates }: { sharedStates: ReturnType<typeof useSharedState> }) {
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
      console.log('value of get', value)
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
    console.log('enemy move', move)

    const result = placeShot({ hit: move, board, ships: placedShips });

    console.log('result: ', result);

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
    console.log('payload', payload)
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
        console.log('hi');
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

function App() {
  const sharedState = useSharedState();
  const { gameState } = sharedState.states;

  const pageMap = {
    [GameState.MAIN]: <MainMenu sharedStates={sharedState} />,
    [GameState.LOBBY]: <Lobby sharedStates={sharedState} />,
    [GameState.MATCH]: <Game sharedStates={sharedState} />
  };

  return (
    <div className="App">
      {pageMap[gameState]}
    </div>
  );
}

export default App;