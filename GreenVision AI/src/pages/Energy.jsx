import { GlassCard } from '../components/ui/GlassCard'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { Zap, Sun, Wind, Battery } from 'lucide-react'
import { motion } from 'framer-motion'

const energyData = [
    { name: 'Solar', value: 35, color: '#facc15' },
    { name: 'Wind', value: 25, color: '#60a5fa' },
    { name: 'Hydro', value: 20, color: '#3b82f6' },
    { name: 'Grid (Fossil)', value: 20, color: '#334155' },
]

const emissionData = [
    { month: 'Jan', co2: 120 },
    { month: 'Feb', co2: 110 },
    { month: 'Mar', co2: 90 },
    { month: 'Apr', co2: 85 },
    { month: 'May', co2: 95 },
    { month: 'Jun', co2: 75 },
]

export default function Energy() {
    return (
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">Energi & Jejak Karbon</h1>
                <p className="text-slate-400 mt-2">Analisis konsumsi energi dan efisiensi terbarukan.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Renewable Mix */}
                <GlassCard className="min-h-[400px]">
                    <h3 className="text-lg font-semibold text-white mb-4">Energy Mix</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={energyData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {energyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 text-xs text-slate-400">
                        {energyData.map((d, i) => (
                            <div key={i} className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                                {d.name}
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* CO2 Emissions */}
                <GlassCard className="lg:col-span-2 min-h-[400px]">
                    <h3 className="text-lg font-semibold text-white mb-6">Emisi Karbon Bulanan (Kg CO₂)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={emissionData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                                <XAxis dataKey="month" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
                                />
                                <Bar dataKey="co2" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
            </div>

            {/* Tips */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { icon: Sun, title: "Pasang Solar Panel", desc: "Hemat hingga 40% tagihan listrik.", color: "text-yellow-400" },
                    { icon: Wind, title: "Ventilasi Alami", desc: "Kurangi penggunaan AC di siang hari.", color: "text-blue-400" },
                    { icon: Battery, title: "Gunakan LED & IoT", desc: "Otimasi pencahayaan otomatis.", color: "text-green-400" }
                ].map((tip, i) => (
                    <GlassCard key={i} className="flex items-start gap-4 hover:bg-slate-800/80 transition-colors">
                        <div className={`p-3 rounded-lg bg-slate-900 ${tip.color}`}>
                            <tip.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white">{tip.title}</h4>
                            <p className="text-sm text-slate-400">{tip.desc}</p>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    )
}
