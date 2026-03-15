import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '../Sidebar'
import TopNavbar from '../TopNavbar'

const FACULTY_LINKS = [
    { to: '/faculty', label: 'Dashboard', icon: '📊', exact: true },
    { to: '/faculty/events', label: 'Events', icon: '🎪' },
    { to: '/faculty/announcements', label: 'Announcements', icon: '📢' },
    { to: '/faculty/attendance', label: 'Attendance Reports', icon: '📋' },
    { to: '/faculty/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { to: '/faculty/todos', label: 'My Todos', icon: '📝' },
    { to: '/faculty/profile', label: 'Profile Settings', icon: '👤' },
    { to: '/faculty/contact', label: 'Contact Us', icon: '📞' },
]

export default function FacultyLayout() {
    const location = useLocation()
    return (
        <div className="flex min-h-screen">
            <Sidebar links={FACULTY_LINKS} title="Faculty Portal" />
            <main className="flex-1 min-w-0 ml-0 lg:ml-[var(--sidebar-width)] p-4 lg:p-6 pt-16 lg:pt-6 min-h-screen bg-app-main text-app-primary">
                <TopNavbar title="Faculty Portal" />
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    )
}
