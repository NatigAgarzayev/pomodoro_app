import { useEffect, useRef, useCallback } from 'react'

type TimeoutHandle = ReturnType<typeof setTimeout>

export const useDebounce = (
    callback: (...args: any[]) => void,
    delay: number
): ((...args: any[]) => void) => {
    const timeoutRef = useRef<TimeoutHandle | null>(null)

    const debouncedCallback = useCallback((...args: any[]) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
            callback(...args)
        }, delay)
    }, [callback, delay])

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    return debouncedCallback
}
