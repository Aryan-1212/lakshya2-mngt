import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '../Sidebar'
import TopNavbar from '../TopNavbar'

const TL_LINKS = [
    { to: '/tl', label: 'Dashboard', icon: '🏠', exact: true },
    { to: '/tl/tasks', label: 'Tasks', icon: '✅' },
    { to: '/tl/verify', label: 'Verify Submissions', icon: '☑️' },
    { to: '/tl/members', label: 'Team Members', icon: '👥' },
    { to: '/tl/announcements', label: 'Announcements', icon: '📢' },
    { to: '/tl/attendance', label: 'Attendance', icon: '📋' },
    { to: '/tl/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { to: '/tl/resources', label: 'Resources', icon: '📁' },
    { to: '/tl/import-members', label: 'Import Members', icon: '📥' },
    { to: '/tl/todos', label: 'My Todos', icon: '📝' },
    { to: '/tl/profile', label: 'Profile Settings', icon: '👤' },
    { to: '/tl/contact', label: 'Contact Us', icon: '📞' },
]

export default function TLLayout() {
    const location = useLocation()
    return (
        <div className="flex min-h-screen">
            <Sidebar links={TL_LINKS} title="Team Leader Portal" />
            <main className="flex-1 min-w-0 ml-0 lg:ml-[var(--sidebar-width)] p-4 lg:p-6 pt-16 lg:pt-6 min-h-screen bg-app-main text-app-primary">
                <TopNavbar title="Team Leader Portal" />
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
