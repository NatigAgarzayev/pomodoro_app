import { create } from 'zustand'

export const useThemeStore = create<{
    theme: string
    setTheme: (name: string) => void
}>((set) => ({
    theme: 'light',
    setTheme: (theme: string) => set({ theme })
}))