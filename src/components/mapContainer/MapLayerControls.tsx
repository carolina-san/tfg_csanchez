import { Flame, MapPinned, Droplets, Volume2, ThermometerSun } from "lucide-react";
import "./MapContainer.css";

export type HeatmapType = 'Temperatura' | 'Humedad' | 'Ruido';

interface MapControlsProps {
    sensorsVisible: boolean;
    heatmapVisible: boolean;
    heatmapType: HeatmapType;
    onToggleSensors: (visible: boolean) => void;
    onToggleHeatmap: (visible: boolean) => void;
    onChangeHeatmapType: (type: HeatmapType) => void;
}

export default function MapControls({ sensorsVisible, heatmapVisible, heatmapType, onToggleSensors, onToggleHeatmap, onChangeHeatmapType }: MapControlsProps) {

    return (
        <div className="absolute left-3 sm:left-5 bottom-3 sm:bottom-5  transform  flex items-end gap-2 z-[60]">

            <div className="flex flex-col items-center bg-panel rounded-2xl shadow-md p-2   border-1 border-panel-oscuro" role="group" aria-label="Controles de capas del mapa">
                <span className="text-xs sm:text-sm text-texto/70 uppercase tracking-wider font-bold w-full pl-1 pb-1"> Capas</span>
                <button
                    onClick={() => {
                        onToggleSensors(!sensorsVisible);
                    }}
                    className={`flex w-full items-center gap-2 pl-2 pr-3 py-1 rounded-full transition-colors mb-1 sm:mb-2 group ${sensorsVisible ? "bg-acento-azul/30 text-acento-azul" : "text-texto-claro hover:bg-acento-azul/30 hover:text-texto"
                        }`}
                    aria-pressed={sensorsVisible}
                    aria-label={`${sensorsVisible ? 'Ocultar' : 'Mostrar'} marcadores de sensores`}
                >
                    <MapPinned className="icon" aria-hidden="true" />
                    <span className={`font-semibold text-sm! sm:text-base! ${sensorsVisible ? "text-texto-oscuro" : "text-texto-claro  group-hover:text-texto"}`}>
                        Sensores
                    </span>
                </button>
                <button
                    onClick={() => {
                        onToggleHeatmap(!heatmapVisible);
                    }}
                    className={`flex w-full items-center gap-2 pl-1.5 pr-3 py-1 rounded-full transition-colors group ${heatmapVisible ? "bg-acento-claro/30 text-acento-claro " : "text-texto-claro hover:bg-acento-claro/30 hover:text-texto"
                        }`}
                    aria-pressed={heatmapVisible}
                    aria-label={`${heatmapVisible ? 'Ocultar' : 'Mostrar'} mapa de calor`}
                >
                    <Flame className="icon" aria-hidden="true" />
                    <span className={`font-semibold text-sm! sm:text-base! ${heatmapVisible ? "text-texto-oscuro" : "text-texto-claro group-hover:text-texto"}`}>
                        Heatmap
                    </span>
                </button>
            </div>

            {heatmapVisible && (
                <div className="flex flex-col items-start bg-panel rounded-2xl shadow-md p-2 gap-1 sm:gap-2 border-1 border-panel-oscuro" role="radiogroup" aria-label="Tipo de mapa de calor">
                    <span className="text-xs sm:text-sm text-texto/70 uppercase tracking-wider font-bold w-full pl-1 pb-0.5 sm:pb-1"> Variable</span>
                    <button
                        onClick={() => onChangeHeatmapType('Temperatura')}
                        className={`flex items-center justify-start gap-2 pl-1.5 pr-3 py-1 rounded-full transition-colors group w-full ${heatmapType === 'Temperatura' ? "bg-acento-claro/30 text-acento-claro" : "text-texto-claro hover:bg-acento-claro/30 hover:text-texto"}`}
                        aria-checked={heatmapType === 'Temperatura'}
                        role="radio"
                    >
                        <ThermometerSun className="icon shrink-0" aria-hidden="true" />
                        <span className={`font-semibold text-sm sm:text-base ${heatmapType === 'Temperatura' ? "text-texto-oscuro" : "text-texto-claro group-hover:text-texto"}`}>Temperatura</span>
                    </button>
                    <button
                        onClick={() => onChangeHeatmapType('Humedad')}
                        className={`flex items-center justify-start gap-2 pl-1.5 pr-3 py-1 rounded-full transition-colors group w-full ${heatmapType === 'Humedad' ? "bg-acento-claro/30 text-acento-claro" : "text-texto-claro hover:bg-acento-claro/30 hover:text-texto"}`}
                        aria-checked={heatmapType === 'Humedad'}
                        role="radio"
                    >
                        <Droplets className="icon shrink-0" aria-hidden="true" />
                        <span className={`font-semibold text-sm sm:text-base ${heatmapType === 'Humedad' ? "text-texto-oscuro" : "text-texto-claro group-hover:text-texto"}`}>Humedad</span>
                    </button>
                    <button
                        onClick={() => onChangeHeatmapType('Ruido')}
                        className={`flex items-center justify-start gap-2 pl-1.5 pr-3 py-1 rounded-full transition-colors group w-full ${heatmapType === 'Ruido' ? "bg-acento-claro/30 text-acento-claro" : "text-texto-claro hover:bg-acento-claro/30 hover:text-texto"}`}
                        aria-checked={heatmapType === 'Ruido'}
                        role="radio"
                    >
                        <Volume2 className="icon shrink-0" aria-hidden="true" />
                        <span className={`font-semibold text-sm sm:text-base ${heatmapType === 'Ruido' ? "text-texto-oscuro" : "text-texto-claro group-hover:text-texto"}`}>Ruido</span>
                    </button>
                </div>
            )}
        </div>
    );
}