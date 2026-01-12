import { motion } from 'framer-motion'
import { Leaf } from 'lucide-react'

export function LoadingScreen() {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
        >
            <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Pulsing Rings */}
                <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full border-2 border-primary/30"
                />
                <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0.2, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                    className="absolute inset-2 rounded-full border-2 border-secondary/30"
                />

                {/* Central Logo */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/40"
                >
                    <Leaf className="w-10 h-10 text-white" fill="currentColor" />
                </motion.div>
            </div>

            <motion.h2
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="mt-8 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
            >
                GreenVision AI
            </motion.h2>
            <p className="mt-2 text-slate-500 text-sm">Initializing System...</p>
        </motion.div>
    )
}
