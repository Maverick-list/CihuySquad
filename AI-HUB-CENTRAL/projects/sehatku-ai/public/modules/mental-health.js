/**
 * SehatKu AI - Mental Health Chat Module
 * Menangani logika chat AI dengan fallback system yang robust.
 * 
 * FITUR AMAN:
 * - Safe Chat Mode: Fallback ke rule-based response jika API mati
 * - Streaming simulation untuk pengalaman UX yang lebih baik
 * - Error handling di setiap step
 * - Keyword matching untuk respons yang relevan
 * 
 * © 2026 SehatKu AI - Hackathon Ready
 */

// ==================== STATE MANAGEMENT ====================
const MentalHealthState = {
    isTyping: false,
    messageHistory: [],
    welcomeShown: false,

    // Extensive fallback responses berdasarkan kategori
    responses: {
        sad: [
            "Saya turut sedih mendengarnya. Menangis atau merasa kecewa itu manusiawi. Apa yang memicu perasaan ini?",
            "Terima kasih sudah berani berbagi. Perasaan sedih adalah bagian alami dari kehidupan. Apakah ada yang ingin Anda ceritakan lebih lanjut?",
            "Saya di sini untuk mendengarkan. Kehilangan atau kekecewaan itu berat. Bagaimana saya bisa mendukung Anda saat ini?",
            "Tidak apa-apa untuk merasa sedih. Kapan perasaan ini mulai terasa berat bagi Anda?"
        ],
        anxious: [
            "Kecemasan bisa sangat mengganggu, tapi ingat bahwa perasaan ini bersifat sementara. Mari kita tarik napas dalam-dalam bersama. Apa yang paling Anda khawatirkan?",
            "Saya memahami kecemasan Anda. Cobalah fokus pada saat ini - 5 hal yang bisa Anda lihat, 4 yang bisa Anda sentuh, 3 yang bisa Anda dengar. Apa yang paling Anda khawatirkan saat ini?",
            "Khawatiran Anda valid. bernapas dalam-dalam dapat membantu menenangkan sistem saraf. Apa yang membuat Anda merasa cemas?",
            "Tenerima kasih sudah berbagi. Kecemasan adalah respons alami tubuh. Apakah ada situasi spesifik yang memicu perasaan ini?"
        ],
        angry: [
            "Wajar jika Anda merasa marah. Emosi itu menunjukkan bahwa sesuatu penting bagi Anda. Apakah Anda ingin menceritakan apa yang terjadi?",
            "Marah adalah emosi yang kuat dan manusiawi.很高兴 Anda bisa mengungkapkannya di sini. Apa yang membuat Anda merasa seperti ini?",
            "Saya mendengarkan tanpa menghakimi. Ke frustrasian atau kemarahan bisa menjadi sinyal bahwa kebutuhan Anda tidak terpenuhi. Mau cerita lebih lanjut?",
            "Tidak apa-apa untuk merasa marah. Yang penting adalah bagaimana kita mengelola emosi tersebut. Apa yang terjadi?"
        ],
        tired: [
            "Sepertinya Anda memikul beban yang berat. Istirahat itu bukan berarti menyerah, ini adalah bagian dari merawat diri sendiri. Apakah Anda sudah meluangkan waktu untuk istirahat?",
            "Kelelahan, baik fisik maupun mental, perlu diperhatikan. Mungkin tubuh dan pikiran Anda memberi sinyal untuk memperlambat. Bagaimana tingkat kelelahan Anda?",
            "Saya memahami perasaan lelah Anda. Penting untuk mengakui kapan kita butuh waktu untuk diri sendiri. Apakah ada hal yang membuat Anda terus terjaga?",
            "Terima kasih sudah berbagi. Kadang kita perlu melangkah mundur untuk bisa melangkah lebih jauh. Bagaimana saya bisa membantu saat ini?"
        ],
        suicidal: [
            "Saya sangat peduli dengan keselamatan Anda. Perasaan ini mungkin terasa tak tertahankan, tapi bantuan selalu tersedia.",
            "Anda tidak sendirian dalam ini. Silakan hubungi hotline kesehatan mental Indonesia di 119 ext 9 atau bicara dengan seseorang yang Anda percaya.",
            "Kehidupan Anda berharga dan ada orang yang peduli dengan Anda. Saya sangat menyarankan Anda untuk segera berbicara dengan profesional kesehatan mental atau orang terdekat.",
            "Mohon untuk tidak melakukan sesuatu yang permanen terhadap keadaan sementara. Bantuan tersedia 24/7 di 119 ext 9 (Kemenkes) atau 112 (Darurat)."
        ],
        general: [
            "Terima kasih sudah berbagi. Saya di sini untuk mendengarkan. Ceritakan lebih lanjut tentang apa yang Anda rasakan.",
            "Saya menghargai kepercayaan Anda untuk berbagi. Setiap perasaan valid. Apa yang ingin Anda eksplorasi lebih lanjut?",
            "Dengan senang hati saya mendengarkan. Kadang menceritakan beban bisa menjadi langkah pertama untuk merasa lebih baik. Lanjutkan...",
            "Saya di sini tanpa menghakimi. Apa yang paling penting bagi Anda saat ini?",
            "Terkadang yang kita butuhkan hanyalah seseorang yang mendengarkan. Saya siap membantu. Ceritakan lebih lanjut.",
            "Bagaimana perasaan Anda setelah berbagi? Apakah ada aspek tertentu yang ingin Anda bahas lebih dalam?"
        ],
        greeting: [
            "Halo! Senang bertemu dengan Anda. Saya di sini untuk mendengarkan tanpa menghakimi. Apa yang sedang Anda rasakan hari ini?",
            "Selamat datang! Tidak ada yang terlalu kecil atau besar untuk dibicarakan di sini. Bagaimana hari Anda berjalan?",
            "Halo! Ruang aman ini untuk Anda. Silakan berbagi apa yang ada di pikiran atau hati Anda."
        ],
        gratitude: [
            "Dengan senang hati! Saya di sini untuk mendukung Anda kapan saja membutuhkan.",
            "Terima kasih atas kepercayaan Anda. Ingat, Anda tidak sendirian dalam perjalanan kesehatan mental.",
            "Sama-sama! Kesembuhan adalah proses, dan setiap langkah kecil berarti. Saya selalu di sini jika butuh teman bicara."
        ]
    }
};

