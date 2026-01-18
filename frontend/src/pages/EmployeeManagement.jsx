import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';
import { toast } from 'react-toastify';
import { UserPlus, Edit2, Trash2, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    // Form State
    const initialFormState = {
        name: '', email: '', password: '', employeeId: '',
        role: 'Employee', department: '', designation: '',
        dob: '', sex: 'Male', address: '', employeeType: 'Full-time',
        joiningDate: new Date().toISOString().split('T')[0],
        shiftTime: '09:00 AM - 06:00 PM',
        profileImage: ''
    };
    const [formData, setFormData] = useState(initialFormState);
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/admin/employees');
            setEmployees(res.data.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleOpenModal = (employee = null) => {
        if (employee) {
            setIsEditMode(true);
            setFormData({
                ...employee,
                password: '',
                dob: employee.dob ? new Date(employee.dob).toISOString().split('T')[0] : '',
                joiningDate: employee.joiningDate ? new Date(employee.joiningDate).toISOString().split('T')[0] : initialFormState.joiningDate
            });
            setSelectedId(employee.id);
        } else {
            setIsEditMode(false);
            setFormData(initialFormState);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await api.patch(`/admin/employees/${selectedId}`, formData);
                toast.success('Employee updated successfully');
            } else {
                await api.post('/auth/register', formData);
                toast.success('Employee created successfully');
            }
            setIsModalOpen(false);
            fetchEmployees();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error processing request');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            try {
                await api.delete(`/admin/employees/${id}`);
                toast.success('Employee deleted');
                setEmployees(employees.filter(emp => emp.id !== id));
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error deleting employee');
            }
        }
    };

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'All' || emp.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 space-y-4 md:space-y-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Employee Management</h1>
                    <button
                        onClick={() => handleOpenModal()}
                        className="btn-premium flex items-center space-x-2 w-full md:w-auto justify-center"
                    >
                        <UserPlus className="w-5 h-5" />
                        <span>Add Employee</span>
                    </button>
                </div>

                <div className="card-premium p-4 md:p-6">
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                className="input-premium pl-12"
                                placeholder="Search by name or ID..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <select
                                className="input-premium"
                                value={roleFilter}
                                onChange={e => setRoleFilter(e.target.value)}
                            >
                                <option value="All">All Roles</option>
                                <option value="Employee">Employees</option>
                                <option value="Admin">Admins</option>
                                <option value="HR_Admin">HR Admins</option>
                                <option value="Manager_Admin">Managers</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-slate-400 text-sm border-b border-slate-100">
                                    <th className="py-4 font-semibold">Name</th>
                                    <th className="py-4 font-semibold">ID</th>
                                    <th className="py-4 font-semibold">Role</th>
                                    <th className="py-4 font-semibold">Department</th>
                                    <th className="py-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan="5" className="py-8 text-center text-slate-400">Loading...</td></tr>
                                ) : filteredEmployees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 font-medium text-slate-800">{emp.name}</td>
                                        <td className="py-4 text-slate-500">{emp.employeeId}</td>
                                        <td className="py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${emp.role === 'Admin' ? 'bg-indigo-100 text-indigo-700' :
                                                emp.role === 'HR_Admin' ? 'bg-rose-100 text-rose-700' :
                                                    emp.role === 'Manager_Admin' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-slate-100 text-slate-700'
                                                }`}>
                                                {emp.role.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-4 text-slate-600">{emp.department || '-'}</td>
                                        <td className="py-4 flex space-x-2">
                                            <button
                                                onClick={() => handleOpenModal(emp)}
                                                className="p-2 rounded-full hover:bg-indigo-50 text-indigo-500 transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(emp.id)}
                                                className="p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-800">
                                    {isEditMode ? 'Edit Employee' : 'Add New Employee'}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-slate-600">Full Name</label>
                                    <input
                                        type="text" required
                                        className="input-premium mt-1 py-3"
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-600">Employee ID</label>
                                    <input
                                        type="text" required
                                        className="input-premium mt-1 py-3"
                                        value={formData.employeeId} onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-600">Email</label>
                                    <input
                                        type="email" required
                                        className="input-premium mt-1 py-3"
                                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                {!isEditMode && (
                                    <div>
                                        <label className="text-sm font-semibold text-slate-600">Password</label>
                                        <input
                                            type="password" required
                                            className="input-premium mt-1 py-3"
                                            value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm font-semibold text-slate-600">Role</label>
                                    <select
                                        className="input-premium mt-1 py-3"
                                        value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="Employee">Employee</option>
                                        <option value="Admin">Admin</option>
                                        <option value="HR_Admin">HR Admin</option>
                                        <option value="Manager_Admin">Manager</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-600">Department</label>
                                    <input
                                        type="text"
                                        className="input-premium mt-1 py-3"
                                        value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-600">Designation</label>
                                    <input
                                        type="text"
                                        className="input-premium mt-1 py-3"
                                        value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-semibold text-slate-600">Profile Image URL</label>
                                    <input
                                        type="text" placeholder="https://..."
                                        className="input-premium mt-1 py-3"
                                        value={formData.profileImage} onChange={e => setFormData({ ...formData, profileImage: e.target.value })}
                                    />
                                </div>
                                <div className="border-t border-slate-50 md:col-span-2 mt-4 pt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    Additional Personal Details
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-600">DOB</label>
                                    <input
                                        type="date"
                                        className="input-premium mt-1 py-3"
                                        value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-600">Sex</label>
                                    <select
                                        className="input-premium mt-1 py-3"
                                        value={formData.sex} onChange={e => setFormData({ ...formData, sex: e.target.value })}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-semibold text-slate-600">Address</label>
                                    <textarea
                                        className="input-premium mt-1 py-3 min-h-[80px]"
                                        value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-600">Employee Type</label>
                                    <input
                                        type="text" placeholder="e.g. Full-time, Intern"
                                        className="input-premium mt-1 py-3"
                                        value={formData.employeeType} onChange={e => setFormData({ ...formData, employeeType: e.target.value })}
                                    />
                                </div>
                                <div className="border-t border-slate-50 md:col-span-2 mt-4 pt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    Employment Fixed Details (Admin Only)
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-600">Joining Date</label>
                                    <input
                                        type="date"
                                        className="input-premium mt-1 py-3 bg-slate-50"
                                        value={formData.joiningDate} onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-600">Shift Time</label>
                                    <input
                                        type="text"
                                        className="input-premium mt-1 py-3 bg-slate-50"
                                        value={formData.shiftTime} onChange={e => setFormData({ ...formData, shiftTime: e.target.value })}
                                    />
                                </div>

                                <div className="md:col-span-2 mt-4">
                                    <button type="submit" className="btn-premium w-full">
                                        {isEditMode ? 'Update Employee' : 'Create Account'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EmployeeManagement;
