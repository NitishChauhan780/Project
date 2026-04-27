import { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { adminResourcesAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { FileText, Video, Activity, Plus, Edit, Trash2, Search, Link, Clock, Eye } from 'lucide-react';

export default function AdminResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [previewResource, setPreviewResource] = useState(null);
  const [formData, setFormData] = useState({
    title: '', content: '', body: '', language: 'en', category: 'article', tags: '', videoUrl: '', readTime: 5
  });
  const toast = useToast();

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const { data } = await adminResourcesAPI.getAll();
      setResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', body: '', language: 'en', category: 'article', tags: '', videoUrl: '', readTime: 5 });
    setEditingResource(null);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.warning('Please enter a title');
      return;
    }
    if (!formData.content.trim()) {
      toast.warning('Please enter a short description');
      return;
    }
    if (formData.category === 'video' && !formData.videoUrl.trim()) {
      toast.warning('Please enter a video URL for video resources');
      return;
    }
    if (formData.category === 'article' && !formData.body.trim()) {
      toast.warning('Please enter the article body content');
      return;
    }

    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        readTime: parseInt(formData.readTime) || 5
      };
      
      if (editingResource) {
        await adminResourcesAPI.update(editingResource._id, payload);
        toast.success('Resource updated successfully');
      } else {
        await adminResourcesAPI.create(payload);
        toast.success('Resource created successfully');
      }
      
      setShowModal(false);
      resetForm();
      fetchResources();
    } catch (error) {
      const msg = error.response?.data?.error || 'Error saving resource';
      toast.error(msg);
    }
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      content: resource.content,
      body: resource.body || '',
      language: resource.language,
      category: resource.category,
      tags: resource.tags?.join(', ') || '',
      videoUrl: resource.videoUrl || '',
      readTime: resource.readTime || 5
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this resource?')) {
      try {
        await adminResourcesAPI.delete(id);
        toast.success('Resource deleted');
        fetchResources();
      } catch (error) {
        toast.error('Error deleting resource');
      }
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'article': return <FileText className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'exercise': return <Activity className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'article': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
      case 'video': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
      case 'exercise': return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getVideoEmbedUrl = (url) => {
    if (!url) return '';
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    return url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 lg:ml-64">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Resource Management</h1>
                <p className="text-gray-500 dark:text-gray-400">Add articles, videos, and exercises for students</p>
              </div>
              <Button onClick={() => { resetForm(); setShowModal(true); }} icon={Plus}>
                Add Resource
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {['article', 'video', 'exercise'].map(cat => (
                <Card key={cat} className="text-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${getCategoryColor(cat)}`}>
                    {getCategoryIcon(cat)}
                  </div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {resources.filter(r => r.category === cat).length}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">{cat}s</p>
                </Card>
              ))}
            </div>

            <div className="space-y-8">
              {Object.entries(
                resources.reduce((acc, resource) => {
                  const cat = resource.category || "other";
                  if (!acc[cat]) acc[cat] = [];
                  acc[cat].push(resource);
                  return acc;
                }, {})
              ).map(([cat, resList]) => (
                <Card key={cat}>
                  <div className="flex items-center space-x-3 mb-6 pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div className={`p-2 rounded-lg ${getCategoryColor(cat)}`}>
                      {getCategoryIcon(cat)}
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white capitalize tracking-tight">{cat}s</h2>
                    <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2.5 py-0.5 rounded-full text-xs font-semibold ml-2">
                      {resList.length}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resList.map(resource => (
                      <div key={resource._id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary/30 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 ${getCategoryColor(resource.category)}`}>
                            {getCategoryIcon(resource.category)}
                            <span className="capitalize">{resource.category}</span>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => setPreviewResource(resource)}
                              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                              title="Preview"
                            >
                              <Eye className="w-4 h-4 text-gray-500" />
                            </button>
                            <button
                              onClick={() => handleEdit(resource)}
                              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4 text-gray-500" />
                            </button>
                            <button
                              onClick={() => handleDelete(resource._id)}
                              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-800 dark:text-white mb-1 line-clamp-1">{resource.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{resource.content}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-xs">
                            <span className={`px-2 py-1 rounded ${
                              resource.language === 'hi' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                            }`}>
                              {resource.language === 'hi' ? 'हिंदी' : 'English'}
                            </span>
                          </div>
                          {resource.category === 'video' && resource.videoUrl && (
                            <span className="text-xs text-gray-400 flex items-center">
                              <Link className="w-3 h-3 mr-1" /> Video
                            </span>
                          )}
                          {resource.category === 'article' && (
                            <span className="text-xs text-gray-400 flex items-center">
                              <Clock className="w-3 h-3 mr-1" /> {resource.readTime || 5} min
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
              {resources.length === 0 && (
                <Card className="text-center py-16">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No Resources Yet</h3>
                  <p className="text-gray-500 dark:text-gray-400">Click "Add Resource" to start building the library.</p>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add/Edit Resource Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingResource ? 'Edit Resource' : 'Add New Resource'}
        size="lg"
      >
        <div className="space-y-4">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Resource Type</label>
            <div className="flex gap-2">
              {['article', 'video', 'exercise'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFormData({ ...formData, category: cat })}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium capitalize transition-all ${
                    formData.category === cat
                      ? 'bg-primary dark:bg-primary text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {getCategoryIcon(cat)}
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
              placeholder="e.g., Understanding Exam Anxiety"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Short Description *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white resize-none"
              placeholder="Brief description shown on the resource card"
            />
          </div>

          {/* Video URL - only for video type */}
          {formData.category === 'video' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Video URL *</label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">Supports YouTube links and direct embed URLs</p>
            </div>
          )}

          {/* Article Body - only for article type */}
          {formData.category === 'article' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Article Body *</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white resize-none font-mono text-sm"
                  placeholder="Write the full article content here. You can use paragraphs separated by blank lines."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Read Time (minutes)</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={formData.readTime}
                  onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                  className="w-24 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                />
              </div>
            </>
          )}

          {/* Exercise body */}
          {formData.category === 'exercise' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exercise Instructions</label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                rows={6}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white resize-none"
                placeholder="Step-by-step instructions for the exercise..."
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                placeholder="stress, anxiety, sleep"
              />
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full">
            {editingResource ? 'Update Resource' : 'Create Resource'}
          </Button>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={!!previewResource}
        onClose={() => setPreviewResource(null)}
        title={previewResource?.title || ''}
        size="xl"
      >
        {previewResource && (
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <span className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center space-x-1 ${getCategoryColor(previewResource.category)}`}>
                {getCategoryIcon(previewResource.category)}
                <span className="capitalize">{previewResource.category}</span>
              </span>
              <span className="text-sm text-gray-500">{previewResource.language === 'hi' ? 'हिंदी' : 'English'}</span>
              {previewResource.readTime && (
                <span className="text-sm text-gray-500 flex items-center">
                  <Clock className="w-4 h-4 mr-1" /> {previewResource.readTime} min read
                </span>
              )}
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-4 italic">{previewResource.content}</p>

            {previewResource.category === 'video' && previewResource.videoUrl && (
              <div className="aspect-video rounded-xl overflow-hidden bg-black mb-4">
                <iframe
                  src={getVideoEmbedUrl(previewResource.videoUrl)}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            )}

            {(previewResource.category === 'article' || previewResource.category === 'exercise') && previewResource.body && (
              <div className="prose dark:prose-invert max-w-none">
                {previewResource.body.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">{paragraph}</p>
                ))}
              </div>
            )}

            {previewResource.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {previewResource.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-accent/20 text-accent rounded text-xs">{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

