import { TBoard, Tile } from ".";

export function Board(input: { board: TBoard, size: number, onCellClick: ((i: number, j: number) => void) | undefined }) {
    const { onCellClick, board, size } = input

    // Dynamic style for grid layout
    const gridStyle = {
        gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`, // Creates `size` columns
        gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,    // Creates `size` rows
        '--cell-size': `calc(100 / ${size})`,  // Calculate the cell size dynamically based on the fixed board size
    };

    const drawBoard = (inputBoard: TBoard, size: number, onCellClick: ((i: number, j: number) => void) | undefined) => {
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
        return <div className={`grid gap-0.5 w-96 h-96 bg-gray-700 p-2`} style={gridStyle}>{renderItems}</div>
    }
    return drawBoard(board, size, onCellClick)
}
