import { TBoard, Tile } from ".";

export function Board(input: { board: TBoard, size: number, onCellClick: ((i: number, j: number) => void) | undefined }) {
    const { onCellClick, board, size } = input

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
