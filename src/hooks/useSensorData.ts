import { useState, useMemo } from "react";
import useSWR from "swr";
import { getLatestValues, getValuesBySensor } from "../services/sensor-service";
import type { SensorDevice, SensorReading } from "../types/sensor";

export function useSensorData() {
    const { data: sensors = [], isLoading: isSensorsLoading, error: sensorsError } = useSWR('sensors-latest', getLatestValues, {
        revalidateOnFocus: false,
        dedupingInterval: 60000,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
            console.warn(`[useSensorData] Reintento ${retryCount}/3 tras error de red:`, error.message);
            if (retryCount >= 3) return;
            setTimeout(() => revalidate({ retryCount }), 5000);
        },
    });

    const [selectedSensor, setSelectedSensor] = useState<SensorDevice | null>(null);
    const [historyData, setHistoryData] = useState<Record<string, SensorReading[]>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [sensorError, setSensorError] = useState<string | null>(null);

    const selectSensor = async (sensor: SensorDevice) => {
        try {
            setIsLoading(true);
            setSensorError(null);
            setSelectedSensor(sensor);
            setHistoryData({});

            const values = await getValuesBySensor(sensor.location_id);
            setHistoryData(values);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error desconocido";
            console.error("Error al obtener los datos del sensor:", message);
            setSensorError("No se pudieron cargar los datos del sensor. Comprueba tu conexión.");
        } finally {
            setIsLoading(false);
        }
    };

    const clearSensor = () => setSelectedSensor(null);
    const valuesByType = useMemo(() => {
        const valuesByType: Record<string, number[]> = {};

        sensors.forEach(s => {
            s.data.forEach(d => {
                const val = Number(d.value);
                if (!isNaN(val)) {
                    if (!valuesByType[d.type]) valuesByType[d.type] = [];
                    valuesByType[d.type].push(val);
                }
            });
        });
        return valuesByType;
    }, [sensors]);

    return {
        sensors,
        isSensorsLoading,
        selectedSensor,
        historyData,
        isLoading,
        selectSensor,
        clearSensor,
        valuesByType,
        sensorsError,
        sensorError,
        hasError: !!sensorsError || !!sensorError,
    };
}