import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { forumAPI } from "../services/api";
import { useToast } from "../context/ToastContext";
import {
  Users,
  MessageCircle,
  Heart,
  Send,
  AlertTriangle,
  Search,
  Filter,
  Pin,
  User,
} from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "All", emoji: "💬" },
  { id: "general", label: "General", emoji: "🗨️" },
  { id: "academics", label: "Academics", emoji: "📖" },
  { id: "placements", label: "Placements", emoji: "💼" },
  { id: "projects", label: "Projects", emoji: "🔬" },
  { id: "exam-stress", label: "Exam Stress", emoji: "📚" },
  { id: "relationships", label: "Relationships", emoji: "💕" },
  { id: "sleep", label: "Sleep", emoji: "😴" },
  { id: "family", label: "Family", emoji: "👨‍👩‍👧" },
  { id: "self-care", label: "Self-Care", emoji: "🌸" },
  { id: "mindfulness", label: "Mindfulness", emoji: "🧘" },
];

export default function ForumPage() {
  const { user } = useApp();
  const toast = useToast();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [showMineOnly, setShowMineOnly] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [category, search, showMineOnly]);

  useEffect(() => {
    const interval = setInterval(fetchPosts, 15000);
    return () => clearInterval(interval);
  }, [category, search, showMineOnly]);

  const fetchPosts = async () => {
    try {
      const params = {};
      if (category !== "all") params.category = category;
      if (search) params.search = search;
      if (showMineOnly) params.authorId = user._id;

      const { data } = await forumAPI.getPosts(params);
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() || !user?._id) return;
    setSubmitting(true);
    try {
      await forumAPI.createPost({
        authorId: user._id,
        isAnonymous: true,
        authorName: user.name,
        content: newPost,
        category: category === "all" ? "general" : category,
      });
      setNewPost("");
      fetchPosts();
      toast.success("Post created successfully");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (postId) => {
    if (!replyContent.trim() || !user?._id) return;
    try {
      await forumAPI.reply(postId, {
        authorId: user._id,
        isAnonymous: true,
        authorName: user.name,
        content: replyContent,
      });
      setReplyingTo(null);
      setReplyContent("");
      fetchPosts();
      toast.success("Reply posted");
    } catch (error) {
      console.error("Error replying:", error);
      toast.error("Failed to post reply");
    }
  };

  const handleReport = async (postId) => {
    const reason = prompt(
      "Report reason (spam, harassment, hate, self-harm, misinformation, other):",
      "other",
    );
    if (reason === null) return;
    const details = prompt("Add optional details for moderators:", "");

    try {
      await forumAPI.reportPost(postId, {
        reporterId: user?._id,
        reason: (reason || "other").trim().toLowerCase(),
        details: (details || "").trim(),
      });
      toast.success("Post reported. Our moderators will review it.");
      fetchPosts();
    } catch (error) {
      console.error("Error reporting post:", error);
      toast.error("Failed to report post");
    }
  };

  const handleUpvote = async (postId) => {
    try {
      await forumAPI.upvote(postId);
      fetchPosts();
      toast.success("Upvoted!");
    } catch (error) {
      console.error("Error upvoting:", error);
    }
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
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Peer Support Forum
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Share experiences and support each other anonymously
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                    category === cat.id
                      ? "bg-primary dark:bg-primary text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="mr-1">{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search posts..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                />
              </div>
              <button
                onClick={() => setShowMineOnly(!showMineOnly)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-colors ${
                  showMineOnly
                    ? "bg-accent text-white"
                    : "border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                }`}
              >
                <User className="w-5 h-5" />
                <span>My Posts</span>
              </button>
            </div>

            <Card className="mb-6">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-primary/20 dark:bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-primary dark:text-primary" />
                </div>
                <div className="flex-1">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Share what's on your mind..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white resize-none"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <AlertTriangle className="w-4 h-4 inline mr-1" />
                      Posts are moderated. Be kind and supportive.
                    </p>
                    <Button
                      onClick={handleCreatePost}
                      disabled={!newPost.trim() || submitting}
                      icon={Send}
                      size="sm"
                    >
                      {submitting ? "Posting..." : "Post Anonymously"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <Card
                    key={post._id}
                    className={post.isPinned ? "border-2 border-accent" : ""}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">👤</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-800 dark:text-white">
                              {post.authorName}
                            </span>
                            {post.category && post.category !== "general" && (
                              <span className="px-2 py-0.5 bg-primary/10 dark:bg-primary/10 text-primary dark:text-primary rounded text-xs">
                                {CATEGORIES.find((c) => c.id === post.category)
                                  ?.label || post.category}
                              </span>
                            )}
                            {post.isPinned && (
                              <span className="flex items-center text-xs text-accent">
                                <Pin className="w-3 h-3 mr-1" /> Pinned
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(post.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-3">
                          {post.content}
                        </p>

                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleUpvote(post._id)}
                            className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <Heart className="w-4 h-4" />
                            <span>{post.upvotes || 0}</span>
                          </button>
                          <button
                            onClick={() =>
                              setReplyingTo(
                                replyingTo === post._id ? null : post._id,
                              )
                            }
                            className="flex items-center space-x-1 text-gray-500 hover:text-primary dark:hover:text-primary transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.replies?.length || 0} replies</span>
                          </button>
                          <button
                            onClick={() => handleReport(post._id)}
                            className="flex items-center space-x-1 text-gray-500 hover:text-orange-500 transition-colors"
                          >
                            <AlertTriangle className="w-4 h-4" />
                            <span>Report</span>
                          </button>
                        </div>

                        {post.replies?.length > 0 && (
                          <div className="mt-4 space-y-3 border-t border-gray-100 dark:border-gray-700 pt-4">
                            {post.replies.map((reply, idx) => (
                              <div
                                key={idx}
                                className="flex items-start space-x-2 pl-4 border-l-2 border-accent/30"
                              >
                                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                  <span className="text-sm">👤</span>
                                </div>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
                                      {reply.authorName}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(
                                        reply.createdAt,
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {reply.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {replyingTo === post._id && (
                          <div className="mt-4 flex items-center space-x-2">
                            <input
                              type="text"
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder="Write a supportive reply..."
                              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm"
                              onKeyPress={(e) =>
                                e.key === "Enter" && handleReply(post._id)
                              }
                            />
                            <Button
                              onClick={() => handleReply(post._id)}
                              size="sm"
                            >
                              Reply
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    No posts yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {showMineOnly
                      ? "You haven't posted anything yet. Share your thoughts!"
                      : "Be the first to start a conversation!"}
                  </p>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
