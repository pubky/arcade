import { useEffect, useRef } from 'react';

export const useInterval = <T>(callback: () => T, delay?: number | null) => {
    const savedCallback = useRef<() => T>((() => { }) as (() => T));

    useEffect(() => {
        savedCallback.current = callback;
    });

    useEffect(() => {
        if (delay !== null) {
            const interval = setInterval(() => savedCallback.current(), delay || 0);
            return () => clearInterval(interval);
        }

        return undefined;
    }, [delay]);
};