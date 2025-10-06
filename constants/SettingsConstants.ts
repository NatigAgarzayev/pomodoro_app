export type SettingsType = {
    theme: 'System' | 'Light' | 'Dark'
    lofi: 'On' | 'Off'
    sound: 'System' | 'On' | 'Off'
    skip: 'Manual' | 'Auto'
    stepsMode: '4 steps' | '8 steps'
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
    stepsMode: '8 steps',
    focusDuration: 1500,
    shortBreakDuration: 300,
    longBreakDuration: 900,
}