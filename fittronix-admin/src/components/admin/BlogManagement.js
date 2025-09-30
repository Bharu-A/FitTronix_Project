// components/admin/BlogManagement.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Save, 
  X, 
  Loader2,
  Calendar,
  User,FileText
} from "lucide-react";
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  where 
} from "firebase/firestore";
import { db } from "../../firebase";

function BlogManagement() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const q = query(collection(db, "blogPosts"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const postsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBlogPosts(postsData);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      try {
        await deleteDoc(doc(db, "blogPosts", postId));
        await fetchBlogPosts();
      } catch (error) {
        console.error("Error deleting blog post:", error);
      }
    }
  };

  const togglePublishStatus = async (post) => {
    try {
      await updateDoc(doc(db, "blogPosts", post.id), {
        published: !post.published,
        updatedAt: serverTimestamp()
      });
      await fetchBlogPosts();
    } catch (error) {
      console.error("Error updating post status:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            BLOG MANAGEMENT
          </h1>
          <p className="text-cyan-200 mt-2">Create and manage blog posts</p>
        </div>
        <motion.button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-lg hover:from-cyan-700 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-cyan-500/30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="h-4 w-4" />
          NEW POST
        </motion.button>
      </div>

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-gray-800/50 rounded-xl border border-cyan-500/20 p-6 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-2/3"></div>
            </div>
          ))
        ) : blogPosts.length === 0 ? (
          <div className="col-span-3 text-center py-12">
            <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No blog posts yet</p>
            <p className="text-gray-500">Create your first blog post to get started</p>
          </div>
        ) : (
          blogPosts.map((post) => (
            <BlogPostCard 
              key={post.id} 
              post={post} 
              onEdit={() => setEditingPost(post)}
              onDelete={() => deletePost(post.id)}
              onTogglePublish={() => togglePublishStatus(post)}
            />
          ))
        )}
      </div>

      {showCreateModal && (
        <BlogPostModal 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={fetchBlogPosts}
        />
      )}

      {editingPost && (
        <BlogPostModal 
          post={editingPost}
          onClose={() => setEditingPost(null)} 
          onSuccess={fetchBlogPosts}
        />
      )}
    </div>
  );
}

// Blog Post Card Component
function BlogPostCard({ post, onEdit, onDelete, onTogglePublish }) {
  return (
    <motion.div 
      className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-cyan-500/20 p-6 hover:border-cyan-500/40 transition-all duration-300"
      whileHover={{ scale: 1.02, y: -5 }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-cyan-100 mb-2 line-clamp-2">
            {post.title}
          </h3>
          <p className="text-gray-300 text-sm line-clamp-3 mb-3">
            {post.excerpt || post.content?.substring(0, 100)}...
          </p>
        </div>
        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
          post.published 
            ? "bg-green-500/20 text-green-300 border border-green-500/30"
            : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
        }`}>
          {post.published ? "PUBLISHED" : "DRAFT"}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{post.createdAt?.toDate().toLocaleDateString()}</span>
          </div>
          {post.author && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{post.author}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <motion.button
          onClick={onTogglePublish}
          className={`flex-1 text-center py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            post.published
              ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/30"
              : "bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {post.published ? "UNPUBLISH" : "PUBLISH"}
        </motion.button>
        
        <motion.button
          onClick={onEdit}
          className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20 rounded-lg transition-all duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Edit className="h-4 w-4" />
        </motion.button>
        
        <motion.button
          onClick={onDelete}
          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Trash2 className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}

// Blog Post Modal Component
function BlogPostModal({ post, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: post?.title || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    author: post?.author || "Admin",
    category: post?.category || "fitness",
    tags: post?.tags?.join(", ") || "",
    featuredImage: post?.featuredImage || "",
    published: post?.published || false
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      const postData = {
        ...formData,
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
        updatedAt: serverTimestamp()
      };

      if (post) {
        // Update existing post
        await updateDoc(doc(db, "blogPosts", post.id), postData);
      } else {
        // Create new post
        await addDoc(collection(db, "blogPosts"), {
          ...postData,
          createdAt: serverTimestamp(),
          views: 0,
          likes: 0
        });
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving blog post:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-800 rounded-xl border border-cyan-500/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex justify-between items-center p-6 border-b border-cyan-500/20">
          <h2 className="text-xl font-semibold text-cyan-300">
            {post ? "EDIT BLOG POST" : "CREATE BLOG POST"}
          </h2>
          <button onClick={onClose} className="text-cyan-400 hover:text-cyan-300">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-1">TITLE</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-gray-700 border border-cyan-500/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white"
                placeholder="Enter post title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-1">CATEGORY</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full bg-gray-700 border border-purple-500/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white"
              >
                <option value="fitness">Fitness</option>
                <option value="nutrition">Nutrition</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="training">Training</option>
                <option value="health">Health</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-1">EXCERPT</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
              rows={2}
              className="w-full bg-gray-700 border border-cyan-500/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white"
              placeholder="Brief description of the post..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-1">CONTENT</label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              rows={12}
              className="w-full bg-gray-700 border border-purple-500/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white font-mono text-sm"
              placeholder="Write your blog post content here... (Markdown supported)"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-1">TAGS</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                className="w-full bg-gray-700 border border-pink-500/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-white"
                placeholder="tag1, tag2, tag3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-1">FEATURED IMAGE URL</label>
              <input
                type="url"
                value={formData.featuredImage}
                onChange={(e) => setFormData({...formData, featuredImage: e.target.value})}
                className="w-full bg-gray-700 border border-cyan-500/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => setFormData({...formData, published: e.target.checked})}
              className="rounded border-cyan-500/30 bg-gray-700 text-cyan-500 focus:ring-cyan-500"
            />
            <label htmlFor="published" className="text-sm text-cyan-400">
              Publish immediately
            </label>
          </div>
        </form>

        <div className="flex justify-end gap-3 p-6 border-t border-cyan-500/20">
          <motion.button
            onClick={onClose}
            className="px-4 py-2 text-cyan-300 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/10 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            CANCEL
          </motion.button>
          <motion.button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-lg hover:from-cyan-700 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "SAVING..." : (post ? "UPDATE POST" : "CREATE POST")}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default BlogManagement;