/**
 * Initialize Mental Health Chat
 * Dipanggil oleh app.js saat halaman dimuat
 */
window.initMentalHealthChat = function () {
    try {
        console.log('🧠 Initializing Mental Health Chat...');

        // Setup event listeners
        const chatInput = document.getElementById('chatInput');
        const sendButton = document.querySelector('.chat-input-container button');

        if (chatInput) {
            chatInput.addEventListener('keypress', handleChatEnter);
        }

        if (sendButton) {
            sendButton.addEventListener('click', sendMessage);
        }

        // Load chat history jika ada
        if (AppState.conversationHistory && AppState.conversationHistory.length > 0) {
            // Tampilkan kembali riwayat chat
            AppState.conversationHistory.forEach(msg => {
                if (msg.role === 'user' || msg.role === 'ai') {
                    addMessageToUI(msg.role, msg.content, false);
                }
            });
        } else {
            // Welcome message jika histori kosong
            setTimeout(() => {
                const welcomeMsg = getRandomResponse('greeting');
                addMessageToUI('ai', welcomeMsg);
                MentalHealthState.welcomeShown = true;
            }, 500);
        }

        console.log('✅ Mental Health Chat initialized');
    } catch (error) {
        console.error('❌ Error initializing Mental Health Chat:', error);
    }
};

/**
 * Handle Enter key pada input
 */
window.handleChatEnter = function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
};

/**
 * Kirim pesan user ke AI dengan sistem fallback
 */
