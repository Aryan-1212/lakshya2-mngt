import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import HeartSnowfall from './components/HeartSnowfall'
import './index.css'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60, // 1 min
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
})

function AppShell() {
    const { theme } = useTheme()
    const isPookie = theme === 'pookie'

    return (
        <>
            <App />
            <HeartSnowfall active={isPookie} />
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: 'var(--color-surface)',
                        color: 'var(--color-text-primary)',
                        border: `1px solid var(--color-border)`,
                        borderLeft: isPookie ? '4px solid #ec4899' : '1px solid var(--color-border)',
                        borderRadius: '12px',
                        fontSize: '14px',
                    },
                    icon: isPookie ? '🌸' : undefined,
                    success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                }}
            />
        </>
    )
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <AuthProvider>
                        <AppShell />
                    </AuthProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </BrowserRouter>
    </React.StrictMode>
)
