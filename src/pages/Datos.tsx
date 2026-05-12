import { useState, useEffect } from "react";
import { getDataForChart } from "../services/sensor-service";
import { useSensorData } from "../hooks/useSensorData";
import { formatSensorName } from "../utils/sensorUtils";

import { AudioLines, Droplets, Thermometer, ChevronDown, AlertTriangle } from 'lucide-react';
import KpiCard from '../components/charts/KpiCard';
import EvolutionChart from '../components/charts/EvolutionChart';
import ComparisonChart from '../components/charts/ComparisonChart';
import LoadingSpinner from "../components/ui/spinner/LoadingSpinner";


export default function Datos() {
    const { sensors, sensorsError } = useSensorData();
    const [selectedSensorId, setSelectedSensorId] = useState<string>('');
    const [selectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const targetSensors = selectedSensorId || sensors.map(s => s.location_id).join(',');

    const [isLoading, setIsLoading] = useState(false);
    const [chartData, setChartData] = useState<Record<string, any[]>>({});
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!targetSensors) return;

            try {
                setIsLoading(true);
                setFetchError(null);
                const target = new Date(selectedDate);
                const data = await getDataForChart(targetSensors, target, 'same_hour_yesterday');
                setChartData(data);
            } catch (error) {
                const message = error instanceof Error ? error.message : "Error desconocido";
                console.error("Error al obtener datos del gráfico:", message);
                setFetchError("No se pudieron cargar los datos de análisis. Comprueba tu conexión a internet.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [targetSensors, selectedDate]);


    const renderKPICards = () => {
        const variables = [
            { id: 'Temperatura', icon: Thermometer, unit: '°C' },
            { id: 'Humedad', icon: Droplets, unit: '%' },
            { id: 'Ruido', icon: AudioLines, unit: 'dB' },
        ];

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 " role="region" aria-label="Tarjetas de indicadores clave">
                {variables.map(variable => {
                    const data = chartData[variable.id] || [];
                    const Icon = variable.icon;

                    return (
                        <KpiCard
                            key={variable.id}
                            title={variable.id}
                            icon={Icon}
                            unit={variable.unit}
                            chartData={data}
                        />
                    );
                })}
            </div>
        );
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }
    return (
        <main className="w-full h-full overflow-x-hidden overflow-y-auto px-3 sm:px-5 py-2 bg-fondo pb-5" aria-label="Página de análisis de datos">
            <div className="flex flex-row items-center justify-between mb-2 sm:mb-4 gap-1 sm:gap-0">
                <h2 className="text-xl! sm:text-3xl! font-medium text-texto-oscuro">Análisis de Datos</h2>
                <div className="relative w-auto text-texto">
                    <label htmlFor="sensor-select" className="sr-only">Seleccionar sensor</label>
                    <select
                        id="sensor-select"
                        className="input-select  text-sm sm:text-base"
                        value={selectedSensorId}
                        onChange={(e) => setSelectedSensorId(e.target.value)}
                        aria-label="Seleccionar sensor para filtrar datos"
                    >
                        <option value="">
                            {isMobile ? "Todos los sensores" : "Media de todos los sensores"}
                        </option>
                        {[...sensors].sort((a, b) => formatSensorName(a.name).localeCompare(formatSensorName(b.name), undefined, { numeric: true })).map(sensor => (
                            <option key={sensor.location_id} value={sensor.location_id}>
                                {formatSensorName(sensor.name)}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-texto pointer-events-none" aria-hidden="true" />
                </div>
            </div>

            {(sensorsError || fetchError) && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4 flex items-start gap-3" role="alert">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" aria-hidden="true" />
                    <div>
                        <p className="text-sm font-semibold text-red-700 dark:text-red-300">Error de conexión</p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {fetchError || "No se pudieron obtener los datos de los sensores. Se reintentará automáticamente."}
                        </p>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-2 sm:gap-4">
                {renderKPICards()}

                <EvolutionChart
                    targetSensors={targetSensors}
                />
                <ComparisonChart
                    targetSensors={targetSensors}
                />
            </div>
        </main>
    );
}
