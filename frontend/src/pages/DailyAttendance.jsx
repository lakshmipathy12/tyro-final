import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';
import * as XLSX from 'xlsx';
import { Download, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

const DailyAttendance = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        fetchAttendance();
    }, [selectedDate]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/attendance/daily-report?date=${selectedDate}`);
            setAttendanceData(res.data.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching daily report", error);
            setLoading(false);
        }
    };

    const handleExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(attendanceData.map(record => ({
            "Employee ID": record.user.employeeId,
            "Name": record.user.name,
            "Department": record.user.department,
            "Date": format(new Date(record.date), 'yyyy-MM-dd'),
            "Login Time": record.loginTime ? format(new Date(record.loginTime), 'HH:mm:ss') : '-',
            "Logout Time": record.logoutTime ? format(new Date(record.logoutTime), 'HH:mm:ss') : '-',
            "Status": record.status,
            "Total Hours": record.totalHours || 0,
            "Mode": record.workMode,
            "Late": record.isLate ? 'Yes' : 'No'
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
        XLSX.writeFile(workbook, `Attendance_Report_${selectedDate}.xlsx`);
    };

    const filteredData = attendanceData.filter(item => {
        if (filterStatus === 'All') return true;
        return item.status === filterStatus;
    });

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Daily Attendance</h1>
                        <p className="text-slate-500">View and manage daily records.</p>
                    </div>
                    <div className="flex space-x-3 mt-4 md:mt-0">
                        <input
                            type="date"
                            className="input-premium py-2 px-4 w-auto"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                        <button
                            onClick={handleExport}
                            className="btn-premium flex items-center space-x-2 py-2 bg-green-600 hover:bg-green-700 from-green-600 to-green-700"
                        >
                            <Download className="w-4 h-4" />
                            <span>Export (XLSX)</span>
                        </button>
                    </div>
                </div>

                <div className="card-premium p-6">
                    {/* Filters */}
                    <div className="flex items-center space-x-4 mb-6 border-b border-slate-100 pb-4">
                        <Filter className="w-5 h-5 text-slate-400" />
                        <span className="font-semibold text-slate-600">Filter Status:</span>
                        {['All', 'Present', 'Absent', 'Half_Day'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filterStatus === status
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-slate-400 text-sm border-b border-slate-100">
                                    <th className="py-4 font-semibold">Employee</th>
                                    <th className="py-4 font-semibold">Mode</th>
                                    <th className="py-4 font-semibold">Login Time</th>
                                    <th className="py-4 font-semibold">Logout Time</th>
                                    <th className="py-4 font-semibold">Hours</th>
                                    <th className="py-4 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-slate-400">Loading records...</td>
                                    </tr>
                                ) : filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-slate-400">No records found for this date.</td>
                                    </tr>
                                ) : (
                                    filteredData.map((record) => (
                                        <tr key={record.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                                        {record.user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-800 text-sm">{record.user.name}</p>
                                                        <p className="text-xs text-slate-400">{record.user.employeeId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-2 py-1 rounded-md text-xs font-medium border ${record.workMode === 'Office'
                                                        ? 'bg-blue-50 text-blue-600 border-blue-100'
                                                        : 'bg-purple-50 text-purple-600 border-purple-100'
                                                    }`}>
                                                    {record.workMode}
                                                </span>
                                            </td>
                                            <td className="py-4 text-slate-600 text-sm">
                                                {record.loginTime ? format(new Date(record.loginTime), 'hh:mm a') : '-'}
                                                {record.isLate && <span className="ml-2 text-[10px] text-red-500 font-bold bg-red-50 px-1 rounded">LATE</span>}
                                            </td>
                                            <td className="py-4 text-slate-600 text-sm">
                                                {record.logoutTime ? format(new Date(record.logoutTime), 'hh:mm a') : '-'}
                                            </td>
                                            <td className="py-4">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm font-bold text-slate-700 w-8">{record.totalHours}</span>
                                                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-indigo-500 rounded-full"
                                                            style={{ width: `${Math.min((record.totalHours / 9) * 100, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${record.status === 'Present' ? 'bg-green-100 text-green-700' :
                                                        record.status === 'Absent' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DailyAttendance;
