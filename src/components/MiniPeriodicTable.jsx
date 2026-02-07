import React from 'react';
import { elements as rawElements } from '../elementsData';

const MiniPeriodicTable = ({ activeElement }) => {
    return (
        <div
            aria-hidden="true"
            className="grid gap-[1px] auto-rows-min select-none"
            style={{
                gridTemplateColumns: 'repeat(18, 1fr)',
                gridTemplateRows: 'repeat(10, 1fr)',
                width: '200px'
            }}
        >
            {rawElements.map(el => {
                let row = el.y;
                if (row === 9) row = 9;
                if (row === 10) row = 10;

                const isActive = activeElement && el.n === activeElement.n;

                return (
                    <div
                        key={el.n}
                        className={`rounded-[0.5px] aspect-square transition-colors duration-300 ${isActive ? 'bg-gray-900 border border-white/20' : 'bg-black/5'}`}
                        style={{
                            gridColumn: el.x,
                            gridRow: row
                        }}
                    />
                );
            })}
        </div>
    );
};

export default MiniPeriodicTable;
