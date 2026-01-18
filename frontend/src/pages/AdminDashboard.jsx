import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import { Users, Clock, AlertCircle, Calendar, LogOut, ChevronRight, FileText, CheckCircle2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeToday: 0,
        recentActivity: [],
        pagination: { hasMore: false }
    });
    const [loading, setLoading] = useState(true);
    const [pageLoading, setPageLoading] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isEditProfile, setIsEditProfile] = useState(false);
    const [profileFormData, setProfileFormData] = useState({});
    const [isAnnounceModalOpen, setIsAnnounceModalOpen] = useState(false);
    const [announceData, setAnnounceData] = useState({ title: '', message: '', target: 'All' });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async (skip = 0) => {
        try {
            if (skip === 0) setLoading(true);
            else setPageLoading(true);

            // Initial load skip=0, limit=4. After that limit=10.
            const limit = skip === 0 ? 4 : 10;
            const res = await api.get(`/admin/stats?limit=${limit}&skip=${skip}`);

            if (skip === 0) {
                setStats(res.data.data);
            } else {
                setStats(prev => ({
                    ...res.data.data,
                    recentActivity: [...prev.recentActivity, ...res.data.data.recentActivity]
                }));
            }

            setLoading(false);
            setPageLoading(false);
        } catch (error) {
            console.error("Error fetching admin stats", error);
            setLoading(false);
            setPageLoading(false);
            const msg = error.response?.data?.message || error.message || "Unknown error";
            toast.error(`Dashboard Error: ${msg}`);
        }
    };

    const handleLoadMore = () => {
        const nextSkip = stats.recentActivity.length;
        fetchStats(nextSkip);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await api.patch('/auth/update-profile', profileFormData);
            updateUser(profileFormData);
            toast.success('Profile updated successfully');
            setIsEditProfile(false);
        } catch (error) {
            console.error("Update Profile Error:", error);
            toast.error('Failed to update profile: ' + (error.response?.data?.message || error.message));
        }
    };

    const openProfile = () => {
        if (user) {
            setProfileFormData({
                name: user.name,
                dob: (user.dob && !isNaN(new Date(user.dob).getTime()))
                    ? new Date(user.dob).toISOString().split('T')[0]
                    : '',
                sex: user.sex || 'Male',
                address: user.address || '',
                employeeType: user.employeeType || 'Full-time',
                profileImage: user.profileImage || '',
                designation: user.designation || '',
                department: user.department || ''
            });
            setIsProfileModalOpen(true);
        }
    };

    const calculateAge = (dob) => {
        if (!dob) return '-';
        const birthDate = new Date(dob);
        if (isNaN(birthDate.getTime())) return '-';
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileFormData({ ...profileFormData, profileImage: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans">
            {/* Dark Professional Navbar from Image 1 */}
            <nav className="bg-[#0f172a] text-white px-8 h-20 flex items-center justify-between sticky top-0 z-50 border-b border-white/5 shadow-xl glass-morphism">
                <div className="flex items-center space-x-10">
                    <div className="flex items-center space-x-4 cursor-pointer group" onClick={() => navigate('/dashboard')}>
                        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-110 transition-transform">T</div>
                        <div className="flex flex-col">
                            <span className="text-lg font-black tracking-tight leading-none">Tyro Avaitor</span>
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Control Center</span>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-slate-800 hidden md:block"></div>

                    <div className="hidden md:flex items-center space-x-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/attendance-report')}>Reports</span>
                        <span className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/employees')}>Teams</span>
                        <span className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/permissions')}>Leaves</span>
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    <div className="hidden lg:flex flex-col items-end border-r border-slate-800 pr-6">
                        <span className="text-sm font-bold text-white">{user?.name}</span>
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{user?.role} • {user?.employeeId}</span>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 text-slate-400 hover:text-rose-500 transition-all text-[10px] font-black uppercase tracking-widest bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-800"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                    </button>

                    <div className="relative">
                        {user?.profileImage ? (
                            <img src={user.profileImage} alt="Profile" className="w-10 h-10 rounded-2xl object-cover border-2 border-indigo-500/20 shadow-lg" />
                        ) : (
                            <div className="w-10 h-10 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 font-black text-sm border border-slate-700 shadow-lg">
                                {user?.name?.charAt(0)}
                            </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0f172a] shadow-sm"></div>
                    </div>
                </div>
            </nav>

            {loading && (
                <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[100] flex items-center justify-center">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-bold animate-pulse tracking-widest uppercase text-xs">Synchronizing Dashboard...</p>
                    </div>
                </div>
            )}

            <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-6 md:py-10 pt-20 md:pt-20">

                {/* Top Stat Cards from Image 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
                    <div
                        onClick={() => navigate('/employees')}
                        className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-6 cursor-pointer hover:bg-slate-50 transition-all hover:scale-[1.02]"
                    >
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 shadow-sm shrink-0">
                            <Users className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Employees</p>
                            <div className="flex items-center space-x-2">
                                <span className="text-3xl font-black text-slate-800">{stats.totalUsers}</span>
                                <ChevronRight className="w-5 h-5 text-slate-300" />
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={() => navigate('/attendance-report')}
                        className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-6 cursor-pointer hover:bg-slate-50 transition-all hover:scale-[1.02]"
                    >
                        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 shadow-sm shrink-0">
                            <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Present Today</p>
                            <div className="flex items-baseline space-x-2">
                                <span className="text-3xl font-black text-slate-800">{stats.activeToday}</span>
                                <span className="text-xs font-bold text-green-500 uppercase">Active</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 font-bold italic">Click for detailed report →</p>
                        </div>
                    </div>

                    <div
                        onClick={() => navigate('/permissions')}
                        className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-6 cursor-pointer hover:bg-slate-50 transition-all hover:scale-[1.02]"
                    >
                        <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 shadow-sm shrink-0">
                            <AlertCircle className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Requests</p>
                            <div className="flex items-center space-x-2">
                                <span className="text-lg font-black text-slate-800 tracking-tight">Manage</span>
                                <ChevronRight className="w-5 h-5 text-slate-300" />
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={() => navigate('/week-offs')}
                        className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-6 cursor-pointer hover:bg-slate-50 transition-all hover:scale-[1.02]"
                    >
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm shrink-0">
                            <Calendar className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Week Offs</p>
                            <div className="flex items-center space-x-2">
                                <span className="text-lg font-black text-slate-800 tracking-tight">Assign</span>
                                <ChevronRight className="w-5 h-5 text-slate-300" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Section from Image 1 */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-5 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center bg-white border-b border-slate-50 space-y-4 md:space-y-0">
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Recent Attendance</h2>
                        <div className="flex items-center space-x-3 w-full md:w-auto">
                            <button className="bg-[#f8fafc] text-[#64748b] px-4 py-2 rounded-lg text-xs font-bold border border-slate-100 hover:bg-slate-100 transition-colors w-full md:w-auto">
                                Export Report
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-[#f8fafc] text-[#94a3b8] text-[10px] font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 md:px-8 py-4">Employee</th>
                                    <th className="px-5 md:px-8 py-4">Date</th>
                                    <th className="px-5 md:px-8 py-4">Login</th>
                                    <th className="px-5 md:px-8 py-4">Logout</th>
                                    <th className="px-5 md:px-8 py-4">Total Hrs</th>
                                    <th className="px-5 md:px-8 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan="6" className="p-8 text-center text-slate-400">Loading data...</td></tr>
                                ) : stats.recentActivity.length === 0 ? (
                                    <tr><td colSpan="6" className="p-8 text-center text-slate-400">No records found today</td></tr>
                                ) : (
                                    stats.recentActivity.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-5 md:px-8 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px]">
                                                        {log.user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-700">{log.user.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold">{log.user.employeeId || 'EMP'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 md:px-8 py-4 text-xs font-medium text-slate-500">
                                                {(!isNaN(new Date(log.updatedAt).getTime()))
                                                    ? new Date(log.updatedAt).toLocaleDateString()
                                                    : '-'}
                                            </td>
                                            <td className="px-5 md:px-8 py-4 text-xs font-bold text-slate-700">
                                                {(log.loginTime && !isNaN(new Date(log.loginTime).getTime()))
                                                    ? new Date(log.loginTime).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true })
                                                    : '--:--'}
                                            </td>
                                            <td className="px-5 md:px-8 py-4 text-xs font-bold text-slate-700">
                                                {(log.logoutTime && !isNaN(new Date(log.logoutTime).getTime()))
                                                    ? new Date(log.logoutTime).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true })
                                                    : '--:--'}
                                            </td>
                                            <td className="px-5 md:px-8 py-4 text-xs font-bold text-green-600">
                                                {log.totalHours ? `${log.totalHours} Hrs` : '--'}
                                            </td>
                                            <td className="px-5 md:px-8 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <span className="bg-green-50 text-green-500 text-[10px] font-bold px-3 py-1 rounded-md">Present</span>
                                                    {log.isLate && (
                                                        <span className="text-orange-400 text-[10px] font-bold">(Late)</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {stats.pagination?.hasMore && (
                        <div className="p-8 border-t border-slate-50 text-center">
                            <button
                                onClick={handleLoadMore}
                                disabled={pageLoading}
                                className="text-sm font-bold text-[#3b82f6] hover:text-blue-700 transition-colors flex items-center justify-center space-x-2 mx-auto disabled:opacity-50"
                            >
                                {pageLoading ? (
                                    <span>Loading...</span>
                                ) : (
                                    <>
                                        <span>Show More Results</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Profile Modal */}
                {isProfileModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden"
                        >
                            <div className="bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] p-8 text-white relative">
                                <button
                                    onClick={() => { setIsProfileModalOpen(false); setIsEditProfile(false); }}
                                    className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <div className="flex items-center space-x-6">
                                    {user?.profileImage ? (
                                        <img src={user.profileImage} alt="Avatar" className="w-20 h-20 rounded-[1.5rem] object-cover border-4 border-white/20 shadow-xl" />
                                    ) : (
                                        <div className="w-20 h-20 rounded-[1.5rem] bg-white text-[#3b82f6] flex items-center justify-center text-3xl font-bold shadow-xl border-4 border-white/20">
                                            {user?.name?.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <h2 className="text-2xl font-bold">{user?.name}</h2>
                                        <p className="text-blue-100 font-medium">{user?.designation || 'Administrator'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar text-slate-600">
                                {!isEditProfile ? (
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin ID</p>
                                                <p className="text-sm font-bold text-slate-700">{user?.employeeId}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Age / Sex</p>
                                                <p className="text-sm font-bold text-slate-700">{calculateAge(user?.dob)}Y / {user?.sex || '-'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Email</p>
                                                <p className="text-sm font-bold text-[#3b82f6] truncate">{user?.email}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Access Role</p>
                                                <p className="text-sm font-bold text-indigo-600 capitalize">{user?.role}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</p>
                                                <p className="text-sm font-bold text-slate-700">{user?.department || '-'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Joining Date</p>
                                                <p className="text-sm font-bold text-green-600">
                                                    {(user?.joiningDate && !isNaN(new Date(user.joiningDate).getTime()))
                                                        ? new Date(user.joiningDate).toLocaleDateString()
                                                        : 'Initial Member'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 p-6 rounded-2xl relative">
                                            <button
                                                onClick={() => setIsEditProfile(true)}
                                                className="absolute top-6 right-6 bg-white border border-slate-100 text-[#3b82f6] text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                                            >
                                                Edit Profile
                                            </button>
                                            <div className="space-y-4">
                                                <div className="pt-4 border-t border-slate-200">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Home Address</p>
                                                    <p className="text-xs font-semibold text-slate-500 mt-1">{user?.address || 'No address provided'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full bg-red-50 text-red-500 font-bold py-4 rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            <span>Logout System</span>
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                                <input
                                                    className="input-premium mt-1 border-slate-100"
                                                    value={profileFormData.name}
                                                    onChange={e => setProfileFormData({ ...profileFormData, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="md:col-span-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Profile Photo</label>
                                                <div
                                                    onClick={() => document.getElementById('adminProfileUpload').click()}
                                                    className="mt-1 h-[52px] border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all overflow-hidden"
                                                >
                                                    {profileFormData.profileImage ? (
                                                        <div className="flex items-center space-x-2">
                                                            <img src={profileFormData.profileImage} className="w-8 h-8 rounded-lg object-cover" />
                                                            <span className="text-[10px] font-bold text-blue-500">Change Photo</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center space-x-2 text-slate-400">
                                                            <User className="w-4 h-4" />
                                                            <span className="text-[10px] font-bold">Upload Local Photo</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <input
                                                    type="file"
                                                    id="adminProfileUpload"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">DOB</label>
                                                <input
                                                    type="date"
                                                    className="input-premium mt-1 border-slate-100"
                                                    value={profileFormData.dob}
                                                    onChange={e => setProfileFormData({ ...profileFormData, dob: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Sex</label>
                                                <select
                                                    className="input-premium mt-1 border-slate-100"
                                                    value={profileFormData.sex}
                                                    onChange={e => setProfileFormData({ ...profileFormData, sex: e.target.value })}
                                                >
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Address</label>
                                                <textarea
                                                    className="input-premium mt-1 border-slate-100 min-h-[80px]"
                                                    value={profileFormData.address}
                                                    onChange={e => setProfileFormData({ ...profileFormData, address: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex space-x-3 pt-4 border-t">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditProfile(false)}
                                                className="flex-1 py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 bg-[#3b82f6] text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>


        </div>
    );
};

export default AdminDashboard;
