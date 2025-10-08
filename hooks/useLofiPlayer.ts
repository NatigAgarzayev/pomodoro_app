import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio'
import React from 'react'

const lofiMusicSource = require('../assets/audio/lofi.mp3')


export function useLofiPlayer() {
    const player = useAudioPlayer(lofiMusicSource)
    const { didJustFinish, playing } = useAudioPlayerStatus(player)

    const playerState = {
        player,
        didJustFinish,
        playing
    }

    return playerState
}