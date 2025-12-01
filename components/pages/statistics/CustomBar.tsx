import { Bar } from 'victory-native';
import React from 'react'
import { ChartBounds, PointsArray } from 'victory-native';

export default function CustomBar(
    {
        color,
        points,
        chartBounds,
        barWidth = 32,
        cornerRadius = 8,
    }: {
        color: string,
        points: PointsArray
        chartBounds: ChartBounds
        barWidth?: number;
        cornerRadius?: number;
    }
) {
    return (
        <Bar
            points={points}
            chartBounds={chartBounds}
            color={color}
            barWidth={barWidth}
            animate={{ type: "spring" }}
            roundedCorners={{
                topLeft: cornerRadius,
                topRight: cornerRadius,
            }}
        />
    )
}