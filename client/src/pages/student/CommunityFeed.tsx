import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { MessageSquare, ThumbsUp, Lightbulb, Heart, Plus, Send, ChevronDown } from 'lucide-react';

const CATEGORIES = ['Academic & Research', 'Creative & Arts', 'Campus & Organisation', 'Technology & Skills'];
const REACTION_ICONS: Record<string, any> = {
  like: ThumbsUp,
  insightful: Lightbulb,
  appreciate: Heart,
};

export const CommunityFeed: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', category: CATEGORIES[0], visibility: 'COMMUNITY' });
  const [submitting, setSubmitting] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});

  const loadPosts = async () => {
    setLoading(true);
    const url = activeCategory ? `/community/posts?category=${encodeURIComponent(activeCategory)}` : '/community/posts';
    const res = await apiRequest(url);
    if (res.success && res.data) setPosts(res.data);
    setLoading(false);
  };

  useEffect(() => { loadPosts(); }, [activeCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await apiRequest('/community/posts', { method: 'POST', body: JSON.stringify(form) });
    setSubmitting(false);
    if (res.success) {
      setShowCreate(false);
      setForm({ title: '', body: '', category: CATEGORIES[0], visibility: 'COMMUNITY' });
      loadPosts();
    }
  };

  const handleReact = async (postId: string, reactionType: string) => {
    await apiRequest(`/community/posts/${postId}/react`, { method: 'POST', body: JSON.stringify({ reactionType }) });
    loadPosts();
  };

  const loadComments = async (postId: string) => {
    const res = await apiRequest(`/community/posts/${postId}/comments`);
    if (res.success && res.data) setComments(prev => ({ ...prev, [postId]: res.data }));
  };

  const togglePost = async (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
      await loadComments(postId);
    }
  };

  const handleComment = async (postId: string) => {
    const body = commentText[postId]?.trim();
    if (!body) return;
    await apiRequest(`/community/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ body }) });
    setCommentText(prev => ({ ...prev, [postId]: '' }));
    await loadComments(postId);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-cinzel text-2xl font-bold text-navy-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-navy-700" /> Community Discourse
          </h1>
          <p className="text-sm text-slate-500 mt-1">A focused student knowledge and discussion space.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-900 text-gold-300 text-xs font-bold hover:bg-navy-800 transition-colors">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {/* Create Post Form */}
      {showCreate && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Create Community Post</h3>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Title *</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900" placeholder="Post title..." />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Content *</label>
            <textarea value={form.body} onChange={e => setForm({...form, body: e.target.value})} required
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 resize-none h-28" placeholder="Write your post..." />
          </div>
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                className="px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Visibility</label>
              <select value={form.visibility} onChange={e => setForm({...form, visibility: e.target.value})}
                className="px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white">
                <option value="COMMUNITY">Community</option>
                <option value="PUBLIC">Public (Review Required)</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting}
              className="px-5 py-2 rounded-xl bg-navy-900 text-gold-300 text-xs font-bold hover:bg-navy-800 transition-colors disabled:opacity-50">
              {submitting ? 'Publishing...' : 'Publish Post'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)}
              className="px-5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setActiveCategory('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${!activeCategory ? 'bg-navy-900 text-gold-300' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          All
        </button>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeCategory === cat ? 'bg-navy-900 text-gold-300' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading community posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-700 text-sm">No posts yet — be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-navy-900 text-gold-300 flex items-center justify-center text-xs font-bold shrink-0">
                    {(post.author_name || 'A')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-semibold text-slate-900 text-sm">{post.author_name || 'Member'}</span>
                      <span className="text-[10px] font-bold text-navy-900 bg-navy-50 px-2 py-0.5 rounded border border-navy-200">{post.category}</span>
                      {post.pinned && <span className="text-[10px] font-bold text-gold-700 bg-gold-50 px-2 py-0.5 rounded border border-gold-200">📌 Pinned</span>}
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mt-1">{post.title}</h3>
                    <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{post.body}</p>
                    <p className="text-xs text-slate-400 mt-2">{new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Reactions */}
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100">
                  {(['like', 'insightful', 'appreciate'] as const).map(reaction => {
                    const Icon = REACTION_ICONS[reaction];
                    return (
                      <button key={reaction} onClick={() => handleReact(post.id, reaction)}
                        className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${post.user_reaction === reaction ? 'bg-navy-100 text-navy-900' : 'text-slate-500 hover:bg-slate-100'}`}>
                        <Icon className="w-3.5 h-3.5" />
                        <span>{reaction}</span>
                      </button>
                    );
                  })}
                  <div className="ml-auto flex items-center gap-1 text-xs text-slate-500">
                    <span>{post.reactions_count || 0} reactions</span>
                  </div>
                  <button onClick={() => togglePost(post.id)}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-navy-900 transition-colors">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{post.comments_count || 0}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${expandedPost === post.id ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Comments */}
              {expandedPost === post.id && (
                <div className="border-t border-slate-100 bg-slate-50 p-4 space-y-3">
                  {(comments[post.id] || []).map((c: any) => (
                    <div key={c.id} className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-navy-800 text-gold-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                        {(c.author_name || 'A')[0]}
                      </div>
                      <div className="bg-white rounded-xl px-3 py-2 text-xs text-slate-700 border border-slate-200 flex-1">
                        <strong className="text-slate-900">{c.author_name || 'Member'}: </strong>
                        {c.body}
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <input
                      value={commentText[post.id] || ''}
                      onChange={e => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleComment(post.id)}
                      placeholder="Add a comment..."
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
                    />
                    <button onClick={() => handleComment(post.id)}
                      className="px-3 py-2 rounded-xl bg-navy-900 text-gold-300 hover:bg-navy-800 transition-colors">
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
