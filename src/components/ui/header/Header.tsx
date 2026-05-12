import './Header.css';
import Navigation from './Navigation';
import ThemeToggle from '../ThemeToggle';

export default function Header() {
    return (
        <header aria-label="Encabezado principal de Laguna Sensing" className="flex justify-between items-center px-2 sm:px-4">
            <div className="flex items-center gap-2 sm:gap-3">
                <img src="/logodoble.svg" alt="Logo de Laguna Sensing" className="w-12 h-12 sm:w-18 sm:h-18 object-contain " />
                <h1 className="text-xl font-bold text-texto-oscuro tracking-tight hidden sm:block">
                    Laguna<span className="text-azul-oscuro font-extrabold ">Sensing</span>
                </h1>
            </div>
            <div className="flex items-center gap-2 ">
                <Navigation />
                <ThemeToggle />
            </div>
        </header>
    );
}
