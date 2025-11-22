import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export const useTheme = () => {
    const [theme, setTheme] = useState<Theme>(() => {
        // Check localStorage first
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        if (savedTheme) {
            return savedTheme;
        }

        // Check system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        return 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        const body = window.document.body;

        // Remove both classes first
        root.classList.remove('light', 'dark');
        body.classList.remove('light', 'dark');

        // Add the current theme class to both html and body
        root.classList.add(theme);
        body.classList.add(theme);

        // Save to localStorage
        localStorage.setItem('theme', theme);

        console.log(`🎨 Theme changed to: ${theme}`);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return { theme, toggleTheme, setTheme };
};
