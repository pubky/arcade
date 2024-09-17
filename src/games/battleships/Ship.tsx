import { Ship } from ".";

import ShipEndDownTile from './assets/ship-end-down.png';
import ShipEndLeftTile from './assets/ship-end-left.png';
import ShipEndRightTile from './assets/ship-end-right.png';
import ShipEndUpTile from './assets/ship-end-up.png';
import ShipMidHorizontalTile from './assets/ship-mid-horizontal.png';
import ShipMidVerticalTile from './assets/ship-mid-vertical.png';

export function ShipTile({ image, isHit, renderSize }: { image: string; isHit: boolean, renderSize?: number }) {
    return (
        <div className={`${renderSize !== undefined ? `min-w-${renderSize} w-${renderSize}` : ''} relative`}>
            <img src={image} style={{ width: renderSize === undefined ? "var(--cell-size)" : 32 }} />
            <div className={`w-1/2 h-1/2 absolute ${isHit ? 'bg-secondary-pink' : 'bg-primary-blue'} 
            ${isHit ? 'border-primary-pink' : 'border-action-blue'}
                top-1/4 start-1/4 rounded-full border`}></div>
        </div>
    )
}

export function ShipComponent({ ship, renderSize }: { ship: Ship, renderSize?: number }) {
    const { tiles, align, hits } = ship;


    return (<div className={`flex ${align === 'vertical' ? 'flex-col h-fit' : 'w-fit p-0.5'}`}>
        {
            tiles.map((tile, index) => {
                const isHit = hits.some(hit => hit === tile);
                if (index === 0) {
                    return (
                        <ShipTile renderSize={renderSize} isHit={isHit} key={index} image={align === 'vertical' ? ShipEndUpTile : ShipEndLeftTile} />
                    )
                } else if (index === tiles.length - 1) {
                    return (
                        <ShipTile renderSize={renderSize} isHit={isHit} key={index} image={align === 'vertical' ? ShipEndDownTile : ShipEndRightTile} />
                    )
                } else {
                    return (
                        <ShipTile renderSize={renderSize} isHit={isHit} key={index} image={align === 'vertical' ? ShipMidVerticalTile : ShipMidHorizontalTile} />
                    )
                }
            })
        }
    </div >)
}
