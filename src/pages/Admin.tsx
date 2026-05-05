import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { authService } from '../services/authService';
import { designService } from '../services/designService';
import { Category, Design, Inquiry } from '../types';
import { 
  Plus, 
  Trash2, 
  LayoutDashboard, 
  Image as ImageIcon, 
  Tags, 
  CheckCircle, 
  Inbox, 
  Grid, 
  FileText,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

const CATEGORIES: Category[] = ["Social Media Designs", "Web3 Designs", "Print Media", "Flyers/Posters", "Product Designs", "Motion Graphics"];

type AdminTab = 'upload' | 'portfolio' | 'inquiries';

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('upload');
  const navigate = useNavigate();

  // Portfolio State
  const [designs, setDesigns] = useState<Design[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [category, setCategory] = useState<Category>("Social Media Designs");
  const [tags, setTags] = useState('');
  const [featured, setFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = authService.onAuthChange((u) => {
      setUser(u);
      if (!authService.isAdmin(u) && !loading) {
        navigate('/');
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, [loading, navigate]);

  useEffect(() => {
    if (!user || !authService.isAdmin(user)) return;

    // Fetch designs
    const fetchDesigns = async () => {
      const data = await designService.getAllDesigns();
      setDesigns(data);
    };
    fetchDesigns();

    // Subscribe to inquiries
    const unsubscribeInquiries = designService.getInquiries(setInquiries);

    return () => {
       if (typeof unsubscribeInquiries === 'function') {
        (unsubscribeInquiries as any).then((unsub: any) => unsub && unsub());
      }
    };
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authService.isAdmin(user)) return;

    setSubmitting(true);
    try {
      const tagList = tags.split(',').map(t => t.trim()).filter(t => t !== '');
      const designData: Omit<Design, 'id' | 'createdAt' | 'likes' | 'views'> = {
        title,
        description,
        imageUrl,
        category,
        tags: tagList,
        authorId: user!.uid,
        featured
      };

      if (videoUrl) {
        designData.videoUrl = videoUrl;
      }

      await designService.createDesign(designData);
      
      // Reset form
      setTitle('');
      setDescription('');
      setImageUrl('');
      setVideoUrl('');
      setTags('');
      setFeatured(false);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Refresh designs list
      const updatedDesigns = await designService.getAllDesigns();
      setDesigns(updatedDesigns);
    } catch (error) {
      console.error(error);
      alert("Failed to upload design.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDesign = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this design?")) return;
    try {
      await designService.deleteDesign(id);
      setDesigns(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await designService.deleteInquiry(id);
      setInquiries(prev => prev.filter(i => i.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center mono uppercase tracking-widest animate-pulse">Checking Permissions...</div>;
  if (!authService.isAdmin(user)) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-brand-accent text-white flex items-center justify-center rounded-xl shadow-lg">
              <LayoutDashboard size={20} />
            </div>
            <p className="mono text-[10px] uppercase tracking-widest opacity-40">Portfolio Command</p>
          </div>
          <h1 className="serif text-5xl font-bold">Workspace</h1>
        </div>

        <div className="flex bg-white p-1.5 rounded-2xl border border-brand-ink/5 shadow-sm">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'upload' ? 'bg-brand-ink text-white' : 'hover:bg-brand-ink/5'
            }`}
          >
            <Plus size={16} />
            Add New
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'portfolio' ? 'bg-brand-ink text-white' : 'hover:bg-brand-ink/5'
            }`}
          >
            <Grid size={16} />
            Manage
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'inquiries' ? 'bg-brand-ink text-white' : 'hover:bg-brand-ink/5'
            }`}
          >
            <Inbox size={16} />
            Inquiries
            {inquiries.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-accent text-white text-[10px] flex items-center justify-center rounded-full border-2 border-brand-bg">
                {inquiries.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-12"
          >
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6 bg-white p-10 rounded-[2.5rem] shadow-xl shadow-brand-ink/5 border border-brand-ink/5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Design Title</label>
                  <input
                    required
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Minimalist Branding System"
                    className="w-full bg-brand-bg/50 border-none rounded-2xl px-6 py-5 focus:ring-2 focus:ring-brand-accent transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Thumbnail/Image URL</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-ink/20" size={20} />
                      <input
                        required
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full bg-brand-bg/50 border-none rounded-2xl pl-14 pr-6 py-5 focus:ring-2 focus:ring-brand-accent transition-all font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Video URL (Optional)</label>
                    <div className="relative">
                      <ExternalLink className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-ink/20" size={20} />
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="Youtube, Vimeo, or direct mp4"
                        className="w-full bg-brand-bg/50 border-none rounded-2xl pl-14 pr-6 py-5 focus:ring-2 focus:ring-brand-accent transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Category)}
                      className="w-full bg-brand-bg/50 border-none rounded-2xl px-6 py-5 focus:ring-2 focus:ring-brand-accent transition-all font-medium appearance-none"
                    >
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Tags (Comma separated)</label>
                    <div className="relative">
                      <Tags className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-ink/20" size={20} />
                      <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="branding, ui, clean"
                        className="w-full bg-brand-bg/50 border-none rounded-2xl pl-14 pr-6 py-5 focus:ring-2 focus:ring-brand-accent transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Description</label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the project goals and creative process..."
                    className="w-full bg-brand-bg/50 border-none rounded-2xl px-6 py-5 focus:ring-2 focus:ring-brand-accent transition-all font-medium resize-none text-sm leading-relaxed"
                  />
                </div>

                <div className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-6 h-6 rounded-lg border-brand-ink/10 text-brand-accent focus:ring-brand-accent cursor-pointer"
                  />
                  <label htmlFor="featured" className="text-sm font-semibold select-none cursor-pointer">Spotlight in Featured Section</label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-6 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${
                    success 
                    ? 'bg-green-500 text-white' 
                    : 'bg-brand-ink text-white hover:bg-brand-accent hover:shadow-2xl hover:shadow-brand-accent/20'
                  } disabled:opacity-50`}
                >
                  {success ? (
                    <>
                      <CheckCircle size={24} />
                      Project Published
                    </>
                  ) : (
                    <>
                      <Plus size={24} />
                      {submitting ? 'Processing...' : 'Upload Design'}
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="space-y-8">
              <div className="bg-brand-ink text-white p-10 rounded-[2.5rem] shadow-xl">
                <h3 className="serif text-2xl font-bold mb-4">Quick Guide</h3>
                <ul className="space-y-6">
                  <li className="flex gap-4">
                    <span className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">01</span>
                    <p className="text-sm opacity-60 leading-relaxed">Host your images on a provider like Cloudinary or Imgur for fast delivery.</p>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">02</span>
                    <p className="text-sm opacity-60 leading-relaxed">Descriptive tags help viewers find your work through the search bar.</p>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">03</span>
                    <p className="text-sm opacity-60 leading-relaxed">Featured works appear at the top of the home page for maximum impact.</p>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'portfolio' && (
          <motion.div
            key="portfolio"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-[2.5rem] border border-brand-ink/5 overflow-hidden shadow-xl shadow-brand-ink/5">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-brand-ink/5 mono text-[10px] uppercase tracking-widest opacity-40">
                    <th className="px-8 py-6">Design</th>
                    <th className="px-8 py-6">Category</th>
                    <th className="px-8 py-6">Stats</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-ink/5">
                  {designs.map(design => (
                    <tr key={design.id} className="group hover:bg-brand-bg/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <img src={design.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover bg-brand-ink/5" />
                          <div>
                            <p className="font-bold text-sm tracking-tight">{design.title}</p>
                            <p className="text-[10px] mono opacity-40">{format(new Date(design.createdAt?.toDate() || Date.now()), 'MMM d, yyyy')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-brand-accent/10 text-brand-accent px-3 py-1 rounded-full">
                          {design.category}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex gap-4 text-[10px] mono opacity-60">
                          <span>{design.views} Views</span>
                          <span>{design.likes} Likes</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {design.featured ? (
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-accent">
                            <CheckCircle size={14} /> Featured
                          </span>
                        ) : (
                          <span className="text-xs opacity-30 italic">Standard</span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => handleDeleteDesign(design.id)}
                          className="p-2 text-brand-ink/20 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'inquiries' && (
          <motion.div
            key="inquiries"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {inquiries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {inquiries.map(inquiry => (
                  <div key={inquiry.id} className="bg-white p-10 rounded-[2.5rem] border border-brand-ink/5 shadow-xl shadow-brand-ink/5 relative group">
                    <button
                      onClick={() => handleDeleteInquiry(inquiry.id)}
                      className="absolute top-8 right-8 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-brand-ink/20 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                    
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 bg-brand-bg rounded-full flex items-center justify-center text-brand-ink/40">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-bold tracking-tight">{inquiry.subject || 'General Inquiry'}</p>
                        <p className="text-[10px] mono opacity-40 uppercase tracking-widest">Received {format(new Date(inquiry.createdAt?.toDate() || Date.now()), 'MMM d, h:mm a')}</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-brand-bg/50 p-6 rounded-2xl">
                        <p className="text-sm leading-relaxed text-brand-ink/80 italic">"{inquiry.message}"</p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-brand-ink/5">
                        <div>
                          <p className="text-xs font-bold">{inquiry.name}</p>
                          <p className="text-[10px] mono opacity-60 underline decoration-brand-accent/30">{inquiry.email}</p>
                        </div>
                        <a 
                          href={`mailto:${inquiry.email}?subject=Re: ${inquiry.subject || 'Portfolio Inquiry'}`}
                          className="flex items-center gap-2 text-xs font-bold text-brand-accent hover:opacity-80 transition-opacity"
                        >
                          Reply <ChevronRight size={14} />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-40 bg-white rounded-[2.5rem] border border-brand-ink/5">
                <Inbox size={48} className="mx-auto mb-6 opacity-10" />
                <p className="serif text-2xl font-bold">No messages yet.</p>
                <p className="text-sm opacity-40">Inquiries from the contact form will appear here.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
