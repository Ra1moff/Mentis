import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FeedbackForm: React.FC = () => {
  const { user } = useAuth();
  
  // Form state
  const [name, setName] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync name/email if user logs in
  React.useEffect(() => {
    if (user) {
      setName(user.username);
      if (user.email) setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setErrorMsg('');
    try {
      const BOT_TOKEN = '8883150816:AAFt-SbjvQVS2zciWJ9CcbkqADDgI4OqFug';
      const CHAT_ID = '5331390850';

      const now = new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' });
      const text =
        `🚨 *New MathBattle Feedback!*\n\n` +
        `👤 *User:* ${name.trim() || 'Anonymous Guest'}\n` +
        `📧 *Contact:* ${email.trim() || 'None'}\n` +
        `📅 *Date:* ${now}\n\n` +
        `💬 *Message:*\n${message.trim()}`;

      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
          parse_mode: 'Markdown',
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setMessage('');
        setTimeout(() => setSuccess(false), 4000);
      } else {
        const data = await res.json();
        throw new Error(data.description || 'Failed to send feedback.');
      }
    } catch (err: any) {
      setErrorMsg('Failed to send feedback. Please try again.');
      console.error('Feedback send error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-8 border-t border-game-blue border-opacity-10 mt-12">
      <div className="glass-panel p-6 rounded-2xl border border-game-blue border-opacity-25 relative overflow-hidden">
        
        {/* Decorative background pulse */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-game-blue bg-opacity-5 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center gap-2 mb-4 border-b border-game-blue border-opacity-10 pb-3">
          <MessageSquare className="w-5 h-5 text-game-lightBlue" />
          <h3 className="font-bold text-base text-game-light tracking-wide">
            Feedback & Suggestions
          </h3>
        </div>

        <p className="text-xs text-game-lightBlue mb-5 leading-relaxed">
          Share your thoughts, suggestions, or bugs to help us improve the MathBattle Arena! Every piece of feedback is valuable to us.
        </p>

        {errorMsg && (
          <div className="bg-game-red bg-opacity-20 border border-game-red border-opacity-40 text-game-light text-xs px-4 py-2 rounded-lg mb-4 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-game-red" /> {errorMsg}
          </div>
        )}

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="py-6 text-center flex flex-col items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-12 h-12 text-game-green animate-bounce-slow" />
              <h4 className="font-bold text-game-green text-sm">Feedback Submitted Successfully!</h4>
              <p className="text-xs text-game-lightBlue">Your thoughts help shape the arena. Thank you for your support!</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-game-lightBlue">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name (optional)"
                    className="glass-input text-xs py-2 px-3.5"
                    disabled={loading}
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-game-lightBlue">
                    Contact Email / Telegram
                  </label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Contact info (optional)"
                    className="glass-input text-xs py-2 px-3.5"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-game-lightBlue">
                  Your Suggestions / Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us how we can make the arena better..."
                  rows={3}
                  required
                  className="glass-input text-xs py-2.5 px-3.5 resize-none w-full"
                  disabled={loading}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="game-btn-primary py-2.5 px-6 font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 self-center sm:self-end disabled:opacity-50"
              >
                {loading ? (
                  'Submitting...'
                ) : (
                  <>
                    Submit <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
