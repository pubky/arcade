import { TBoard, Tile } from ".";

export function Board(input: { board: TBoard, size: number, onCellClick: ((i: number, j: number) => void) | undefined }) {
    const { onCellClick, board, size } = input

    // Dynamic style for grid layout
    const gridStyle = {
        gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`, // Creates `size` columns
        gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,    // Creates `size` rows
        '--cell-size': `calc(100 / ${size})`,  // Calculate the cell size dynamically based on the fixed board size
    };

    const gridStyleRow = {
        gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,    // Creates `size` rows
    };
    const gridStyleCol = {
        gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`, // Creates `size` columns
    };

    const drawBoard = (inputBoard: TBoard, size: number, onCellClick: ((i: number, j: number) => void) | undefined) => {
        const getCellColor = (value: Tile) => {
            switch (value) {
                case Tile.WATER: return 'bg-secondary-blue';
                case Tile.SHIP: return 'bg-gray-500';
                case Tile.MISS: return 'bg-black';
                case Tile.HIT: return 'bg-red-500';
                default: return 'bg-secondary-blue'; // Water
            }
        };
        const renderItems = []
        for (let i = 0; i < size; i++) {
            const renderRow = []
            for (let j = 0; j < size; j++) {
                const key = `${i}-${j}`
                renderRow.push(<button
                    key={key}
                    style={{
                        width: 'var(--cell-size)',  // Set width dynamically
                        height: 'var(--cell-size)', // Set height dynamically
                    }}
                    className={`p-0 rounded-sm aspect-square cursor-pointer ${getCellColor(inputBoard[key])}
                     ${onCellClick === undefined && 'pointer-events-none'}`}
                    disabled={onCellClick === undefined}
                    onClick={onCellClick ? () => onCellClick(i, j) : undefined}
                />)
            }
            renderItems.push(renderRow)
        }
        return (
            <div className="relative p-6 w-full h-fit">
                <div className="absolute top-0 left-0 px-[26px] w-full grid opacity-60 justify-center gap-0.5" style={gridStyleCol}>
                    {[...Array(size).keys()].map(index => (<p key={index} className="text-center">{index + 1}</p>))}
                </div>
                <div className="absolute top-0 left-0 py-[23px] h-full grid opacity-60 items-center" style={gridStyleRow}>
                    {[...Array(size).keys()].map(index => (<p key={index} className="text-center leading-loose">{String.fromCharCode(index + 'A'.charCodeAt(0))}</p>))}
                </div>
                <div className={`w-full grid gap-0.5 bg-gray-700 p-0.5`} style={gridStyle}>{renderItems}</div>
            </div>
        )
    }
    return drawBoard(board, size, onCellClick)
}
