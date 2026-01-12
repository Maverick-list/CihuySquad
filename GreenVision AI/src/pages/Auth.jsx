import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '../components/ui/GlassCard'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Mail, Lock, User, ArrowRight } from 'lucide-react'
import { useSearchParams, useNavigate } from 'react-router-dom'

export default function Auth() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const mode = searchParams.get('mode') || 'login'
    const isLogin = mode === 'login'

    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)
            navigate('/')
        }, 1500)
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <GlassCard className="w-full max-w-md p-8 relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                <div className="relative z-10">
                    <h2 className="text-3xl font-bold text-white mb-2">{isLogin ? 'Selamat Datang' : 'Buat Akun'}</h2>
                    <p className="text-slate-400 mb-8">{isLogin ? 'Masuk untuk akses dashboard.' : 'Bergabunglah dengan komunitas hijau.'}</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence mode='wait'>
                            {!isLogin && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    key="name-field"
                                >
                                    <Input icon={User} placeholder="Nama Lengkap" required />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Input icon={Mail} type="email" placeholder="Email Address" required />
                        <Input icon={Lock} type="password" placeholder="Password" required />

                        <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                            {isLoading ? 'Memproses...' : (isLogin ? 'Masuk' : 'Daftar')} <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-400">
                        {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
                        <button
                            onClick={() => navigate(`/auth?mode=${isLogin ? 'register' : 'login'}`)}
                            className="text-primary hover:text-primary-hover font-bold hover:underline"
                        >
                            {isLogin ? 'Daftar Sekarang' : 'Masuk Disini'}
                        </button>
                    </div>
                </div>
            </GlassCard>
        </div>
    )
}
