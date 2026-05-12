import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, YAxis, ReferenceLine, Tooltip } from 'recharts';

export interface KpiCardProps {
    title: string;
    icon: React.ElementType<{ className?: string }>;
    unit: string;
    chartData: any[];
}

export default function KpiCard({
    title,
    icon: Icon,
    unit,
    chartData
}: KpiCardProps) {
    const { currentValue, comparisonValue, percentChange } = useMemo(() => {
        const validTodayPoints = chartData.filter(d => d.todayValue !== null && d.todayValue !== undefined);
        const latestTodayPoint = validTodayPoints.length > 0 ? validTodayPoints[validTodayPoints.length - 1] : null;

        let compValue = null;
        if (latestTodayPoint) {
            compValue = latestTodayPoint.yesterdayValue;
        }

        const currVal = latestTodayPoint ? latestTodayPoint.todayValue : null;
        let pctChange = 0;

        if (currVal !== null && compValue !== null) {
            const diff = currVal - compValue;
            if (compValue !== 0) {
                pctChange = Math.abs((diff / compValue) * 100);
            }
        }

        return {
            currentValue: currVal,
            comparisonValue: compValue,
            percentChange: pctChange
        };
    }, [chartData]);
    const { max, min } = useMemo(() => {
        const validValues = chartData.filter(d => d.todayValue !== null && d.todayValue !== undefined).map(d => d.todayValue);
        if (validValues.length === 0) return { max: null, min: null };
        return {
            max: Math.max(...validValues),
            min: Math.min(...validValues)
        };
    }, [chartData]);
    return (
        <article className="card p-3 sm:p-4 flex flex-col relative overflow-hidden" aria-label={`Indicador de ${title}`}>
            <div className="flex-between gap-2 mb-0.5 sm:mb-2">
                <div className="p-1.5 sm:p-2 bg-acento/10 rounded-xl flex items-center gap-2">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-acento" aria-hidden="true" />
                </div>
                <h4 className="uppercase tracking-wider font-semibold text-base sm:text-lg text-texto-oscuro text-left w-full">{title}</h4>
                <div className="flex items-end gap-1" aria-live="polite" aria-atomic="true">
                    <span className="text-value text-xl sm:text-3xl" aria-label={`Valor actual: ${currentValue !== null ? currentValue.toFixed(1) : 'sin datos'} ${unit}`}>
                        {currentValue !== null ? currentValue.toFixed(1) : '--'}
                    </span>
                    <span className="text-sm sm:text-lg font-medium text-texto-claro pb-0.5" aria-hidden="true">{unit}</span>
                </div>
            </div>
            <div className="flex items-center justify-end">
                {currentValue !== null && comparisonValue !== null && (
                    <div className={`flex items-center gap-1 `}>
                        <span className="text-[10px] sm:text-xs font-bold text-texto-oscuro">{percentChange.toFixed(1)}%</span>
                        <span className="text-[10px] sm:text-xs flex flex-row font-semibold text-texto-claro uppercase">{currentValue > comparisonValue ? "más" : "menos"} que ayer</span>
                    </div>
                )}
            </div>


            {/* Gráfica Mini */}
            <div className="h-16 w-full mt-1 sm:mt-3 mb-1 sm:mb-2" role="img" aria-label={`Gráfica de tendencia de ${title}`}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
                        {max !== null && (
                            <ReferenceLine y={max} stroke="var(--color-acento)" strokeDasharray="3 3" opacity={0.7} />
                        )}
                        {min !== null && (
                            <ReferenceLine y={min} stroke="var(--color-acento-azul)" strokeDasharray="3 3" opacity={0.7} />
                        )}
                        <Line
                            type="monotone"
                            dataKey="todayValue"
                            stroke="var(--color-azul-oscuro)"
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={true}

                        />
                        <Tooltip
                            cursor={{ strokeDasharray: '3 3', stroke: 'var(--color-texto)', strokeWidth: 1 }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-panel px-2 py-1 rounded-md shadow-md text-xs font-bold text-texto-oscuro border border-texto/40">
                                            {Number(payload[0].value).toFixed(1)} {unit}
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>


        </article>
    );
}
