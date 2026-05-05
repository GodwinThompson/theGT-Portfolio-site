import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { designService } from '../services/designService';
import { Design, Review } from '../types';
import { Heart, Eye, Share2, ArrowLeft, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';

export default function DesignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [design, setDesign] = useState<Design | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchDesign() {
      const data = await designService.getDesign(id!);
      if (data) {
        setDesign(data);
        // Increment view count
        await designService.incrementViews(id!);
      } else {
        navigate('/');
      }
      setLoading(false);
    }

    fetchDesign();
    const unsubscribe = designService.getReviews(id!, setReviews);
    return () => {
      if (typeof unsubscribe === 'function') {
        (unsubscribe as any).then((unsub: any) => unsub && unsub());
      }
    };
  }, [id]);

  const handleLike = async () => {
    if (!design || liked) return;
    try {
      await designService.incrementLikes(design.id);
      setDesign(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
      setLiked(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: design?.title,
        text: design?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !reviewerName || !comment) return;

    setSubmittingReview(true);
    try {
      await designService.addReview(id, { reviewerName, comment });
      setReviewerName('');
      setComment('');
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderMedia = () => {
    if (!design) return null;

    if (design.videoUrl) {
      const isYoutube = design.videoUrl.includes('youtube.com') || design.videoUrl.includes('youtu.be');
      const isVimeo = design.videoUrl.includes('vimeo.com');

      if (isYoutube) {
        let videoId = '';
        if (design.videoUrl.includes('v=Header')) {
            videoId = design.videoUrl.split('v=')[1]?.split('&')[0];
        } else if (design.videoUrl.includes('youtu.be/')) {
            videoId = design.videoUrl.split('youtu.be/')[1]?.split('?')[0];
        } else if (design.videoUrl.includes('youtube.com/embed/')) {
            videoId = design.videoUrl.split('embed/')[1]?.split('?')[0];
        } else {
             videoId = new URL(design.videoUrl).searchParams.get('v') || design.videoUrl.split('/').pop() || '';
        }
        
        return (
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={design.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        );
      }

      if (isVimeo) {
        const videoId = design.videoUrl.split('/').pop();
        return (
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black">
            <iframe
              src={`https://player.vimeo.com/video/${videoId}`}
              title={design.title}
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        );
      }

      return (
        <video
          src={design.videoUrl}
          poster={design.imageUrl}
          controls
          className="w-full h-auto rounded-2xl shadow-2xl"
          autoPlay
          muted
          loop
        />
      );
    }

    return (
      <img
        src={design.imageUrl}
        alt={design.title}
        className="w-full h-auto rounded-2xl"
        referrerPolicy="no-referrer"
      />
    );
  };

  if (loading) return <div className="h-screen flex items-center justify-center mono uppercase tracking-widest animate-pulse">Loading Design...</div>;
  if (!design) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-12 text-sm font-medium hover:text-brand-accent transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Gallery
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Media Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-white dark:bg-[#141D17] rounded-3xl overflow-hidden shadow-2xl shadow-brand-ink/5 p-4 self-start"
        >
          {renderMedia()}
        </motion.div>

        {/* Info Section */}
        <div className="space-y-12">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className="mono text-[10px] uppercase font-bold bg-brand-ink text-white px-3 py-1 rounded-full">{design.category}</span>
              <span className="text-[10px] mono opacity-70 dark:opacity-80 font-medium">{format(new Date(design.createdAt?.toDate() || Date.now()), 'MMMM dd, yyyy')}</span>
            </div>
            <h1 className="serif text-5xl font-bold mb-6">{design.title}</h1>
            <p className="text-brand-ink dark:text-dark-ink leading-relaxed text-lg mb-8">{design.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-10">
              {design.tags.map(tag => (
                <span key={tag} className="px-4 py-1.5 bg-brand-ink/5 dark:bg-white/5 rounded-full text-xs mono">#{tag}</span>
              ))}
            </div>

            <div className="flex items-center gap-8 py-8 border-y border-brand-ink/10 dark:border-white/10">
              <button 
                onClick={handleLike}
                disabled={liked}
                className={`flex items-center gap-2.5 transition-all ${liked ? 'text-red-500 scale-110' : 'hover:text-red-500 text-brand-ink dark:text-dark-ink'}`}
              >
                <Heart size={24} className={liked ? 'fill-current' : ''} />
                <span className="mono text-sm font-bold">{design.likes}</span>
              </button>
              <div className="flex items-center gap-2.5 text-brand-ink/70 dark:text-dark-ink/70">
                <Eye size={24} />
                <span className="mono text-sm font-bold">{design.views}</span>
              </div>
              <button 
                onClick={handleShare}
                className="ml-auto w-12 h-12 flex items-center justify-center rounded-full border border-brand-ink/10 dark:border-white/10 hover:bg-brand-ink hover:text-white dark:hover:bg-brand-accent transition-all text-brand-ink dark:text-dark-ink dark:hover:text-white"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="space-y-8">
            <h3 className="serif text-2xl font-bold">Community Feedback</h3>
            
            <form onSubmit={handleSubmitReview} className="space-y-4 bg-white p-6 rounded-2xl border border-brand-ink/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full bg-brand-bg/50 dark:bg-dark-bg/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-brand-accent transition-all text-brand-ink dark:text-dark-ink"
                />
              </div>
              <textarea
                placeholder="Share your thoughts on this design..."
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-brand-bg/50 dark:bg-dark-bg/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-brand-accent transition-all resize-none text-brand-ink dark:text-dark-ink"
              />
              <button
                type="submit"
                disabled={submittingReview}
                className="w-full bg-brand-ink text-white py-3 rounded-xl text-sm font-bold hover:bg-brand-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send size={16} />
                {submittingReview ? 'Posting...' : 'Post Review'}
              </button>
            </form>

            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {reviews.length > 0 ? reviews.map(review => (
                <div key={review.id} className="border-l-2 border-brand-accent/20 pl-6 py-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm tracking-tight text-brand-ink dark:text-dark-ink">{review.reviewerName}</span>
                    <span className="text-[10px] mono opacity-60 dark:opacity-80 font-medium">{format(new Date(review.createdAt?.toDate() || Date.now()), 'MMM d, h:mm a')}</span>
                  </div>
                  <p className="text-sm text-brand-ink dark:text-dark-ink leading-relaxed italic">"{review.comment}"</p>
                </div>
              )) : (
                <p className="text-xs italic opacity-40 dark:opacity-60 text-center py-8">No reviews yet. Be the first to share your thoughts!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
