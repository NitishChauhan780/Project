import { useState, useEffect } from "react";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { adminModerationAPI } from "../../services/api";
import { useApp } from "../../context/AppContext";
import { useToast } from "../../context/ToastContext";
import {
  AlertTriangle,
  Trash2,
  Pin,
  PinOff,
  MessageSquare,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function ForumModeration() {
  const { user } = useApp();
  const toast = useToast();
  const [posts, setPosts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [expandedReplies, setExpandedReplies] = useState({});

  useEffect(() => {
    fetchPosts();
    fetchLogs();
  }, []);

  const fetchPosts = async () => {
    try {
      // Always fetch all posts so the tab counts calculate correctly
      const { data } = await adminModerationAPI.getPosts({ queue: "all" });
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const { data } = await adminModerationAPI.getLogs();
      setLogs(data);
    } catch (error) {
      console.error("Error fetching moderation logs:", error);
    }
  };

  const handleDelete = async (id) => {
    const reason = prompt("Reason for deleting this post:", "Policy violation");
    if (reason === null) return;
    if (
      confirm(
        "Are you sure you want to delete this post? This action cannot be undone.",
      )
    ) {
      try {
        await adminModerationAPI.deletePost(id, {
          adminId: user?._id,
          reason: reason.trim() || "Policy violation",
        });
        toast.success("Post deleted and author notified");
        fetchPosts();
        fetchLogs();
      } catch (error) {
        console.error("Error deleting post:", error);
        toast.error("Failed to delete post");
      }
    }
  };

  const handlePin = async (id) => {
    const reason = prompt("Reason for pinning this post:", "Helpful content");
    if (reason === null) return;
    try {
      await adminModerationAPI.pinPost(id, {
        adminId: user?._id,
        reason: reason.trim() || "Helpful content",
      });
      toast.success("Post pinned and author notified");
      fetchPosts();
      fetchLogs();
    } catch (error) {
      console.error("Error pinning post:", error);
      toast.error("Failed to pin post");
    }
  };

  const handleUnpin = async (id) => {
    try {
      await adminModerationAPI.unpinPost(id, {
        adminId: user?._id,
        reason: "No longer featured",
      });
      toast.success("Post unpinned");
      fetchPosts();
      fetchLogs();
    } catch (error) {
      console.error("Error unpinning post:", error);
      toast.error("Failed to unpin post");
    }
  };

  const handleMarkSafe = async (id) => {
    const reason = prompt(
      "Reason for marking this post as safe:",
      "Reviewed and safe",
    );
    if (reason === null) return;

    try {
      await adminModerationAPI.markSafe(id, {
        adminId: user?._id,
        reason: reason.trim() || "Reviewed and safe",
      });
      toast.success("Post marked safe and removed from queue");
      fetchPosts();
      fetchLogs();
    } catch (error) {
      console.error("Error marking post safe:", error);
      toast.error("Failed to mark post safe");
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (filter === "pending") return post.moderationStatus === "pending_review";
    if (filter === "reported") return post.reported;
    if (filter === "pinned") return post.isPinned;
    return true;
  });

  const toggleReplies = (postId) => {
    setExpandedReplies((prev) => ({ ...prev, [postId]: !prev[postId] }));
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
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Forum Moderation
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Review and manage community forum posts
              </p>
            </div>

            <div className="flex gap-2 mb-6">
              {[
                {
                  key: "pending",
                  label: "Pending Review",
                  count: posts.filter(
                    (p) => p.moderationStatus === "pending_review",
                  ).length,
                },
                { key: "all", label: "All Posts", count: posts.length },
                {
                  key: "pinned",
                  label: "Pinned",
                  count: posts.filter((p) => p.isPinned).length,
                },
                {
                  key: "reported",
                  label: "Reported",
                  count: posts.filter((p) => p.reported).length,
                },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-4 py-2 rounded-lg ${
                    filter === f.key
                      ? "bg-primary dark:bg-primary text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <Card
                  key={post._id}
                  className={post.isPinned ? "border-2 border-accent" : ""}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">👤</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-gray-800 dark:text-white">
                            {post.isAnonymous
                              ? "Anonymous"
                              : post.authorId?.name || "Unknown"}
                          </span>
                          {post.isPinned && (
                            <span className="px-2 py-0.5 bg-accent text-white rounded text-xs flex items-center">
                              <Pin className="w-3 h-3 mr-1" /> Pinned
                            </span>
                          )}
                          {post.reported && (
                            <span className="px-2 py-0.5 bg-red-500 text-white rounded text-xs flex items-center">
                              <AlertTriangle className="w-3 h-3 mr-1" />{" "}
                              Reported
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-3">
                          {post.content}
                        </p>
                        {post.reports?.length > 0 && (
                          <div className="mb-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                            <p className="text-xs font-semibold text-orange-700 dark:text-orange-300 mb-1">
                              Report Reasons
                            </p>
                            <div className="space-y-1">
                              {post.reports
                                .slice(-2)
                                .reverse()
                                .map((r, idx) => (
                                  <p
                                    key={idx}
                                    className="text-xs text-orange-700 dark:text-orange-300"
                                  >
                                    {r.source?.toUpperCase()}: {r.reason}
                                    {r.details ? ` - ${r.details}` : ""}
                                  </p>
                                ))}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            {post.replies?.length || 0} replies
                          </span>
                          <span className="flex items-center">
                            ❤️ {post.upvotes || 0} upvotes
                          </span>
                          <span>
                            {new Date(post.date).toLocaleDateString()}
                          </span>
                          {(post.replies?.length || 0) > 0 && (
                            <button
                              onClick={() => toggleReplies(post._id)}
                              className="inline-flex items-center text-primary dark:text-primary hover:underline"
                            >
                              {expandedReplies[post._id] ? (
                                <>
                                  <ChevronUp className="w-4 h-4 mr-1" /> Hide
                                  replies
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4 mr-1" /> View
                                  replies
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {expandedReplies[post._id] &&
                          (post.replies?.length || 0) > 0 && (
                            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Replies ({post.replies.length})
                              </p>
                              <div className="space-y-2 max-h-48 overflow-auto">
                                {post.replies.map((reply, idx) => (
                                  <div
                                    key={idx}
                                    className="p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                        {reply.isAnonymous
                                          ? "Anonymous"
                                          : reply.authorName || "Unknown"}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(
                                          reply.createdAt || reply.date,
                                        ).toLocaleString()}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                      {reply.content}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      {post.reported && (
                        <button
                          onClick={() => handleMarkSafe(post._id)}
                          className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900 text-green-600"
                          title="Mark post as safe"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() =>
                          post.isPinned
                            ? handleUnpin(post._id)
                            : handlePin(post._id)
                        }
                        className={`p-2 rounded-lg ${post.isPinned ? "bg-accent/20 text-accent" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"}`}
                        title={post.isPinned ? "Unpin post" : "Pin post"}
                      >
                        {post.isPinned ? (
                          <PinOff className="w-4 h-4" />
                        ) : (
                          <Pin className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 text-red-500"
                        title="Delete post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="mt-8">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                Moderation Audit Log
              </h2>
              {logs.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-auto">
                  {logs.slice(0, 20).map((log) => (
                    <div
                      key={log._id}
                      className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <p className="text-sm text-gray-800 dark:text-white">
                        <span className="font-semibold uppercase">
                          {log.action}
                        </span>
                        {" by "}
                        <span>{log.moderatorId?.name || "System"}</span>
                        {" on "}
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </p>
                      {log.reason && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Reason: {log.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No moderation actions recorded yet.
                </p>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}



