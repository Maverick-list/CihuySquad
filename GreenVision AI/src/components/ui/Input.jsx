import { forwardRef } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const Input = forwardRef(({ className, icon: Icon, ...props }, ref) => {
    return (
        <div className="relative w-full">
            {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Icon className="w-5 h-5" />
                </div>
            )}
            <input
                ref={ref}
                className={twMerge(
                    'w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all',
                    Icon && 'pl-10',
                    className
                )}
                {...props}
            />
        </div>
    )
})
Input.displayName = "Input"