window.sendMessage = async function () {
    try {
        const chatInput = document.getElementById('chatInput');
        const chatMessages = document.getElementById('chatMessages');

        if (!chatInput || !chatInput.value.trim()) return;

        // Cegah spam saat AI sedang mengetik
        if (MentalHealthState.isTyping) return;

        const userMessage = chatInput.value.trim();

        // Validasi pesan
        if (!userMessage || userMessage.length === 0) return;

        // Batasi panjang pesan
        const maxLength = 1000;
        if (userMessage.length > maxLength) {
            showNotification('Pesan terlalu panjang. Silakan ringkas.', 'warning');
            return;
        }

        // 1. Tampilkan pesan user
        addMessageToUI('user', userMessage);
        chatInput.value = '';

        // Simpan ke history
        AppState.addChatMessage('user', userMessage);

        // 2. Tampilkan thinking indicator
        MentalHealthState.isTyping = true;
        const thinkingId = showThinkingIndicator();

        // 3. Proses response AI (dengan safety net)
        try {
            // Delay natural (1-1.5 detik)
            await new Promise(resolve => setTimeout(resolve, 1200));

            // Coba panggil API jika backend tersedia
            let aiResponse = null;
            let isFallback = false;

            try {
                const response = await API.call('/ai/mental-health/chat', {
                    method: 'POST',
                    timeout: 5000,
                    body: JSON.stringify({
                        message: userMessage,
                        history: AppState.conversationHistory.slice(-10) // Kirim 10 pesan terakhir
                    })
                });

                if (response && response.response) {
                    aiResponse = response.response;
                    isFallback = response.isFallback || false;
                } else {
                    throw new Error('Invalid API response');
                }
            } catch (apiError) {
                console.warn('⚠️ AI API failed, using local response:', apiError.message);
                // Generate response lokal
                aiResponse = generateLocalResponse(userMessage);
                isFallback = true;
            }

            // Hapus thinking indicator
            removeThinkingIndicator(thinkingId);

            // 4. Stream response karakter per karakter
            await streamResponse(aiResponse);

            // Simpan ke history
            AppState.addChatMessage('ai', aiResponse);

            // Tandai jika menggunakan fallback
            if (isFallback) {
                console.log('📴 Used local fallback response');
            }

        } catch (error) {
            console.error('❌ Error getting AI response:', error);
            removeThinkingIndicator(thinkingId);

            // SAFE CHAT MODE: Fallback response
            const fallbackMsg = "Maaf, saya sedang dalam mode offline. Namun saya tetap di sini untuk mendengarkan. Ceritakan lebih lanjut apa yang Anda rasakan.";
            await streamResponse(fallbackMsg);
            AppState.addChatMessage('ai', fallbackMsg);
        } finally {
            MentalHealthState.isTyping = false;
            scrollToBottom();
        }

    } catch (error) {
        console.error('❌ Critical error in sendMessage:', error);
        MentalHealthState.isTyping = false;
    }
};

/**
 * Generate response lokal berdasarkan keyword matching
 */
function generateLocalResponse(message) {
    const lowerMessage = message.toLowerCase();

    // Cek suicidal keywords (PRIORITAS TINGGI)
    const suicidalKeywords = ['bunuh diri', 'mati', 'akhiri hidup', 'mau mati', 'tidak mau hidup', 'lebih baik mati'];
    if (suicidalKeywords.some(kw => lowerMessage.includes(kw))) {
        return getRandomResponse('suicidal');
    }

    // Cek sad/depressed keywords
    const sadKeywords = ['sedih', 'nangis', 'kecewa', 'menangis', 'putus asa', 'gagal', 'hilang', 'sendirian', 'kosong'];
    if (sadKeywords.some(kw => lowerMessage.includes(kw))) {
        return getRandomResponse('sad');
    }

    // Cek anxious keywords
    const anxiousKeywords = ['cemas', 'takut', 'khawatir', 'gugup', 'panik', 'gelisah', 'stress', 'tegang', 'tidak tenang'];
    if (anxiousKeywords.some(kw => lowerMessage.includes(kw))) {
        return getRandomResponse('anxious');
    }

    // Cek angry keywords
    const angryKeywords = ['marah', 'kesal', 'jengkel', 'frustasi', 'benci', 'dongkol', 'geram'];
    if (angryKeywords.some(kw => lowerMessage.includes(kw))) {
        return getRandomResponse('angry');
    }

    // Cek tired keywords
    const tiredKeywords = ['lelah', 'capek', 'kehabisan', 'habis', 'lemas', 'letih', 'ngantuk', 'tidak bisa tidur', 'insomnia'];
    if (tiredKeywords.some(kw => lowerMessage.includes(kw))) {
        return getRandomResponse('tired');
    }

    // Cek greeting
    const greetingKeywords = ['halo', 'hai', 'hello', 'pagi', 'siang', 'malam', 'assalamualaikum', 'assalamu\'alaikum'];
    if (greetingKeywords.some(kw => lowerMessage.includes(kw)) && lowerMessage.length < 30) {
        return getRandomResponse('greeting');
    }

    // Cek gratitude
    const gratitudeKeywords = ['terima kasih', 'makasih', 'good', 'bagus', 'terima', 'thanks'];
    if (gratitudeKeywords.some(kw => lowerMessage.includes(kw))) {
        return getRandomResponse('gratitude');
    }

    // Default: general response
    return getRandomResponse('general');
}

