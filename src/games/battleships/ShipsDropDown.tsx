import { useState } from "react";
import { SHIP_NAMES } from ".";
import { ShipComponent } from "./Ship";

export function ShipSelectDropDown({ onSelect, options, selectedValue }: { onSelect: (option: string) => void, options: string[], selectedValue: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative w-full h-fit rounded bg-neutral-blue" onClick={() => setIsOpen(!isOpen)}>
            <div
                className="flex items-center cursor-pointer px-1 py-1"
            >
                <div className="flex flex-wrap justify-between items-center w-11/12">
                    <p className="leading-loose text-sm font-semibold">
                        {selectedValue ? SHIP_NAMES[Number(selectedValue)] : 'Select a ship size'}
                    </p>
                    {selectedValue && <ShipComponent renderSize={6} ship={{ align: 'horizontal', hits: [], tiles: Array<string>(Number(selectedValue)).fill('1-1') }}></ShipComponent>}
                </div>
                <div className="flex w-1/12">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                </div>
            </div>

            {isOpen && (
                <div
                    className="absolute w-full border mt-1 z-10 bg-neutral-blue rounded divide-y text-sm font-semibold"
                >
                    {options.map(option => (
                        <div
                            key={option}
                            className="flex flex-wrap justify-between items-center px-2 py-1 cursor-pointer"
                            onClick={() => { setIsOpen(false); onSelect(option); }}
                        >
                            <p className="leading-loose">{SHIP_NAMES[Number(option)]}</p>
                            <ShipComponent renderSize={4} ship={{ align: 'horizontal', hits: [], tiles: Array<string>(Number(option)).fill('1-1') }}></ShipComponent>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
