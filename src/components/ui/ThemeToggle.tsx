import { Sun, Moon } from 'lucide-react';
import { useDarkMode } from '../../hooks/useDarkMode';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useDarkMode();

  return (
    <button
      onClick={toggleTheme}
      className="p-1.5 sm:p-2 ml-1 sm:ml-4 rounded-xl bg-panel hover:bg-panel-oscuro text-texto-oscuro transition-all duration-300 border border-panel-oscuro shadow-sm cursor-pointer"
      aria-label="Alternar modo oscuro"
    >
      {theme === 'light' ? (
        <Sun className="w-4 sm:w-5 h-4 sm:h-5 text-acento" />
      ) : (
        <Moon className="w-4 sm:w-5 h-4 sm:h-5 text-acento" />
      )}
    </button>
  );
}
