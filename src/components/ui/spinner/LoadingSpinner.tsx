import './LoadingSpinner.css';

export default function LoadingSpinner() {
    return (
        <div className="spinner-container" role="status" aria-live="polite" aria-label="Cargando contenido">
            <div className="spinner" aria-hidden="true"></div>
            <span className="sr-only">Cargando...</span>
        </div>
    );
}
