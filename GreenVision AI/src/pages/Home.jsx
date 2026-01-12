import { motion } from 'framer-motion'
import { GlassCard } from '../components/ui/GlassCard'
import { Button } from '../components/ui/Button'
import { ArrowRight, Cloud, Zap, Trees, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Home() {
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-20"
        >
            {/* Hero Section */}
            <section className="text-center space-y-8 py-10">
                <motion.div variants={itemVariants} className="inline-block relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                    <h1 className="relative text-6xl md:text-8xl font-black tracking-tight text-white mb-4">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-blue-500">
                            GreenVision
                        </span><br />
                        AI Platform.
                    </h1>
                </motion.div>

                <motion.p variants={itemVariants} className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    Platform kecerdasan buatan lokal untuk mitigasi perubahan iklim.
                    Monitor emisi, hemat energi, dan lindungi lingkungan—semua dalam satu dasbor.
                </motion.p>

                <motion.div variants={itemVariants} className="flex justify-center gap-4">
                    <Link to="/monitor">
                        <Button className="px-8 py-4 text-lg">
                            Mulai Monitor <ArrowRight className="w-5 h-5" />
                        </Button>
                    </Link>
                    <Link to="/auth?mode=register">
                        <Button variant="outline" className="px-8 py-4 text-lg">Bergabung Sekarang</Button>
                    </Link>
                </motion.div>
            </section>

            {/* Feature Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: 'Monitor Iklim', icon: Cloud, desc: 'Prediksi cuaca & risiko bencana real-time', path: '/monitor', color: 'text-blue-400' },
                    { title: 'Energi & Karbon', icon: Zap, desc: 'Kalkulator jejak karbon & efisiensi', path: '/energy', color: 'text-yellow-400' },
                    { title: 'Lingkungan', icon: Trees, desc: 'Manajemen kualitas udara & sampah', path: '/environment', color: 'text-emerald-400' },
                    { title: 'AI Consultant', icon: MessageSquare, desc: 'Chatbot pintar untuk solusi hijau', path: '/monitor', color: 'text-purple-400' }
                ].map((feature, i) => (
                    <Link key={i} to={feature.path}>
                        <GlassCard className="h-full hover:-translate-y-2 transition-transform duration-300 cursor-pointer group">
                            <div className={`p-4 rounded-xl bg-slate-800/50 w-fit mb-6 group-hover:bg-slate-800 transition-colors`}>
                                <feature.icon className={`w-8 h-8 ${feature.color}`} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                            <p className="text-slate-400 text-sm">{feature.desc}</p>
                        </GlassCard>
                    </Link>
                ))}
            </section>

            {/* Impact Stats */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-y border-white/5">
                {[
                    { val: '1M+', label: 'Data Points' },
                    { val: '500k', label: 'Ton CO₂ Saved' },
                    { val: '100+', label: 'Komunitas' },
                    { val: '24/7', label: 'AI Monitoring' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        variants={itemVariants}
                        className="text-center"
                    >
                        <div className="text-4xl font-black text-white mb-1">{stat.val}</div>
                        <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">{stat.label}</div>
                    </motion.div>
                ))}
            </section>
        </motion.div>
    )
}
