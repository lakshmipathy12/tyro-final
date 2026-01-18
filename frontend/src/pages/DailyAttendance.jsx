import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';
import * as XLSX from 'xlsx';
import { Download, Search, Filter, Calendar as CalendarIcon, PieChart } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const DailyAttendance = () => {
    // We now support Date Range
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    // Data States
    const [attendanceData, setAttendanceData] = useState([]);
    const [summaryData, setSummaryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchReport();
    }, [startDate, endDate]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            // New endpoint supporting ranges
            const res = await api.get(`/attendance/report?startDate=${startDate}&endDate=${endDate}`);
            setAttendanceData(res.data.data);
            setSummaryData(res.data.summary);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching report", error);
            setLoading(false);
        }
    };

    const handleExport = () => {
        // Prepare Export Data
        const exportData = attendanceData.map(record => ({
            "Employee ID": record.user.employeeId,
            "Name": record.user.name,
            "Date": format(new Date(record.date), 'dd-MM-yyyy'),
            "Login Time": record.loginTime ? format(new Date(record.loginTime), 'hh:mm a') : '-',
            "Logout Time": record.logoutTime ? format(new Date(record.logoutTime), 'hh:mm a') : '-',
            "Total Hours": record.totalHours || 0,
            "Status": record.status,
            "Mode": record.workMode,
            "Late": record.isLate ? 'Yes' : 'No'
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Log");

        // Optional: Add Summary Sheet
        const summaryExport = summaryData.map(s => ({
            "Name": s.user.name,
            "Employee ID": s.user.employeeId,
            "Present Days": s.present,
            "Leaves/Permissions": s.permissions,
            "Half Days": s.halfDay,
            "Late Days": s.late
        }));
        const summarySheet = XLSX.utils.json_to_sheet(summaryExport);
        XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary Stats");

        XLSX.writeFile(workbook, `Attendance_Report_${startDate}_to_${endDate}.xlsx`);
    };

    // Filter Logic
    const filteredRecords = attendanceData.filter(item => {
        const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
        const matchesSearch = item.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.user.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const formatDuration = (hoursDecimal) => {
        if (!hoursDecimal) return '0h 0m';
        const h = Math.floor(hoursDecimal);
        const m = Math.round((hoursDecimal - h) * 60);
        return `${h}h ${m}m`;
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
            <div className="max-w-[1600px] mx-auto">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Attendance Reports</h1>
                        <p className="text-slate-500 text-sm mt-1">Generate detailed attendance logs and analaytics.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center space-x-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                            <CalendarIcon className="w-4 h-4 text-slate-400" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none"
                            />
                            <span className="text-slate-300">-</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none"
                            />
                        </div>
                        <button
                            onClick={handleExport}
                            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                        >
                            <Download className="w-4 h-4" />
                            <span>Export Data</span>
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Just calculating totals from the current view */}
                    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Days</p>
                                <h3 className="text-3xl font-black text-slate-800 mt-1">{filteredRecords.length}</h3>
                            </div>
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500"><CalendarIcon className="w-5 h-5" /></div>
                        </div>
                        <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-full"></div>
                        </div>
                    </div>

                    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Present</p>
                                <h3 className="text-3xl font-black text-slate-800 mt-1">
                                    {filteredRecords.filter(r => r.status === 'Present').length}
                                </h3>
                            </div>
                            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-500"><CalendarIcon className="w-5 h-5" /></div>
                        </div>
                        <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 w-[80%]"></div>
                        </div>
                    </div>

                    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Late Arrivals</p>
                                <h3 className="text-3xl font-black text-slate-800 mt-1">
                                    {filteredRecords.filter(r => r.isLate).length}
                                </h3>
                            </div>
                            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500"><PieChart className="w-5 h-5" /></div>
                        </div>
                        <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 w-[30%]"></div>
                        </div>
                    </div>

                    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Hours</p>
                                <h3 className="text-3xl font-black text-slate-800 mt-1">
                                    {filteredRecords.length > 0
                                        ? (filteredRecords.reduce((acc, curr) => acc + (curr.totalHours || 0), 0) / filteredRecords.length).toFixed(1)
                                        : '0.0'
                                    }
                                </h3>
                            </div>
                            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500"><CalendarIcon className="w-5 h-5" /></div>
                        </div>
                        <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 w-[60%]"></div>
                        </div>
                    </div>
                </div>

                {/* Main Table Card */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                    {/* Toolbar */}
                    <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto no-scrollbar">
                            {['All', 'Present', 'Absent', 'Half_Day'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${filterStatus === status
                                            ? 'bg-slate-800 text-white shadow-lg shadow-slate-200'
                                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search employee..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                <tr>
                                    <th className="px-8 py-5">Employee</th>
                                    <th className="px-8 py-5">Date</th>
                                    <th className="px-8 py-5">Shift Timing</th>
                                    <th className="px-8 py-5">Duration</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    [1, 2, 3].map(i => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-8 py-6"><div className="h-10 w-40 bg-slate-100 rounded-xl"></div></td>
                                            <td className="px-8 py-6"><div className="h-4 w-24 bg-slate-100 rounded-lg"></div></td>
                                            <td className="px-8 py-6"><div className="h-4 w-32 bg-slate-100 rounded-lg"></div></td>
                                            <td className="px-8 py-6"><div className="h-4 w-16 bg-slate-100 rounded-lg"></div></td>
                                            <td className="px-8 py-6"><div className="h-8 w-20 bg-slate-100 rounded-lg"></div></td>
                                        </tr>
                                    ))
                                ) : filteredRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center">
                                            <div className="flex flex-col items-center justify-center opacity-40">
                                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                                    <Search className="w-8 h-8 text-slate-400" />
                                                </div>
                                                <p className="font-bold text-slate-600">No records found</p>
                                                <p className="text-sm text-slate-400">Try adjusting your date range or filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecords.map((record) => (
                                        <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-100">
                                                        {record.user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{record.user.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400">{record.user.employeeId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-700">
                                                        {format(new Date(record.date), 'dd MMM yyyy')}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                        {format(new Date(record.date), 'EEEE')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center space-x-3 text-xs font-semibold text-slate-600">
                                                    <div className="px-3 py-1 bg-green-50 text-green-600 rounded-lg border border-green-100">
                                                        {record.loginTime ? format(new Date(record.loginTime), 'hh:mm a') : '--:--'}
                                                    </div>
                                                    <span className="text-slate-300">→</span>
                                                    <div className="px-3 py-1 bg-red-50 text-red-500 rounded-lg border border-red-100">
                                                        {record.logoutTime ? format(new Date(record.logoutTime), 'hh:mm a') : '--:--'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-800">{formatDuration(record.totalHours)}</span>
                                                    <span className="text-[10px] font-medium text-slate-400">Logged Hours</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${record.status === 'Present' ? 'bg-green-100 text-green-700' :
                                                            record.status === 'Absent' ? 'bg-red-100 text-red-700' :
                                                                'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {record.status}
                                                    </span>
                                                    {record.isLate && (
                                                        <span className="px-2 py-1 bg-orange-50 text-orange-600 text-[10px] font-bold rounded-md border border-orange-100">
                                                            Late
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline">
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Individual Summary (Optional: Show below table or in modal) */}
                <div className="mt-12">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 px-2">Individual Performance Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {summaryData.map((stat, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-500 font-bold">
                                            {stat.user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">{stat.user.name}</h3>
                                            <p className="text-xs text-slate-400 font-bold">{stat.user.employeeId}</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 px-3 py-1 rounded-lg">
                                        <span className="text-xs font-bold text-slate-500">{Math.floor(stat.totalHours)}h Total</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="bg-green-50 p-3 rounded-xl">
                                        <p className="text-xl font-black text-green-500">{stat.present}</p>
                                        <p className="text-[9px] font-bold text-green-400 uppercase">Present</p>
                                    </div>
                                    <div className="bg-orange-50 p-3 rounded-xl">
                                        <p className="text-xl font-black text-orange-500">{stat.late}</p>
                                        <p className="text-[9px] font-bold text-orange-400 uppercase">Late</p>
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded-xl">
                                        <p className="text-xl font-black text-blue-500">{stat.permissions}</p>
                                        <p className="text-[9px] font-bold text-blue-400 uppercase">Permit</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DailyAttendance;
