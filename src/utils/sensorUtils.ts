import { SENSOR_INFO } from "../types/sensor";


//Formatear el nombre del sensor a sonoX-th
export const formatSensorName = (name: string) => {
    const parts = name.split('/devices/');
    if (parts.length > 1) {
        return parts[1].split('/')[0];
    }
    return name;
}

//Formatear las unidades y el tipo del sensor
export const getSensorInfo = (type: string) => {
    const key = type?.toLowerCase() || 'desconocido';
    return SENSOR_INFO[key] || { label: type, unit: '' };
};