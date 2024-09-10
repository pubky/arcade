'use client';
import { useContext, useEffect, useState } from 'react';
import { ClientContext } from '../../client/context';

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
  PRE = 'PRE',
  MOVE = 'MOVE',
  RES = 'RES',
  CONF = 'CONF',
  WAIT = 'WAIT'
}

function App() {
  const [gameState, setGameState] = useState(GameState.MAIN);
  const [lobbyMode, setLobbyMode] = useState(LobbyMode.CREATE);

  const [id, setId] = useState<string | null>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [joinUri, setJoinUri] = useState<string | null>(null);
  const [matchPublicKey, setMatchPublicKey] = useState<string | null>(null);
  const [nonce, setNonce] = useState<string | null>(null);
  const [enemyPubky, setEnemyPubky] = useState<string | null>(null);
  const [enemyMatchPublicKey, setEnemyMatchPublicKey] = useState<string | null>(null);
  const [board, setBoard] = useState<Record<string, number>>({});
  const [boardHash, setBoardHash] = useState<string | null>(null);
  const [size, setSize] = useState<number>(10);
  const [ships, setShips] = useState<number[]>([2, 2, 3, 3]);
  const [placedShips, setPlacedShips] = useState<number[]>([]);
  const [enemyBoard, setEnemyBoard] = useState(createEmptyBoard(size));
  const [enemyBoardHash, setEnemyBoardHash] = useState<string | null>(null);
  const [shipsSunk, setShipsSunk] = useState<number>(0);
  const [enemyShipsSunk, setEnemyShipsSunk] = useState<number>(0);

  const [disable, setDisable] = useState(false);

  const { battleshipsGet, battleshipsPut, battleshipsStart, battleshipsJoin } = useContext(ClientContext);

  const getGamePage = (state: GameState) => {
    switch (state) {
      case GameState.MAIN:
        return <MainMenu />
      case GameState.LOBBY:
        return <Lobby />
      case GameState.MATCH:
        return <Game />
    }
  }

  function createEmptyBoard(size: number) {
    const board: Record<string, number> = {}
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const key = `${i}-${j}`
        board[key] = 0
      }
    }
    return board
  }

  const startGame = (mode: LobbyMode) => {
    setLobbyMode(mode)
    setGameState(GameState.LOBBY)
    setDisable(false)
    if (mode === LobbyMode.JOIN && joinUri) {
      const parts = (joinUri as string).split('/')
      const id = parts[parts.length - 1]
      const enemyPk = parts[0].replace('pk:', '')
      setId(id)
      setEnemyPubky(enemyPk)
      setUri(joinUri)
    }
  };

  const joinMatch = () => {
    const parts = (joinUri as string).split('/')
    const id = parts[parts.length - 1]
    const enemyPk = parts[0].replace('pk:', '')
    battleshipsGet(enemyPk, `matches/${id}/init`).then((value => {
      setUri(joinUri);
      setId(id);
      setEnemyPubky(enemyPk)
      setSize(Number(value.data.size))
      setEnemyMatchPublicKey(value.data.publicKey as string)
      setEnemyBoardHash(value.data.boardHash as string)
      setShips((value.data.ships as string).split(',').map(i => Number(i)))

      battleshipsJoin(joinUri as string, board).then((value => {
        setBoardHash(value.boardHash)
        setNonce(value.nonce)
        setMatchPublicKey(value.publicKey)

        battleshipsPut({path: `matches/${id}/join`, 
          payload: {publicKey: matchPublicKey || '', boardHash: boardHash || '' }}).then((value => {
            setGameState(GameState.MATCH)
            setDisable(false)
          }));
      }))
    }))
  }

  function Board(input: { onCellClick: ((i: number, j: number) => void) | undefined }) {
    const { onCellClick } = input
    return drawBoard(board, onCellClick)
  }

  function EnemyBoard(input: { onCellClick: ((i: number, j: number) => void) | undefined }) {
    const { onCellClick } = input
    return drawBoard(enemyBoard, onCellClick)
  }

  const drawBoard = (inputBoard: Record<string, number>, onCellClick: ((i: number, j: number) => void) | undefined) => {
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

  const getCellColor = (value: number) => {
    switch (value) {
      case 0: return 'bg-blue-500';    // Water
      case 1: return 'bg-gray-500';    // Ship
      case 2: return 'bg-black';    // Miss
      case 3: return 'bg-red-500';     // Hit
      default: return 'bg-blue-500';
    }
  };

  function Lobby() {
    const placeShip = (row: number, col: number) => {
      const currentShip = shipsRemained()[0]
      const newBoard: Record<string, number> = {...board}

      for (let i = 0; i < currentShip; i++){
        const key = `${row}-${col+i}`
        newBoard[key] = 1
      }

      setPlacedShips(placedShips.concat(currentShip))
      setBoard(newBoard)
    };

    const startMatch = () => {
      battleshipsStart(board as Record<string, number>).then((value => {
        if (value === null) return
        const { id, nonce, boardHash, publicKey, pubky } = value
        battleshipsPut({path: `matches/${id}/init`, 
          payload: {publicKey, boardHash, size: String(size), ships: String(ships)}}).then((value => {
            setMatchPublicKey(publicKey)
            setBoardHash(boardHash)
            setId(id)
            setUri(`pk:${pubky}/battleships.app/matches/${id}`);
            setNonce(nonce)
          }));
      }));
      setGameState(GameState.MATCH);
      setDisable(false);
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
              <Board onCellClick={ships.length !== placedShips.length ? placeShip : undefined} />
          </div>

          {/* Start button */}
          <button 
            onClick={lobbyMode === LobbyMode.CREATE ? startMatch : joinMatch}
            disabled={!enemyPubky || placedShips.length !== ships.length}
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
              value={size} 
              onChange={(e) => 
                setSize(Number(e.target.value))}
              className="w-full p-2 border rounded"
            /> : <h3>{size}</h3>}
          </label>

          {/* Ships input */}
          <label className="mb-2">
            Ships:
            <div className="flex">
              {lobbyMode === LobbyMode.CREATE ? <input 
                type="text"
                value={String(ships)} 
                onChange={(e) => 
                  setShips(e.target.value.split(',').map(i => Number(i)))}
                className="flex-grow p-2 border rounded-l"
              /> : <h3>{String(ships)}</h3>}
            </div>
          </label>

          {/* Ships list */}
          <div className="mt-4">
            <h4 className="font-semibold">Ships:</h4>
            <ul className="list-disc list-inside">
              {shipsRemained().map((ship, index) => (
                <li key={index}>Ship: {ship}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const shipsRemained = () => {
    const placed = [...placedShips]
    return ships.filter(item => {
      const index = placed.indexOf(item)
      if (index > -1) {
        placed.splice(index, 1);
        return false;
      }
      return true
    });
  }

  function MainMenu() {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-blue-100">
        <h1 className="text-4xl font-bold mb-8 text-blue-800">Battleships</h1>
        <button 
          onClick={() => startGame(LobbyMode.CREATE)}
          disabled={disable}
          className="m-2 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
        >
          Start Game
        </button>
        <span> Or </span>
        <form onSubmit={() => startGame(LobbyMode.JOIN)} className='w-full mt-2 flex flex-col items-center justify-center'>
          <input 
                type="text" 
                id="join-url"
                placeholder='Enter match uri'
                onChange={(e) => {
                  setJoinUri(e.target.value);
                }}
                value={joinUri || ''}
                disabled={disable}
                className="w-1/4 p-2 border rounded"/>
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

  const getGameTitle = (state: MatchState) => {
    switch (state) {
      case MatchState.PRE:
        return 'Waiting for the other player to join...'
      case MatchState.MOVE:
        return 'Attacking the enemy board'
      case MatchState.RES:
        return 'Reporting enemy attempt'
      case MatchState.WAIT:
        return 'Waiting for the other player\'s turn'
    }
  }

  function Game() {
    const [matchState, setMatchState] = useState(MatchState.PRE)
    const [enemyPreSig, setEnemyPreSig] = useState<string | null>(null)
    const [currentTurn, setCurrentTurn] = useState(lobbyMode === LobbyMode.CREATE ? 'M1' : 'C0')
    const [lastMove, setLastMove] = useState<string | null>(null)

    const waitForOtherPlayerJoin = () => {
      const intervalId = setInterval(() => {
        if (lobbyMode === LobbyMode.JOIN) {
          setMatchState(MatchState.WAIT)
          return
        }
        battleshipsGet(enemyPubky as string, `matches/${id}/join`).then(value => {
          if (value === null) return
          setMatchState(MatchState.MOVE);
          setCurrentTurn('M1');
          setEnemyBoardHash((value as {data: Record<string, string>, sig: string}).data.boardHash as string)
          setEnemyMatchPublicKey((value as {data: Record<string, string>, sig: string}).data.publicKey as string)
          setEnemyPreSig((value as {data: Record<string, string>, sig: string}).sig)
        })
      }, 1000); // polling interval of 1 seconds
  
      return () => clearInterval(intervalId); // cleanup on unmount
    }

    const getNextTurn = (currentTurn: string) => {
      const stage = currentTurn[0]
      const turn = Number(currentTurn.slice(1))
      let nextStage = stage
      switch (stage) {
        case 'M':
          nextStage = 'R'
          return `${nextStage}${turn}`
        case 'R':
          nextStage = 'C'
          return `${nextStage}${turn}`
        case 'C':
          nextStage = 'M'
          return `${nextStage}${turn+1}`
        default:
          return currentTurn
      }
    }

    const attackEnemy = (row: number, col: number) => {
      const key = `${row}-${col}`
      const payload = {
        move: key
      }
      console.log('payload', payload)
      battleshipsPut({path: `matches/${id}/${currentTurn}`, payload, preSig: enemyPreSig as string})
      setLastMove(key)
      setMatchState(MatchState.WAIT);
    }

    const handleEnemyAttack = (data: Record<string, string>, turn: string) => {
      const { move } = data
      console.log('enemy move', move)
      const target = board[move]
      console.log('enemy hit: ', target);
      sendEnemyTheirAttackResult(target, turn);
      const newBoard = { ...board };
      newBoard[move] = target === 0 ? 2 : 3;
      setBoard(newBoard)
    }
    const handleEnemyRes = (data: Record<string, string>, turn: string) => {
      const { res } = data
      const newEnemyBoard = { ...enemyBoard }
      newEnemyBoard[lastMove as string] = Number(res) === 0 ? 2 : 3
      if (Number(res) === 2) {
        setEnemyShipsSunk(enemyShipsSunk + 1);
      }
      sendEnemyConfirmation(turn);
    }
    const handleEnemyConf = (data: Record<string, string>) => {
      const {confirmation} = data
      if (confirmation === 'false') {
        alert('enemy did not confirm');
      }
    }

    const handleEnemyMove = (data: Record<string, string>) => {
      const enemyTurn = getNextTurn(currentTurn) // enemy's turn
      const enemyState = getNextState(currentTurn) // enemy's turn
      const myturn = getNextTurn(enemyTurn)
      const myState = getNextState(enemyTurn)
      
      setCurrentTurn(myturn);
      setMatchState(myState);
      console.log({enemyTurn, enemyState, myturn, myState})

      switch (enemyState) {
        case MatchState.MOVE:
          handleEnemyAttack(data, myturn);
          setMatchState(MatchState.WAIT);
          break;
        case MatchState.RES:
          handleEnemyRes(data, myturn);
          setMatchState(MatchState.WAIT);
          break;
        case MatchState.CONF:
          handleEnemyConf(data)
          setMatchState(MatchState.MOVE);
          break;
        default:
          break;
      }
    }

    const sendEnemyConfirmation = (turn: string) => {
      battleshipsPut({path: `matches/${id}/${turn}`, payload: {
        confirmation: 'true'
      }, preSig: enemyPreSig as string})
    }

    const sendEnemyTheirAttackResult = (res: number, turn: string) => {
      battleshipsPut({path: `matches/${id}/${turn}`, payload: {
        res: String(res)
      }, preSig: enemyPreSig as string})
    }

    const getNextState = (turn: string | null): MatchState => {
      if (turn === null) return MatchState.WAIT

      const stage = turn[0]
      switch (stage) {
        case 'M':
          return MatchState.RES
        case 'R':
          return MatchState.CONF
        case 'C':
          return MatchState.MOVE
        default:
          return MatchState.WAIT
      }
    }

    const waitForOtherPlayerMove = () => {
      console.log('current turn', currentTurn)
      const intervalId = setInterval(() => {
        console.log('in interval', enemyPubky, getNextTurn(currentTurn))
        battleshipsGet(enemyPubky as string, `matches/${id}/${getNextTurn(currentTurn)}`).then(value => {
          console.log('value of get', value)
          if (value === null) return
          setEnemyPreSig((value as {data: Record<string, string>, sig: string}).sig)
          handleEnemyMove((value as {data: Record<string, string>, sig: string}).data)
        })
      }, 1000); // polling interval of 1 seconds
  
      return () => clearInterval(intervalId); // cleanup on unmount
    }

    useEffect(() => {
      switch (matchState) {
        case MatchState.PRE:
          return waitForOtherPlayerJoin();
        case MatchState.MOVE:
          return
        case MatchState.RES:
          return
        case MatchState.CONF:
          return
        case MatchState.WAIT:
          console.log('hi');
          return waitForOtherPlayerMove();
      }
    }, [matchState])

    return (
      <div className="flex flex-col items-center p-8 bg-blue-100 min-h-screen">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">{getGameTitle(matchState)}</h2>
        <div className="flex flex-wrap justify-center gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-blue-700">Your Board</h3>
            <Board onCellClick={undefined}/>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-blue-700">Enemy Board @{enemyPubky?.slice(0, 8)}...</h3>
            <EnemyBoard onCellClick={attackEnemy}/>
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

  return (
    <div className="App">
      {getGamePage(gameState)}
    </div>
  );
}

export default App;