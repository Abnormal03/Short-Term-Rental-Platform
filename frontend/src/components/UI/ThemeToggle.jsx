import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../store/useTheme';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="flex size-9 items-center justify-center rounded-full bg-neutral text-text hover:bg-bg-2 transition-colors"
        >
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
        </button>
    );
}