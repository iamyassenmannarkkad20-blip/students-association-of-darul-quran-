import React, { useState } from 'react';
import { apiRequest } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import {
  PenTool, MessageSquare, BookOpen, FileText, CheckCircle2,
  AlertCircle, ArrowRight, ExternalLink
} from 'lucide-react';

const CATEGORIES = [
  'Academic & Research',
  'Creative & Arts',
  'Campus & Organisation',
  'Technology & Skills',
  'Islamic Studies',
];

const CLASS_CODES = ['01', '02', '03', '04', '05', '06', '07', '08'];

export const CreateCenter: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'post' | 'article' | 'notes'>('post');

  // Community Post Form
  const [postForm, setPostForm] = useState({
    title: '',
    body: '',
    category: CATEGORIES[0],
    visibility: 'COMMUNITY',
  });

  // Article Form
  const [articleForm, setArticleForm] = useState({
    title: '',
    category: CATEGORIES[0],
    summary: '',
    content: '',
    coverImageUrl: '',
    visibility: 'COMMUNITY',
  });

  // Study Notes Form
  const [notesForm, setNotesForm] = useState({
    title: '',
    subjectArea: 'Islamic Jurisprudence',
    classCode: '01',
    description: '',
    fileUrl: '',
    downloadable: true,
    visibility: 'COMMUNITY',
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Submit Post
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await apiRequest('/community/posts', {
      method: 'POST',
      body: JSON.stringify(postForm),
    });

    setSubmitting(false);
    if (res.success) {
      setSuccessMsg('✅ Community post published successfully!');
      setTimeout(() => navigate('/community'), 1500);
    } else {
      setErrorMsg(res.error || 'Failed to submit post.');
    }
  };

  // Submit Article
  const handleArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await apiRequest('/community/articles', {
      method: 'POST',
      body: JSON.stringify(articleForm),
    });

    setSubmitting(false);
    if (res.success) {
      setSuccessMsg('✅ Article submitted for institutional review! Once approved by admin, it will be published.');
      setArticleForm({
        title: '',
        category: CATEGORIES[0],
        summary: '',
        content: '',
        coverImageUrl: '',
        visibility: 'COMMUNITY',
      });
    } else {
      setErrorMsg(res.error || 'Failed to submit article.');
    }
  };

  // Submit Study Notes
  const handleNotesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const fullDescription = `[Class ${notesForm.classCode}] ${notesForm.description || ''}`;

    const res = await apiRequest('/community/notes', {
      method: 'POST',
      body: JSON.stringify({
        title: notesForm.title,
        subjectArea: notesForm.subjectArea,
        description: fullDescription,
        fileUrl: notesForm.fileUrl,
        downloadable: notesForm.downloadable,
        visibility: notesForm.visibility,
      }),
    });

    setSubmitting(false);
    if (res.success) {
      setSuccessMsg('✅ Study notes submitted to digital repository!');
      setNotesForm({
        title: '',
        subjectArea: 'Islamic Jurisprudence',
        classCode: '01',
        description: '',
        fileUrl: '',
        downloadable: true,
        visibility: 'COMMUNITY',
      });
    } else {
      setErrorMsg(res.error || 'Failed to submit notes.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-gold-700 bg-gold-50 w-fit px-3 py-1 rounded-full border border-gold-200 mb-2">
          <PenTool className="w-3.5 h-3.5 text-gold-600" />
          <span>Student Creator Studio</span>
        </div>
        <h1 className="font-cinzel text-3xl font-extrabold text-navy-950">Create & Share Knowledge</h1>
        <p className="text-sm text-slate-500 mt-1">
          Publish discussion posts, submit creative articles, or contribute study notes with Google Drive links.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => { setActiveTab('post'); setErrorMsg(null); setSuccessMsg(null); }}
          className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'post' ? 'border-navy-900 text-navy-900' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Community Post
        </button>

        <button
          onClick={() => { setActiveTab('article'); setErrorMsg(null); setSuccessMsg(null); }}
          className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'article' ? 'border-navy-900 text-navy-900' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Article / Creative Writing
        </button>

        <button
          onClick={() => { setActiveTab('notes'); setErrorMsg(null); setSuccessMsg(null); }}
          className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'notes' ? 'border-navy-900 text-navy-900' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Study Notes (Drive Link)
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. COMMUNITY POST FORM */}
      {activeTab === 'post' && (
        <form onSubmit={handlePostSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 text-base">Write Community Post</h2>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Title *</label>
            <input
              required
              value={postForm.title}
              onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
              placeholder="e.g. Thoughts on balancing memorization and academics"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
              <select
                value={postForm.category}
                onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Visibility</label>
              <select
                value={postForm.visibility}
                onChange={(e) => setPostForm({ ...postForm, visibility: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
              >
                <option value="COMMUNITY">Community (Students & Teachers)</option>
                <option value="PUBLIC">Public (Visible to everyone)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Discussion Content *</label>
            <textarea
              required
              rows={6}
              value={postForm.body}
              onChange={(e) => setPostForm({ ...postForm, body: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 resize-none"
              placeholder="Share insights, ask questions, or begin a constructive discussion..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-navy-900 text-gold-300 font-bold text-xs hover:bg-navy-800 disabled:opacity-50 shadow-md transition-all flex items-center gap-2"
          >
            <span>{submitting ? 'Publishing...' : 'Publish to Feed'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      {/* 2. ARTICLE SUBMISSION FORM */}
      {activeTab === 'article' && (
        <form onSubmit={handleArticleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Submit Article or Essay</h2>
            <p className="text-xs text-slate-500">
              Articles are reviewed by official moderators before being published in the SADQ knowledge archive.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Article Title *</label>
            <input
              required
              value={articleForm.title}
              onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
              placeholder="e.g. The Historical Role of Arabic In Islamic Civilization"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
              <select
                value={articleForm.category}
                onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Cover Image URL (Optional)</label>
              <input
                type="url"
                value={articleForm.coverImageUrl}
                onChange={(e) => setArticleForm({ ...articleForm, coverImageUrl: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                placeholder="https://... cover photo link"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Executive Summary / Abstract</label>
            <textarea
              rows={2}
              value={articleForm.summary}
              onChange={(e) => setArticleForm({ ...articleForm, summary: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 resize-none"
              placeholder="A brief 1-2 sentence overview of your article..."
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Full Article Content (Malayalam or English) *</label>
            <textarea
              required
              rows={8}
              value={articleForm.content}
              onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 resize-none"
              placeholder="Write your article here..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-navy-900 text-gold-300 font-bold text-xs hover:bg-navy-800 disabled:opacity-50 shadow-md transition-all flex items-center gap-2"
          >
            <span>{submitting ? 'Submitting...' : 'Submit for Review'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      {/* 3. STUDY NOTES SUBMISSION */}
      {activeTab === 'notes' && (
        <form onSubmit={handleNotesSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Share Study Notes / Reference Material</h2>
            <p className="text-xs text-slate-500">
              Provide a Google Drive public link to your study notes or summaries for peers to study.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Notes Title *</label>
            <input
              required
              value={notesForm.title}
              onChange={(e) => setNotesForm({ ...notesForm, title: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
              placeholder="e.g. Nahw (Arabic Grammar) Simplified Summary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Subject Area *</label>
              <input
                required
                value={notesForm.subjectArea}
                onChange={(e) => setNotesForm({ ...notesForm, subjectArea: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                placeholder="e.g. Fiqh, Hadith, IT, Tajweed"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Class Code (01–08) *</label>
              <select
                value={notesForm.classCode}
                onChange={(e) => setNotesForm({ ...notesForm, classCode: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
              >
                {CLASS_CODES.map((c) => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Google Drive Public Link / PDF URL *
            </label>
            <input
              type="url"
              required
              value={notesForm.fileUrl}
              onChange={(e) => setNotesForm({ ...notesForm, fileUrl: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
              placeholder="https://drive.google.com/file/d/... or public download link"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Ensure Google Drive file permission is set to "Anyone with the link can view".
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Topics Covered / Description</label>
            <textarea
              rows={3}
              value={notesForm.description}
              onChange={(e) => setNotesForm({ ...notesForm, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 resize-none"
              placeholder="List specific chapters or topics covered in this PDF..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-navy-900 text-gold-300 font-bold text-xs hover:bg-navy-800 disabled:opacity-50 shadow-md transition-all flex items-center gap-2"
          >
            <span>{submitting ? 'Submitting...' : 'Contribute Study Notes'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      )}
    </div>
  );
};
