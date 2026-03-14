import { Outlet } from 'react-router-dom'
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
    return (
        <div className="flex min-h-screen">
            <Sidebar links={TL_LINKS} title="Team Leader Portal" />
            <main className="flex-1 min-w-0 ml-0 lg:ml-[var(--sidebar-width)] p-4 lg:p-6 pt-16 lg:pt-6 min-h-screen bg-app-main text-app-primary">
                <TopNavbar title="Team Leader Portal" />
                <Outlet />
            </main>
        </div>
    )
}
