import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  MapPin,
  ChevronDown,
  ChevronUp,
  BarChart2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ISSUE_TYPES = [
  'Jalanan & Jembatan',
  'Listrik & Energi',
  'Logistik & Distribusi',
  'Sarana Air Bersih',
  'Fasilitas Umum',
  'Konektivitas Digital'
];

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('input');
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedIssues, setExpandedIssues] = useState({});
  const [issues, setIssues] = useState([
    {
      id: 1,
      type: 'Jalanan & Jembatan',
      title: 'Perbaikan Jembatan Desa Sukamaju',
      description: 'Jembatan utama penghubung antar desa terputus akibat banjir, menghambat akses warga.',
      location: 'Jawa Barat',
      impact: 9,
      urgency: 10,
      risk: 8,
      costScore: 7,
      status: 'analyzed',
      aiResponse: {
        score: 9.2,
        justification: 'Dampak sosial sangat tinggi karena memutus akses utama ekonomi warga.',
        impactAnalysis: 'Mempengaruhi 5,000+ warga secara langsung.',
        riskAnalysis: 'Risiko tinggi jika warga menyeberang tanpa fasilitas resmi.'
      }
    }
  ]);

  const toggleExpand = (id) => setExpandedIssues(prev => ({ ...prev, [id]: !prev[id] }));

  const addIssue = () => {
    const newIssue = {
      id: Date.now(),
      type: 'Jalanan & Jembatan',
      title: '',
      description: '',
      location: '',
      impact: 5,
      urgency: 5,
      risk: 5,
      costScore: 5,
      status: 'draft'
    };
    setIssues([newIssue, ...issues]);
  };

  const updateIssue = (id, field, value) => {
    setIssues(issues.map(issue => issue.id === id ? { ...issue, [field]: value } : issue));
  };

  const removeIssue = (id) => setIssues(issues.filter(issue => issue.id !== id));

  const analyzeIssues = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const analyzedIssues = issues.map(issue => {
        const score = ((issue.impact * 0.4) + (issue.urgency * 0.3) + (issue.risk * 0.2) + (issue.costScore * 0.1)).toFixed(1);
        return {
          ...issue,
          status: 'analyzed',
          aiResponse: {
            score: parseFloat(score),
            justification: `Masalah ini memerlukan perhatian ${score > 8 ? 'mendesak' : 'prioritas'}. Dampak pada wilayah ${issue.location} cukup signifikan.`,
            impactAnalysis: `Estimasi dampak pada masyarakat lokal di level ${issue.impact}/10.`,
            riskAnalysis: issue.risk > 7 ? 'Risiko tertunda sangat tinggi.' : 'Risiko dapat dimitigasi.'
          }
        };
      });
      setIssues([...analyzedIssues].sort((a, b) => b.aiResponse.score - a.aiResponse.score));
      setIsProcessing(false);
      setActiveTab('dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="nav-container relative py-4 px-6 flex items-center justify-center">
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-2">
            <button
              onClick={() => setActiveTab('input')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'input' ? 'bg-primary text-white' : 'text-text-muted hover:text-primary'}`}
            >
              Input
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'dashboard' ? 'bg-primary text-white' : 'text-text-muted hover:text-primary'}`}
            >
              Hasil
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/90 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center text-center"
            >
              <img src="/logo.png" alt="Logo" className="w-12 h-12 mb-6 animate-pulse" />
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-2 text-text-main">
                InfraVision <span className="text-primary italic">AI</span>
              </h1>
              <p className="text-text-muted text-sm md:text-base font-medium mb-8">
                Platform sederhana untuk menentukan prioritas pengerjaan infrastruktur secara objektif.
              </p>
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <span className="text-sm font-bold text-primary animate-pulse">Sedang Menganalisis...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="container animate-in">
        <AnimatePresence mode="wait">
          {activeTab === 'input' ? (
            <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Input Masalah</h2>
                <button onClick={addIssue} className="btn btn-outline text-sm">
                  <Plus className="w-4 h-4" /> Tambah Isu
                </button>
              </div>

              {issues.map((issue) => (
                <div key={issue.id} className="card">
                  <div className="flex justify-between mb-6">
                    <span className="badge">Usulan #{String(issue.id).slice(-4)}</span>
                    <button onClick={() => removeIssue(issue.id)} className="text-text-muted hover:text-primary transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="form-group">
                      <label>Judul Proyek</label>
                      <input
                        value={issue.title}
                        onChange={(e) => updateIssue(issue.id, 'title', e.target.value)}
                        placeholder="Contoh: Perbaikan Saluran Air..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label>Jenis</label>
                        <select value={issue.type} onChange={(e) => updateIssue(issue.id, 'type', e.target.value)}>
                          {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Lokasi</label>
                        <input value={issue.location} onChange={(e) => updateIssue(issue.id, 'location', e.target.value)} placeholder="Kota / Kec..." />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Deskripsi</label>
                      <textarea rows={3} value={issue.description} onChange={(e) => updateIssue(issue.id, 'description', e.target.value)} placeholder="Detail singkat..." />
                    </div>

                    <div className="pt-4 border-t border-border mt-6">
                      <label className="text-sm text-text-muted mb-4 block">Parameter Penting (1-10)</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {[
                          { label: 'Dampak Sosial', key: 'impact' },
                          { label: 'Urgensi', key: 'urgency' },
                          { label: 'Risiko', key: 'risk' },
                          { label: 'Efisiensi Biaya', key: 'costScore' }
                        ].map((param) => (
                          <div key={param.key} className="flex items-center gap-4">
                            <span className="text-sm font-medium w-28">{param.label}</span>
                            <input
                              type="range" min="1" max="10"
                              value={issue[param.key]}
                              onChange={(e) => updateIssue(issue.id, param.key, parseInt(e.target.value))}
                            />
                            <span className="text-xs font-bold w-4">{issue[param.key]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-center mt-16 mb-12">
                <button
                  disabled={isProcessing || issues.length === 0}
                  onClick={analyzeIssues}
                  className="group relative flex items-center gap-3 px-12 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-hover hover:shadow-primary/30 hover:-translate-y-1 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sedang Menganalisis...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      <span className="text-lg">Proses Prioritas AI</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-10 text-center">
                <h2 className="text-3xl font-bold mb-2">Hasil Analisis</h2>
                <p className="text-text-muted">Urutan prioritas berdasarkan skor objektif AI.</p>
              </div>

              {issues.map((issue, index) => (
                <div key={issue.id} className="card animate-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg">#{index + 1} {issue.title}</span>
                      </div>
                      <div className="flex gap-3 items-center">
                        <span className="text-xs font-bold text-primary uppercase">{issue.type}</span>
                        <span className="text-xs text-text-muted flex items-center gap-1"><MapPin className="w-3 h-3" /> {issue.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Score</p>
                      <span className="score-tag">{issue.aiResponse?.score}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleExpand(issue.id)}
                    className="btn btn-ghost text-xs w-full flex justify-between mt-4 border-t border-border pt-4 rounded-none h-auto p-0"
                  >
                    <span>Detail Analisis</span>
                    {expandedIssues[issue.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  <AnimatePresence>
                    {expandedIssues[issue.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-6 space-y-4">
                          <div className="p-4 bg-bg rounded-lg">
                            <p className="text-xs font-bold text-text-muted uppercase mb-2">Justifikasi AI</p>
                            <p className="text-sm font-medium">{issue.aiResponse?.justification}</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3 p-3 border border-border rounded-lg">
                              <FileText className="w-4 h-4 mt-1 text-primary" />
                              <div>
                                <p className="text-[10px] font-bold text-text-muted uppercase">Dampak</p>
                                <p className="text-xs font-medium">{issue.aiResponse?.impactAnalysis}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 border border-border rounded-lg">
                              <AlertCircle className="w-4 h-4 mt-1 text-primary" />
                              <div>
                                <p className="text-[10px] font-bold text-text-muted uppercase">Risiko</p>
                                <p className="text-xs font-medium">{issue.aiResponse?.riskAnalysis}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              <div className="flex justify-center mt-12 pb-12">
                <button onClick={() => setActiveTab('input')} className="btn btn-outline">
                  Kembali ke Input
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
