// src/pages/Blog.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Calendar, 
  User, 
  Edit, 
  Trash2, 
  Plus,
  Eye,
  Cpu,
  Network,
  Brain,
  Activity,
  Search,
  Filter,
  Clock,
  TrendingUp
} from 'lucide-react';
import { collection, getDocs, deleteDoc, doc, orderBy, query, where } from 'firebase/firestore';
import { db } from '../../firebase';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchPosts();
    checkAdminStatus();
  }, []);

  // Fetch posts from Firebase
  const fetchPosts = async () => {
    try {
      const postsRef = collection(db, 'blogPosts');
      const q = query(postsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const mappedPosts = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title,
          content: data.content,
          category: data.category || 'General',
          author: data.author || { name: 'Neural Admin', avatar: 'https://via.placeholder.com/32' },
          image: data.image || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500&h=300&fit=crop',
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          slug: data.slug || docSnap.id,
          excerpt: data.excerpt || (data.content ? data.content.substring(0, 150) + '...' : ''),
          readTime: data.readTime || '5 min',
          views: data.views || 0,
          tags: data.tags || ['ai', 'fitness'],
          featured: data.featured || false
        };
      });

      setPosts(mappedPosts);
      extractCategories(mappedPosts);
    } catch (err) {
      console.error(err);
      setError('NEURAL NETWORK ERROR: Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const extractCategories = (posts) => {
    const uniqueCategories = [...new Set(posts.map(post => post.category))];
    setCategories(['all', ...uniqueCategories]);
  };

  // Check if user is admin
  const checkAdminStatus = async () => {
    // Example: get role from localStorage or Firebase Auth token
    const token = localStorage.getItem('token');
    if (token) {
      // Simplified example, adjust according to your auth system
      setIsAdmin(true); 
    }
  };

  // Delete post
  const deletePost = async (postId) => {
    if (!window.confirm('ACTIVATE DELETE PROTOCOL? This action cannot be reversed.')) return;

    try {
      await deleteDoc(doc(db, 'blogPosts', postId));
      setPosts(posts.filter(post => post.id !== postId));
    } catch (err) {
      console.error(err);
      setError('SYSTEM ERROR: Failed to delete post');
    }
  };

  // Filter posts based on search and category
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full"
      />
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-red-400 text-xl bg-red-900/20 p-8 rounded-2xl border border-red-500/30"
      >
        {error}
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-[70px]">
      {/* Enhanced Cyber Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-cyan-900/10 pointer-events-none"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-500/10 via-gray-900 to-purple-900/20 pointer-events-none"></div>
      
      {/* Main Content */}
      <div className="relative z-10">
        

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <motion.section 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-8"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              CYBER FITNESS INTELLIGENCE
            </motion.h1>
            <motion.p 
              className="text-xl text-cyan-200 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Access cutting-edge research, AI training methodologies, and neural network insights 
              from the forefront of cybernetic fitness evolution.
            </motion.p>
          </motion.section>

          {/* Search and Filters */}
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cyan-400" />
                  <input
                    type="text"
                    placeholder="SCAN NEURAL DATABASE..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-700/50 border border-cyan-500/30 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-cyan-300/60 font-mono"
                  />
                </div>
                
                {/* Category Filter */}
                <div className="flex items-center gap-4">
                  <Filter className="h-5 w-5 text-purple-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-gray-700/50 border border-purple-500/30 rounded-xl px-4 py-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white"
                  >
                    {categories.map(category => (
                      <option key={category} value={category} className="bg-gray-800">
                        {category.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Blog Posts Grid */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <AnimatePresence>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    className="bg-gray-800/30 backdrop-blur-md rounded-2xl border border-cyan-500/20 overflow-hidden hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 group"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    {/* Featured Badge */}
                    {post.featured && (
                      <div className="absolute top-4 left-4 z-10">
                        <span className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg shadow-yellow-500/30">
                          FEATURED
                        </span>
                      </div>
                    )}

                    {/* Image */}
                    <div className="relative overflow-hidden">
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                      <div className="absolute bottom-4 left-4">
                        <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-sm border border-cyan-500/30">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Meta Info */}
                      <div className="flex items-center justify-between mb-4 text-sm">
                        <div className="flex items-center gap-4 text-cyan-300">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{post.createdAt.toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-purple-300">
                          <Eye className="h-4 w-4" />
                          <span>{post.views}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-bold text-cyan-100 mb-3 line-clamp-2 group-hover:text-cyan-50 transition-colors">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-gray-300 mb-6 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {post.tags.slice(0, 3).map(tag => (
                          <span 
                            key={tag}
                            className="bg-purple-500/10 text-purple-300 px-2 py-1 rounded text-xs border border-purple-500/20"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Author and Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-cyan-500/20">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm text-cyan-300">{post.author.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <motion.a
                            href={`/blog/${post.slug}`}
                            className="text-cyan-400 hover:text-cyan-300 p-2 hover:bg-cyan-500/20 rounded-lg transition-all duration-300"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Eye className="h-4 w-4" />
                          </motion.a>
                          
                          {isAdmin && (
                            <>
                              <motion.a
                                href={`/admin/blog/edit/${post.id}`}
                                className="text-green-400 hover:text-green-300 p-2 hover:bg-green-500/20 rounded-lg transition-all duration-300"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Edit className="h-4 w-4" />
                              </motion.a>
                              <motion.button
                                onClick={() => deletePost(post.id)}
                                className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </motion.button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </AnimatePresence>

            {/* Empty State */}
            {filteredPosts.length === 0 && (
              <motion.div 
                className="text-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Cpu className="h-24 w-24 text-gray-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-400 mb-4">NO NEURAL PATTERNS DETECTED</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  No blog posts match your current search parameters. 
                  Try adjusting your filters or check back later for new content.
                </p>
              </motion.div>
            )}
          </motion.section>

          {/* CTA Section */}
          {isAdmin && (
            <motion.section
              className="text-center mt-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <motion.div 
                className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-8 hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-500"
                whileHover={{ scale: 1.02 }}
              >
                <Brain className="h-16 w-16 text-cyan-400 mx-auto mb-6" />
                <h3 className="text-3xl font-bold text-cyan-300 mb-4">
                  DEPLOY NEW NEURAL CONTENT
                </h3>
                <p className="text-cyan-200 text-lg mb-6">
                  Share your cyber fitness insights with the neural network.
                </p>
                <motion.a
                  href="/admin/blog/new"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="h-5 w-5" />
                  INITIATE CONTENT CREATION
                </motion.a>
              </motion.div>
            </motion.section>
          )}
        </main>
      </div>
    </div>
  );
};

export default Blog;