// components/admin/ContactMessages.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Mail, 
  User, 
  Calendar, 
  Eye, 
  Trash2, 
  Reply, 
  Loader2,
  CheckCircle,
  X
} from "lucide-react";
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  where 
} from "firebase/firestore";
import { db } from "../../firebase";

function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filter, setFilter] = useState("all"); // all, unread, read

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const fetchMessages = async () => {
    try {
      let q;
      if (filter === "unread") {
        q = query(
          collection(db, "contactMessages"), 
          where("read", "==", false),
          orderBy("createdAt", "desc")
        );
      } else if (filter === "read") {
        q = query(
          collection(db, "contactMessages"), 
          where("read", "==", true),
          orderBy("createdAt", "desc")
        );
      } else {
        q = query(collection(db, "contactMessages"), orderBy("createdAt", "desc"));
      }

      const querySnapshot = await getDocs(q);
      const messagesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messagesData);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await updateDoc(doc(db, "contactMessages", messageId), {
        read: true,
        readAt: serverTimestamp()
      });
      await fetchMessages();
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const deleteMessage = async (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await deleteDoc(doc(db, "contactMessages", messageId));
        await fetchMessages();
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(null);
        }
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    }
  };

  const replyToMessage = async (messageId, replyContent) => {
    try {
      // Implement your email sending logic here
      // This could be a Cloud Function or your email service
      console.log("Replying to message:", messageId, replyContent);
      
      // Mark as replied
      await updateDoc(doc(db, "contactMessages", messageId), {
        replied: true,
        repliedAt: serverTimestamp(),
        replyContent
      });
      
      await fetchMessages();
    } catch (error) {
      console.error("Error replying to message:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            CONTACT MESSAGES
          </h1>
          <p className="text-cyan-200 mt-2">Manage user inquiries and support requests</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-cyan-500/20 p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg border transition-all duration-300 ${
              filter === "all"
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                : "text-gray-400 border-gray-600 hover:text-cyan-300"
            }`}
          >
            ALL MESSAGES
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-lg border transition-all duration-300 ${
              filter === "unread"
                ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                : "text-gray-400 border-gray-600 hover:text-purple-300"
            }`}
          >
            UNREAD
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`px-4 py-2 rounded-lg border transition-all duration-300 ${
              filter === "read"
                ? "bg-green-500/20 text-green-300 border-green-500/30"
                : "text-gray-400 border-gray-600 hover:text-green-300"
            }`}
          >
            READ
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-cyan-500/20 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mx-auto" />
              </div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center">
                <Mail className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No messages found</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <MessageItem 
                    key={message.id}
                    message={message}
                    isSelected={selectedMessage?.id === message.id}
                    onSelect={() => {
                      setSelectedMessage(message);
                      if (!message.read) {
                        markAsRead(message.id);
                      }
                    }}
                    onDelete={() => deleteMessage(message.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <MessageDetail 
              message={selectedMessage}
              onReply={replyToMessage}
              onDelete={() => deleteMessage(selectedMessage.id)}
            />
          ) : (
            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-cyan-500/20 p-8 text-center h-96 flex items-center justify-center">
              <div>
                <Mail className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Select a message to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Message Item Component
function MessageItem({ message, isSelected, onSelect, onDelete }) {
  return (
    <motion.div 
      className={`border-b border-gray-700/50 last:border-b-0 cursor-pointer transition-all duration-200 ${
        isSelected 
          ? "bg-cyan-500/10 border-r-4 border-r-cyan-500" 
          : "hover:bg-gray-700/30"
      } ${!message.read ? 'bg-purple-500/5' : ''}`}
      whileHover={{ scale: 1.01 }}
      onClick={onSelect}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold truncate ${
              isSelected ? 'text-cyan-300' : 'text-white'
            }`}>
              {message.subject || "No Subject"}
            </h3>
            <p className="text-sm text-gray-400 truncate">{message.email}</p>
          </div>
          {!message.read && (
            <div className="w-2 h-2 bg-purple-500 rounded-full ml-2 flex-shrink-0"></div>
          )}
        </div>
        
        <p className="text-sm text-gray-300 line-clamp-2 mb-2">
          {message.message}
        </p>
        
        <div className="flex justify-between items-center text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{message.createdAt?.toDate().toLocaleDateString()}</span>
          </div>
          {message.replied && (
            <CheckCircle className="h-3 w-3 text-green-500" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Message Detail Component
function MessageDetail({ message, onReply, onDelete }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replying, setReplying] = useState(false);

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    
    setReplying(true);
    try {
      await onReply(message.id, replyContent);
      setShowReplyForm(false);
      setReplyContent("");
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setReplying(false);
    }
  };

  return (
    <motion.div 
      className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-cyan-500/20 p-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-cyan-300 mb-2">
            {message.subject || "No Subject"}
          </h2>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{message.name} ({message.email})</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{message.createdAt?.toDate().toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {message.replied ? (
            <span className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-300 text-sm rounded-full border border-green-500/30">
              <CheckCircle className="h-3 w-3" />
              REPLIED
            </span>
          ) : (
            <motion.button
              onClick={() => setShowReplyForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-lg border border-cyan-500/30 hover:bg-cyan-500/30 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Reply className="h-4 w-4" />
              REPLY
            </motion.button>
          )}
          
          <motion.button
            onClick={onDelete}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Trash2 className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      <div className="bg-gray-700/30 rounded-lg p-4 mb-6">
        <p className="text-gray-300 whitespace-pre-wrap">{message.message}</p>
      </div>

      {showReplyForm && (
        <motion.div 
          className="border-t border-cyan-500/20 pt-6"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <h3 className="text-lg font-semibold text-cyan-300 mb-4">SEND REPLY</h3>
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows={6}
            className="w-full bg-gray-700 border border-cyan-500/30 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white mb-4"
            placeholder="Type your reply here..."
          />
          <div className="flex justify-end gap-3">
            <motion.button
              onClick={() => setShowReplyForm(false)}
              className="px-4 py-2 text-cyan-300 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/10 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              CANCEL
            </motion.button>
            <motion.button
              onClick={handleReply}
              disabled={replying || !replyContent.trim()}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-lg hover:from-cyan-700 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {replying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Reply className="h-4 w-4" />
              )}
              {replying ? "SENDING..." : "SEND REPLY"}
            </motion.button>
          </div>
        </motion.div>
      )}

      {message.replyContent && (
        <div className="border-t border-green-500/20 pt-6">
          <h3 className="text-lg font-semibold text-green-300 mb-4">SENT REPLY</h3>
          <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
            <p className="text-green-200 whitespace-pre-wrap">{message.replyContent}</p>
            <p className="text-green-400 text-sm mt-2">
              Replied on: {message.repliedAt?.toDate().toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default ContactMessages;