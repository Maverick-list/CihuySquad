import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function Button({ children, className, variant = 'primary', ...props }) {
    const variants = {
        primary: 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20',
        secondary: 'bg-secondary hover:bg-secondary-hover text-white shadow-lg shadow-secondary/20',
        outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary/10',
        glass: 'glass-button text-white',
        ghost: 'bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-white',
    }

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={twMerge(
                'px-6 py-2.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2',
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </motion.button>
    )
}
