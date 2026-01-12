import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Home, Cloud, Zap, Trees, X, User, Menu } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { clsx } from 'clsx'
import { Button } from './ui/Button'

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const location = useLocation()

    const navItems = [
        { name: 'Beranda', path: '/', icon: Home },
        { name: 'Monitor Iklim', path: '/monitor', icon: Cloud },
        { name: 'Energi & Karbon', path: '/energy', icon: Zap },
        { name: 'Lingkungan', path: '/environment', icon: Trees },
    ]

    const toggleMenu = () => setIsOpen(!isOpen)
    const closeMenu = () => setIsOpen(false)

    return (
        <>
            <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center gap-4 shadow-xl">
                <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <Leaf className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-white hidden md:block">GreenVision AI</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-6 mx-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                "text-sm font-medium transition-colors hover:text-primary",
                                location.pathname === item.path ? "text-primary" : "text-slate-400"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Auth Buttons (Desktop) */}
                <div className="hidden md:flex items-center gap-2 pl-4 border-l border-white/10">
                    <Link to="/auth?mode=login">
                        <Button variant="ghost" className="text-sm px-4 py-1.5 h-auto">Masuk</Button>
                    </Link>
                </div>

                {/* Mobile Toggle (Central Hub Trigger) */}
                <button onClick={toggleMenu} className="md:hidden w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Menu className="w-5 h-5" />
                </button>
            </nav>

            {/* Fullscreen Overlay Menu (Mobile) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8"
                    >
                        <button
                            onClick={closeMenu}
                            className="absolute top-8 right-8 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="grid gap-6 w-full max-w-sm">
                            {navItems.map((item, index) => (
                                <Link key={item.path} to={item.path} onClick={closeMenu}>
                                    <motion.div
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={clsx(
                                            "flex items-center gap-4 p-4 rounded-xl border border-transparent hover:border-primary/30 hover:bg-primary/10 transition-all",
                                            location.pathname === item.path ? "bg-primary/20 border-primary/50" : "bg-white/5"
                                        )}
                                    >
                                        <item.icon className={clsx("w-6 h-6", location.pathname === item.path ? "text-primary" : "text-slate-400")} />
                                        <span className="text-lg font-medium text-white">{item.name}</span>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>

                        <div className="mt-8 flex gap-4 w-full max-w-sm">
                            <Link to="/auth?mode=login" className="flex-1" onClick={closeMenu}>
                                <Button variant="outline" className="w-full">Masuk</Button>
                            </Link>
                            <Link to="/auth?mode=register" className="flex-1" onClick={closeMenu}>
                                <Button className="w-full">Daftar</Button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
