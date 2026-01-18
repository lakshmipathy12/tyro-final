import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, User, Shield, Phone, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const Register = () => {
    const navigate = useNavigate();

    // State for the "Gatekeeper" (2-Step Verification)
    const [isVerified, setIsVerified] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [verifying, setVerifying] = useState(false);

    // State for Registration
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Admin', // Default to Admin since this is an organization setup flow
        profileImage: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleVerification = (e) => {
        e.preventDefault();
        setVerifying(true);

        // Simulate a network delay for "verification"
        setTimeout(() => {
            if (verificationCode === '9962164178') {
                setIsVerified(true);
                toast.success("Security Verification Successful");
            } else {
                toast.error("Invalid Authorization Number. Access Denied.");
            }
            setVerifying(false);
        }, 1000);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await axios.post('/auth/register', formData);
            toast.success("Account Created Successfully! Please Login.");
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.error || "Registration Failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ----------------------------------------------------
    // Verification View (Step 1)
    // ----------------------------------------------------
    if (!isVerified) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 relative overflow-hidden">
                {/* Background Effects */}
                <div className="gradient-orb w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-3xl absolute -top-20 -left-20 animate-pulse"></div>
                <div className="gradient-orb w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl absolute -bottom-20 -right-20 animate-pulse animation-delay-2000"></div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card-premium w-full max-w-md p-6 md:p-8 relative z-10 border-t-4 border-indigo-500"
                >
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
                            <Shield className="w-8 h-8 text-indigo-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">Security Verification</h2>
                        <p className="text-slate-500 text-sm mt-2">
                            Restricted Access. Please enter the Master Administrator mobile number to proceed.
                        </p>
                    </div>

                    <form onSubmit={handleVerification} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                                Verified Mobile Number
                            </label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors w-5 h-5" />
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    className="input-premium pl-12 text-center text-lg tracking-widest font-mono"
                                    placeholder="99XX-XXX-XXX"
                                    maxLength={10}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={verifying}
                            className="btn-premium w-full py-3 flex items-center justify-center space-x-2"
                        >
                            {verifying ? (
                                <span className="animate-pulse">Validating Credentials...</span>
                            ) : (
                                <>
                                    <span>Verify Identity</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button onClick={() => navigate('/login')} className="text-sm text-slate-500 hover:text-indigo-600 font-medium">
                            Return to Login
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ----------------------------------------------------
    // Registration View (Step 2 - Only shown after Verification)
    // ----------------------------------------------------
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden p-4">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <div className="gradient-orb w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-premium w-full max-w-lg p-6 md:p-8 relative z-10"
            >
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                            Create Account
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">Setup your organization profile</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="flex items-center space-x-1 text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                            <CheckCircle className="w-3 h-3" />
                            <span className="text-xs font-bold">VERIFIED</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">

                    {/* Name */}
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-600 ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="input-premium pl-12"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-600 ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="input-premium pl-12"
                                placeholder="admin@company.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-600 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="input-premium pl-12"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-600 ml-1">Account Type</label>
                        <div className="relative">
                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="input-premium pl-12 appearance-none cursor-pointer"
                            >
                                <option value="Admin">System Administrator</option>
                                <option value="HR_Admin">HR Manager</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-premium w-full mt-4 flex items-center justify-center space-x-2 shadow-lg shadow-indigo-200"
                    >
                        <span>{isSubmitting ? 'Creating Profile...' : 'Complete Registration'}</span>
                        {!isSubmitting && <ArrowRight className="w-5 h-5" />}
                    </button>

                </form>

                <div className="mt-6 text-center border-t border-slate-100 pt-4">
                    <p className="text-xs text-slate-400">
                        By registering, you agree to Tyro's Terms of Service & Privacy Policy.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
