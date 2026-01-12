import { GlassCard } from '../components/ui/GlassCard'
import { motion } from 'framer-motion'
import { Trees, Trash2, Wind } from 'lucide-react'

export default function Environment() {
    return (
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-green-600">Kesehatan Lingkungan</h1>
                <p className="text-slate-400 mt-2">Manajemen limbah, kualitas udara, dan keanekaragaman hayati.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Air Quality */}
                <GlassCard className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
                    <div className="flex items-center gap-4 mb-6">
                        <Wind className="w-8 h-8 text-emerald-400" />
                        <h3 className="text-xl font-bold text-white">Kualitas Udara</h3>
                    </div>

                    <div className="flex items-center justify-center py-8">
                        <div className="relative w-48 h-48 rounded-full border-8 border-slate-700 flex items-center justify-center">
                            <div className="text-center">
                                <span className="text-5xl font-black text-white">45</span>
                                <div className="text-emerald-400 font-medium">Baik (AQI)</div>
                            </div>
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                                <circle
                                    cx="50%" cy="50%" r="calc(50% - 4px)"
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="8"
                                    strokeDasharray="289" // 2 * pi * r approx
                                    strokeDashoffset="100" // (100 - val)/100 * 289
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div>
                            <div className="text-slate-500">PM2.5</div>
                            <div className="text-white font-bold">12 µg</div>
                        </div>
                        <div>
                            <div className="text-slate-500">PM10</div>
                            <div className="text-white font-bold">24 µg</div>
                        </div>
                        <div>
                            <div className="text-slate-500">CO</div>
                            <div className="text-white font-bold">0.4 ppm</div>
                        </div>
                    </div>
                </GlassCard>

                {/* Waste Management */}
                <GlassCard>
                    <div className="flex items-center gap-4 mb-8">
                        <Trash2 className="w-8 h-8 text-orange-400" />
                        <h3 className="text-xl font-bold text-white">Statistik Limbah</h3>
                    </div>

                    <div className="space-y-6">
                        {[
                            { label: 'Organik (Kompos)', val: 65, color: 'bg-emerald-500' },
                            { label: 'Plastik (Daur Ulang)', val: 20, color: 'bg-orange-500' },
                            { label: 'Kertas', val: 10, color: 'bg-yellow-500' },
                            { label: 'Residu', val: 5, color: 'bg-red-500' },
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-300">{item.label}</span>
                                    <span className="text-white font-bold">{item.val}%</span>
                                </div>
                                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.val}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                        className={`h-full rounded-full ${item.color}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}
