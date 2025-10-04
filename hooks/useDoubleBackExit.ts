// hooks/useDoubleBackExit.ts
import { useEffect, useRef, useCallback } from 'react'
import { BackHandler, ToastAndroid } from 'react-native'

export const useDoubleBackExit = (message = 'Press back again to exit', timeout = 2000) => {
    const backPressCount = useRef(0)
    const backPressTimer = useRef<NodeJS.Timeout | null>(null)

    const handleDoubleBackPress = useCallback(() => {
        backPressCount.current += 1

        if (backPressCount.current === 1) {
            ToastAndroid.show(message, ToastAndroid.SHORT)

            backPressTimer.current = setTimeout(() => {
                backPressCount.current = 0
            }, timeout)
        } else if (backPressCount.current === 2) {
            if (backPressTimer.current) {
                clearTimeout(backPressTimer.current)
            }
            BackHandler.exitApp()
        }
    }, [message, timeout])

    useEffect(() => {
        return () => {
            if (backPressTimer.current) {
                clearTimeout(backPressTimer.current)
            }
        }
    }, [])

    return handleDoubleBackPress
}