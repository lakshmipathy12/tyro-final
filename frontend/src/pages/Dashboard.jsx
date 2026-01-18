import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Clock, MapPin, Laptop, LogOut, User, LayoutGrid, Coffee, AlertCircle, CheckCircle2, Calendar, ClipboardCheck, X, Camera } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [attendance, setAttendance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [locationLoading, setLocationLoading] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isEditProfile, setIsEditProfile] = useState(false);
    const [profileFormData, setProfileFormData] = useState({});
    const [isAnnounceModalOpen, setIsAnnounceModalOpen] = useState(false);
    const [announceData, setAnnounceData] = useState({ title: '', message: '', target: 'All', recipientEmail: '' });
    const [showWorkModeSelect, setShowWorkModeSelect] = useState(false);
    const [selectedMode, setSelectedMode] = useState(null);

    const OFFICE_LOCATIONS = [
        { lat: 13.119129, lng: 80.15127, name: 'Main Office' },
        { lat: 13.1068797, lng: 79.9229042, name: 'Secondary Office' }
    ];
    const ALLOWED_RADIUS = 100;

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (user) {
            fetchAnnouncements();
            fetchTodayAttendance();
        }
    }, [user]);

    const fetchTodayAttendance = async () => {
        try {
            const res = await api.get('/attendance/today');
            setAttendance(res.data.data);
            if (!res.data.data) {
                setShowWorkModeSelect(true);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching today attendance", error);
            setLoading(false);
        }
    };

    const fetchAnnouncements = async () => {
        try {
            const res = await api.get('/announcements');
            setAnnouncements(res.data.data);
        } catch (error) {
            console.error("Error fetching announcements", error);
        }
    };

    const handleClockIn = async (mode) => {
        if (mode === 'Office') {
            if (!navigator.geolocation) {
                toast.error("Geolocation is not supported");
                return;
            }
            setLocationLoading(true);
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    submitClockIn(mode, { lat: latitude, lng: longitude });
                    setLocationLoading(false);
                    setShowWorkModeSelect(false);
                },
                () => {
                    setLocationLoading(false);
                    toast.error("Location access denied. Office check-in requires location.");
                }
            );
        } else {
            submitClockIn(mode);
            setShowWorkModeSelect(false);
        }
    };

    const submitClockIn = async (mode, locationData = null) => {
        try {
            const response = await api.post('/attendance/clock-in', { mode, location: locationData });
            setAttendance(response.data.data);
            toast.success(`Clocked in (${mode})`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Clock-in failed");
        }
    };

    const handleClockOut = async () => {
        try {
            const response = await api.post('/attendance/clock-out');
            setAttendance(response.data.data);
            toast.success("Clocked out");
        } catch (error) {
            toast.error(error.response?.data?.message || "Clock-out failed");
        }
    };

    const handlePostAnnouncement = async (e) => {
        e.preventDefault();
        try {
            await api.post('/announcements', announceData);
            toast.success('Announcement posted!');
            setIsAnnounceModalOpen(false);
            setAnnounceData({ title: '', message: '', target: 'All', recipientEmail: '' });
            fetchAnnouncements(); // Refresh list
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to post announcement');
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await api.patch('/auth/update-profile', profileFormData);
            updateUser(profileFormData);
            setIsEditProfile(false);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error("Update Profile Error:", error);
            toast.error('Failed to update profile');
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

    const handleLogout = async () => {
        await logout();
        navigate('/login');
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

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
            {/* Professional Navbar from Image 0 */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 h-20 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-tr from-[#3b82f6] to-[#2dd4bf] rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
                        T
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-black tracking-tight text-slate-800 leading-none">Tyro Avaitor</span>
                        <span className="text-[10px] font-black text-[#3b82f6] uppercase tracking-[0.2em] mt-0.5">Workforce</span>
                    </div>
                </div>

                <div className="flex items-center space-x-10">
                    <div className="hidden md:flex items-center space-x-8">
                        <button
                            onClick={openProfile}
                            className="flex items-center space-x-2 text-slate-500 hover:text-[#3b82f6] text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            <User className="w-4 h-4" />
                            <span>My Profile</span>
                        </button>

                        {user?.role?.toLowerCase().includes('admin') && (
                            <button
                                onClick={() => navigate('/admin')}
                                className="flex items-center space-x-2 text-slate-500 hover:text-[#3b82f6] text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                <LayoutGrid className="w-4 h-4" />
                                <span>Control Center</span>
                            </button>
                        )}
                    </div>

                    <div className="flex items-center space-x-6 border-l pl-10 border-slate-100">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-black text-slate-800 leading-none">{user?.name || 'User'}</p>
                            <p className="text-[10px] text-[#3b82f6] uppercase tracking-widest font-black mt-1">
                                {user?.role || 'Member'} • {user?.employeeId}
                            </p>
                        </div>
                        <div className="relative group cursor-pointer" onClick={openProfile}>
                            {user?.profileImage ? (
                                <img src={user.profileImage} alt="Profile" className="w-11 h-11 rounded-2xl object-cover border-2 border-white shadow-xl group-hover:border-[#3b82f6] transition-all" />
                            ) : (
                                <div className="w-11 h-11 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 font-black text-sm border-2 border-transparent group-hover:border-[#3b82f6] transition-all shadow-inner">
                                    {user?.name?.charAt(0)}
                                </div>
                            )}
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-white"></div>
                        </div>
                        <button onClick={handleLogout} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-[1400px] mx-auto px-10 py-10">
                {/* Dashboard Header */}
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-1">Dashboard</h1>
                        <p className="text-slate-500 text-sm">Welcome back, here's your activity for today.</p>
                    </div>

                    {/* Floating Clock Display */}
                    <div className="bg-white border border-slate-100 rounded-2xl px-8 py-3 shadow-sm flex items-center space-x-3">
                        <Clock className="w-6 h-6 text-[#3b82f6]" />
                        <span className="text-2xl font-medium tracking-tight text-slate-700">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    </div>
                </div>

                {/* 3-Column Grid Layout from Image 0 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Card 1: Today's Attendance */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-50/50"
                    >
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Today's Attendance</h3>

                        <div className="space-y-10">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Clock In</p>
                                    <p className="text-xl font-bold text-slate-800">
                                        {(attendance?.loginTime && !isNaN(new Date(attendance.loginTime).getTime()))
                                            ? new Date(attendance.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            : (attendance ? '-' : 'Not Marked')}
                                    </p>
                                </div>
                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${attendance?.workMode === 'Remote' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {attendance?.workMode || 'Office'}
                                </span>
                            </div>

                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Clock Out</p>
                                    <p className="text-xl font-bold text-slate-800">
                                        {(attendance?.logoutTime && !isNaN(new Date(attendance.logoutTime).getTime()))
                                            ? new Date(attendance.logoutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            : '-'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Hours</p>
                                    <p className="text-xl font-bold text-green-500">{attendance?.totalHours || '0.00'} Hrs</p>
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-between">
                                <div className="flex space-x-2">
                                    {attendance && (
                                        <>
                                            {attendance.isLate && (
                                                <span className="bg-orange-50 text-orange-500 text-[10px] font-bold px-3 py-1 rounded-md flex items-center space-x-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    <span>Late</span>
                                                </span>
                                            )}
                                            <span className="bg-green-50 text-green-500 text-[10px] font-bold px-3 py-1 rounded-md">Present</span>
                                        </>
                                    )}
                                </div>
                                {!attendance && !loading && (
                                    <div className="flex space-x-2">
                                        <button onClick={() => handleClockIn('Office')} className="bg-[#3b82f6] text-white text-[10px] font-bold px-4 py-2 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all">Clock In (Office)</button>
                                        <button onClick={() => handleClockIn('Remote')} className="bg-slate-800 text-white text-[10px] font-bold px-4 py-2 rounded-xl shadow-lg shadow-slate-500/20 hover:bg-slate-700 transition-all">Remote</button>
                                    </div>
                                )}
                                {attendance && !attendance.logoutTime && (
                                    <button onClick={handleClockOut} className="bg-red-500 text-white text-[10px] font-bold px-6 py-2 rounded-xl shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all">Clock Out</button>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2: Quick Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-50/50 flex flex-col"
                    >
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Quick Stats</h3>

                        <div className="space-y-6 flex-1">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-slate-800">1</p>
                                    <p className="text-xs text-slate-400 font-medium">Working Days (M)</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-500">
                                    <Coffee className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-slate-800">0</p>
                                    <p className="text-xs text-slate-400 font-medium">Leaves Taken</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/permissions')}
                            className="mt-8 w-full border border-blue-100 text-slate-600 font-semibold py-3 rounded-2xl hover:bg-blue-50 hover:border-blue-200 transition-all text-sm"
                        >
                            Request Leave / Permission
                        </button>
                    </motion.div>

                    {/* Card 3: Announcements */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-50/50 flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Announcements</h3>
                            {(user?.role === 'Admin' || user?.role === 'HR_Admin') && (
                                <button
                                    onClick={() => setIsAnnounceModalOpen(true)}
                                    className="text-[10px] bg-[#3b82f6] text-white px-3 py-1 rounded-full font-bold hover:bg-blue-600 transition-colors"
                                >
                                    + New
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 max-h-[300px]">
                            {announcements.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                                    <ClipboardCheck className="w-8 h-8 mb-2" />
                                    <p className="text-sm font-semibold">No new announcements.</p>
                                </div>
                            ) : (
                                <div className="w-full space-y-4">
                                    {announcements.map(ann => (
                                        <div key={ann.id} className="text-left p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-blue-200 transition-colors">
                                            <p className="text-sm font-bold text-slate-800 flex items-center justify-between">
                                                <span>{ann.title}</span>
                                                {ann.target === 'Individual' && (
                                                    <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Direct</span>
                                                )}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ann.message}</p>
                                            <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center opacity-60">
                                                <span className="text-[9px] font-bold uppercase">{ann.sender?.name || 'Admin'}</span>
                                                <span className="text-[9px]">
                                                    {(!isNaN(new Date(ann.createdAt).getTime()))
                                                        ? new Date(ann.createdAt).toLocaleDateString()
                                                        : '-'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>

                </div>
            </div>

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
                                <div className="relative group">
                                    {profileFormData.profileImage ? (
                                        <img
                                            src={profileFormData.profileImage}
                                            alt="Profile"
                                            className="w-24 h-24 rounded-3xl object-cover shadow-2xl border-4 border-white/20 group-hover:opacity-75 transition-opacity cursor-pointer"
                                            onClick={() => document.getElementById('profileUpload').click()}
                                        />
                                    ) : (
                                        <div
                                            onClick={() => document.getElementById('profileUpload').click()}
                                            className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-2xl border-4 border-white/20 hover:scale-105 transition-all cursor-pointer"
                                        >
                                            {user?.name?.charAt(0)}
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        id="profileUpload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg text-indigo-600 pointer-events-none group-hover:scale-110 transition-transform">
                                        <Camera className="w-4 h-4" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{user?.name}</h2>
                                    <p className="text-blue-100 font-medium">{user?.designation || 'Team Member'}</p>
                                    <p className="text-[10px] text-blue-200 mt-1 uppercase tracking-widest font-black">{user?.role} • {user?.department || 'Department'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar text-slate-600">
                            {!isEditProfile ? (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee ID</p>
                                            <p className="text-sm font-bold text-slate-700">{user?.employeeId}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Age / Sex</p>
                                            <p className="text-sm font-bold text-slate-700">{calculateAge(user?.dob)}Y / {user?.sex || '-'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee Type</p>
                                            <p className="text-sm font-bold text-slate-700">{user?.employeeType || 'Full-time'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                                            <p className="text-sm font-bold text-[#3b82f6] truncate">{user?.email}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</p>
                                            <p className="text-sm font-bold text-slate-700">{user?.department || '-'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Joining Date</p>
                                            <p className="text-sm font-bold text-[#3b82f6] italic">
                                                {(user?.joiningDate && !isNaN(new Date(user.joiningDate).getTime()))
                                                    ? new Date(user.joiningDate).toLocaleDateString()
                                                    : 'Joined'}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shift Time</p>
                                            <p className="text-sm font-bold text-indigo-600">{user?.shiftTime || '09:00 - 18:00'}</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-6 rounded-2xl flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-3 bg-white rounded-xl shadow-sm">
                                                <MapPin className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Work Address</p>
                                                <p className="text-xs font-semibold text-slate-600 mt-0.5">{user?.address || 'No address provided'}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setIsEditProfile(true)}
                                            className="bg-white border border-slate-100 text-[#3b82f6] text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                                        >
                                            Edit Details
                                        </button>
                                    </div>

                                    <button
                                        onClick={logout}
                                        className="w-full bg-red-50 text-red-500 font-bold py-4 rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span>Logout safely</span>
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
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Employee Type</label>
                                            <input
                                                className="input-premium mt-1 border-slate-100"
                                                placeholder="e.g. Full-time"
                                                value={profileFormData.employeeType}
                                                onChange={e => setProfileFormData({ ...profileFormData, employeeType: e.target.value })}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Profile Photo</label>
                                            <div
                                                onClick={() => document.getElementById('profileUpload').click()}
                                                className="mt-1 h-[60px] border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center cursor-pointer hover:border-[#3b82f6] hover:bg-blue-50 transition-all bg-slate-50/50"
                                            >
                                                {profileFormData.profileImage ? (
                                                    <div className="flex items-center space-x-3">
                                                        <img src={profileFormData.profileImage} className="w-10 h-10 rounded-xl object-cover shadow-sm" />
                                                        <span className="text-xs font-bold text-[#3b82f6]">Photo selected (click to change)</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center space-x-2 text-slate-400">
                                                        <Camera className="w-4 h-4" />
                                                        <span className="text-[10px] font-bold">Upload Local Photo</span>
                                                    </div>
                                                )}
                                            </div>
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
                                            className="flex-1 bg-[#3b82f6] text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/10"
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

            {/* Announcement Modal */}
            {isAnnounceModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 overflow-hidden"
                    >
                        <h2 className="text-xl font-bold mb-6 text-slate-800">Post New Announcement</h2>
                        <form onSubmit={handlePostAnnouncement}>
                            <div className="space-y-4">
                                <div className="flex space-x-4">
                                    <div className="flex-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Target Audience</label>
                                        <select
                                            className="input-premium mt-1 py-3"
                                            value={announceData.target}
                                            onChange={e => setAnnounceData({ ...announceData, target: e.target.value })}
                                        >
                                            <option value="All">Everyone</option>
                                            <option value="Individual">Specific Person</option>
                                        </select>
                                    </div>
                                    {announceData.target === 'Individual' && (
                                        <div className="flex-[2]">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">User Email ID</label>
                                            <input
                                                className="input-premium mt-1 py-3"
                                                placeholder="Enter recipient email..."
                                                required
                                                value={announceData.recipientEmail}
                                                onChange={e => setAnnounceData({ ...announceData, recipientEmail: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Title</label>
                                    <input
                                        className="input-premium mt-1 py-3"
                                        placeholder="What's the update?"
                                        required
                                        value={announceData.title}
                                        onChange={e => setAnnounceData({ ...announceData, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Message</label>
                                    <textarea
                                        className="input-premium mt-1 py-3 min-h-[100px] resize-none"
                                        placeholder="Detailed message..."
                                        required
                                        value={announceData.message}
                                        onChange={e => setAnnounceData({ ...announceData, message: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setIsAnnounceModalOpen(false)}
                                    className="px-6 py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-[#3b82f6] text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all"
                                >
                                    Post Update
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Work Mode Selection Modal */}
            {showWorkModeSelect && !attendance && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-10 text-center"
                    >
                        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-[#3b82f6] mx-auto mb-8 shadow-inner">
                            <Clock className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 mb-2">Good Morning!</h2>
                        <p className="text-slate-500 mb-10 font-medium">Please select your work mode for today to start tracking.</p>

                        <div className="grid grid-cols-2 gap-6">
                            <button
                                onClick={() => handleClockIn('Office')}
                                disabled={locationLoading}
                                className="group relative flex flex-col items-center p-8 rounded-3xl border-2 border-slate-100 hover:border-[#3b82f6] hover:bg-blue-50/50 transition-all"
                            >
                                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-[#3b82f6] mb-4 group-hover:scale-110 transition-transform">
                                    <MapPin className="w-7 h-7" />
                                </div>
                                <span className="text-sm font-bold text-slate-700">Work Office</span>
                                <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">100m Range</span>
                            </button>

                            <button
                                onClick={() => handleClockIn('Remote')}
                                disabled={locationLoading}
                                className="group relative flex flex-col items-center p-8 rounded-3xl border-2 border-slate-100 hover:border-slate-800 hover:bg-slate-50 transition-all"
                            >
                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-800 mb-4 group-hover:scale-110 transition-transform">
                                    <Laptop className="w-7 h-7" />
                                </div>
                                <span className="text-sm font-bold text-slate-700">Work Home</span>
                                <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">No Limits</span>
                            </button>
                        </div>

                        {locationLoading && (
                            <div className="mt-8 flex items-center justify-center space-x-3 text-blue-500">
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-xs font-bold uppercase tracking-widest">Checking Location...</span>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
