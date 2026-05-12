import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LoadingSpinner from "../ui/spinner/LoadingSpinner";
import { MoveUpRight, MoveDownRight, MoveRight, ChevronDown, AlertTriangle } from 'lucide-react';

interface SensorDataCardProps {
    data: { type: string; value: number | string; unit?: string };
    dataForChart: any[];
    isLoading: boolean;
    valuesByType?: number[];
}

export default function SensorDataCard({ data, dataForChart, isLoading, valuesByType }: SensorDataCardProps) {
    const trendArrow = () => {
        if (!dataForChart || dataForChart.length === 0) return null;

        const lastDataTime = new Date(dataForChart[dataForChart.length - 1].fullTime);

        const startOfToday = new Date(lastDataTime);
        startOfToday.setHours(0, 0, 0, 0);

        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);

        const limitYesterday = new Date(lastDataTime);
        limitYesterday.setDate(limitYesterday.getDate() - 1);

        const todayValues = dataForChart.filter(d => {
            const dTime = new Date(d.fullTime);
            return dTime >= startOfToday && dTime <= lastDataTime;
        });

        const yesterdayValues = dataForChart.filter(d => {
            const dTime = new Date(d.fullTime);
            return dTime >= startOfYesterday && dTime <= limitYesterday;
        });

        if (todayValues.length === 0 || yesterdayValues.length === 0) {
            return (
                <MoveRight className="w-5 h-5 text-texto-claro" aria-hidden="true" />
            );
        }

        const avgToday = todayValues.reduce((sum, d) => sum + d.value, 0) / todayValues.length;
        const avgYesterday = yesterdayValues.reduce((sum, d) => sum + d.value, 0) / yesterdayValues.length;

        const diff = avgToday - avgYesterday;

        if (Math.abs(diff) < 0.01) {
            return (
                <MoveRight className="w-5 h-5 text-texto-claro" aria-hidden="true" />
            );
        } else if (diff > 0) {
            return (
                <MoveUpRight className="w-5 h-5 text-green-500" aria-hidden="true" />
            );
        } else {
            return (
                <MoveDownRight className="w-5 h-5 text-red-500" aria-hidden="true" />
            );
        }
    };

    const rangeIndicator = () => {
        if (!valuesByType || valuesByType.length === 0) return null;

        const validValues = valuesByType.filter(v => typeof v === 'number' && !isNaN(v));
        if (validValues.length === 0) return null;

        const min = Math.min(...validValues);
        const max = Math.max(...validValues);
        const current = Number(data.value);

        const range = max - min;
        const percentage = range === 0 ? 50 : Math.max(0, Math.min(100, ((current - min) / range) * 100));

        return (
            <div
                className="relative h-6 w-1.5 bg-texto-claro rounded-full  flex flex-col justify-end items-center"
                title={`Relativo al resto\nMín: ${min.toFixed(1)}${data.unit || ''} | Máx: ${max.toFixed(1)}${data.unit || ''}`}
                role="img"
                aria-label={`Indicador de rango: valor actual relativo entre mínimo ${min.toFixed(1)} y máximo ${max.toFixed(1)} ${data.unit || ''}`}
            >
                <div
                    className={`absolute w-2 h-2 rounded-full bg-acento shadow-sm border border-white`}
                    style={{ bottom: `calc(${percentage}% - 4px)` }}
                />
            </div>
        );
    };

    return (
        <details className="card group transition-all duration-300" role="article" aria-label={`Datos de ${data.type}`}>
            <summary className="flex-between cursor-pointer list-none px-3 py-2 sm:px-4 sm:py-3 hover:bg-panel-oscuro/20 transition-colors rounded-2xl">
                <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-xs sm:text-sm font-medium text-texto">{data.type}</span>
                    {trendArrow()}
                </div>
                <div className="flex items-center gap-1">
                    {rangeIndicator()}
                    <span className="text-sm sm:text-base font-bold text-texto-oscuro min-w-[55px] sm:min-w-[65px] text-right">
                        {Number(data.value).toFixed(2)} <span className="text-[10px] sm:text-xs font-medium opacity-70">{data.unit}</span>
                    </span>
                    <ChevronDown className="w-4 h-4 text-texto-oscuro  opacity-70 group-open:rotate-180 transition-transform duration-300 ml-1" aria-hidden="true" />
                </div>
            </summary>
            <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-300">

                {isLoading ? (
                    <LoadingSpinner />
                ) : dataForChart.length > 0 ? (
                    <div className="  h-35 " role="img" aria-label={`Historial de ${data.type}`}>
                        <div className="flex flex-col h-full">
                            <span className="text-xs text-texto mb-4 block">
                                {new Date(dataForChart[dataForChart.length - 1].fullTime).toLocaleString()}
                            </span>
                            <div className="flex-1 min-h-0 text-texto">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={dataForChart} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="time" fontSize={10} tick={{ fill: 'var(--color-texto)' }} />
                                        <YAxis fontSize={10} width={35} tick={{ fill: 'var(--color-texto)' }} />
                                        <Tooltip wrapperClassName="tooltip" labelFormatter={(label, payload) => {
                                            if (payload && payload.length > 0) {
                                                return new Date(payload[0].payload.fullTime).toLocaleDateString();
                                            }
                                            return label;
                                        }} />
                                        <Line type="monotone" dataKey="value" stroke="var(--color-acento)" name={data.type} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-10">
                        <p className="text-texto-claro h-full gap-2 flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-texto-claro" aria-hidden="true" />
                            No hay datos disponibles
                        </p>
                    </div>
                )}
            </div>
        </details>
    );
}
