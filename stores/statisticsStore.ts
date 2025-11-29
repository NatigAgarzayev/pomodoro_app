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

// Types
export type PhaseType = 'work' | 'short_break' | 'long_break'

export interface DailyStats {
    date: string // ISO date string (YYYY-MM-DD)
    work: number // minutes
    short_break: number // minutes
    long_break: number // minutes
}

export interface WeeklyStats {
    weekStart: string // ISO date string of Monday
    days: DailyStats[]
}

export interface StatisticsState {
    totalCycles: number // Total cycles completed all time
    dailyStats: { [date: string]: DailyStats } // Keyed by date string
    currentSessionStart: number | null // Timestamp when current session started
    currentPhase: PhaseType | null
}

interface StatisticsStore extends StatisticsState {
    // Cycle tracking
    incrementCycles: () => void

    // Session tracking
    startSession: (phase: PhaseType) => void
    endSession: () => void

    // Time logging
    logTime: (phase: PhaseType, minutes: number, date?: string) => void

    // Data retrieval
    getWeeklyData: (weekOffset?: number) => WeeklyStats
    getDailyData: (date: string) => DailyStats
    getTotalTimeByPhase: () => { work: number; short_break: number; long_break: number }
    getWeeklyTimeByPhase: (weekOffset?: number) => { work: number; short_break: number; long_break: number }

    // Utility
    resetStatistics: () => void
}

const getDateString = (date: Date = new Date()): string => {
    return date.toISOString().split('T')[0]
}

const getWeekStart = (date: Date = new Date()): Date => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust to Monday
    return new Date(d.setDate(diff))
}

const getWeekDates = (weekStart: Date): string[] => {
    const dates: string[] = []
    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart)
        date.setDate(weekStart.getDate() + i)
        dates.push(getDateString(date))
    }
    return dates
}

const initialState: StatisticsState = {
    totalCycles: 0,
    dailyStats: {},
    currentSessionStart: null,
    currentPhase: null,
}

export const useStatisticsStore = create<StatisticsStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            incrementCycles: () => {
                set((state) => ({
                    totalCycles: state.totalCycles + 1,
                }))
            },

            startSession: (phase) => {
                set({
                    currentSessionStart: Date.now(),
                    currentPhase: phase,
                })
            },

            endSession: () => {
                const state = get()
                if (state.currentSessionStart && state.currentPhase) {
                    const duration = Math.floor((Date.now() - state.currentSessionStart) / 60000) // Convert to minutes
                    get().logTime(state.currentPhase, duration)
                }
                set({
                    currentSessionStart: null,
                    currentPhase: null,
                })
            },

            logTime: (phase, minutes, date) => {
                const dateStr = date || getDateString()

                set((state) => {
                    const existingStats = state.dailyStats[dateStr] || {
                        date: dateStr,
                        work: 0,
                        short_break: 0,
                        long_break: 0,
                    }

                    return {
                        dailyStats: {
                            ...state.dailyStats,
                            [dateStr]: {
                                ...existingStats,
                                [phase]: existingStats[phase] + minutes,
                            },
                        },
                    }
                })
            },

            getWeeklyData: (weekOffset = 0) => {
                const today = new Date()
                const targetWeekStart = new Date(getWeekStart(today))
                targetWeekStart.setDate(targetWeekStart.getDate() + (weekOffset * 7))

                const weekDates = getWeekDates(targetWeekStart)
                const state = get()

                const days: DailyStats[] = weekDates.map(date => {
                    return state.dailyStats[date] || {
                        date,
                        work: 0,
                        short_break: 0,
                        long_break: 0,
                    }
                })

                return {
                    weekStart: getDateString(targetWeekStart),
                    days,
                }
            },

            getDailyData: (date) => {
                const state = get()
                return state.dailyStats[date] || {
                    date,
                    work: 0,
                    short_break: 0,
                    long_break: 0,
                }
            },

            getTotalTimeByPhase: () => {
                const state = get()
                const totals = { work: 0, short_break: 0, long_break: 0 }

                Object.values(state.dailyStats).forEach(day => {
                    totals.work += day.work
                    totals.short_break += day.short_break
                    totals.long_break += day.long_break
                })

                return totals
            },

            getWeeklyTimeByPhase: (weekOffset = 0) => {
                const weeklyData = get().getWeeklyData(weekOffset)
                const totals = { work: 0, short_break: 0, long_break: 0 }

                weeklyData.days.forEach(day => {
                    totals.work += day.work
                    totals.short_break += day.short_break
                    totals.long_break += day.long_break
                })

                return totals
            },

            resetStatistics: () => {
                set(initialState)
            },
        }),
        {
            name: 'statistics-storage',
            storage: createJSONStorage(() => zustandStorage),
        }
    )
)