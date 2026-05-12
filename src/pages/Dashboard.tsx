import { Suspense, lazy } from 'react';
import SensorInfoPanel from "../components/sensor/SensorInfoPanel";
import { useSensorData } from "../hooks/useSensorData";
import LoadingSpinner from "../components/ui/spinner/LoadingSpinner";
import { WifiOff } from 'lucide-react';

const MapContainer = lazy(() => import("../components/mapContainer/MapContainer"));

export default function Dashboard() {
    const {
        selectedSensor,
        historyData,
        isLoading,
        selectSensor,
        clearSensor,
        sensorsError,
    } = useSensorData();

    return (
        <div className="relative w-full h-full overflow-hidden " role="region" aria-label="Panel de control del mapa">
            <Suspense fallback={<LoadingSpinner />}>
                <MapContainer
                    selectedSensor={selectedSensor}
                    onSensorSelect={selectSensor}
                />
            </Suspense>

            {sensorsError && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600/90 backdrop-blur-sm text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 max-w-sm animate-in fade-in slide-in-from-top-2 duration-300" role="alert">
                    <WifiOff className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <div>
                        <p className="text-sm font-semibold">Sin conexión a los sensores</p>
                        <p className="text-xs opacity-90">No se pudieron obtener los datos. Reintentando automáticamente…</p>
                    </div>
                </div>
            )}

            <SensorInfoPanel
                sensor={selectedSensor}
                historyData={historyData}
                isLoading={isLoading}
                onClose={clearSensor}
            />
        </div>
    );
}