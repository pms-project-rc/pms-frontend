import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-all duration-300"
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            <div className="relative w-6 h-6">
                <Sun
                    className={`absolute inset-0 w-6 h-6 text-yellow-500 transition-all duration-300 ${theme === 'light'
                            ? 'opacity-100 rotate-0 scale-100'
                            : 'opacity-0 rotate-90 scale-0'
                        }`}
                />
                <Moon
                    className={`absolute inset-0 w-6 h-6 text-blue-400 transition-all duration-300 ${theme === 'dark'
                            ? 'opacity-100 rotate-0 scale-100'
                            : 'opacity-0 -rotate-90 scale-0'
                        }`}
                />
            </div>
        </button>
    );
};
