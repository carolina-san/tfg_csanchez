import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Thermometer, Droplets, AudioLines, ChevronDown, X, Plus } from 'lucide-react';
import LoadingSpinner from '../ui/spinner/LoadingSpinner';
import { getDataForChart } from '../../services/sensor-service';

interface ComparisonChartProps {
    targetSensors: string;
}

const COLORS = ['#3f9bcd', '#dc6464ff', '#4abe98ff', '#d7a143ff', '#8a6fc7ff', '#be5389ff', '#14b8a6', '#f9788eff'];

export default function ComparisonChart({ targetSensors }: ComparisonChartProps) {
    const [selectedMetric, setSelectedMetric] = useState<string>('Temperatura');

    const [selectedDates, setSelectedDates] = useState<string[]>([new Date().toISOString().split('T')[0]]);
    const dateInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [chartData, setChartData] = useState<any[]>([]);
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

    useEffect(() => {
        const fetchData = async () => {
            if (!targetSensors || selectedDates.length === 0) {
                setChartData([]);
                return;
            }
            setIsLoading(true);
            const allPromises = selectedDates.map(dateStr =>
                getDataForChart(targetSensors, new Date(dateStr), 'same_hour_yesterday')
                    .then(res => ({ dateStr, data: res[selectedMetric] || [] }))
            );

            const results = await Promise.all(allPromises);

            const merged: any[] = Array.from({ length: 24 }, (_, i) => ({
                timeLabel: `${i.toString().padStart(2, '0')}:00`,
                hour: i
            }));

            results.forEach(({ dateStr, data }) => {
                data.forEach(item => {
                    if (merged[item.hour]) {
                        merged[item.hour][dateStr] = item.todayValue;
                    }
                });
            });

            setChartData(merged);
            setIsLoading(false);
        };
        fetchData();
    }, [targetSensors, selectedDates, selectedMetric]);

    const variables = [
        { id: 'Temperatura', icon: Thermometer, label: 'Comparativa Temperatura' },
        { id: 'Humedad', icon: Droplets, label: 'Comparativa Humedad' },
        { id: 'Ruido', icon: AudioLines, label: 'Comparativa Ruido' },
    ];

    const currentConf = variables.find(v => v.id === selectedMetric) || variables[0];
    const Icon = currentConf.icon;

    const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        const maxDate = getLocalTodayString();

        if (newDate && newDate <= maxDate) {
            setSelectedDates(prev => {
                if (!prev.includes(newDate) && prev.length < 8) {
                    return [...prev, newDate];
                }
                return prev;
            });
        }

        setTimeout(() => {
            if (dateInputRef.current) {
                dateInputRef.current.value = '';
            }
        }, 10);
    };

    const removeDate = (dateToRemove: string) => {
        setSelectedDates(prev => prev.filter(d => d !== dateToRemove));
    };

    const formatDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-');
        if (!year || !month || !day) return dateStr;
        return `${day}-${month}-${year}`;
    };

    return (
        <section className="card p-2 sm:p-6 h-[350px] sm:h-[400px] flex flex-col" aria-label="Gráfica comparativa entre días">
            <div className="flex flex-col md:flex-row md:items-center md:flex-nowrap justify-between mb-2 sm:mb-6 gap-3 sm:gap-4 px-1 sm:px-0">
                <div className="flex items-center justify-between w-full md:w-auto gap-2 shrink-0">
                    <h3 className="text-base sm:text-xl text-texto-oscuro flex items-center gap-2 whitespace-nowrap uppercase tracking-wide">
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-acento shrink-0" aria-hidden="true" />
                        <span className="md:hidden">Comparación</span>
                        <span className="hidden md:inline">{currentConf.label}</span>
                    </h3>
                    <div className="relative flex md:hidden items-center shrink-0">
                        <select
                            className="input-select-chart px-2 sm:px-4 pr-6 sm:pr-8 text-xs sm:text-sm"
                            value={selectedMetric}
                            onChange={(e) => setSelectedMetric(e.target.value)}
                            aria-label="Seleccionar métrica para la comparativa"
                        >
                            {variables.map(v => (
                                <option key={v.id} value={v.id}>{v.id}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-texto pointer-events-none" aria-hidden="true" />
                    </div>
                </div>

                <div className="flex flex-1 min-w-0 items-center justify-start md:justify-end gap-3 sm:gap-4">
                    <div className="flex flex-1 items-center gap-2 min-w-0 justify-end">
                        <div className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pr-1">
                            {selectedDates.map((date, index) => (
                                <div key={date} className={`px-1.5 py-1 sm:px-3 sm:py-1.5 text-white rounded-full flex items-center gap-0.5 sm:gap-2 text-[10px] sm:text-xs font-semibold shadow-sm shrink-0 ${index === 0 ? 'ml-auto' : ''}`} style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                                    {formatDate(date)}
                                    {selectedDates.length > 1 && (
                                        <button onClick={() => removeDate(date)} className="hover:text-black/50 transition-colors" aria-label={`Eliminar fecha ${formatDate(date)}`}>
                                            <X className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="relative flex items-center shrink-0">
                            <input
                                ref={dateInputRef}
                                type="date"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                                disabled={selectedDates.length >= 8}
                                max={getLocalTodayString()}
                                onChange={handleDateSelect}
                                onClick={(e) => {
                                    try {
                                        if ('showPicker' in HTMLInputElement.prototype) {
                                            (e.target as HTMLInputElement).showPicker();
                                        }
                                    } catch (err) {
                                        // Ignorar error si el navegador lo gestiona de forma nativa
                                    }
                                }}
                                aria-label="Seleccionar fecha para añadir a la comparativa"
                            />
                            <button
                                disabled={selectedDates.length >= 8}
                                className="w-fit h-6 sm:h-7 flex items-center justify-center bg-acento text-white rounded-full text-[10px] sm:text-xs px-2 gap-0.5 sm:gap-1 hover:bg-acento-claro hover:text-texto-oscuro disabled:opacity-50 transition-all shadow-sm relative z-0"
                                aria-label="Añadir fecha"
                                title="Añadir nueva fecha"
                            >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" /><span className="hidden sm:block">FECHA</span>
                            </button>
                        </div>
                    </div>

                    <div className="relative hidden md:flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <label htmlFor="comparison-metric-select" className="hidden sm:block text-[10px] sm:text-xs text-texto font-medium uppercase tracking-wider">Métrica:</label>

                        <select
                            id="comparison-metric-select"
                            className="input-select-chart px-2 sm:px-4 pr-6 sm:pr-8 text-xs sm:text-sm"
                            value={selectedMetric}
                            onChange={(e) => setSelectedMetric(e.target.value)}
                            aria-label="Seleccionar métrica para la comparativa"
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
                <div className="flex-1 flex items-center justify-center">
                    <LoadingSpinner />
                </div>
            ) : chartData.length > 0 ? (
                <div role="img" aria-label={`Gráfica comparativa de ${currentConf.label}`} className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%" key={isMobile ? 'mobile' : 'desktop'}>
                        <LineChart data={chartData} margin={{ top: 5, right: isMobile ? 10 : 30, left: isMobile ? -25 : -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis
                                dataKey="timeLabel"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: isMobile ? 10 : 14 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: isMobile ? 10 : 14 }}
                                domain={['auto', 'auto']}
                            />
                            <Tooltip
                                wrapperClassName='tooltip' contentStyle={{ color: "var(--color-texto)" }}
                            />
                            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: isMobile ? '10px' : '14px' }} />

                            {selectedDates.map((date, index) => (
                                <Line
                                    key={date}
                                    type="monotone"
                                    dataKey={date}
                                    name={formatDate(date)}
                                    stroke={COLORS[index % COLORS.length]}
                                    strokeWidth={3}
                                    dot={{ r: 2, strokeWidth: 1 }}
                                    activeDot={{ r: 4, strokeWidth: 0 }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-texto-claro text-sm font-medium">
                    No hay datos disponibles para mostrar la comparativa
                </div>
            )}
        </section>
    );
}
