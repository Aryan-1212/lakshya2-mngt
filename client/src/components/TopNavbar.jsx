import { useTheme } from '../context/ThemeContext'

const OPTIONS = [
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'pookie', label: 'Pookie', icon: '🩷' },
]

export default function TopNavbar({ title }) {
    const { theme, setTheme } = useTheme()

    return (
        <header className="sticky top-0 z-30 backdrop-blur-md bg-app-main border border-app-border rounded-2xl px-4 py-3 mb-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-app-secondary">Theme</p>
                    <h2 className="text-lg font-bold text-app-primary pookie-navbar-title">{title}</h2>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-app-surface border border-app-border p-1.5">
                    {OPTIONS.map((option) => {
                        const active = theme === option.value
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setTheme(option.value)}
                                className={`theme-toggle-btn ${active ? 'active' : ''}`}
                            >
                                <span>{option.icon}</span>
                                <span>{option.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>
        </header>
    )
}