/**
 * Get random response dari kategori
 */
function getRandomResponse(category) {
    const responses = MentalHealthState.responses[category] || MentalHealthState.responses.general;
    return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Tambahkan pesan ke UI dengan aman
 */
function addMessageToUI(type, text, animate = true) {
    try {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) {
            console.warn('⚠️ Chat messages container not found');
            return null;
        }

        // Validasi text
        if (!text || typeof text !== 'string') {
            text = 'Maaf, terjadi kesalahan.';
        }

        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${type}`;
        msgDiv.textContent = text;

        if (!animate) {
            msgDiv.style.animation = 'none';
        }

        chatMessages.appendChild(msgDiv);
        scrollToBottom();

        return msgDiv;
    } catch (error) {
        console.error('❌ Error adding message to UI:', error);
        return null;
    }
}

/**
 * Show animated dots saat AI berpikir
 */
function showThinkingIndicator() {
    try {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return null;

        const indicator = document.createElement('div');
        const timestamp = Date.now();
        indicator.className = 'chat-message ai thinking-indicator';
        indicator.id = 'thinking-' + timestamp;

        indicator.innerHTML = `
            <div class="thinking-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <span class="thinking-text">Sedang mengetik...</span>
        `;

        chatMessages.appendChild(indicator);
        scrollToBottom();

        return indicator.id;
    } catch (error) {
        console.error('❌ Error showing thinking indicator:', error);
        return null;
    }
}

/**
 * Hapus thinking indicator dengan aman
 */
function removeThinkingIndicator(id) {
    try {
        if (!id) return;

        const element = document.getElementById(id);
        if (element) {
            element.remove();
        } else {
            // Coba hapus semua thinking indicators
            document.querySelectorAll('.thinking-indicator').forEach(el => el.remove());
        }
    } catch (error) {
        console.warn('⚠️ Error removing thinking indicator:', error);
        // Bersihkan semua thinking indicators
        document.querySelectorAll('.thinking-indicator').forEach(el => el.remove());
    }
}

/**
 * Efek mengetik (Streaming) dengan aman
 */
function streamResponse(fullText) {
    return new Promise((resolve) => {
        try {
            if (!fullText || typeof fullText !== 'string') {
                resolve();
                return;
            }

            const chatMessages = document.getElementById('chatMessages');
            if (!chatMessages) {
                resolve();
                return;
            }

            const msgDiv = document.createElement('div');
            msgDiv.className = 'chat-message ai streaming';
            chatMessages.appendChild(msgDiv);

            let i = 0;
            const charDelay = Math.max(10, Math.min(50, 3000 / fullText.length)); // Adjust speed based on length
            const interval = setInterval(() => {
                if (i < fullText.length) {
                    msgDiv.textContent += fullText.charAt(i);
                    i++;
                    scrollToBottom();
                } else {
                    clearInterval(interval);
                    msgDiv.classList.remove('streaming');
                    resolve();
                }
            }, charDelay);

            // Safety timeout (maksimal 10 detik)
            setTimeout(() => {
                if (i < fullText.length) {
                    clearInterval(interval);
                    msgDiv.textContent = fullText;
                    msgDiv.classList.remove('streaming');
                    resolve();
                }
            }, 10000);

        } catch (error) {
            console.error('❌ Error in streamResponse:', error);
            resolve();
        }
    });
}

/**
 * Scroll ke pesan terbawah dengan aman
 */
function scrollToBottom() {
    try {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    } catch (error) {
        console.warn('⚠️ Error scrolling to bottom:', error);
    }
}

// Export functions untuk global access
window.handleChatEnter = window.handleChatEnter;
window.sendMessage = window.sendMessage;
window.initMentalHealthChat = window.initMentalHealthChat;

