import { useState, useEffect, useMemo, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Thermometer, Droplets, AudioLines, ChevronDown } from 'lucide-react';
import LoadingSpinner from '../ui/spinner/LoadingSpinner';
import { getDataForDateRange } from '../../services/sensor-service';

interface EvolutionChartProps {
    targetSensors: string;
}

export default function EvolutionChart({ targetSensors }: EvolutionChartProps) {
    const [selectedMetric, setSelectedMetric] = useState<string>('Temperatura');

    const [startDate, setStartDate] = useState<string>(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

    const [isLoading, setIsLoading] = useState(false);
    const [chartData, setChartData] = useState<Record<string, any[]>>({});
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const getLocalTodayString = () => {
        const today = new Date();
        today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
        return today.toISOString().split('T')[0];
    };

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            if (abortRef.current) abortRef.current.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            const fetchData = async () => {
                if (!targetSensors) return;
                setIsLoading(true);
                const start = new Date(startDate);
                const end = new Date(endDate);
                const data = await getDataForDateRange(targetSensors, start, end, controller.signal);
                if (!controller.signal.aborted) {
                    setChartData(data);
                    setIsLoading(false);
                }
            };
            fetchData();
        }, 300);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            if (abortRef.current) abortRef.current.abort();
        };
    }, [targetSensors, startDate, endDate]);

    const variables = [
        { id: 'Temperatura', icon: Thermometer, label: 'Evolución Temperatura' },
        { id: 'Humedad', icon: Droplets, label: 'Evolución Humedad' },
        { id: 'Ruido', icon: AudioLines, label: 'Evolución Ruido' },
    ];

    const currentConf = variables.find(v => v.id === selectedMetric) || variables[0];
    const Icon = currentConf.icon;
    const data = useMemo(() => chartData[selectedMetric] || [], [chartData, selectedMetric]);

    return (
        <section className="card p-2 sm:p-6 h-[350px] sm:h-[400px] flex flex-col" aria-label="Gráfica de evolución temporal">
            <div className="flex flex-col md:flex-row md:items-center md:flex-nowrap justify-between mb-2 sm:mb-6 gap-3 sm:gap-4 px-1 sm:px-0">
                <div className="flex items-center justify-between w-full md:w-auto gap-2">
                    <h3 className="text-base sm:text-xl text-texto-oscuro flex items-center gap-2 tracking-wider uppercase whitespace-nowrap">
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-acento shrink-0" aria-hidden="true" />
                        <span className="md:hidden">Evolución</span>
                        <span className="hidden md:inline">{currentConf.label}</span>
                    </h3>
                    <div className="relative flex md:hidden items-center shrink-0">
                        <select
                            className="input-select-chart px-2 sm:px-4 pr-6 sm:pr-8 text-xs sm:text-sm"
                            value={selectedMetric}
                            onChange={(e) => setSelectedMetric(e.target.value)}
                            aria-label="Seleccionar métrica a visualizar"
                        >
                            {variables.map(v => (
                                <option key={v.id} value={v.id}>{v.id}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-texto pointer-events-none" aria-hidden="true" />
                    </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto justify-between md:justify-end overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <label htmlFor="evolution-start-date" className="text-[10px] sm:text-xs text-texto font-medium uppercase tracking-wide">Desde:</label>
                        <input
                            id="evolution-start-date"
                            type="date"
                            className="input-select-chart text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5"
                            value={startDate}
                            max={getLocalTodayString()}
                            onChange={(e) => {
                                if (e.target.value <= getLocalTodayString()) {
                                    setStartDate(e.target.value);
                                }
                            }}
                            aria-label="Fecha de inicio del rango"
                        />
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <label htmlFor="evolution-end-date" className="text-[10px] sm:text-xs text-texto font-medium uppercase tracking-wider">Hasta:</label>
                        <input
                            id="evolution-end-date"
                            type="date"
                            className="input-select-chart text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5"
                            value={endDate}
                            max={getLocalTodayString()}
                            onChange={(e) => {
                                if (e.target.value <= getLocalTodayString()) {
                                    setEndDate(e.target.value);
                                }
                            }}
                            aria-label="Fecha de fin del rango"
                        />
                    </div>
                    <div className="relative hidden md:flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
                        <label htmlFor="evolution-metric-select" className='hidden sm:block text-[10px] sm:text-xs text-texto font-medium uppercase tracking-wide'>Métrica:</label>
                        <select
                            id="evolution-metric-select"
                            className="input-select-chart px-2 sm:px-4 pr-6 sm:pr-8 text-xs sm:text-sm "
                            value={selectedMetric}
                            onChange={(e) => setSelectedMetric(e.target.value)}
                            aria-label="Seleccionar métrica a visualizar"
                        >
                            {variables.map(v => (
                                <option key={v.id} value={v.id}>{v.id}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-texto pointer-events-none" aria-hidden="true" />
                    </div>
                </div>
            </div>
            {isLoading ? (
                <div className="flex-1 flex flex-center items-center justify-center">
                    <LoadingSpinner />
                </div>
            ) : data.length > 0 ? (
                <div role="img" aria-label={`Gráfica de evolución de ${currentConf.label}`} className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%" key={isMobile ? 'mobile' : 'desktop'}>
                        <LineChart data={data} margin={{ top: 5, right: isMobile ? 10 : 30, left: isMobile ? -25 : -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis
                                dataKey="timeLabel"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--color-texto)', fontSize: isMobile ? 10 : 14 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--color-texto)', fontSize: isMobile ? 10 : 14 }}
                                domain={['auto', 'auto']}
                            />
                            <Tooltip wrapperClassName='tooltip' contentStyle={{ color: "var(--color-texto)" }}
                            />
                            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: isMobile ? '10px' : '14px' }} />
                            <Line
                                type="monotone"
                                dataKey="todayValue"
                                name={`Valor medido`}
                                stroke="var(--color-azul-oscuro)"
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={{ r: 4, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-texto-claro text-sm font-medium">
                    No hay datos para el rango seleccionado
                </div>
            )}
        </section>
    );
}
