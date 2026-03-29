import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaShieldHalved, FaRightFromBracket } from 'react-icons/fa6';
import { motion } from 'framer-motion';

const Lockdown = () => {
    const { logout } = useAuth();

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background cinematic effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-900/40 blur-[130px] rounded-full" 
                />
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.05, 0.2, 0.05] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-900/30 blur-[110px] rounded-full" 
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
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <FaShieldHalved className="w-28 h-28 text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]" />
                        </motion.div>
                        <motion.div 
                            animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 w-28 h-28 bg-red-600/30 blur-2xl rounded-full" 
                        />
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-6">
                    <motion.h1 
                        initial={{ tracking: "0.2em", opacity: 0 }}
                        animate={{ tracking: "-0.02em", opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="text-7xl md:text-8xl font-black text-white uppercase italic leading-none"
                    >
                        Face the <br />
                        <span className="text-red-700 underline decoration-red-900/50 decoration-8 underline-offset-8">Consequences</span>
                    </motion.h1>
                    
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="space-y-4"
                    >
                        <p className="text-gray-400 text-xl md:text-2xl font-semibold tracking-[0.2em] uppercase">
                            Total Lockdown Initiated
                        </p>
                        <div className="h-[1px] w-24 bg-red-800 mx-auto" />
                        <p className="text-gray-500 text-lg font-medium italic max-w-lg mx-auto leading-relaxed">
                            "The gates are sealed. The shadows have claimed this domain. Your presence here is no longer authorized."
                        </p>
                    </motion.div>
                </div>

                {/* Actions */}
                <motion.div 
                    initial={{ opacity: 0, s: 0.9 }}
                    animate={{ opacity: 1, s: 1 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                    className="pt-4"
                >
                    <button
                        onClick={logout}
                        className="group relative flex items-center justify-center gap-3 px-12 py-4 bg-transparent border border-gray-800 text-gray-400 font-bold uppercase tracking-[0.3em] overflow-hidden transition-all duration-500 hover:border-red-600 hover:text-white mx-auto shadow-2xl"
                    >
                        <div className="absolute inset-0 bg-red-600 flex translate-y-full items-center justify-center transition-transform duration-500 group-hover:translate-y-0" />
                        <span className="relative z-10 flex items-center gap-3">
                            <FaRightFromBracket className="w-5 h-5 group-hover:animate-pulse" />
                            Abandon Access
                        </span>
                    </button>
                    
                    <p className="mt-8 text-[10px] text-gray-700 tracking-[0.5em] uppercase">
                        System Status: Critically Compromised
                    </p>
                </motion.div>
            </motion.div>

            {/* CRT Flicker Overlay Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-50 animate-pulse" />
            
            {/* Dark Vignette */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.9)_100%)]" />
        </div>
    );
};

export default Lockdown;
