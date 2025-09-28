export type SettingsType = {
    theme: 'System' | 'Light' | 'Dark'
    lofi: 'On' | 'Off'
    sound: 'System' | 'On' | 'Off'
    skip: 'Manual' | 'Auto'
    focusDuration: number
    shortBreakDuration: number
    longBreakDuration: number
}

export const SETTINGS_KEY = '@pomodoro_settings'

export const defaultSettings: SettingsType = {
    theme: 'Light',
    lofi: 'Off',
    sound: 'System',
    skip: 'Manual',
    focusDuration: 1500,
    shortBreakDuration: 300,
    longBreakDuration: 900,
}