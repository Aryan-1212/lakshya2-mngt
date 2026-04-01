import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaGear, FaRightFromBracket, FaHammer } from 'react-icons/fa6';
import { motion } from 'framer-motion';

const Lockdown = () => {
    const { logout } = useAuth();

    return (
        <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background cinematic effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-900/20 blur-[130px] rounded-full" 
                />
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.05, 0.15, 0.05] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-900/10 blur-[110px] rounded-full" 
                />
            </div>

            {/* Content Container */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="max-w-2xl w-full text-center z-10 space-y-12"
            >
                {/* Icon Section */}
                <div className="flex justify-center">
                    <div className="relative">
                        <motion.div
                            animate={{ 
                                scale: [1, 1.05, 1],
                                rotate: [0, 3, -3, 0]
                            }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <div className="relative">
                                <FaGear className="w-24 h-24 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-spin-slow" />
                                <motion.div
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="absolute -top-2 -right-2"
                                >
                                    <FaHammer className="w-8 h-8 text-amber-600" />
                                </motion.div>
                            </div>
                        </motion.div>
                        <motion.div 
                            animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0, 0.15] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute inset-0 w-24 h-24 bg-amber-500/20 blur-2xl rounded-full" 
                        />
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-6">
                    <motion.h1 
                        initial={{ tracking: "0.1em", opacity: 0 }}
                        animate={{ tracking: "-0.01em", opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="text-6xl md:text-7xl font-black text-white uppercase italic leading-none"
                    >
                        UNDER <br />
                        <span className="text-amber-500 underline decoration-amber-900/50 decoration-8 underline-offset-8">MAINTENANCE</span>
                    </motion.h1>
                    
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="space-y-4"
                    >
                        <p className="text-amber-500/80 text-lg md:text-xl font-bold tracking-[0.2em] uppercase">
                            System Status: Scheduled Maintenance
                        </p>
                        <div className="h-[2px] w-32 bg-gradient-to-r from-transparent via-amber-700 to-transparent mx-auto" />
                        <p className="text-gray-400 text-lg font-medium italic max-w-lg mx-auto leading-relaxed">
                            "We're currently performing some essential system upgrades. Our engineering team is hard at work making sure everything is running smoother than ever. We'll be back online in a heartbeat."
                        </p>
                    </motion.div>
                </div>

                {/* Actions */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                    className="pt-4"
                >
                    <button
                        onClick={logout}
                        className="group relative flex items-center justify-center gap-3 px-12 py-4 bg-transparent border border-amber-900/30 text-amber-600/70 font-bold uppercase tracking-[0.2em] overflow-hidden transition-all duration-500 hover:border-amber-500 hover:text-white mx-auto shadow-xl hover:shadow-amber-500/10"
                    >
                        <div className="absolute inset-0 bg-amber-600 flex translate-y-full items-center justify-center transition-transform duration-500 group-hover:translate-y-0" />
                        <span className="relative z-10 flex items-center gap-3">
                            <FaRightFromBracket className="w-5 h-5 group-hover:animate-bounce" />
                            Log Out & Check Back Later
                        </span>
                    </button>
                    
                    <div className="mt-8 flex flex-col items-center gap-2">
                        <p className="text-[10px] text-gray-600 tracking-[0.4em] uppercase">
                            System Status: Performing Maintenance
                        </p>
                        <div className="flex gap-1">
                           {[...Array(3)].map((_, i) => (
                               <motion.div 
                                    key={i}
                                    animate={{ opacity: [0.2, 1, 0.2] }}
                                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                                    className="w-1.5 h-1.5 rounded-full bg-amber-700"
                                />
                           ))}
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Subtle Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#888_1px,transparent_1px),linear-gradient(to_bottom,#888_1px,transparent_1px)] bg-[size:40px_40px] z-50" />
            
            {/* Dark Vignette */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
        </div>
    );
};

export default Lockdown;

