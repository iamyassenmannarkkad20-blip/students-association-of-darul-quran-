import React, { useState } from 'react';
import { apiRequest } from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  PenTool, MessageSquare, BookOpen, FileText, CheckCircle2,
  AlertCircle, ArrowRight, ExternalLink, GraduationCap, Video,
  FolderGit2, Lock, LogIn, Sparkles, Layers
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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'class_union' | 'post' | 'article' | 'notes'>('class_union');

  // Class Union Upload Form (Projects, Notes, Videos, Magazines)
  const [classUnionForm, setClassUnionForm] = useState({
    classCode: user?.classCode || '01',
    title: '',
    category: 'PROJECT' as 'PROJECT' | 'MAGAZINE' | 'VIDEO' | 'POSTER' | 'DOCUMENT',
    itemUrl: '',
    thumbnailUrl: '',
    description: '',
  });

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
    classCode: user?.classCode || '01',
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

  // Submit Class Union Item (Projects, Notes, Videos, Magazines)
  const handleClassUnionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await apiRequest(`/class-unions/${classUnionForm.classCode}/items`, {
      method: 'POST',
      body: JSON.stringify({
        title: classUnionForm.title,
        description: classUnionForm.description,
        category: classUnionForm.category,
        item_url: classUnionForm.itemUrl,
        thumbnail_url: classUnionForm.thumbnailUrl,
      }),
    });

    setSubmitting(false);
    if (res.success) {
      setSuccessMsg(`🎉 Successfully published under Class ${classUnionForm.classCode} Union! It is now live in your Class Union and synchronized into the Digital Library.`);
      setClassUnionForm({
        classCode: user?.classCode || '01',
        title: '',
        category: 'PROJECT',
        itemUrl: '',
        thumbnailUrl: '',
        description: '',
      });
    } else {
      setErrorMsg(res.error || 'Failed to submit class union release.');
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="font-cinzel text-3xl font-extrabold text-[#02167f]">Login Required to Create & Upload</h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            All guests, students, and outside visitors can read public discussions, view the digital library, and explore class projects freely.
            To contribute study notes, upload class union projects, or start discussions, please sign in with your verified SADQ credentials.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#02167f] text-[#ffd014] text-xs font-bold hover:bg-navy-800 transition-all shadow-md"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Your Account</span>
          </Link>
          <Link
            to="/library"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>Browse Digital Library</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-gold-700 bg-gold-50 w-fit px-3 py-1 rounded-full border border-gold-200 mb-2">
          <PenTool className="w-3.5 h-3.5 text-gold-600" />
          <span>Student Creator Studio</span>
        </div>
        <h1 className="font-cinzel text-3xl font-extrabold text-navy-950">Create & Share Knowledge</h1>
        <p className="text-sm text-slate-500 mt-1">
          Publish Class Union projects, upload study notes with Drive links, or contribute community discussions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => { setActiveTab('class_union'); setErrorMsg(null); setSuccessMsg(null); }}
          className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'class_union' ? 'border-[#02167f] text-[#02167f]' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-[#02167f]" />
          Class Union (Projects, Notes, Videos)
        </button>

        <button
          onClick={() => { setActiveTab('post'); setErrorMsg(null); setSuccessMsg(null); }}
          className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'post' ? 'border-[#02167f] text-[#02167f]' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Community Post
        </button>

        <button
          onClick={() => { setActiveTab('article'); setErrorMsg(null); setSuccessMsg(null); }}
          className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'article' ? 'border-[#02167f] text-[#02167f]' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Article / Creative Writing
        </button>

        <button
          onClick={() => { setActiveTab('notes'); setErrorMsg(null); setSuccessMsg(null); }}
          className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'notes' ? 'border-[#02167f] text-[#02167f]' : 'border-transparent text-slate-500 hover:text-slate-800'
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

      {/* 0. CLASS UNION PROJECT & MEDIA SUBMISSION */}
      {activeTab === 'class_union' && (
        <form onSubmit={handleClassUnionSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-cinzel font-bold text-slate-900 text-lg flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#02167f]" />
              Class Union Project, Notes & Video Submission
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Upload your projects, class magazines, documentaries, or study materials. They will be officially cataloged under your Class Union and synchronized into the Digital Library.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Target Class Union *</label>
              <select
                value={classUnionForm.classCode}
                onChange={(e) => setClassUnionForm({ ...classUnionForm, classCode: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#02167f] bg-white font-medium"
              >
                {CLASS_CODES.map((c) => (
                  <option key={c} value={c}>Class {c} Union</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Resource Category *</label>
              <select
                value={classUnionForm.category}
                onChange={(e) => setClassUnionForm({ ...classUnionForm, category: e.target.value as any })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#02167f] bg-white font-medium"
              >
                <option value="PROJECT">📁 Academic / Creative Project</option>
                <option value="VIDEO">🎥 Video / Documentary Link (YouTube / Drive)</option>
                <option value="DOCUMENT">📄 Study Notes & Research Document</option>
                <option value="MAGAZINE">📖 Class E-Magazine / Periodical</option>
                <option value="POSTER">🎨 Academic Poster / Infographic</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Project / Item Title *</label>
            <input
              type="text"
              required
              value={classUnionForm.title}
              onChange={(e) => setClassUnionForm({ ...classUnionForm, title: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#02167f]"
              placeholder="e.g., Arabic Syntax Comprehensive Guide or Class 06 Documentary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              External Resource Link (Google Drive / YouTube / Issuu / PDF) *
            </label>
            <input
              type="url"
              required
              value={classUnionForm.itemUrl}
              onChange={(e) => setClassUnionForm({ ...classUnionForm, itemUrl: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#02167f]"
              placeholder="https://drive.google.com/file/d/... or https://youtube.com/watch?v=..."
            />
            <p className="text-[11px] text-slate-400 mt-1">
              For Google Drive files, ensure permission is set to "Anyone with the link can view".
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Thumbnail / Cover Image URL (Optional)</label>
            <input
              type="url"
              value={classUnionForm.thumbnailUrl}
              onChange={(e) => setClassUnionForm({ ...classUnionForm, thumbnailUrl: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#02167f]"
              placeholder="https://images.unsplash.com/... or direct image URL"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Brief Description / Synopsis</label>
            <textarea
              rows={3}
              value={classUnionForm.description}
              onChange={(e) => setClassUnionForm({ ...classUnionForm, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#02167f] resize-none"
              placeholder="Describe the objective, methodology, or contents of this work..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 rounded-xl bg-[#02167f] text-[#ffd014] font-bold text-xs hover:bg-navy-900 disabled:opacity-50 shadow-md transition-all flex items-center gap-2"
          >
            <GraduationCap className="w-4 h-4" />
            <span>{submitting ? 'Publishing...' : 'Upload to Class Union & Digital Library'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
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
