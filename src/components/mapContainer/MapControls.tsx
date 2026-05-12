import { Plus, Minus, Calendar, RefreshCcwDot } from "lucide-react";
import "./MapContainer.css";

interface MapControlsProps {
    showReset: boolean;
    onReset: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    selectedSensor: any;
}

export default function MapControls({
    showReset,
    onReset,
    onZoomIn,
    onZoomOut,
    selectedSensor
}: MapControlsProps) {
    const today = new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <>
            <div className={`absolute top-1 left-3 sm:left-5 z-[60] flex items-center gap-2 pointer-events-auto transition-all duration-300 ${selectedSensor ? 'opacity-0 pointer-events-none sm:opacity-100 sm:pointer-events-auto' : ''}`}>
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-acento" aria-hidden="true" />
                <span className="text-texto-oscuro font-medium capitalize text-xs sm:text-sm">{today}</span>
            </div>

            <div
                className={`fixed bottom-3 sm:bottom-5 right-3 sm:right-5 flex flex-col gap-1 sm:gap-2  transition-all duration-300 ease-in-out z-[60] ${selectedSensor ? 'opacity-0 pointer-events-none sm:opacity-100 sm:pointer-events-auto sm:-translate-x-[420px]' : 'translate-x-0'}`}
                role="group"
                aria-label="Controles de zoom del mapa"
            >
                {showReset && (
                    <button
                        className="btn-control-mapa"
                        onClick={onReset}
                        title="Restablecer vista"
                        aria-label="Restablecer vista del mapa"
                    >
                        <RefreshCcwDot className="icono" aria-hidden="true" />
                    </button>
                )}
                <button
                    className="btn-control-mapa"
                    onClick={onZoomIn}
                    title="Ampliar"
                    aria-label="Ampliar mapa"
                >
                    <Plus className="icono" aria-hidden="true" />
                </button>
                <button
                    className="btn-control-mapa"
                    onClick={onZoomOut}
                    title="Reducir"
                    aria-label="Reducir mapa"
                >
                    <Minus className="icono" aria-hidden="true" />
                </button>


            </div>
        </>
    );
}
