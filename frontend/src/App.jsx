import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import DailyAttendance from './pages/DailyAttendance';
import PermissionManagement from './pages/PermissionManagement';
import EmployeeManagement from './pages/EmployeeManagement';
import WeekOffManagement from './pages/WeekOffManagement';

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="min-h-screen relative overflow-hidden text-slate-800 bg-slate-50">
                    {/* Global Background Orbs - Reduced Intensity */}
                    <div className="gradient-orb w-[500px] h-[500px] bg-purple-200/40 top-0 left-0 -translate-x-1/2 -translate-y-1/2 mix-blend-multiply blur-3xl pointer-events-none"></div>
                    <div className="gradient-orb w-[500px] h-[500px] bg-indigo-200/40 bottom-0 right-0 translate-x-1/2 translate-y-1/2 mix-blend-multiply animation-delay-2000 blur-3xl pointer-events-none"></div>

                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Logic inside components helps redirect if not authorized, or we could add ProtectedRoute wrapper later */}
                        <Route path="/dashboard" element={<Dashboard />} />

                        {/* Admin Routes */}
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/attendance-report" element={<DailyAttendance />} />
                        <Route path="/permissions" element={<PermissionManagement />} />
                        <Route path="/employees" element={<EmployeeManagement />} />
                        <Route path="/week-offs" element={<WeekOffManagement />} />

                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
