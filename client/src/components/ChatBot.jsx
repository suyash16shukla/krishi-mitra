import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { X, Send, MessageCircle, Globe, ChevronDown, User, Mic, MicOff, Sparkles } from 'lucide-react';
import { getTranslation } from '../utils/translations';

const QUICK_PROMPTS_BY_LANG = {
  hindi: [
    { text: 'गेहूँ में पीला रतुआ कैसे रोकें?', label: 'पीला रतुआ' },
    { text: 'सरसों में माहू (चेपा) का सबसे अच्छा कीटनाशक क्या है?', label: 'सरसों माहू' },
    { text: 'चना में इल्ली (Pod Borer) से बचाव कैसे करें?', label: 'चना इल्ली' },
    { text: 'मक्का में फॉल आर्मीवर्म का उपचार?', label: 'मक्का कीट' },
    { text: 'पीएम किसान योजना में ई-केवाईसी कैसे करें?', label: 'पीएम-किसान KYC' },
  ],
  english: [
    { text: 'How to control yellow rust in wheat?', label: 'Yellow Rust' },
    { text: 'Best organic fertilizer for JG-11 Chana?', label: 'Chickpea Care' },
    { text: 'Potato late blight prevention in winter', label: 'Potato Blight' },
    { text: 'How to improve moisture in black cotton soil?', label: 'Black Soil Care' },
    { text: 'Eligibility rules for PM-KISAN subsidy', label: 'PM-KISAN' },
  ],
  hinglish: [
    { text: 'Gehun mein peela ratua kaise rokein?', label: 'Yellow Rust' },
    { text: 'Sarson mein aphid/maahu ka best ilaj?', label: 'Mustard Aphid' },
    { text: 'Chana mein phool aate time paani dena chahiye?', label: 'Chana Sichai' },
    { text: 'Khad kab aur kitna dalna chahiye?', label: 'Khad Schedule' },
    { text: 'PM-KISAN ki kist check karne ka tareeka', label: 'PM-KISAN Kist' },
  ]
};

