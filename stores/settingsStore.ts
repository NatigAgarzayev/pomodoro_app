import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { StateStorage } from 'zustand/middleware'
import { MMKV } from 'react-native-mmkv'

const storage = new MMKV()

const zustandStorage: StateStorage = {
    setItem: (name, value) => {
        return storage.set(name, value)
    },
    getItem: (name) => {
        const value = storage.getString(name)
        return value ?? null
    },
    removeItem: (name) => {
        return storage.delete(name)
    },
}

export type SettingsType = {
    theme: 'System' | 'Light' | 'Dark'
    lofi: 'On' | 'Off'
    sound: 'System' | 'On' | 'Off'
    skip: 'Manual' | 'Auto'
    focusDuration: number
    shortBreakDuration: number
    longBreakDuration: number
}

export const defaultSettings: SettingsType = {
    theme: 'Light',
    lofi: 'Off',
    sound: 'System',
    skip: 'Manual',
    focusDuration: 1500,
    shortBreakDuration: 300,
    longBreakDuration: 900,
}

interface SettingsStore {
    settings: SettingsType
    saveSettings: (newSettings: SettingsType) => void
    updateSetting: <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => void
    resetToDefaults: () => void
}

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set) => ({
            settings: defaultSettings,

            // Save entire settings object - exactly like your AsyncStorage approach
            saveSettings: (newSettings) => {
                set({ settings: newSettings })
            },

            // Update individual setting
            updateSetting: (key, value) => {
                set((state) => ({
                    settings: {
                        ...state.settings,
                        [key]: value,
                    },
                }))
            },

            resetToDefaults: () => {
                set({ settings: defaultSettings })
            },
        }),
        {
            name: 'settings-storage', // This will be the key in MMKV
            storage: createJSONStorage(() => zustandStorage),
        }
    )
)