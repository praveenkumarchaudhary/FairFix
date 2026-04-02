import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, ChevronDown, Sparkles, Zap } from 'lucide-react';
import API from '../utils/api';

const WELCOME = {
  role: 'bot',
  text: "Hey! 👋 I'm **FairFix AI** — your smart repair pricing assistant.\n\nI can help you:\n• 💰 Get fair price estimates\n• 🚨 Detect overcharging\n• 🏪 Find trusted shops\n• ⭐ Understand trust scores",
  suggestions: ['iPhone screen repair cost?', 'Am I being overcharged?', 'Find best shops near me'],
  time: new Date(),
};

function formatText(text) {
  return text.split('\n').map((line, i, arr) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <span key={i}>
        {parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: 'inherit', fontWeight: 700 }}>{p}</strong> : p)}
        {i < arr.length - 1 && <br />}
      </span>
    );
  });
}

function formatTime(date) {
  return date?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 200); }
  }, [open]);

  useEffect(() => {
    if (open && !minimized) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, minimized, isTyping]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg, time: new Date() }]);
    setLoading(true);
    setIsTyping(true);

    // Simulate typing delay for realism
    await new Promise(r => setTimeout(r, 600 + Math.random() * 600));

    try {
      const { data } = await API.post('/chat', { message: msg });
      setIsTyping(false);
      const botMsg = { role: 'bot', text: data.reply, suggestions: data.suggestions || [], time: new Date() };
      setMessages(prev => [...prev, botMsg]);
      if (!open) setUnread(n => n + 1);
    } catch {
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I'm having trouble right now. Please try again!", time: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clearChat = () => setMessages([WELCOME]);

  return (
    <>
      {/* ── FAB BUTTON ── */}
      <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 999 }}>
        {/* Ripple rings */}
        {!open && (
          <>
            <div style={{
              position: 'absolute', inset: -8, borderRadius: '50%',
              border: '2px solid var(--primary)',
              animation: 'ripple 2s ease-out infinite',
              opacity: 0,
            }} />
            <div style={{
              position: 'absolute', inset: -8, borderRadius: '50%',
              border: '2px solid var(--primary)',
              animation: 'ripple 2s ease-out 0.7s infinite',
              opacity: 0,
            }} />
          </>
        )}

        <button
          onClick={() => { setOpen(o => !o); setMinimized(false); }}
          style={{
            width: 58, height: 58, borderRadius: '50%',
            background: open
              ? 'linear-gradient(135deg, #ef4444, #f87171)'
              : 'linear-gradient(135deg, var(--primary), var(--accent))',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: open
              ? '0 4px 20px rgba(239,68,68,0.4)'
              : '0 4px 24px var(--primary-glow), 0 0 0 0 var(--primary)',
            transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            transform: open ? 'rotate(0deg) scale(1)' : 'rotate(0deg) scale(1)',
            animation: !open ? 'float 3s ease-in-out infinite' : 'none',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.12)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          title={open ? 'Close chat' : 'Chat with FairFix AI'}
        >
          <div style={{ transition: 'transform 0.3s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>
            {open ? <X size={22} color="white" /> : <MessageCircle size={22} color="white" />}
          </div>
        </button>

        {/* Unread badge */}
        {unread > 0 && !open && (
          <div style={{
            position: 'absolute', top: -4, right: -4,
            background: 'var(--danger)', color: 'white',
            borderRadius: '50%', width: 22, height: 22,
            fontSize: 11, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--bg)',
            animation: 'bounce 1s ease infinite',
          }}>{unread}</div>
        )}
      </div>

      {/* ── CHAT WINDOW ── */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 100, right: 28, zIndex: 998,
          width: 380,
          borderRadius: 20,
          background: 'var(--card-solid)',
          border: '1px solid var(--border2)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.1)',
          display: 'flex', flexDirection: 'column',
          height: minimized ? 'auto' : 540,
          animation: 'chatPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
          overflow: 'hidden',
        }}>

          {/* ── HEADER ── */}
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, #6d28d9 50%, var(--accent) 100%)',
            padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
            flexShrink: 0,
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Decorative orbs */}
            <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ position: 'absolute', bottom: -30, left: 40, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

            {/* Bot avatar */}
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              border: '2px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, position: 'relative',
              animation: 'float 3s ease-in-out infinite',
            }}>
              <Bot size={20} color="white" />
              <div style={{
                position: 'absolute', bottom: 1, right: 1,
                width: 10, height: 10, borderRadius: '50%',
                background: '#4ade80', border: '2px solid rgba(255,255,255,0.5)',
              }} />
            </div>

            <div style={{ flex: 1, position: 'relative' }}>
              <div style={{ fontWeight: 800, color: 'white', fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                FairFix AI
                <Sparkles size={13} color="rgba(255,255,255,0.7)" />
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                Online · Repair pricing expert
              </div>
            </div>

            <div style={{ display: 'flex', gap: 4, position: 'relative' }}>
              <button onClick={clearChat} title="Clear chat" style={{
                background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.7)', padding: '5px 7px', borderRadius: 8,
                fontSize: 11, fontFamily: 'inherit', transition: 'all 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >Clear</button>
              <button onClick={() => setMinimized(m => !m)} style={{
                background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.7)', padding: '5px 7px', borderRadius: 8,
                display: 'flex', alignItems: 'center', transition: 'all 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                <ChevronDown size={15} style={{ transform: minimized ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }} />
              </button>
              <button onClick={() => setOpen(false)} style={{
                background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.7)', padding: '5px 7px', borderRadius: 8,
                display: 'flex', alignItems: 'center', transition: 'all 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.4)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* ── BODY ── */}
          {!minimized && (
            <>
              {/* Messages */}
              <div style={{
                flex: 1, overflowY: 'auto', padding: '16px 14px',
                display: 'flex', flexDirection: 'column', gap: 14,
                background: 'var(--bg2)',
              }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    animation: 'msgSlide 0.3s cubic-bezier(0.16,1,0.3,1) both',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', maxWidth: '85%' }}>
                      {/* Avatar */}
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                        background: msg.role === 'bot'
                          ? 'linear-gradient(135deg, var(--primary), var(--accent))'
                          : 'linear-gradient(135deg, #475569, #64748b)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: msg.role === 'bot' ? '0 2px 8px var(--primary-glow)' : 'none',
                      }}>
                        {msg.role === 'bot' ? <Bot size={15} color="white" /> : <User size={15} color="white" />}
                      </div>

                      {/* Bubble */}
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: msg.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                        background: msg.role === 'user'
                          ? 'linear-gradient(135deg, var(--primary), var(--primary-light))'
                          : 'var(--card-solid)',
                        color: msg.role === 'user' ? 'white' : 'var(--text)',
                        fontSize: 13.5, lineHeight: 1.6,
                        border: msg.role === 'bot' ? '1px solid var(--border)' : 'none',
                        boxShadow: msg.role === 'user'
                          ? '0 4px 12px var(--primary-glow)'
                          : '0 2px 8px rgba(0,0,0,0.15)',
                      }}>
                        {formatText(msg.text)}
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3, paddingLeft: msg.role === 'bot' ? 38 : 0, paddingRight: msg.role === 'user' ? 38 : 0 }}>
                      {formatTime(msg.time)}
                    </div>

                    {/* Suggestion chips — only on last bot message */}
                    {msg.role === 'bot' && msg.suggestions?.length > 0 && i === messages.length - 1 && !isTyping && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, paddingLeft: 38 }}>
                        {msg.suggestions.map((s, j) => (
                          <button key={j} onClick={() => send(s)} style={{
                            background: 'var(--card-solid)',
                            border: '1px solid var(--border2)',
                            color: 'var(--primary-light)',
                            borderRadius: 20, padding: '5px 12px',
                            fontSize: 11.5, cursor: 'pointer',
                            fontFamily: 'inherit', fontWeight: 600,
                            transition: 'all 0.2s',
                            animation: `fadeUp 0.3s ${j * 0.07}s both`,
                          }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.12)'; e.currentTarget.style.borderColor = 'var(--primary-light)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'var(--card-solid)'; e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, animation: 'msgSlide 0.3s ease both' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px var(--primary-glow)' }}>
                      <Bot size={15} color="white" />
                    </div>
                    <div style={{
                      background: 'var(--card-solid)', border: '1px solid var(--border)',
                      borderRadius: '4px 18px 18px 18px',
                      padding: '12px 16px', display: 'flex', gap: 5, alignItems: 'center',
                    }}>
                      {[0, 1, 2].map(i => (
                        <span key={i} style={{
                          width: 7, height: 7, borderRadius: '50%',
                          background: 'var(--primary-light)', display: 'inline-block',
                          animation: `dotBounce 1.2s ease infinite`,
                          animationDelay: `${i * 0.15}s`,
                        }} />
                      ))}
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* ── INPUT ── */}
              <div style={{
                padding: '12px 14px',
                borderTop: '1px solid var(--border)',
                background: 'var(--card-solid)',
                flexShrink: 0,
              }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKey}
                      placeholder="Ask about repair prices..."
                      disabled={loading}
                      style={{
                        width: '100%',
                        background: 'var(--bg2)',
                        border: '1px solid var(--border)',
                        borderRadius: 24,
                        padding: '10px 16px',
                        color: 'var(--text)',
                        fontSize: 13.5,
                        fontFamily: 'inherit',
                        outline: 'none',
                        transition: 'all 0.2s',
                        paddingRight: 44,
                      }}
                      onFocus={e => { e.target.style.borderColor = 'var(--primary-light)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'; }}
                      onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <button
                    onClick={() => send()}
                    disabled={!input.trim() || loading}
                    style={{
                      width: 40, height: 40, borderRadius: '50%', border: 'none',
                      background: input.trim() && !loading
                        ? 'linear-gradient(135deg, var(--primary), var(--accent))'
                        : 'var(--border)',
                      cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                      boxShadow: input.trim() ? '0 4px 12px var(--primary-glow)' : 'none',
                    }}
                    onMouseEnter={e => { if (input.trim()) e.currentTarget.style.transform = 'scale(1.1)'; }}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <Send size={16} color="white" style={{ transform: 'translateX(1px)' }} />
                  </button>
                </div>
                <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text3)', marginTop: 8 }}>
                  Powered by FairFix AI · Press Enter to send
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 440px) {
          div[style*="width: 380px"] {
            width: calc(100vw - 24px) !important;
            right: 12px !important;
            bottom: 90px !important;
          }
        }
      `}</style>
    </>
  );
}
