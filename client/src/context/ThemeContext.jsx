import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const THEME_KEY = 'tf-theme'
const THEMES = ['dark', 'light', 'pookie']
const ThemeContext = createContext(null)
const defaultTitle = typeof document !== 'undefined' ? document.title : 'TechFest 2026'
const defaultFavicon = typeof document !== 'undefined'
    ? document.querySelector("link[rel~='icon']")?.getAttribute('href') || '/favicon.ico'
    : '/favicon.ico'

function getInitialTheme() {
    if (typeof window === 'undefined') return 'dark'
    const saved = localStorage.getItem(THEME_KEY)
    if (THEMES.includes(saved)) return saved
    return 'dark'
}

function ensurePookieFont(theme) {
    const existing = document.getElementById('tf-pookie-font')
    if (theme === 'pookie' && !existing) {
        const link = document.createElement('link')
        link.id = 'tf-pookie-font'
        link.rel = 'stylesheet'
        link.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap'
        document.head.appendChild(link)
    }
    if (theme !== 'pookie' && existing) {
        existing.remove()
    }
}

function ensurePookieMeta(theme) {
    let icon = document.querySelector("link[rel~='icon']")
    if (!icon) {
        icon = document.createElement('link')
        icon.rel = 'icon'
        document.head.appendChild(icon)
    }
    if (theme === 'pookie') {
        document.title = `🩷 ${defaultTitle.replace(/^🩷\s*/, '')}`
        icon.setAttribute(
            'href',
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ctext y='.9em' font-size='56'%3E%F0%9F%8E%80%3C/text%3E%3C/svg%3E"
        )
        return
    }
    document.title = defaultTitle
    icon.setAttribute('href', defaultFavicon)
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(getInitialTheme)

    useEffect(() => {
        if (localStorage.getItem('pookie-sounds') === null) {
            localStorage.setItem('pookie-sounds', 'false')
        }
    }, [])

    useEffect(() => {
        localStorage.setItem(THEME_KEY, theme)
        document.body.classList.remove('theme-dark', 'theme-light', 'theme-pookie')
        document.body.classList.add(`theme-${theme}`)
        document.documentElement.setAttribute('data-theme', theme)
        const root = document.getElementById('root')
        if (root) {
            root.classList.remove('theme-dark', 'theme-light', 'theme-pookie')
            root.classList.add(`theme-${theme}`)
        }
        ensurePookieFont(theme)
        ensurePookieMeta(theme)
    }, [theme])

    const value = useMemo(() => ({ theme, setTheme, themes: THEMES }), [theme])

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext)
