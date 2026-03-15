import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '../Sidebar'
import TopNavbar from '../TopNavbar'

const ADMIN_LINKS = [
    { to: '/admin', label: 'Dashboard', icon: '📊', exact: true },
    { to: '/admin/users', label: 'Users', icon: '👥' },
    { to: '/admin/teams', label: 'Teams', icon: '🏷️' },
    { to: '/admin/tasks', label: 'Tasks', icon: '✅' },
    { to: '/admin/announcements', label: 'Announcements', icon: '📢' },
    { to: '/admin/events', label: 'Events', icon: '🎪' },
    { to: '/admin/attendance', label: 'Attendance', icon: '📋' },
    { to: '/admin/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { to: '/admin/resources', label: 'Resources', icon: '📁' },
    { to: '/admin/bulk-email', label: 'Bulk Email', icon: '📧' },
    { to: '/admin/import-members', label: 'Import Members', icon: '📥' },
    { to: '/admin/todos', label: 'My Todos', icon: '📝' },
    { to: '/admin/profile', label: 'Profile Settings', icon: '👤' },
    { to: '/admin/contact', label: 'Contact Us', icon: '📞' },
]

export default function AdminLayout() {
    const location = useLocation()
    return (
        <div className="flex min-h-screen">
            <Sidebar links={ADMIN_LINKS} title="Admin Portal" />
            <main className="flex-1 min-w-0 ml-0 lg:ml-[var(--sidebar-width)] p-4 lg:p-6 pt-16 lg:pt-6 min-h-screen bg-app-main text-app-primary">
                <TopNavbar title="Admin Portal" />
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
