import { GlassCard } from '../components/ui/GlassCard'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Cloud, Droplets, Thermometer, Wind } from 'lucide-react'
import { motion } from 'framer-motion'

const tempData = [
    { time: '00:00', temp: 26, humidity: 80 },
    { time: '04:00', temp: 25, humidity: 85 },
    { time: '08:00', temp: 28, humidity: 75 },
    { time: '12:00', temp: 32, humidity: 60 },
    { time: '16:00', temp: 30, humidity: 65 },
    { time: '20:00', temp: 27, humidity: 78 },
    { time: '24:00', temp: 26, humidity: 82 },
]

const floodRiskData = [
    { region: 'Jakarta', risk: 85 },
    { region: 'Bogor', risk: 65 },
    { region: 'Depok', risk: 70 },
    { region: 'Tangerang', risk: 50 },
    { region: 'Bekasi', risk: 60 },
]

export default function Monitor() {
    return (
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">Monitor Iklim Realtime</h1>
                <p className="text-slate-400 mt-2">Data sensor IoT dan prediksi AI untuk cuaca ekstrem.</p>
            </motion.div>

            {/* Sensor Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Suhu', val: '32°C', icon: Thermometer, color: 'text-red-400', sub: 'Terasa 36°C' },
                    { label: 'Kelembaban', val: '65%', icon: Droplets, color: 'text-blue-400', sub: 'Menurun' },
                    { label: 'Angin', val: '12 km/h', icon: Wind, color: 'text-slate-400', sub: 'Arah Barat' },
                    { label: 'Curah Hujan', val: '0 mm', icon: Cloud, color: 'text-indigo-400', sub: 'Cerah Berawan' },
                ].map((item, i) => (
                    <GlassCard key={i} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-slate-500 text-sm font-medium">{item.label}</span>
                            <item.icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{item.val}</div>
                        <div className="text-xs text-slate-400">{item.sub}</div>
                    </GlassCard>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <GlassCard className="lg:col-span-2 min-h-[400px]">
                    <h3 className="text-lg font-semibold text-white mb-6">Tren Suhu & Kelembaban (24 Jam)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={tempData}>
                                <defs>
                                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                                <XAxis dataKey="time" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                />
                                <Area type="monotone" dataKey="temp" stroke="#f87171" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" name="Suhu (°C)" />
                                <Area type="monotone" dataKey="humidity" stroke="#60a5fa" strokeWidth={3} fillOpacity={1} fill="url(#colorHum)" name="Kelembaban (%)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                <GlassCard>
                    <h3 className="text-lg font-semibold text-white mb-6">Risiko Banjir Regional</h3>
                    <div className="space-y-6">
                        {floodRiskData.map((d, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-300">{d.region}</span>
                                    <span className={d.risk > 70 ? 'text-red-400 font-bold' : 'text-emerald-400'}>{d.risk}%</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${d.risk}%` }}
                                        transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                        className={`h-full rounded-full ${d.risk > 70 ? 'bg-red-500' : d.risk > 50 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
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
