import React, { useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Search, Moon, Sun, Settings } from "lucide-react";
import NewsDetail from "./components/NewsDetail.jsx";
import NewsSection from "./components/NewsSection.jsx";
import logo from './indialive.png';

// Slider Component to cycle images/videos every 10 seconds
function Slider({ items }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef();

  useEffect(() => {
    if (items.length === 0) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 10000); // 10 seconds

    return () => clearInterval(intervalRef.current);
  }, [items]);

  if (items.length === 0) return null;

  const currentItem = items[currentIndex];

  return (
    <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-lg shadow-lg mb-6">
      {currentItem.file_type === "video" ? (
        <video
          key={currentItem.id}
          src={currentItem.file_url}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
        />
      ) : (
        <img
          key={currentItem.id}
          src={currentItem.file_url}
          alt={`Slider item ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-40 text-white p-2 text-center">
        Slider Item {currentIndex + 1} / {items.length}
      </div>
    </div>
  );
}

const categories = [
  "Breaking News",
  "Politics",
  "Business",
  "Technology",
  "Entertainment",
  "Sports",
];

function NewsPortal() {
  const [newsItems, setNewsItems] = useState([]);
  const [sliderItems, setSliderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [darkMode, setDarkMode] = useState(false);
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchNews();
    fetchSliderItems();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Fetch news from supabase 'news' table
  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setNewsItems(data);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch news. Please try again later.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Fetch slider items from supabase 'slider_items' table
  const fetchSliderItems = async () => {
    try {
      const { data, error } = await supabase
        .from("slider_items")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setSliderItems(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load slider images.",
        variant: "destructive",
      });
    }
  };

  // Subscribe newsletter handler
  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert([{ email }]);
      if (error) throw error;

      setEmail("");
      toast({
        title: "Success",
        description: "Thank you for subscribing to our newsletter!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Filter news based on search and category
  const filteredNews = newsItems.filter((news) => {
    const matchesSearch =
      news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      news.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || news.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-red-800 dark:bg-red-900 text-white py-4 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            {/* <img alt="India Live News Logo" className="h-12" src="src/indialive.png" /> */}
            <img src={logo} className="h-12" alt="India Live" />
            <h1 className="text-3xl font-bold ml-4">India Live</h1>
          </Link>

          <div className="flex items-center space-x-4">
            <Link to="/admin">
              <Button variant="ghost" size="icon" className="text-white">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="text-white"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>


      {/* --- Enhanced News Portal Front Page Layout --- */}
      <div className="bg-white dark:bg-gray-800 py-4 shadow-md mt-4">
        <div className="container mx-auto px-4 flex flex-col md:flex-row gap-4 items-center">
          {/* Search Input with Clear Button */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search news..."
              className="w-full pl-10 pr-10 py-2 rounded-lg border dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-red-800 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search news"
            />
            {searchTerm && (
              <button
                className="absolute right-3 top-2.5 text-gray-400 hover:text-red-700 transition"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
                tabIndex={0}
              >
                ×
              </button>
            )}
          </div>
          {/* Category Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "All" ? "default" : "outline"}
              onClick={() => setSelectedCategory("All")}
              className="transition"
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="transition"
              >
                {category}
              </Button>
            ))}
          </div>
          {/* Engagement Actions */}
          <div className="flex gap-2 mt-2 md:mt-0">
            {/* Share Site Button */}
            <Button
              variant="outline"
              className="flex items-center gap-1"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: "India Live News",
                    text: "Check out the latest news on India Live!",
                    url: window.location.origin,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.origin);
                  alert("Link copied to clipboard!");
                }
              }}
              aria-label="Share this site"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7"></path><path d="M16 6l-4-4-4 4"></path><path d="M12 2v14"></path></svg>
              Share
            </Button>
            {/* Feedback Button */}
            <Button
              variant="outline"
              className="flex items-center gap-1"
              onClick={() => {
                window.open("mailto:feedback@indialive.com?subject=Site Feedback", "_blank");
              }}
              aria-label="Send feedback"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2z"></path><polyline points="3 7 12 13 21 7"></polyline></svg>
              Feedback
            </Button>
          </div>
        </div>
        {/* Engagement Tip */}
        <div className="container mx-auto px-4 mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <svg className="h-4 w-4 text-red-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>
          <span>
            Tip: Use the search and filters to quickly find news. Share your favorite stories or send us your feedback to help us improve!
          </span>
        </div>
      </div>

      {/* --- Main Professional News Portal Content Layout --- */}
      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {/* Hero Section */}
          <section className="mb-8">
            <div className="relative rounded-xl overflow-hidden shadow-lg">
              <img
                src={filteredNews[0]?.image_url || '/default-hero.jpg'}
                alt={filteredNews[0]?.title || 'Top News'}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                <h2 className="text-3xl font-bold text-white mb-2 drop-shadow">
                  {filteredNews[0]?.title || "Welcome to India Live News"}
                </h2>
                <p className="text-lg text-white/90 mb-4 drop-shadow">
                  {filteredNews[0]?.description?.slice(0, 120) || "Stay updated with the latest breaking news, in-depth analysis, and exclusive stories from across India and the world. Explore categories, trending topics, and more."}
                </p>
                <Link
                  to={filteredNews[0] ? `/news/${filteredNews[0].id}` : "#"}
                  className="inline-block bg-red-700 hover:bg-red-800 text-white font-semibold px-4 py-2 rounded transition"
                >
                  Read Top Story
                </Link>
              </div>
            </div>
          </section>

          {/* Featured Stories Grid */}
          <section className="mb-8">
            <h3 className="text-2xl font-bold text-red-800 mb-4">Featured Stories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNews.slice(1, 7).map((news) => (
                <Link
                  to={`/news/${news.id}`}
                  key={news.id}
                  className="group bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition overflow-hidden flex flex-col"
                >
                  <img
                    src={news.image_url}
                    alt={news.title}
                    className="h-40 w-full object-cover group-hover:scale-105 transition"
                  />
                  <div className="p-4 flex-1 flex flex-col">
                    <span className="text-xs text-red-700 font-semibold mb-1">{news.category}</span>
                    <h4 className="text-lg font-bold mb-2 group-hover:text-red-700 transition">{news.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex-1 line-clamp-2">{news.description}</p>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <span>{new Date(news.created_at).toLocaleDateString()}</span>
                      <span className="mx-2">|</span>
                      <span>👁 {news.views || 0}</span>
                      <span className="mx-2">|</span>
                      <span>❤️ {news.likes || 0}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Latest News List */}
          <section>
            <h3 className="text-2xl font-bold text-red-800 mb-4">Latest News</h3>
            <div className="flex flex-col gap-6">
              {filteredNews.slice(7, 20).map((news) => (
                <motion.article
                  key={news.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg overflow-hidden flex flex-col md:flex-row transition-all duration-300"
                >
                  {/* Image */}
                  <Link to={`/news/${news.id}`} className="w-full md:w-1/3 block">
                    <img
                      alt={news.title}
                      src={news.image_url}
                      className="w-full h-52 object-cover"
                    />
                  </Link>
                  {/* Content */}
                  <div className="p-6 flex flex-col justify-between flex-1">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {news.title}
                      </h2>
                      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                        {news.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{new Date(news.created_at).toLocaleDateString()}</span>
                      <span>Category: {news.category}</span>
                      <span>👁 {news.views || 0}</span>
                      <span>❤️ {news.likes || 0}</span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </section>
        </main>

        {/* Professional & Engaging Aside Section */}
        <aside className="w-full lg:w-80 flex-shrink-0">
          {/* Latest Headlines */}
          <section className="mb-8">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4">
              <h2 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
                <svg className="h-6 w-6 text-red-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"></path></svg>
                Latest Headlines
              </h2>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredNews.slice(0, 6).map((article) => (
                  <Link
                    to={`/news/${article.id}`}
                    key={article.id}
                    className="block py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
                  >
                    <div className="flex items-center gap-3">
                      {article.image_url && (
                        <img
                          src={article.image_url}
                          alt={article.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-white line-clamp-2">{article.title}</h3>
                        <div className="text-xs text-gray-500">
                          {new Date(article.created_at).toLocaleDateString()} | {article.category}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Trending Topics */}
          <section className="mb-8">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4">
              <h2 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
                <svg className="h-6 w-6 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2l2 7h7l-5.5 4 2 7-5.5-4-5.5 4 2-7L3 9h7z"></path></svg>
                Trending Topics
              </h2>
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 6).map((cat) => (
                  <Button
                    key={cat}
                    variant="outline"
                    className="text-xs px-3 py-1"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    #{cat}
                  </Button>
                ))}
              </div>
            </div>
          </section>

          {/* Newsletter Signup */}
          <section className="mb-8">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4">
              <h2 className="text-xl font-bold text-red-700 mb-2 flex items-center gap-2">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2z"></path><polyline points="3 7 12 13 21 7"></polyline></svg>
                Newsletter
              </h2>
              <form
                className="flex flex-col gap-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  // handle newsletter signup logic here
                  toast({
                    title: "Subscribed!",
                    description: "Thank you for subscribing to our newsletter.",
                  });
                }}
              >
                <input
                  type="email"
                  required
                  placeholder="Your email address"
                  className="rounded border px-3 py-2 text-sm dark:bg-gray-800 dark:text-white dark:border-gray-700"
                />
                <Button type="submit" className="w-full bg-red-700 hover:bg-red-800 text-white">
                  Subscribe
                </Button>
              </form>
              <p className="text-xs text-gray-500 mt-2">
                Get the latest news delivered straight to your inbox.
              </p>
            </div>
          </section>

          {/* Social Media Links */}
          <section>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4">
              <h2 className="text-xl font-bold text-red-700 mb-2 flex items-center gap-2">
                <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M8 12h8"></path><path d="M12 8v8"></path></svg>
                Connect With Us
              </h2>
              <div className="flex gap-3 mt-2">
                <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-blue-500 transition">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.59-2.47.7a4.3 4.3 0 001.88-2.37 8.59 8.59 0 01-2.72 1.04A4.28 4.28 0 0016.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 8.99 4.07 7.13 1.64 4.16c-.37.64-.58 1.39-.58 2.19 0 1.51.77 2.85 1.95 3.63-.72-.02-1.4-.22-1.99-.55v.06c0 2.11 1.5 3.87 3.5 4.27-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.7 2.11 2.94 3.97 2.97A8.6 8.6 0 012 19.54a12.13 12.13 0 006.56 1.92c7.88 0 12.2-6.53 12.2-12.2 0-.19 0-.37-.01-.56A8.7 8.7 0 0024 4.59a8.48 8.48 0 01-2.54.7z"/></svg>
                </a>
                <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-blue-700 transition">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
                </a>
                <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-pink-500 transition">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.241-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.363 3.678 1.344c-.98.98-1.213 2.092-1.272 3.373C2.013 5.668 2 6.077 2 12c0 5.923.013 6.332.072 7.613.059 1.281.292 2.393 1.272 3.373.98.98 2.092 1.213 3.373 1.272C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.281-.059 2.393-.292 3.373-1.272.98-.98 1.213-2.092 1.272-3.373.059-1.281.072-1.69.072-7.613 0-5.923-.013-6.332-.072-7.613-.059-1.281-.292-2.393-1.272-3.373-.98-.98-2.092-1.213-3.373-1.272C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z"/></svg>
                </a>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <div >
        <main className="flex-1">Your main content</main>
        <aside >Aside content</aside>
        <Slider items={sliderItems} />
      </div>



      <div className="flex flex-col lg:flex-row">
        <div className="lg:hidden space-y-6">
          {/* <div className="w-full mb-6">
            {/* <Slider /> */}
        </div> */}

        {/* News List */}
        <main className="container mx-auto px-4 py-8 flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {filteredNews.map((news) => (
                <motion.article
                  key={news.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg overflow-hidden flex flex-col md:flex-row transition-all duration-300"
                >
                  {/* Image */}
                  <Link to={`/news/${news.id}`} className="w-full md:w-1/3 block">
                    <img
                      alt={news.title}
                      src={news.image_url}
                      className="w-full h-52 object-cover"
                    />
                  </Link>

                  {/* Content */}
                  <div className="p-6 flex flex-col justify-between flex-1">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {news.title}
                      </h2>
                      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                        {news.description}
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-gray-500 dark:text-gray-400 text-sm mb-4">
                      <span>{new Date(news.created_at).toLocaleDateString()}</span>
                      <span>Likes: {news.likes || 0}</span>
                    </div>

                    {/* Share Button */}
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: news.title,
                            text: news.description,
                            url: window.location.origin + `/news/${news.id}`,
                          });
                        } else {
                          alert("Sharing is not supported on this browser.");
                        }
                      }}
                      className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                    >
                      Share
                    </button>
                  </div>
                </motion.article>
              ))}
              {filteredNews.length === 0 && (
                <p className="text-center text-gray-600 dark:text-gray-400">No news found.</p>
              )}
            </div>
          )}
        </main>

        <aside className="w-full lg:w-[30%] space-y-8">
          {/* As per image, desktop sidebar has text-only "ताजा समाचार" */}

          <NewsSection />
          hello
          {/* Could add more sections like "सर्वाधिक लोकप्रिय" here if data was available */}
        </aside>
      </div>



      {/* Newsletter Subscription */}
      <footer className="bg-red-800 dark:bg-red-900 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-lg font-semibold mb-3">Subscribe to our Newsletter</h3>
          <form
            onSubmit={handleSubscribe}
            className="flex justify-center gap-2 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-l-md px-4 py-2 text-black w-full"
              required
            />
            <Button type="submit" className="rounded-r-md">
              Subscribe
            </Button>
          </form>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}

// Admin panel with password protection
function AdminPanel() {
  const [passwordInput, setPasswordInput] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  // For slider upload
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [sliderItems, setSliderItems] = useState([]);

  // For news upload
  const [newsTitle, setNewsTitle] = useState("");
  const [newsDescription, setNewsDescription] = useState("");
  const [newsCategory, setNewsCategory] = useState("");
  const [newsMediaFile, setNewsMediaFile] = useState(null);
  const [newsUploading, setNewsUploading] = useState(false);

  // News list
  const [newsItems, setNewsItems] = useState([]);

  const { toast } = useToast();

  const ADMIN_PASSWORD = "yourStrongAdminPassword123"; // Change this!

  useEffect(() => {
    if (authenticated) {
      fetchSliderItems();
      fetchNewsItems();
    }
  }, [authenticated]);

  // Fetch slider items
  const fetchSliderItems = async () => {
    try {
      const { data, error } = await supabase
        .from("slider_items")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setSliderItems(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load slider images.",
        variant: "destructive",
      });
    }
  };

  // Fetch news items
  const fetchNewsItems = async () => {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setNewsItems(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load news.",
        variant: "destructive",
      });
    }
  };

  // Login handler
  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthenticated(true);
      toast({
        title: "Success",
        description: "Welcome, Admin!",
      });
    } else {
      toast({
        title: "Error",
        description: "Invalid password.",
        variant: "destructive",
      });
    }
    setPasswordInput("");
  };

  // Slider file change
  const handleFileChange = (e) => {
    setUploadFile(e.target.files[0]);
  };

  // Upload slider file
  const handleUpload = async () => {
    if (!uploadFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = uploadFile.name.split(".").pop();
      const fileName = `slider_${Date.now()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from("news-media")
        .upload(fileName, uploadFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: uploadFile.type,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("news-media")
        .getPublicUrl(fileName);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      const fileType = uploadFile.type.startsWith("video") ? "video" : "image";

      const { error: insertError } = await supabase
        .from("slider_items")
        .insert([{ file_url: publicUrlData.publicUrl, file_type: fileType }]);

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "File uploaded and slider updated.",
      });

      setUploadFile(null);
      fetchSliderItems();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Upload failed",
        variant: "destructive",
      });
    }

    setUploading(false);
  };

  // News media change
  const handleNewsMediaChange = (e) => {
    setNewsMediaFile(e.target.files[0]);
  };

  // Upload news content
  const handleNewsUpload = async () => {
    if (!newsTitle || !newsDescription || !newsCategory) {
      toast({
        title: "Missing Fields",
        description: "Please fill all the required fields: Title, Description, and Category.",
        variant: "destructive",
      });
      return;
    }

    setNewsUploading(true);
    let publicUrl = null;

    try {
      // Step 1: Upload media file if present
      if (newsMediaFile) {
        const fileExt = newsMediaFile.name.split(".").pop();
        const fileName = `news_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("news-media")
          .upload(fileName, newsMediaFile, {
            contentType: newsMediaFile.type,
          });

        if (uploadError) {
          throw new Error(`File upload failed: ${uploadError.message}`);
        }

        // Step 2: Get public URL
        const { data: urlData, error: urlError } = supabase.storage
          .from("news-media")
          .getPublicUrl(fileName);

        if (urlError || !urlData?.publicUrl) {
          throw new Error("Failed to get public URL.");
        }

        publicUrl = urlData.publicUrl;
      }

      // Step 3: Insert news into database (REMOVE view, likes if not in schema)
      const { error: insertError } = await supabase.from("news").insert([
        {
          title: newsTitle,
          description: newsDescription,
          category: newsCategory,
          image_url: publicUrl,
          created_at: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        throw new Error(`Database insert failed: ${insertError.message}`);
      }

      toast({
        title: "Success",
        description: "News uploaded successfully.",
      });

      // Reset fields
      setNewsTitle("");
      setNewsDescription("");
      setNewsCategory("");
      setNewsMediaFile(null);

      fetchNewsItems(); // Reload list
    } catch (error) {
      console.error("Upload Error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "An unknown error occurred during upload.",
        variant: "destructive",
      });
    }

    setNewsUploading(false);
  };





  // Delete slider item
  const handleDeleteSlider = async (id, fileUrl) => {
    try {
      // Delete from DB
      const { error } = await supabase.from("slider_items").delete().eq("id", id);
      if (error) throw error;

      // Delete from storage
      // Extract filename from public URL
      const url = new URL(fileUrl);
      const path = url.pathname.replace("/storage/v1/object/public/news-media/", "");
      const { error: storageError } = await supabase.storage
        .from("news-media")
        .remove([path]);

      if (storageError) throw storageError;

      toast({
        title: "Success",
        description: "Slider item deleted.",
      });

      fetchSliderItems();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete slider item",
        variant: "destructive",
      });
    }
  };

  // Delete news item
  const handleDeleteNews = async (id, imageUrl) => {
    try {
      // Delete from DB
      const { error } = await supabase.from("news").delete().eq("id", id);
      if (error) throw error;

      // Delete from storage if image exists
      if (imageUrl) {
        const url = new URL(imageUrl);
        const path = url.pathname.replace("/storage/v1/object/public/news-media/", "");
        const { error: storageError } = await supabase.storage
          .from("news-media")
          .remove([path]);

        if (storageError) throw storageError;
      }

      toast({
        title: "Success",
        description: "News item deleted.",
      });

      fetchNewsItems();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete news item",
        variant: "destructive",
      });
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100 dark:bg-gray-900">
        <form
          onSubmit={handleLogin}
          className="bg-white dark:bg-gray-800 p-8 rounded shadow-md max-w-sm w-full"
        >
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">
            Admin Login
          </h2>
          <input
            type="password"
            placeholder="Enter password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="w-full px-4 py-2 rounded border dark:bg-gray-700 dark:text-white dark:border-gray-600 mb-4"
            required
          />
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
      </div>
    );
  }

  // Admin panel UI
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 space-y-10">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Admin Panel - Slider & News Management
      </h2>

      {/* Slider Upload Section */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded shadow-md">
        <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
          Upload Image or Video for Slider
        </h3>
        <input type="file" accept="image/*,video/*" onChange={handleFileChange} />
        <Button onClick={handleUpload} disabled={uploading} className="mt-4">
          {uploading ? "Uploading..." : "Upload Slider Media"}
        </Button>

        <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">
          Current Slider Items
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sliderItems.length === 0 && (
            <p className="text-gray-700 dark:text-gray-300">No slider items found.</p>
          )}
          {sliderItems.map((item) => (
            <div key={item.id} className="relative rounded overflow-hidden shadow group">
              {item.file_type === "video" ? (
                <video
                  src={item.file_url}
                  className="w-full h-32 object-cover"
                  muted
                  loop
                  controls
                />
              ) : (
                <img
                  src={item.file_url}
                  alt="Slider media"
                  className="w-full h-32 object-cover"
                />
              )}
              <button
                onClick={() => handleDeleteSlider(item.id, item.file_url)}
                className="absolute top-1 right-1 bg-red-600 text-white px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition"
                title="Delete slider item"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* News Upload Section */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded shadow-md">
        <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
          Upload News Content
        </h3>

        <div className="space-y-4 max-w-xl">
          <input
            type="text"
            placeholder="Title"
            value={newsTitle}
            onChange={(e) => setNewsTitle(e.target.value)}
            className="w-full px-4 py-2 rounded border dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          <textarea
            placeholder="Description"
            value={newsDescription}
            onChange={(e) => setNewsDescription(e.target.value)}
            className="w-full px-4 py-2 rounded border dark:bg-gray-700 dark:text-white dark:border-gray-600"
            rows={4}
          />
          <input
            type="text"
            placeholder="Category"
            value={newsCategory}
            onChange={(e) => setNewsCategory(e.target.value)}
            className="w-full px-4 py-2 rounded border dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />

          {/* File upload input with preview filename */}
          <div className="flex flex-col space-y-1">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleNewsMediaChange}
              className="text-sm text-gray-700 dark:text-gray-300"
            />
            {newsMediaFile && (
              <span className="text-sm text-green-600 dark:text-green-400">
                Selected file: {newsMediaFile.name}
              </span>
            )}
          </div>

          <Button
            onClick={handleNewsUpload}
            disabled={newsUploading}
            className="w-full md:w-auto"
          >
            {newsUploading ? "Uploading News..." : "Upload News"}
          </Button>
        </div>

        <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">
          Current News Items
        </h4>

        {newsItems.length === 0 ? (
          <p className="text-gray-700 dark:text-gray-300">No news found.</p>
        ) : (
          <div className="space-y-6 max-w-3xl">
            {newsItems.map((news) => (
              <div
                key={news.id}
                className="flex flex-col md:flex-row items-start md:items-center justify-between bg-gray-50 dark:bg-gray-700 p-4 rounded shadow"
              >
                <div className="flex items-center space-x-4">
                  {news.image_url && news.image_url.includes(".mp4") ? (
                    <video
                      src={news.image_url}
                      className="w-24 h-16 object-cover rounded"
                      muted
                      loop
                      controls
                    />
                  ) : news.image_url ? (
                    <img
                      src={news.image_url}
                      alt={news.title}
                      className="w-24 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-24 h-16 bg-gray-300 dark:bg-gray-600 flex items-center justify-center rounded text-gray-500">
                      No Image
                    </div>
                  )}
                  <div>
                    <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {news.title}
                    </h5>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 max-w-xs">
                      {news.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Category: {news.category} | Views: {news.view} | Likes: {news.likes}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteNews(news.id, news.image_url)}
                  className="mt-4 md:mt-0 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<NewsPortal />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}
