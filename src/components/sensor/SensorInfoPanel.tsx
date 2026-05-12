import type { SensorDevice, SensorReading } from "../../types/sensor";
import { useSensorData } from "../../hooks/useSensorData";
import SensorDataCard from "./SensorDataCard";
import { formatSensorName } from "../../utils/sensorUtils";
import { MapPin, X, AlertTriangle } from "lucide-react";
import "./Sensor.css";

interface SensorInfoPanelProps {
    sensor: SensorDevice | null;
    historyData?: Record<string, SensorReading[]>;
    isLoading?: boolean;
    onClose: () => void;
}

export default function SensorInfoPanel({ sensor, historyData = {}, isLoading = false, onClose }: SensorInfoPanelProps) {
    const { valuesByType, sensorError } = useSensorData();

    const getValuesByType = (type: SensorReading['type']) => {
        return valuesByType[type] || [];
    };

    return (
        <aside
            className={`info-panel ${sensor ? 'visible' : 'hidden'}`}
            aria-label="Panel de información del sensor"
            aria-hidden={!sensor}
        >
            {sensor && (
                <div className="flex-1 overflow-y-auto w-full min-w-[260px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <h2 className="text-2xl! sm:text-3xl! font-bold mb-1 sm:mb-2 text-texto">{formatSensorName(sensor.name)}</h2>
                    <div className="space-y-4 w-full">
                        <p className="justify-self-right text-sm! sm:text-base! font-semibold uppercase flex items-center text-texto">
                            <MapPin className="w-3 h-3 sm:w-5 sm:h-5 text-texto-oscuro" aria-hidden="true" />
                            <span className="ml-1 sm:ml-2" aria-label={`Coordenadas: ${Number(sensor.lat).toFixed(6)}, ${Number(sensor.lon).toFixed(6)}`}>{Number(sensor.lat).toFixed(6)}, {Number(sensor.lon).toFixed(6)}</span>
                        </p>

                        {sensorError && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2" role="alert">
                                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" aria-hidden="true" />
                                <p className="text-xs text-red-700 dark:text-red-300">{sensorError}</p>
                            </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-texto-claro/50" role="region" aria-label="Lecturas del sensor">
                            <div className="space-y-2 sm:space-y-3 px-0.5">
                                {sensor.data.map((dato, index) => (
                                    <SensorDataCard
                                        key={index}
                                        data={dato}
                                        dataForChart={historyData[dato.type] || []}
                                        isLoading={isLoading}
                                        valuesByType={getValuesByType(dato.type)}
                                    />
                                ))}
                                {sensor.data.length === 0 && (
                                    <p className="text-sm text-texto-claro ">No hay datos disponibles.</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <button onClick={() => onClose()} className="fixed top-4 right-4 p-1 text-texto-oscuro rounded-full hover:bg-acento-claro transition-colors" aria-label="Cerrar panel de información del sensor">
                        <X className="w-5 h-5 text-texto-oscuro" aria-hidden="true" />
                    </button>
                </div>
            )}
        </aside>
    );
}
