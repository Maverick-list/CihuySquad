import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function GlassCard({ children, className, ...props }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={twMerge(
                'glass-card rounded-2xl p-6 backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 shadow-lg',
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    )
}
