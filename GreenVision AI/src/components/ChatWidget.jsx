import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Bot, User } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import axios from 'axios'
import { clsx } from 'clsx'

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: 'ai', content: 'Halo! Saya GreenVision AI. Ada yang bisa saya bantu tentang iklim atau energi?' }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async (e) => {
        e.preventDefault()
        if (!input.trim()) return

        const userMsg = input
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setInput('')
        setIsLoading(true)

        try {
            const res = await axios.post('/api/ai/chat', { message: userMsg })
            setMessages(prev => [...prev, { role: 'ai', content: res.data.reply }])
        } catch (error) {
            console.error(error)
            setMessages(prev => [...prev, { role: 'ai', content: 'Maaf, saya tidak dapat terhubung ke server saat ini.' }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 w-full max-w-sm h-[500px] z-50 rounded-2xl overflow-hidden shadow-2xl glass-card flex flex-col border border-white/10"
                    >
                        {/* Header */}
                        <div className="p-4 bg-primary/20 backdrop-blur-md flex justify-between items-center border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">GreenVision AI</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                        <span className="text-xs text-slate-300">Online (Llama 3.2)</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/40">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={clsx("flex gap-3", msg.role === 'user' ? "justify-end" : "justify-start")}>
                                    {msg.role === 'ai' && (
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex-shrink-0 flex items-center justify-center">
                                            <Bot className="w-4 h-4 text-emerald-400" />
                                        </div>
                                    )}
                                    <div className={clsx(
                                        "max-w-[80%] p-3 rounded-2xl text-sm",
                                        msg.role === 'user' ? "bg-primary text-white rounded-tr-none" : "bg-slate-800 text-slate-200 rounded-tl-none border border-white/5"
                                    )}>
                                        {msg.content}
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center">
                                            <User className="w-4 h-4 text-slate-300" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex-shrink-0 flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75" />
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-4 bg-slate-900/60 border-t border-white/10 flex gap-2">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Tanya sesuatu..."
                                className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="p-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30 flex items-center justify-center"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
            </motion.button>
        </>
    )
}
