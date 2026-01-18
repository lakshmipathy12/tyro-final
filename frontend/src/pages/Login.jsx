import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Activity, Users, Shield } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const success = await login(email, password);
        setIsSubmitting(false);

        if (success) {
            navigate('/dashboard');
        }
    };

    // 3D Dashboard Illustration Component (CSS-only)
    const DashboardPreview = () => (
        <div className="relative w-full h-full flex items-center justify-center perspective-1000 overflow-hidden bg-slate-900">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 opacity-90"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            {/* 3D Scene Container */}
            <div className="relative w-[500px] h-[400px] transform-style-3d rotate-y-12 rotate-x-6 scale-90">

                {/* Main Base Card */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Mock Header */}
                    <div className="h-12 border-b border-white/10 flex items-center px-4 space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    {/* Mock Content */}
                    <div className="p-6 grid grid-cols-2 gap-4 flex-1">
                        <div className="col-span-2 h-24 bg-white/5 rounded-lg border border-white/5 p-4 relative overflow-hidden">
                            <div className="absolute top-0 left-0 h-1 w-2/3 bg-gradient-to-r from-green-400 to-emerald-500"></div>
                            <div className="flex justify-between items-center text-white/80">
                                <span>Total Workforce</span>
                                <Users className="w-5 h-5 text-indigo-300" />
                            </div>
                            <div className="mt-2 text-3xl font-bold text-white">1,284</div>
                            <div className="text-xs text-white/40 mt-1">+12% from last month</div>
                        </div>

                        <div className="h-32 bg-white/5 rounded-lg border border-white/5 p-4 relative overflow-hidden">
                            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-orange-400 to-red-500"></div>
                            <div className="flex justify-between items-center text-white/80">
                                <span>Performance</span>
                                <Activity className="w-5 h-5 text-orange-300" />
                            </div>
                            {/* Mock Chart Bars */}
                            <div className="mt-4 flex items-end space-x-2 h-16 opacity-80">
                                <div className="w-2 bg-white/20 h-[60%] rounded-t"></div>
                                <div className="w-2 bg-indigo-500 h-[80%] rounded-t"></div>
                                <div className="w-2 bg-white/20 h-[40%] rounded-t"></div>
                                <div className="w-2 bg-indigo-500 h-[70%] rounded-t"></div>
                                <div className="w-2 bg-white/20 h-[50%] rounded-t"></div>
                            </div>
                        </div>

                        <div className="h-32 bg-white/5 rounded-lg border border-white/5 p-4 relative overflow-hidden">
                            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-400 to-cyan-500"></div>
                            <div className="flex justify-between items-center text-white/80">
                                <span>Security</span>
                                <Shield className="w-5 h-5 text-cyan-300" />
                            </div>
                            <div className="mt-4 flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full border-4 border-cyan-500/30 border-t-cyan-500 animate-spin"></div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Floating Element 1 - Notification */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="absolute -right-12 top-10 w-48 bg-white/20 backdrop-blur-xl rounded-lg p-3 border border-white/30 shadow-lg transform translate-z-20"
                >
                    <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        </div>
                        <div className="text-xs text-white">
                            <div className="font-semibold">System Online</div>
                            <div className="text-white/60">All services active</div>
                        </div>
                    </div>
                </motion.div>

                {/* Floating Element 2 - User Card */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="absolute -left-12 bottom-20 w-48 bg-white/20 backdrop-blur-xl rounded-lg p-3 border border-white/30 shadow-lg transform translate-z-10"
                >
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-200">
                            LK
                        </div>
                        <div className="text-xs text-white">
                            <div className="font-semibold">Laksh K.</div>
                            <div className="text-white/60">Administrator</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex w-full">
            {/* Left: Interactive 3D Mockup */}
            <div className="hidden lg:block w-1/2 relative bg-slate-900 border-r border-white/10 shadow-2xl z-10">
                <DashboardPreview />
            </div>

            {/* Right: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
                {/* Background Orbs for Form Side */}
                <div className="gradient-orb w-64 h-64 bg-indigo-400/20 top-10 right-10 mix-blend-multiply"></div>
                <div className="gradient-orb w-64 h-64 bg-purple-400/20 bottom-10 left-10 mix-blend-multiply"></div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="card-premium w-full max-w-md p-6 md:p-10 relative z-20"
                >
                    <div className="mb-6 md:mb-8 text-center">
                        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">Tyro</h1>
                        <p className="text-slate-500 font-medium">Workforce Management System</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-600 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 disabled:opacity-50" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-premium pl-12"
                                    placeholder="name@company.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-600 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-premium pl-12"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-premium w-full flex items-center justify-center space-x-2 font-bold tracking-wide"
                        >
                            <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
                            {!isSubmitting && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate('/register')}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                            New Organization? <span className="font-bold underline decoration-2 underline-offset-2">Create Admin Account</span>
                        </button>
                    </div>

                    <div className="mt-8 text-center text-sm text-slate-400">
                        <p>Protected by Tyro Security Systems</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
