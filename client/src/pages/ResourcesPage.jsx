import { useState, useEffect } from "react";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";
import Card from "../components/common/Card";
import Modal from "../components/common/Modal";
import { resourceAPI } from "../services/api";
import {
  FileText,
  Video,
  Activity,
  Search,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Clock,
  Play,
  ArrowLeft,
  ExternalLink,
  X,
} from "lucide-react";

const FAVORITES_KEY = "mindbridge_favorites";

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("all");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedResource, setSelectedResource] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    fetchResources();
  }, [language, category, search]);

  useEffect(() => {
    const interval = setInterval(fetchResources, 60000);
    return () => clearInterval(interval);
  }, [language, category, search]);

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (e, resourceId) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(resourceId)
        ? prev.filter((id) => id !== resourceId)
        : [...prev, resourceId],
    );
  };

  const fetchResources = async () => {
    try {
      const params = {};
      if (language !== "all") params.language = language;
      if (category !== "all") params.category = category;
      if (search) params.search = search;

      const { data } = await resourceAPI.getAll(params);
      setResources(data);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const openResource = async (resource) => {
    setDetailLoading(true);
    setSelectedResource(resource);
    try {
      const { data } = await resourceAPI.getById(resource._id);
      setSelectedResource(data);
    } catch (error) {
      console.error("Error fetching resource detail:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case "article":
        return <FileText className="w-5 h-5" />;
      case "video":
        return <Video className="w-5 h-5" />;
      case "exercise":
        return <Activity className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case "article":
        return "bg-blue-500";
      case "video":
        return "bg-red-500";
      case "exercise":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCategoryBg = (cat) => {
    switch (cat) {
      case "article":
        return "from-blue-500/20 to-blue-600/5";
      case "video":
        return "from-red-500/20 to-red-600/5";
      case "exercise":
        return "from-green-500/20 to-green-600/5";
      default:
        return "from-gray-500/20 to-gray-600/5";
    }
  };

  const getVideoEmbedUrl = (url) => {
    if (!url) return "";
    const ytMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    );
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    return url;
  };

  const getVideoThumbnail = (url) => {
    if (!url) return null;
    const ytMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    );
    if (ytMatch)
      return `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg`;
    return null;
  };

  const filteredResources = showFavoritesOnly
    ? resources.filter((r) => favorites.includes(r._id))
    : resources;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 lg:ml-64">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Resource Hub
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Explore articles, videos, and exercises to support your mental
                health
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search resources..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                />
              </div>
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-colors ${
                  showFavoritesOnly
                    ? "bg-accent text-white"
                    : "border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                }`}
              >
                {showFavoritesOnly ? (
                  <BookmarkCheck className="w-5 h-5" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
                <span>Saved ({favorites.length})</span>
              </button>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
              >
                <option value="all">All Languages</option>
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
              </select>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
              >
                <option value="all">All Categories</option>
                <option value="article">Articles</option>
                <option value="video">Videos</option>
                <option value="exercise">Exercises</option>
              </select>
            </div>

            {/* Resource Grid */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : filteredResources.length > 0 ? (
              <div className="space-y-12">
                {Object.entries(
                  filteredResources.reduce((acc, resource) => {
                    const cat = resource.category || "other";
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(resource);
                    return acc;
                  }, {})
                ).map(([cat, resList]) => (
                  <div key={cat} className="animate-fade-in">
                    <div className="flex items-center space-x-3 mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                      <div className={`p-2 rounded-lg ${
                        cat === "article" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" :
                        cat === "video" ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400" :
                        "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400"
                      }`}>
                        {getCategoryIcon(cat)}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white capitalize tracking-tight">
                        {cat}s
                      </h2>
                      <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full text-sm font-semibold ml-2">
                        {resList.length}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {resList.map((resource) => (
                        <div
                          key={resource._id}
                          onClick={() => openResource(resource)}
                          className="group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-primary/30 dark:hover:border-primary/30 hover:-translate-y-1"
                        >
                          {/* Card Header Gradient */}
                          <div
                            className={`h-2 bg-gradient-to-r ${getCategoryBg(resource.category)}`}
                          >
                            <div
                              className={`h-full w-16 ${getCategoryColor(resource.category)} rounded-r-full`}
                            />
                          </div>

                          {/* Video Thumbnail */}
                          {resource.category === "video" && resource.videoUrl && (
                            <div className="relative">
                              <img
                                src={getVideoThumbnail(resource.videoUrl) || ""}
                                alt=""
                                className="w-full h-36 object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                                  <Play className="w-6 h-6 text-red-600 ml-0.5" />
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    resource.category === "article"
                                      ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                                      : resource.category === "video"
                                        ? "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"
                                        : "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400"
                                  }`}
                                >
                                  {getCategoryIcon(resource.category)}
                                </span>
                                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  {resource.category}
                                </span>
                              </div>
                              <button
                                onClick={(e) => toggleFavorite(e, resource._id)}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              >
                                {favorites.includes(resource._id) ? (
                                  <BookmarkCheck className="w-5 h-5 text-accent" />
                                ) : (
                                  <Bookmark className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-gray-400" />
                                )}
                              </button>
                            </div>

                            <h3 className="font-semibold text-gray-800 dark:text-white mb-1 line-clamp-2 group-hover:text-primary dark:group-hover:text-primary transition-colors">
                              {resource.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                              {resource.content}
                            </p>

                            <div className="flex items-center justify-between">
                              <div className="flex flex-wrap gap-1.5">
                                {resource.tags?.slice(0, 2).map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 bg-accent/10 text-accent rounded text-xs"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {resource.tags?.length > 2 && (
                                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded text-xs">
                                    +{resource.tags.length - 2}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center text-xs text-gray-400">
                                {resource.language === "hi" && (
                                  <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded mr-2">
                                    हिं
                                  </span>
                                )}
                                {resource.category === "article" && (
                                  <span className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {resource.readTime || 5}m
                                  </span>
                                )}
                                {resource.category === "video" && (
                                  <span className="flex items-center">
                                    <Play className="w-3 h-3 mr-1" />
                                    Watch
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  No Resources Found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your filters or search terms.
                </p>
              </Card>
            )}
          </div>
        </main>
      </div>

      {/* Resource Detail Modal */}
      <Modal
        isOpen={!!selectedResource}
        onClose={() => setSelectedResource(null)}
        title=""
        size="xl"
      >
        {selectedResource && (
          <div className="-mt-2">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-3">
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center space-x-1.5 ${
                    selectedResource.category === "article"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                      : selectedResource.category === "video"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                        : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                  }`}
                >
                  {getCategoryIcon(selectedResource.category)}
                  <span className="capitalize">
                    {selectedResource.category}
                  </span>
                </span>
                {selectedResource.language === "hi" && (
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded text-sm">
                    हिंदी
                  </span>
                )}
                {selectedResource.readTime &&
                  selectedResource.category === "article" && (
                    <span className="text-sm text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />{" "}
                      {selectedResource.readTime} min read
                    </span>
                  )}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                {selectedResource.title}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 italic">
                {selectedResource.content}
              </p>
            </div>

            {detailLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Video Player */}
                {selectedResource.category === "video" &&
                  selectedResource.videoUrl && (
                    <div className="mb-6">
                      <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
                        <iframe
                          src={getVideoEmbedUrl(selectedResource.videoUrl)}
                          className="w-full h-full"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          title={selectedResource.title}
                        />
                      </div>
                    </div>
                  )}

                {/* Article / Exercise Body */}
                {(selectedResource.category === "article" ||
                  selectedResource.category === "exercise") &&
                  selectedResource.body && (
                    <div className="mb-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                      <div className="prose dark:prose-invert max-w-none">
                        {selectedResource.body
                          .split("\n\n")
                          .map((paragraph, i) => (
                            <p
                              key={i}
                              className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed text-[15px]"
                            >
                              {paragraph.split("\n").map((line, j) => (
                                <span key={j}>
                                  {line}
                                  {j < paragraph.split("\n").length - 1 && (
                                    <br />
                                  )}
                                </span>
                              ))}
                            </p>
                          ))}
                      </div>
                    </div>
                  )}

                {/* No body content fallback */}
                {!selectedResource.body &&
                  selectedResource.category !== "video" && (
                    <div className="mb-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 text-center">
                      <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                      <p className="text-gray-500 dark:text-gray-400">
                        Full content coming soon.
                      </p>
                    </div>
                  )}

                {/* Tags */}
                {selectedResource.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-500 mr-1">Tags:</span>
                    {selectedResource.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}



