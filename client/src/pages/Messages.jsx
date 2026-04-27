import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { useApp } from "../context/AppContext";
import { messageAPI } from "../services/api";
import { MessageSquare, Send, User, Calendar } from "lucide-react";

export default function Messages() {
  const { user } = useApp();
  const { appointmentId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(
    appointmentId || null,
  );
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user?._id) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation);
    }
  }, [activeConversation]);

  useEffect(() => {
    if (appointmentId) {
      setActiveConversation(appointmentId);
    }
  }, [appointmentId]);

  useEffect(() => {
    if (!user?._id) return;

    const interval = setInterval(() => {
      fetchConversations();
      if (activeConversation) {
        fetchMessages(activeConversation);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [user, activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const { data } = await messageAPI.getConversations(user._id);
      setConversations(data);
      if (!activeConversation && data.length > 0) {
        setActiveConversation(data[0].appointmentId);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (aptId) => {
    try {
      setError(null);
      const { data } = await messageAPI.getConversation(aptId);
      setMessages(data);
      await messageAPI.markConversationRead(aptId, user._id);
    } catch (error) {
      console.error("Error fetching messages:", error);
      if (error.response?.status === 403) {
        setError("This chat is not available yet. The appointment must be accepted by the counsellor first.");
      }
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    try {
      const { data } = await messageAPI.send({
        appointmentId: activeConversation,
        senderId: user._id,
        senderRole: user.role,
        content: newMessage.trim(),
      });
      setMessages((prev) => [...prev, data]);
      setNewMessage("");
      fetchConversations();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
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

  const getOtherParty = (conv) => {
    if (!conv) return null;
    if (user.role === "student") {
      return conv.counsellor;
    }
    return conv.student;
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 lg:ml-64">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Messages
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Follow-up messages from your sessions
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1 p-0 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    Conversations
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {conversations.length > 0 ? (
                    conversations.map((conv) => {
                      const otherParty = getOtherParty(conv);
                      return (
                        <div
                          key={conv.appointmentId}
                          onClick={() =>
                            setActiveConversation(conv.appointmentId)
                          }
                          className={`p-4 cursor-pointer border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                            activeConversation === conv.appointmentId
                              ? "bg-primary/10 dark:bg-primary/10"
                              : ""
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-accent" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 dark:text-white truncate">
                                {otherParty?.name || "Unknown"}
                              </p>
                              {conv.lastMessage && (
                                <p className="text-sm text-gray-500 truncate">
                                  {conv.lastMessage.content}
                                </p>
                              )}
                            </div>
                            {conv.unreadCount > 0 && (
                              <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No conversations yet</p>
                      <p className="text-sm">
                        Complete sessions to message your counsellor
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="lg:col-span-2 flex flex-col">
                {activeConversation ? (
                  <>
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-white">
                            {getOtherParty(
                              conversations.find(
                                (c) => c.appointmentId === activeConversation,
                              ),
                            )?.name || "Chat"}
                          </h3>
                          {activeConversation && conversations.find(c => c.appointmentId === activeConversation) && user.role === 'counsellor' && getOtherParty(conversations.find(c => c.appointmentId === activeConversation))?.department && (
                            <p className="text-[10px] uppercase font-bold text-primary dark:text-primary">
                              {getOtherParty(conversations.find(c => c.appointmentId === activeConversation))?.department} • Year {getOtherParty(conversations.find(c => c.appointmentId === activeConversation))?.yearOfStudy}
                            </p>
                          )}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
                      {error ? (
                        <div className="flex items-center justify-center h-full text-center p-8 bg-red-50 dark:bg-red-900/10 rounded-xl m-4 border border-red-100 dark:border-red-900/20">
                          <div className="max-w-xs">
                            <Calendar className="w-12 h-12 mx-auto mb-4 text-red-500 opacity-50" />
                            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                          </div>
                        </div>
                      ) : messages.length > 0 ? (
                        messages.map((msg, index) => {
                          const isOwn = msg.senderId._id === user._id;
                          return (
                            <div
                              key={msg._id || index}
                              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                                  isOwn
                                    ? "bg-primary dark:bg-primary text-white rounded-br-sm"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white rounded-bl-sm"
                                }`}
                              >
                                <p className="text-sm">{msg.content}</p>
                                <p
                                  className={`text-xs mt-1 ${isOwn ? "text-white/70" : "text-gray-400"}`}
                                >
                                  {formatTime(msg.createdAt)}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center text-gray-500 py-8">
                          <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No messages yet</p>
                          <p className="text-sm">Start the conversation!</p>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                    <form
                      onSubmit={sendMessage}
                      className="p-4 border-t border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex space-x-4">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                        />
                        <Button type="submit" disabled={!newMessage.trim()}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Select a conversation to start messaging</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}



