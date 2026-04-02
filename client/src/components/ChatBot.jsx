import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import API from '../utils/api';

const WELCOME = {
  role: 'bot',
  text: "Hey! 👋 I'm FairFix AI. Ask me about repair prices, overcharging, or finding trusted shops!",
  suggestions: ['How much is iPhone screen repair?', 'Find best shops near me', 'Am I being overcharged?']
};

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (open && !minimized) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, minimized]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const { data } = await API.post('/chat', { message: msg });
      const botMsg = { role: 'bot', text: data.reply, suggestions: data.suggestions || [] };
      setMessages(prev => [...prev, botMsg]);
      if (!open) setUnread(n => n + 1);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I'm having trouble connecting. Please try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const formatText = (text) => {
    // Convert **bold** and newlines to JSX
    return text.split('\n').map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={i}>
          {parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => { setOpen(true); setMinimized(false); }}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 999,
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
          border: 'none', cursor: 'pointer', display: open ? 'none' : 'flex',
          alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(99,102,241,0.5)',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        title="Chat with FairFix AI"
      >
        <MessageCircle size={24} color="white" />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: 'var(--danger)', color: 'white',
            borderRadius: '50%', width: 20, height: 20,
            fontSize: 11, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>{unread}</span>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          width: 360, borderRadius: 16,
          background: 'var(--card)', border: '1px solid var(--border)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column',
          height: minimized ? 'auto' : 520,
          animation: 'fadeIn 0.2s ease',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
            padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10,
            flexShrink: 0,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={20} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: 'white', fontSize: 14 }}>FairFix AI</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                Online · Repair pricing expert
              </div>
            </div>
            <button onClick={() => setMinimized(!minimized)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', padding: 4 }}>
              {minimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', padding: 4 }}>
              <X size={16} />
            </button>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                      {/* Avatar */}
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        background: msg.role === 'bot' ? 'linear-gradient(135deg, var(--primary), #8b5cf6)' : 'var(--bg2)',
                        border: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {msg.role === 'bot' ? <Bot size={14} color="white" /> : <User size={14} color="var(--text2)" />}
                      </div>
                      {/* Bubble */}
                      <div style={{
                        maxWidth: '78%', padding: '10px 13px', borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                        background: msg.role === 'user' ? 'var(--primary)' : 'var(--bg2)',
                        color: msg.role === 'user' ? 'white' : 'var(--text)',
                        fontSize: 13, lineHeight: 1.55,
                        border: msg.role === 'bot' ? '1px solid var(--border)' : 'none',
                      }}>
                        {formatText(msg.text)}
                      </div>
                    </div>
                    {/* Suggestions */}
                    {msg.role === 'bot' && msg.suggestions?.length > 0 && i === messages.length - 1 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, marginLeft: 34 }}>
                        {msg.suggestions.map((s, j) => (
                          <button key={j} onClick={() => send(s)} style={{
                            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
                            color: 'var(--primary)', borderRadius: 20, padding: '4px 10px',
                            fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
                            transition: 'all 0.15s',
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
                          >{s}</button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Bot size={14} color="white" />
                    </div>
                    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '4px 16px 16px 16px', padding: '12px 16px', display: 'flex', gap: 4 }}>
                      {[0, 1, 2].map(i => (
                        <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text3)', display: 'inline-block', animation: 'pulse 1.2s ease infinite', animationDelay: `${i * 0.2}s` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexShrink: 0 }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask about repair prices..."
                  style={{
                    flex: 1, background: 'var(--bg2)', border: '1px solid var(--border)',
                    borderRadius: 24, padding: '8px 14px', color: 'var(--text)',
                    fontSize: 13, fontFamily: 'inherit', outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || loading}
                  style={{
                    width: 36, height: 36, borderRadius: '50%', border: 'none',
                    background: input.trim() ? 'var(--primary)' : 'var(--border)',
                    cursor: input.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'background 0.2s',
                  }}
                >
                  <Send size={15} color="white" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 400px) {
          div[style*="width: 360px"] { width: calc(100vw - 32px) !important; right: 16px !important; }
        }
      `}</style>
    </>
  );
}
