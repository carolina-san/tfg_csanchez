import { NavLink } from "react-router-dom";
import { Map, BarChart3 } from "lucide-react";
import './Header.css';
export default function Navigation() {
    return (
        <nav className="flex items-center" aria-label="Navegación principal">
            <ul className="flex items-center gap-1 bg-panel-oscuro p-1 rounded-full border border-1 border-panel-oscuro" role="list">
                <li>
                    <NavLink to="/" className={({ isActive }) => 'nav-link ' + (isActive ? ' active' : '')} aria-label="Ir a la vista de mapa" end>
                        <Map size={14} className="sm:size-5" strokeWidth={2.5} aria-hidden="true" />
                        Mapa
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/datos" className={({ isActive }) => 'nav-link ' + (isActive ? ' active' : '')} aria-label="Ir a la vista de datos">
                        <BarChart3 size={14} className="sm:size-5" strokeWidth={2.5} aria-hidden="true" />
                        Datos
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
}