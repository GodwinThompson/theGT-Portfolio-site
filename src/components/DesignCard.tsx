import React from 'react';
import { Link } from 'react-router-dom';
import { Design } from '../types';
import { Heart, Eye, ArrowUpRight, Play } from 'lucide-react';
import { motion } from 'motion/react';

interface DesignCardProps {
  design: Design;
}

export default function DesignCard({ design }: DesignCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -12, 
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      className="group bg-white dark:bg-[#141D17] p-3 rounded-[2rem] border border-brand-ink/5 hover:shadow-2xl hover:shadow-brand-ink/10 transition-shadow duration-300"
    >
      <Link to={`/design/${design.id}`} className="block relative overflow-hidden bg-brand-ink/5 aspect-square rounded-2xl">
        <img
          src={design.imageUrl}
          alt={design.title}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-brand-ink/0 group-hover:bg-brand-ink/20 transition-colors pointer-events-none" />
        
        <div className="absolute top-4 right-4 flex gap-2">
          {design.videoUrl && (
            <div className="bg-brand-accent/90 backdrop-blur-sm p-2 rounded-full shadow-lg">
              <Play size={20} className="text-white fill-white" />
            </div>
          )}
          <div className="bg-white/90 dark:bg-black/40 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0">
            <ArrowUpRight size={20} className="text-brand-ink dark:text-white" />
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white/90 dark:bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
             <span className="mono text-[10px] uppercase font-bold text-brand-ink dark:text-white">{design.category}</span>
          </div>
        </div>
      </Link>
      
      <div className="mt-4 flex justify-between items-start">
        <div>
          <h3 className="display text-lg font-bold group-hover:text-brand-accent transition-colors text-brand-ink dark:text-dark-ink">{design.title}</h3>
          <div className="flex gap-2 mt-1">
            {design.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] mono opacity-60 dark:opacity-80">#{tag}</span>
            ))}
          </div>
        </div>
        <div className="flex gap-3 text-brand-ink/60 dark:text-dark-ink/80 mono text-[10px]">
          <span className="flex items-center gap-1"><Eye size={12} /> {design.views}</span>
          <span className="flex items-center gap-1"><Heart size={12} /> {design.likes}</span>
        </div>
      </div>
    </motion.div>
  );
}
