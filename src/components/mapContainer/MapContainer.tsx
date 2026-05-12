import { useState, useRef } from "react";
import { lazy, Suspense } from "react";
import ErrorBoundary from "../ui/ErrorBoundary";

import type { Map3DHandle } from "../map/Map";
import LoadingSpinner from "../ui/spinner/LoadingSpinner";
import "./MapContainer.css";
import MapLayerControls from "./MapLayerControls";
import type { HeatmapType } from "./MapLayerControls";
import MapControls from "./MapControls";
const Map3D = lazy(() => import("../map/Map"));

interface MapContainerProps {
    selectedSensor: any;
    onSensorSelect: (sensor: any) => void;
}

export default function MapContainer({ selectedSensor, onSensorSelect }: MapContainerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [heatmapVisible, setHeatmapVisible] = useState(false);
    const [heatmapType, setHeatmapType] = useState<HeatmapType>('Temperatura');
    const [sensorsVisible, setSensorsVisible] = useState(true);
    const [showReset, setShowReset] = useState(false);

    const mapRef = useRef<Map3DHandle>(null);

    const handleReset = () => {
        mapRef.current?.resetCamera();
    };

    const handleZoomIn = () => {
        mapRef.current?.zoomIn();
    };

    const handleZoomOut = () => {
        mapRef.current?.zoomOut();
    };

    return (
        <section className="w-full h-full" aria-label="Contenedor del mapa interactivo">
            {isLoading && (
                <div className="bg-spinner" role="status" aria-live="polite">
                    <LoadingSpinner />
                </div>
            )}

            <MapLayerControls
                sensorsVisible={sensorsVisible}
                heatmapVisible={heatmapVisible}
                heatmapType={heatmapType}
                onToggleSensors={setSensorsVisible}
                onToggleHeatmap={setHeatmapVisible}
                onChangeHeatmapType={setHeatmapType}
            />

            <MapControls
                showReset={showReset}
                onReset={handleReset}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                selectedSensor={selectedSensor}
            />

            <ErrorBoundary
                fallbackTitle="Error al cargar el mapa 3D"
                fallbackMessage="No se ha podido inicializar el visor 3D. Es posible que tu dispositivo no soporte WebGL. Intenta recargar la página."
            >
                <Suspense fallback={
                    <div className="bg-spinner" role="status" aria-live="polite">
                        <LoadingSpinner />
                    </div>
                }>
                    <Map3D
                        ref={mapRef}
                        selectedSensor={selectedSensor}
                        heatmapVisible={heatmapVisible}
                        heatmapType={heatmapType}
                        sensorsVisible={sensorsVisible}
                        onSensorSelect={onSensorSelect}
                        onLoadingChange={setIsLoading}
                        onCameraMove={setShowReset}
                    />
                </Suspense>
            </ErrorBoundary>
        </section>
    );
}