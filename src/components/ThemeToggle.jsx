import { useTheme } from '../context/ThemeProvider.jsx';

export function ThemeToggle({ className = '' }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={`theme-toggle ${className}`.trim()}
      role="group"
      aria-label="Выбор темы оформления"
    >
      <button
        type="button"
        className="theme-toggle__btn"
        data-active={theme === 'light' ? 'true' : 'false'}
        onClick={() => setTheme('light')}
        aria-pressed={theme === 'light'}
      >
        Светлая
      </button>
      <button
        type="button"
        className="theme-toggle__btn"
        data-active={theme === 'dark' ? 'true' : 'false'}
        onClick={() => setTheme('dark')}
        aria-pressed={theme === 'dark'}
      >
        Тёмная
      </button>
    </div>
  );
}
