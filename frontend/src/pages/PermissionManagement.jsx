import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { Check, X, Clock, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';

const PermissionManagement = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin' || user?.role === 'HR_Admin';
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        type: 'Leave',
        reason: '',
        fromDate: '',
        toDate: ''
    });

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        try {
            const endpoint = isAdmin ? '/permissions/all' : '/permissions/my';
            const res = await api.get(endpoint);
            setPermissions(res.data.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching permissions", error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/permissions', formData);
            toast.success("Permission requested successfully");
            setFormData({ type: 'Leave', reason: '', fromDate: '', toDate: '' });
            fetchPermissions();
        } catch (error) {
            toast.error(error.response?.data?.message || "Error submitting request");
        }
    };

    const handleAction = async (id, status) => {
        try {
            await api.patch(`/permissions/${id}/status`, { status });
            toast.success(`Request ${status.toLowerCase()} successfully`);
            fetchPermissions();
        } catch (error) {
            toast.error("Error updating status");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-800 mb-8">
                    {isAdmin ? 'Permission Requests' : 'My Permissions'}
                </h1>

                {/* Apply Section (Only for Employees, or Admins applying for themselves) */}
                {!isAdmin && (
                    <div className="card-premium p-6 mb-8">
                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center space-x-2">
                            <PlusIcon />
                            <span>New Request</span>
                        </h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Type</label>
                                <select
                                    className="input-premium p-3 h-12"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="Leave">Leave</option>
                                    <option value="Late_Login">Late Login</option>
                                    <option value="Early_Logout">Early Logout</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Reason</label>
                                <input
                                    type="text"
                                    required
                                    className="input-premium p-3 h-12"
                                    placeholder="e.g. Doctor appointment"
                                    value={formData.reason}
                                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">From</label>
                                <input
                                    type="datetime-local"
                                    required
                                    className="input-premium p-3 h-12"
                                    value={formData.fromDate}
                                    onChange={e => setFormData({ ...formData, fromDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">To</label>
                                <input
                                    type="datetime-local"
                                    required
                                    className="input-premium p-3 h-12"
                                    value={formData.toDate}
                                    onChange={e => setFormData({ ...formData, toDate: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <button type="submit" className="btn-premium w-full">Submit Request</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* List Section */}
                <div className="space-y-4">
                    {loading ? <p className="text-center text-slate-400">Loading...</p> :
                        permissions.length === 0 ? <p className="text-center text-slate-400 py-8">No records found.</p> :
                            permissions.map((perm) => (
                                <div key={perm.id} className="card-premium p-6 flex flex-col md:flex-row justify-between items-center transition-all hover:shadow-xl">
                                    <div className="mb-4 md:mb-0">
                                        <div className="flex items-center space-x-3 mb-2">
                                            {isAdmin && (
                                                <span className="font-bold text-slate-800">{perm.user?.name}</span>
                                            )}
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide border ${perm.type === 'Leave' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                                }`}>
                                                {perm.type.replace('_', ' ')}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${perm.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                    perm.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {perm.status}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 font-medium">{perm.reason}</p>
                                        <div className="flex items-center space-x-4 mt-2 text-xs text-slate-400">
                                            <div className="flex items-center space-x-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>{format(new Date(perm.fromDate), 'MMM dd, HH:mm')}</span>
                                            </div>
                                            <span>to</span>
                                            <div className="flex items-center space-x-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>{format(new Date(perm.toDate), 'MMM dd, HH:mm')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions for Admin */}
                                    {isAdmin && perm.status === 'Pending' && (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleAction(perm.id, 'Approved')}
                                                className="p-2 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors border border-green-200"
                                                title="Approve"
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleAction(perm.id, 'Rejected')}
                                                className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200"
                                                title="Reject"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                </div>

            </div>
        </div>
    );
};

// Helper Icon
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
)

export default PermissionManagement;
