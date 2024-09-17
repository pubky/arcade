import { useState } from "react";
import { Ship, TBoard, Tile } from ".";
import { ShipComponent } from "./Ship";

export function Board(input: {
    board: TBoard,
    size: number,
    onCellClick: ((i: number, j: number) => void) | undefined,
    ships: Ship[] | undefined,
    onShipDelete: ((index: number) => void) | undefined
    onShipRotate: ((index: number) => void) | undefined
    onShipReplace: ((row: number, col: number, index: number) => void) | undefined
}) {
    const {
        onCellClick,
        board,
        size,
        ships,
        onShipDelete = () => { },
        onShipRotate = () => { },
        onShipReplace = () => { },
    } = input

    const [selectedShip, setSelectedShip] = useState<number | null>(null);

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
                case Tile.SHIP: return 'bg-secondary-blue opacity-50';
                case Tile.MISS: return 'bg-black';
                case Tile.HIT: return 'bg-primary-pink';
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
                    className={`p-0 rounded-sm aspect-square ${getCellColor(inputBoard[key])}
                     ${onCellClick === undefined && selectedShip === null ? 'pointer-events-none' : ''}`}
                    disabled={onCellClick === undefined && selectedShip === null}
                    onClick={() => {
                        if (onCellClick !== undefined && selectedShip === null) {
                            onCellClick(i, j);
                        }
                        if (selectedShip !== null) {
                            onShipReplace(i, j, selectedShip);
                        }
                    }}
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
                {ships?.length ? (
                    <div className="absolute pointer-events-none grid gap-0.5 top-0 start-0 w-full h-full p-[26px]" style={gridStyle}>{
                        ships.map((ship, index) => (
                            <div
                                key={index}
                                className={`relative flex items-center w-full pointer-events-auto`}
                                onClick={() => { setSelectedShip(selectedShip === index ? null : index); }}
                                style={{
                                    gridRow: Number(ship.tiles[0].split('-')[0]) + 1,
                                    gridColumn: Number(ship.tiles[0].split('-')[1]) + 1,
                                    gridRowEnd: ship.align === 'vertical' ?
                                        Number(ship.tiles[0].split('-')[0]) + 1 + ship.tiles.length :
                                        Number(ship.tiles[0].split('-')[0]) + 1,
                                    gridColumnEnd: ship.align === 'horizontal' ?
                                        Number(ship.tiles[0].split('-')[1]) + 1 + ship.tiles.length :
                                        Number(ship.tiles[0].split('-')[1]) + 1
                                }}
                            >
                                <ShipComponent ship={ship} renderSize={undefined} />
                                {selectedShip !== undefined && selectedShip === index ?
                                    <div className="absolute w-4 -top-6 md:w-8 end-8 md:-top-8 flex gap-2">
                                        <button className="bg-gray-500 rounded-full p-0.5" onClick={() => { onShipRotate(index); }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className="size-4 md:size-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                            </svg>
                                        </button>
                                        <button className="bg-gray-500 rounded-full p-0.5" onClick={() => { onShipDelete(index); setSelectedShip(null); }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className="size-4 md:size-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                            </svg>
                                        </button>
                                    </div>
                                    :
                                    <></>
                                }
                            </div>
                        ))
                    }</div>
                ) : (<div></div>)}
            </div>
        )
    }
    return drawBoard(board, size, onCellClick)
}
