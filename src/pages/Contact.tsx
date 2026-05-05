import React, { useState } from 'react';
import { designService } from '../services/designService';
import { Send, Mail, MapPin, Phone } from 'lucide-react';
import { motion } from 'motion/react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      await designService.sendInquiry({ name, email, subject, message });
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setStatus('success');
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error(error);
      alert("Failed to send message. Please try again.");
      setStatus('idle');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="serif text-6xl font-bold mb-8 italic">Let's Create Something <span className="text-brand-accent not-italic">Exceptional</span>.</h1>
            <p className="text-brand-ink/60 text-lg leading-relaxed mb-12 max-w-md">
              Whether you have a specific project in mind or just want to say hello, my inbox is always open. Let’s collaborate and bring your vision to life.
            </p>
          </motion.div>

          <div className="space-y-8">
            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border border-brand-ink/5 group-hover:bg-brand-accent group-hover:text-white transition-all shadow-sm">
                <Mail size={24} />
              </div>
              <div>
                <p className="mono text-[10px] uppercase font-bold opacity-40">Email Me</p>
                <p className="font-semibold">talktothegt@gmail.com</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border border-brand-ink/5 group-hover:bg-brand-accent group-hover:text-white transition-all shadow-sm">
                <MapPin size={24} />
              </div>
              <div>
                <p className="mono text-[10px] uppercase font-bold opacity-40">Location</p>
                <p className="font-semibold">Worldwide · Remote</p>
              </div>
            </div>

            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border border-brand-ink/5 group-hover:bg-brand-accent group-hover:text-white transition-all shadow-sm">
                <Phone size={24} />
              </div>
              <div>
                <p className="mono text-[10px] uppercase font-bold opacity-40">Availability</p>
                <p className="font-semibold">Mon — Fri, 9am — 6pm</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-brand-ink text-white p-10 sm:p-16 rounded-[40px] relative overflow-hidden shadow-2xl">
          {/* Background Decorative Blob */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/20 rounded-full blur-[80px] -mr-32 -mt-32" />
          
          <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] mono uppercase font-bold opacity-60">Your Name</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border-none rounded-2xl px-6 py-5 focus:ring-1 focus:ring-brand-accent transition-all text-white placeholder:text-white/20"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] mono uppercase font-bold opacity-60">Email Address</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border-none rounded-2xl px-6 py-5 focus:ring-1 focus:ring-brand-accent transition-all text-white placeholder:text-white/20"
                placeholder="hello@company.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] mono uppercase font-bold opacity-60">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white/5 border-none rounded-2xl px-6 py-5 focus:ring-1 focus:ring-brand-accent transition-all text-white placeholder:text-white/20"
                placeholder="New Project Inquiry"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] mono uppercase font-bold opacity-60">Message</label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-white/5 border-none rounded-2xl px-6 py-5 focus:ring-1 focus:ring-brand-accent transition-all text-white placeholder:text-white/20 resize-none"
                placeholder="Tell me about your project..."
              />
            </div>

            <button
              type="submit"
              disabled={status !== 'idle'}
              className={`w-full py-6 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${
                status === 'success' 
                ? 'bg-green-500 text-white' 
                : 'bg-brand-accent text-white hover:bg-white hover:text-brand-ink'
              } disabled:opacity-50`}
            >
              {status === 'success' ? (
                <>Message Sent Successfully</>
              ) : (
                <>
                  <Send size={18} />
                  {status === 'submitting' ? 'Sending...' : 'Send Message'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
