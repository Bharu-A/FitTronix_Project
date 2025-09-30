// components/admin/ContentManagement.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Save, 
  Edit, 
  Eye, 
  FileText, 
  MessageCircle, 
  HelpCircle, 
  Shield,
  Plus,
  Trash2,
  X,
  Loader2
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
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../../firebase";

function ContentManagement() {
  const [activeContentTab, setActiveContentTab] = useState("about");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const contentTabs = [
    { id: "about", label: "ABOUT PAGE", icon: FileText },
    { id: "privacy", label: "PRIVACY POLICY", icon: Shield },
    { id: "faq", label: "FAQ MANAGEMENT", icon: HelpCircle },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            CONTENT MANAGEMENT
          </h1>
          <p className="text-cyan-200 mt-2">Manage website content and pages</p>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="flex space-x-2 mb-6">
        {contentTabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveContentTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition-all duration-300 ${
              activeContentTab === tab.id
                ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border-cyan-500/30 shadow-lg shadow-cyan-500/20"
                : "text-gray-400 border-gray-600 hover:text-cyan-300 hover:border-cyan-500/30"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <tab.icon className="h-4 w-4" />
            <span className="font-medium">{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-cyan-500/20 p-6">
        {activeContentTab === "about" && <AboutPageEditor />}
        {activeContentTab === "privacy" && <PrivacyPolicyEditor />}
        {activeContentTab === "faq" && <FAQManagement />}
      </div>
    </div>
  );
}

// About Page Editor Component
function AboutPageEditor() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const fetchAboutContent = async () => {
    try {
      const docRef = doc(db, "content", "about");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setContent(docSnap.data().content || "");
      } else {
        // Initialize with default content
        setContent("# About Us\n\nWelcome to our fitness platform...");
      }
    } catch (error) {
      console.error("Error fetching about content:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveAboutContent = async () => {
    try {
      setSaving(true);
      const docRef = doc(db, "content", "about");
      await updateDoc(docRef, {
        content,
        updatedAt: serverTimestamp(),
        updatedBy: "admin" // You can replace with actual admin user ID
      });
      // Show success message
    } catch (error) {
      console.error("Error saving about content:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-cyan-300">ABOUT PAGE CONTENT</h2>
        <motion.button
          onClick={saveAboutContent}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-lg hover:from-cyan-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "SAVING..." : "SAVE CHANGES"}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-cyan-400 mb-2">
            EDIT CONTENT (Markdown Supported)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="w-full bg-gray-700 border border-cyan-500/30 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-400 font-mono text-sm"
            placeholder="Enter your content here... (Markdown supported)"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-cyan-400 mb-2">
            PREVIEW
          </label>
          <div className="bg-white rounded-lg p-6 h-full overflow-auto">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Privacy Policy Editor (Similar structure)
function PrivacyPolicyEditor() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPrivacyContent();
  }, []);

  const fetchPrivacyContent = async () => {
    try {
      const docRef = doc(db, "content", "privacy");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setContent(docSnap.data().content || "");
      } else {
        setContent("# Privacy Policy\n\nYour privacy is important to us...");
      }
    } catch (error) {
      console.error("Error fetching privacy content:", error);
    } finally {
      setLoading(false);
    }
  };

  const savePrivacyContent = async () => {
    try {
      setSaving(true);
      const docRef = doc(db, "content", "privacy");
      await updateDoc(docRef, {
        content,
        updatedAt: serverTimestamp(),
        updatedBy: "admin"
      });
    } catch (error) {
      console.error("Error saving privacy content:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-cyan-300">PRIVACY POLICY</h2>
        <motion.button
          onClick={savePrivacyContent}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-lg hover:from-cyan-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "SAVING..." : "SAVE CHANGES"}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-cyan-400 mb-2">
            EDIT PRIVACY POLICY
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="w-full bg-gray-700 border border-cyan-500/30 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-400 font-mono text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-cyan-400 mb-2">
            PREVIEW
          </label>
          <div className="bg-white rounded-lg p-6 h-full overflow-auto">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// FAQ Management Component
function FAQManagement() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const q = query(collection(db, "faqs"), orderBy("order", "asc"));
      const querySnapshot = await getDocs(q);
      const faqsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFaqs(faqsData);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteFAQ = async (faqId) => {
    if (window.confirm("Are you sure you want to delete this FAQ?")) {
      try {
        await deleteDoc(doc(db, "faqs", faqId));
        await fetchFAQs();
      } catch (error) {
        console.error("Error deleting FAQ:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-cyan-300">FREQUENTLY ASKED QUESTIONS</h2>
        <motion.button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-lg hover:from-cyan-700 hover:to-purple-700 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="h-4 w-4" />
          ADD FAQ
        </motion.button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              className="bg-gray-700/30 rounded-lg border border-cyan-500/20 p-6 hover:border-cyan-500/40 transition-all duration-200"
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-cyan-100 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-300">{faq.answer}</p>
                  {faq.category && (
                    <span className="inline-block mt-2 px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full border border-purple-500/30">
                      {faq.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <motion.button
                    onClick={() => setEditingFaq(faq)}
                    className="text-cyan-400 hover:text-cyan-300 p-2 hover:bg-cyan-500/20 rounded-lg transition-all duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Edit className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    onClick={() => deleteFAQ(faq.id)}
                    className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showAddModal && (
        <FAQModal 
          onClose={() => setShowAddModal(false)} 
          onSuccess={fetchFAQs}
        />
      )}

      {editingFaq && (
        <FAQModal 
          faq={editingFaq}
          onClose={() => setEditingFaq(null)} 
          onSuccess={fetchFAQs}
        />
      )}
    </div>
  );
}

// FAQ Modal Component
function FAQModal({ faq, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    question: faq?.question || "",
    answer: faq?.answer || "",
    category: faq?.category || "general",
    order: faq?.order || 0
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      if (faq) {
        // Update existing FAQ
        await updateDoc(doc(db, "faqs", faq.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new FAQ
        await addDoc(collection(db, "faqs"), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving FAQ:", error);
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
        className="bg-gray-800 rounded-xl border border-cyan-500/30 max-w-2xl w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex justify-between items-center p-6 border-b border-cyan-500/20">
          <h2 className="text-xl font-semibold text-cyan-300">
            {faq ? "EDIT FAQ" : "ADD NEW FAQ"}
          </h2>
          <button onClick={onClose} className="text-cyan-400 hover:text-cyan-300">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-1">QUESTION</label>
            <input
              type="text"
              required
              value={formData.question}
              onChange={(e) => setFormData({...formData, question: e.target.value})}
              className="w-full bg-gray-700 border border-cyan-500/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white"
              placeholder="Enter the question..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-1">ANSWER</label>
            <textarea
              required
              value={formData.answer}
              onChange={(e) => setFormData({...formData, answer: e.target.value})}
              rows={4}
              className="w-full bg-gray-700 border border-purple-500/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white"
              placeholder="Enter the answer..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-1">CATEGORY</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full bg-gray-700 border border-pink-500/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-white"
              >
                <option value="general">General</option>
                <option value="account">Account</option>
                <option value="workouts">Workouts</option>
                <option value="billing">Billing</option>
                <option value="technical">Technical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-1">ORDER</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                className="w-full bg-gray-700 border border-cyan-500/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white"
              />
            </div>
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
            {saving ? "SAVING..." : "SAVE FAQ"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Simple markdown renderer (you can replace with a proper library like marked)
function renderMarkdown(text) {
  return text
    .replace(/# (.*?)\n/g, '<h1>$1</h1>')
    .replace(/## (.*?)\n/g, '<h2>$1</h2>')
    .replace(/### (.*?)\n/g, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

export default ContentManagement;