function TypingIndicator() {
  return (
    <div className="flex gap-1.5 items-center px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-bl-md w-20 shadow-xs">
      <div className="typing-dot" />
      <div className="typing-dot" />
      <div className="typing-dot" />
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.sender === 'user' || msg.role === 'user';
  // Safe conversion to prevent "e.content.split is not a function" crash
  const safeContent = typeof msg.content === 'string'
    ? msg.content
    : (typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.content || msg.text || ''));

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end chat-message`}>
      <div className={`w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs ${
        isUser ? 'bg-emerald-600 text-white' : 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white'
      }`}>
        {isUser ? <User size={15} className="text-white" /> : <span className="text-sm">🌱</span>}
      </div>

      <div className={`max-w-[85%] px-4 py-3 text-xs md:text-sm leading-relaxed ${
        isUser
          ? 'bg-emerald-600 text-white rounded-2xl rounded-br-xs shadow-sm'
          : 'bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-xs shadow-xs'
      }`}>
        {safeContent.split('\n').map((line, i) => (
          <p key={i} className={line === '' ? 'h-2' : 'mb-1 last:mb-0'}>
            {line}
          </p>
        ))}
        <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-black/5">
          <span className={`text-[9px] ${isUser ? 'text-emerald-200' : 'text-emerald-600 font-medium'}`}>
            {isUser ? 'Aap' : (msg.engine || 'Krishi Mitra AI')}
          </span>
          <span className={`text-[9px] ml-auto ${isUser ? 'text-emerald-200' : 'text-gray-400'}`}>
            {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ChatBot({ isOpen = true, onClose, currentLanguage = 'hinglish', onLanguageChange = null }) {
  const [language, setLanguage] = useState(currentLanguage);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      role: 'bot',
      text: 'Namaste Kisan Bhai! Kheti-badi ya fasal ki bimari ke baare me kuch bhi puchiye.',
      content: 'Namaste Kisan Bhai! Kheti-badi ya fasal ki bimari ke baare me kuch bhi puchiye.',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Sync language with parent
  useEffect(() => {
    if (currentLanguage) setLanguage(currentLanguage);
  }, [currentLanguage]);

  // Initial welcome message per language
  useEffect(() => {
    try {
      const greeting = getTranslation(language)?.chat?.greeting || 'Namaste Kisan Bhai! Kheti-badi ya fasal ki bimari ke baare me kuch bhi puchiye.';
      setMessages([
        {
          sender: 'bot',
          role: 'bot',
          text: String(greeting),
          content: String(greeting),
          engine: 'Gemini 3.8 Flash',
          timestamp: new Date().toISOString()
        }
      ]);
    } catch {
      // safe fallback
    }
  }, [language]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, isListening]);

  // Voice Recognition Toggle
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      setSpeechError(null);
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.lang = language === 'hindi' ? 'hi-IN' : language === 'english' ? 'en-IN' : 'hi-IN';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript) {
          setInput(currentTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission denied. Please allow microphone access in browser.');
        } else if (event.error !== 'no-speech') {
          setSpeechError(`Voice input error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      setSpeechError('Could not access microphone.');
    }
  };

  const handleLanguageSelect = (newLang) => {
    setLanguage(newLang);
    setLangMenuOpen(false);
    if (onLanguageChange) onLanguageChange(newLang);
  };

  const sendMessage = async (messageText) => {
    const textToSend = typeof messageText === 'string' ? messageText.trim() : input.trim();
    if (!textToSend || loading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setInput('');
    // Store user message cleanly
    setMessages(prev => [
      ...prev,
      {
        sender: 'user',
        role: 'user',
        text: String(textToSend),
        content: String(textToSend),
        timestamp: new Date().toISOString()
      }
    ]);
    setLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'https://krishi-mitra-z3vm.onrender.com';
      const res = await axios.post(`${API_BASE}/api/chat/advisor`, {
        query: textToSend,
        prompt: textToSend,
        message: textToSend,
        language
      });

      // Always store response cleanly as a string to prevent split error
      const botMessage = res.data?.reply ||
        res.data?.message ||
        res.data?.response ||
        (typeof res.data === 'string' ? res.data : "Thodi der baad punah prayas karein.");

      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          role: 'bot',
          text: String(botMessage),
          content: String(botMessage),
          engine: res.data?.engine || 'Gemini 3.8 Flash',
          timestamp: res.data?.timestamp || new Date().toISOString()
        }
      ]);
    } catch (err) {
      console.error("ChatBot API error:", err);
      // Resilient fallback on 404, 500, or network failure
      const fallbackMessage = err.response?.data?.reply ||
        err.response?.data?.message ||
        err.response?.data?.response ||
        (language === 'hindi'
          ? 'नमस्ते किसान भाई! 🙏 कृषि मित्र सर्वर अभी वेक-अप हो रहा है या नेटवर्क व्यस्त है। कृपया 10-15 सेकंड बाद पुनः प्रयास करें या नीचे दिए गए त्वरित विषयों में से चुनें।'
          : language === 'english'
          ? 'Hello Farmer! 🙏 Krishi Mitra server is waking up or network is busy. Please retry in 10-15 seconds or choose from the quick topics below.'
          : 'Thodi der baad punah prayas karein. Server se sampark nahi ho pa raha hai (Render wake-up timeout). Kripya thodi der baad punah message karein.');

      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          role: 'bot',
          text: String(fallbackMessage),
          content: String(fallbackMessage),
          engine: 'Krishi Expert Core (Fallback)',
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const LANG_OPTIONS = [
    { value: 'hinglish', label: 'Hinglish', flag: '🇮🇳' },
    { value: 'hindi', label: 'हिंदी', flag: '🇮🇳' },
    { value: 'english', label: 'English', flag: '🇬🇧' },
  ];

  const quickPrompts = QUICK_PROMPTS_BY_LANG[language] || QUICK_PROMPTS_BY_LANG.hinglish;
  const t = getTranslation(language)?.chat || {
    inputPlaceholder: 'Apna sawal likhein...',
    quickPrompts: 'Popular Questions:'
  };

  // If used as modal and isOpen is false, don't render
  if (isOpen === false) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg h-[90vh] lg:h-[80vh] max-h-[700px] bg-white rounded-t-3xl lg:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up border border-emerald-100">

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 px-5 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl shadow-xs">
              🌱
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">Krishi Mitra AI</h3>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>
              <p className="text-[11px] text-emerald-100">Voice-Enabled • Gemini 3.8 Flash</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-white text-xs font-semibold transition-colors"
              >
                <Globe size={13} />
                <span>{LANG_OPTIONS.find(l => l.value === language)?.label || 'Language'}</span>
                <ChevronDown size={11} />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 top-10 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20 min-w-[130px] p-1 animate-fade-in">
                  {LANG_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleLanguageSelect(opt.value)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl transition-colors ${
                        language === opt.value
                          ? 'bg-emerald-50 text-emerald-700 font-bold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{opt.flag}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-white"
                aria-label="Close Chat"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Chat message stream */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 bg-slate-50/70">
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}

          {loading && (
            <div className="flex gap-2.5 items-end">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center text-sm flex-shrink-0 shadow-xs">
                🌱
              </div>
              <TypingIndicator />
            </div>
          )}

          {/* Voice Listening Active Wave Indicator */}
          {isListening && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-medium animate-pulse">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span>🎙️ Listening to your voice ({language === 'hindi' ? 'हिंदी में बोलें' : 'Speak now'})...</span>
            </div>
          )}

          {speechError && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center justify-between">
              <span>⚠️ {speechError}</span>
              <button type="button" onClick={() => setSpeechError(null)} className="text-amber-600 font-bold ml-2">✕</button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt suggestions */}
        <div className="px-4 py-2 border-t border-gray-100 bg-white">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => sendMessage(prompt.text)}
                disabled={loading}
                className="flex-shrink-0 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200 transition-colors disabled:opacity-50"
              >
                {prompt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input box with Voice Mic Button */}
        <div className="px-4 py-3 bg-white border-t border-gray-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-2 items-end"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? 'Listening... Bolna shuru karein' : (t.inputPlaceholder || 'Apna sawal likhein...')}
              className={`flex-1 resize-none border rounded-2xl px-4 py-2.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent max-h-24 min-h-[46px] transition-all ${
                isListening ? 'border-red-400 bg-red-50/30' : 'border-gray-200 bg-gray-50'
              }`}
              rows={1}
              disabled={loading}
            />

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleListening}
              disabled={loading}
              className={`w-11 h-11 flex-shrink-0 rounded-2xl flex items-center justify-center transition-all shadow-sm active:scale-95 relative ${
                isListening
                  ? 'bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-400/40 animate-pulse'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
              }`}
              title={isListening ? 'Stop listening' : 'Speak into microphone (बोलकर पूछें)'}
            >
              {isListening ? (
                <>
                  <MicOff size={18} />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                </>
              ) : (
                <Mic size={18} />
              )}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-11 h-11 flex-shrink-0 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-95"
              title="Send message"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </form>
          <p className="text-[10px] text-gray-400 text-center mt-1.5">
            Click 🎙️ to speak in Hindi/English • Press Enter to send
          </p>
        </div>
      </div>
    </div>
  );
}

// Floating AI trigger button
export function FloatingChatButton({ onClick, unread = false }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 lg:bottom-6 z-40 w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center group"
      aria-label="Open Krishi Mitra AI"
    >
      <div className="relative">
        <MessageCircle size={26} strokeWidth={1.8} />
        {unread && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
        )}
      </div>
      <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
        AI Mitra 🌱
      </div>
    </button>
  );
}