import { LoadingScreen } from '../components/LoadingScreen'
import { Navbar } from '../components/Navbar'
import { ChatWidget } from '../components/ChatWidget'
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

export function MainLayout({ children }) {
    const [loading, setLoading] = useState(true)
    const location = useLocation()

    useEffect(() => {
        // Artificial loading simulation for "Premium" feel on first load
        const timer = setTimeout(() => setIsGlobalLoading(false), 2000)
        return () => clearTimeout(timer)
    }, [])

    // We can manage global loading state here if we want a splash screen
    // For now, let's just show it on mount.
    // Actually, let's use a simpler approach:
    const [isGlobalLoading, setIsGlobalLoading] = useState(true);

    return (
        <div className="bg-background min-h-screen text-foreground overflow-x-hidden relative">
            <AnimatePresence>
                {isGlobalLoading && <LoadingScreen />}
            </AnimatePresence>

            {!isGlobalLoading && (
                <>
                    <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background pointer-events-none z-0" />
                    <Navbar />
                    <ChatWidget />
                    <main className="relative z-10 pt-24 px-4 pb-20 max-w-7xl mx-auto min-h-[calc(100vh-80px)]">
                        {children}
                    </main>

                    <footer className="relative z-10 py-8 border-t border-white/5 text-center text-slate-500 text-sm">
                        <p>&copy; 2026 GreenVision AI. Built for Impact.</p>
                    </footer>
                </>
            )}
        </div>
    )
}
