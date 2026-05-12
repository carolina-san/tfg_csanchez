//Lectura de un sensor (temperatura, humedad o ruido)
export interface SensorReading {
    type: string;
    value: any;
    unit?: string;
    timestamp?: string;
}

//Sensor físico con valor para temperatura, humedad y ruido
export interface SensorDevice {
    location_id: string;
    name: string;
    lat: number;
    lon: number;
    alt: number;
    data: SensorReading[];
}

export const SENSOR_INFO: Record<string, { label: string; unit: string }> = {
    humidity: { label: 'Humedad', unit: '%' },
    temperature: { label: 'Temperatura', unit: '°C' },
    noise: { label: 'Ruido', unit: 'dB' },
};