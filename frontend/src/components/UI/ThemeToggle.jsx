import { Sun, Moon } from 'lucide-react';
import useThemeStore from '../../store/useTheme';

export function ThemeToggle() {
    const { theme, toggleTheme } = useThemeStore();

    return (
        <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full flex items-center justify-center
                 bg-gray-600 dark:bg-slate-100  
                 text-gray-500 dark:text-slate-400
                 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
        >
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
        </button>
    );
}