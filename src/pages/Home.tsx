import React, { useState, useEffect } from 'react';
import { designService } from '../services/designService';
import { Design, Category } from '../types';
import { Link } from 'react-router-dom';
import DesignCard from '../components/DesignCard';
import { Search, SlidersHorizontal, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES: Category[] = ["Social Media Designs", "Web3 Designs", "Print Media", "Flyers/Posters", "Product Designs", "Motion Graphics"];

export default function Home() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [featured, setFeatured] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [all, feat] = await Promise.all([
        designService.getAllDesigns(selectedCategory || undefined, searchQuery),
        designService.getFeatured()
      ]);
      setDesigns(all);
      setFeatured(feat);
      setLoading(false);
    }
    fetchData();
  }, [selectedCategory, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchTerm);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero / Featured */}
      <section className="relative overflow-hidden bg-brand-ink text-white py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-6 mono text-[10px] uppercase tracking-[0.3em] opacity-60">
              <Star size={12} className="fill-brand-accent text-brand-accent" />
              <span>Selected Works</span>
            </div>
            <h1 className="display text-5xl sm:text-7xl font-bold leading-tight mb-8">
              Crafting Compelling <span className="italic font-normal">Visual</span> Narratives.
            </h1>
            <p className="text-white/80 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl">
              I don't just create graphics; I build comprehensive visual stories that solve problems, beautify, and elevate brands.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <form onSubmit={handleSearch} className="flex-1 max-w-sm relative">
                <input
                  type="text"
                  placeholder="Search projects or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-full py-4 px-6 focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all placeholder:text-white/40 text-sm"
                />
                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-brand-accent transition-colors">
                  <Search size={20} />
                </button>
              </form>
              <Link 
                to="/contact"
                className="bg-brand-accent hover:bg-brand-accent/90 text-white px-10 py-4 rounded-full font-bold text-sm tracking-tight transition-all hover:scale-105 active:scale-95 flex items-center justify-center whitespace-nowrap"
              >
                Let's Work Together
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-1/2 -right-20 w-[600px] h-[600px] bg-brand-accent/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />
      </section>

      {/* Filter Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-brand-ink/10 pb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-2 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === null 
                ? 'bg-brand-ink text-white' 
                : 'bg-white dark:bg-dark-bg/20 border border-brand-ink/10 dark:border-white/10 hover:border-brand-ink/30 dark:hover:border-white/30 text-brand-ink dark:text-dark-ink'
              }`}
            >
              All Works
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat 
                  ? 'bg-brand-ink text-white' 
                  : 'bg-white dark:bg-dark-bg/20 border border-brand-ink/10 dark:border-white/10 hover:border-brand-ink/30 dark:hover:border-white/30 text-brand-ink dark:text-dark-ink'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 mono text-[10px] opacity-70 uppercase tracking-widest font-bold text-brand-ink dark:text-dark-ink">
            <SlidersHorizontal size={14} />
            Filter
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="max-w-7xl mx-auto px-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="aspect-square bg-brand-ink/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : designs.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16"
          >
            {designs.map(design => (
              <div key={design.id}>
                <DesignCard design={design} />
              </div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-40">
            <p className="serif text-2xl mb-4">No designs found.</p>
            <button 
              onClick={() => { setSelectedCategory(null); setSearchQuery(''); setSearchTerm(''); }}
              className="text-brand-accent underline underline-offset-4"
            >
              View all works
            </button>
          </div>
        )}
      </section>

      {/* About Me Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 border-t border-brand-ink/10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-brand-ink/5 border border-brand-ink/10">
              <img 
                src="https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=2400&auto=format&fit=crop" 
                alt="Profile" 
                className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 transition-all duration-700"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-brand-accent rounded-full flex items-center justify-center p-8 text-white shadow-2xl">
              <p className="mono text-[10px] uppercase font-bold tracking-widest text-center">4+ Years of Design Excellence</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="mono text-[10px] uppercase tracking-[0.3em] opacity-80 text-brand-ink dark:text-dark-ink">About the creative</div>
            <h2 className="serif text-5xl font-bold leading-tight">Mastering the Art of <span className="italic font-normal">Minimalism</span>.</h2>
            <div className="space-y-6 text-brand-ink dark:text-dark-ink leading-relaxed text-lg">
              <p>
                I am a passionate graphic designer dedicated to creating visual experiences that resonate and inspire. With a focus on simplicity, purpose, and aesthetics, I help brands find their unique voice in a crowded digital landscape.
              </p>
              <p>
                My approach combines strategic thinking with artistic intuition. From subtle social media assets to complex web3 interfaces, I believe every pixel should serve a goal.
              </p>
            </div>
            <div className="flex gap-4 pt-4">
              <div className="bg-white dark:bg-dark-bg/40 p-6 rounded-2xl border border-brand-ink/5 dark:border-white/5 shadow-sm flex-1">
                <p className="mono text-[10px] uppercase opacity-70 dark:opacity-80 mb-2">Philosophy</p>
                <p className="font-bold text-sm">Less is more, but enough is just right.</p>
              </div>
              <div className="bg-white dark:bg-dark-bg/40 p-6 rounded-2xl border border-brand-ink/5 dark:border-white/5 shadow-sm flex-1">
                <p className="mono text-[10px] uppercase opacity-70 dark:opacity-80 mb-2">Process</p>
                <p className="font-bold text-sm">Research, Iterate, Refine, Deliver.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
