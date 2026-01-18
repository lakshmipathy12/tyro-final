import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';
import { toast } from 'react-toastify';
import { Calendar, Trash2 } from 'lucide-react';

const WeekOffManagement = () => {
    const [weekOffs, setWeekOffs] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({ userId: '', dayOfWeek: '0', type: 'Full' });
    const [loading, setLoading] = useState(true);

    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [woRes, empRes] = await Promise.all([
                api.get('/weekoffs'),
                api.get('/admin/employees')
            ]);
            setWeekOffs(woRes.data.data);
            setEmployees(empRes.data.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        try {
            await api.post('/weekoffs', formData);
            toast.success("Week-off assigned successfully");
            fetchData(); // refresh list
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error assigning week-off');
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/weekoffs/${id}`);
            toast.success("Week-off removed");
            setWeekOffs(weekOffs.filter(w => w.id !== id));
        } catch (error) {
            toast.error("Error removing week-off");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-800 mb-8">Week-Off Management</h1>

                {/* Assignment Card */}
                <div className="card-premium p-6 mb-8">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">Assign New Week-Off</h2>
                    <form onSubmit={handleAssign} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="text-sm font-semibold text-slate-600 mb-1 block">Employee</label>
                            <select
                                className="input-premium py-3"
                                required
                                value={formData.userId}
                                onChange={e => setFormData({ ...formData, userId: e.target.value })}
                            >
                                <option value="">Select Employee</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.employeeId})</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 w-full">
                            <label className="text-sm font-semibold text-slate-600 mb-1 block">Day</label>
                            <select
                                className="input-premium py-3"
                                value={formData.dayOfWeek}
                                onChange={e => setFormData({ ...formData, dayOfWeek: e.target.value })}
                            >
                                {DAYS.map((day, idx) => (
                                    <option key={idx} value={idx}>{day}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 w-full">
                            <label className="text-sm font-semibold text-slate-600 mb-1 block">Type</label>
                            <select
                                className="input-premium py-3"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="Full">Full Day</option>
                                <option value="Alternate">Alternate</option>
                            </select>
                        </div>
                        <button type="submit" className="btn-premium mb-[2px] h-[52px]">Assign</button>
                    </form>
                </div>

                {/* List */}
                <div className="space-y-4">
                    {loading ? <p className="text-center text-slate-400">Loading...</p> :
                        weekOffs.length === 0 ? <p className="text-center text-slate-400">No week-offs assigned yet.</p> :
                            weekOffs.map((wo) => (
                                <div key={wo.id} className="card-premium p-4 flex justify-between items-center group hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                            {wo.user?.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{wo.user?.name}</p>
                                            <p className="text-xs text-slate-500 flex items-center">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {DAYS[wo.dayOfWeek]} • {wo.type}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(wo.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                </div>

            </div>
        </div>
    );
};

export default WeekOffManagement;
