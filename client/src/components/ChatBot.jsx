import React, { useState } from 'react';
import axios from 'axios';

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Namaste Kisan Bhai! Kheti-badi ya fasal ki bimari ke baare me kuch bhi puchiye.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'https://krishi-mitra-z3vm.onrender.com';
      const res = await axios.post(`${backendUrl}/api/chat/advisor`, { query: userText });
      
      // Safe Parsing: kabhi white screen crash nahi hoga
      let botReply = "Jawab milne me samay lag raha hai. Kripya punah prayas karein.";
      if (typeof res.data === 'string') {
        botReply = res.data;
      } else if (res.data?.reply) {
        botReply = typeof res.data.reply === 'string' ? res.data.reply : JSON.stringify(res.data.reply);
      } else if (res.data?.message) {
        botReply = res.data.message;
      }

      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    } catch (err) {
      setMessages(prev => [
        ...prev, 
        { sender: 'bot', text: 'Server se sampark nahi ho pa raha hai (Render wake-up timeout). Kripya 20 second baad punah message karein.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border rounded-xl shadow-lg p-4 flex flex-col h-[450px]">
      <div className="font-bold text-emerald-800 pb-2 border-b flex items-center justify-between">
        <span>🌱 Krishi Mitra AI Sahayak</span>
        <span className="text-xs text-gray-500">Gemini 2.5</span>
      </div>

      <div className="flex-1 overflow-y-auto my-3 space-y-2 p-2">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-xl px-4 py-2 max-w-[80%] text-sm ${
              m.sender === 'user' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-800'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-xs text-gray-400 italic">Krishi Sahayak soch raha hai...</div>
        )}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 pt-2 border-t">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Apna sawal likhein..."
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-emerald-600"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold"
        >
          Bhejo
        </button>
      </form>
    </div>
  );
}