import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getTeams, sendBulkEmail, getUsers } from '../../api'
import toast from 'react-hot-toast'

const ROLES = [
    { id: 'admin', name: 'Admin', icon: '⚡' },
    { id: 'teamleader', name: 'Team Leader', icon: '👑' },
    { id: 'member', name: 'Member', icon: '👤' },
    { id: 'campus_ambassador', name: 'Campus Ambassador', icon: '🎓' },
]

export default function BulkEmail() {
    const { data: teamData } = useQuery({ queryKey: ['teams'], queryFn: getTeams })
    const teams = teamData?.data?.teams || []

    const [form, setForm] = useState({
        roles: [],
        teams: [],
        specificEmails: '',
        subject: '',
        html: '',
    })
    const [userSearch, setUserSearch] = useState('')
    const [selectedUsers, setSelectedUsers] = useState([]) // Array of {id, email, name}

    const { data: userData, isFetching: usersLoading } = useQuery({
        queryKey: ['users-search', userSearch],
        queryFn: () => getUsers({ search: userSearch, limit: 10 }),
        enabled: userSearch.length > 2,
    })
    const searchedUsers = userData?.data?.users || []

    const sendMut = useMutation({
        mutationFn: sendBulkEmail,
        onSuccess: (res) => {
            toast.success(res.data.message || 'Emails sent successfully!')
            setForm({ roles: [], teams: [], specificEmails: '', subject: '', html: '' })
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to send emails'),
    })

    const toggleRole = (role) => {
        setForm(s => ({
            ...s,
            roles: s.roles.includes(role) ? s.roles.filter(r => r !== role) : [...s.roles, role]
        }))
    }

    const toggleTeam = (teamId) => {
        setForm(s => ({
            ...s,
            teams: s.teams.includes(teamId) ? s.teams.filter(t => t !== teamId) : [...s.teams, teamId]
        }))
    }

    const toggleUser = (u) => {
        if (selectedUsers.some(su => su._id === u._id)) {
            setSelectedUsers(selectedUsers.filter(su => su._id !== u._id))
        } else {
            setSelectedUsers([...selectedUsers, u])
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!form.subject || !form.html) return toast.error('Subject and content are required')
        
        const manualEmails = form.specificEmails.split(/[\n,]+/).map(e => e.trim()).filter(Boolean)
        const selectedEmails = selectedUsers.map(u => u.email)
        
        const payload = {
            ...form,
            specificEmails: [...new Set([...manualEmails, ...selectedEmails])]
        }
        
        if (payload.roles.length === 0 && payload.teams.length === 0 && payload.specificEmails.length === 0) {
            return toast.error('Please select at least one target audience')
        }

        if (window.confirm(`Are you sure you want to initiate this bulk email?`)) {
            sendMut.mutate(payload)
        }
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="page-title mb-0">📧 Bulk Email Suite</h1>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side: Targets */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card space-y-4">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Target Roles</h3>
                        <div className="grid grid-cols-1 gap-2">
                            {ROLES.map(role => (
                                <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => toggleRole(role.id)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${form.roles.includes(role.id) ? 'bg-primary-500/10 border-primary-500 text-primary-400' : 'bg-dark-700 border-dark-600 text-gray-400 hover:border-dark-400'}`}
                                >
                                    <span className="text-xl">{role.icon}</span>
                                    <span className="font-medium">{role.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="card space-y-4">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Target Teams</h3>
                        <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {teams.map(team => (
                                <button
                                    key={team._id}
                                    type="button"
                                    onClick={() => toggleTeam(team._id)}
                                    className={`w-full flex items-center gap-3 p-2 rounded-lg border transition-all text-left text-sm ${form.teams.includes(team._id) ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-dark-700 border-dark-600 text-gray-400 hover:border-dark-400'}`}
                                >
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: team.color || '#6366f1' }} />
                                    <span className="truncate">{team.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="card space-y-4">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Target Users</h3>
                        <div className="space-y-3">
                            <input
                                className="input text-sm"
                                placeholder="Search by name/email..."
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                            />
                            {userSearch.length > 2 && (
                                <div className="max-h-40 overflow-y-auto space-y-1 p-2 bg-dark-800 rounded-lg border border-dark-600 custom-scrollbar">
                                    {usersLoading && <div className="text-center py-2"><div className="animate-spin h-4 w-4 border-2 border-primary-500 rounded-full border-t-transparent mx-auto" /></div>}
                                    {!usersLoading && searchedUsers.length === 0 && <div className="text-center py-2 text-xs text-gray-500">No users found</div>}
                                    {searchedUsers.map(u => (
                                        <button
                                            key={u._id}
                                            type="button"
                                            onClick={() => toggleUser(u)}
                                            className={`w-full flex items-center justify-between p-2 rounded hover:bg-dark-700 transition-colors text-left text-xs ${selectedUsers.some(su => su._id === u._id) ? 'text-primary-400' : 'text-gray-300'}`}
                                        >
                                            <div className="flex-1 min-w-0 mr-2">
                                                <p className="font-medium truncate">{u.name}</p>
                                                <p className="text-[10px] text-gray-500 truncate">{u.email}</p>
                                            </div>
                                            {selectedUsers.some(su => su._id === u._id) ? '✅' : '➕'}
                                        </button>
                                    ))}
                                </div>
                            )}
                            
                            {selectedUsers.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold px-1">Selected ({selectedUsers.length}):</p>
                                    <div className="flex flex-wrap gap-1">
                                        {selectedUsers.map(u => (
                                            <div key={u._id} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-400 text-[10px]">
                                                <span className="truncate max-w-[100px]">{u.name}</span>
                                                <button type="button" onClick={() => toggleUser(u)} className="hover:text-white">✕</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card space-y-4">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Specific Emails</h3>
                        <textarea
                            className="input text-sm min-h-[100px]"
                            placeholder="Enter emails separated by comma or new line..."
                            value={form.specificEmails}
                            onChange={(e) => setForm(s => ({ ...s, specificEmails: e.target.value }))}
                        />
                    </div>
                </div>

                {/* Right Side: Composition */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card space-y-4">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Compose Mail</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="label">Subject Line</label>
                                <input
                                    className="input font-medium"
                                    placeholder="e.g. Important Update: Technical Fest 2024"
                                    value={form.subject}
                                    onChange={(e) => setForm(s => ({ ...s, subject: e.target.value }))}
                                    required
                                />
                            </div>
                            <div>
                                <label className="label">Email Body (HTML Supported)</label>
                                <textarea
                                    className="input font-mono text-sm min-h-[300px]"
                                    placeholder="<h1>Hello {{name}}</h1><p>Your message here...</p>"
                                    value={form.html}
                                    onChange={(e) => setForm(s => ({ ...s, html: e.target.value }))}
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    💡 Tip: You can use standard HTML tags for styling. Images should use external URLs.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={sendMut.isPending}
                        className="btn-primary w-full py-4 text-lg justify-center shadow-lg shadow-primary-500/20"
                    >
                        {sendMut.isPending ? '⏳ Sending Emails...' : '🚀 Blast Emails'}
                    </button>
                </div>
            </form>
        </div>
    )
}
