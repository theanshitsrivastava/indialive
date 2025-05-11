
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Search, Moon, Sun, Heart, Settings } from "lucide-react";
import { AdminPanel } from "@/components/AdminPanel";

const categories = [
  "Breaking News",
  "Politics",
  "Business",
  "Technology",
  "Entertainment",
  "Sports"
];

function NewsPortal() {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [darkMode, setDarkMode] = useState(false);
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchNews();
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

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

  const handleLike = async (newsId) => {
    try {
      const { data, error } = await supabase
        .from('news')
        .update({ likes: newsItems.find(n => n.id === newsId).likes + 1 })
        .eq('id', newsId);

      if (error) throw error;

      setNewsItems(newsItems.map(item => 
        item.id === newsId ? { ...item, likes: item.likes + 1 } : item
      ));

      toast({
        title: "Success",
        description: "Thanks for liking this article!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like the article.",
        variant: "destructive",
      });
    }
  };

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
        .from('newsletter_subscribers')
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

  const filteredNews = newsItems.filter(news => {
    const matchesSearch = news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         news.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || news.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-red-800 dark:bg-red-900 text-white py-4 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center"
            >
              <Link to="/">
                <img alt="India Live News Logo" className="h-12" src="src\indialive.png" />
              </Link>
              <h1 className="text-3xl font-bold ml-4">India Live</h1>
            </motion.div>
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
              <nav className="hidden md:flex space-x-4">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant="ghost"
                    className={`text-white hover:bg-red-700 ${
                      selectedCategory === category ? 'bg-red-700' : ''
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filter Section */}
      <div className="bg-white dark:bg-gray-800 py-4 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search news..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              className={`${
                selectedCategory === "All" ? 'bg-red-700 text-white' : ''
              }`}
              onClick={() => setSelectedCategory("All")}
            >
              All Categories
            </Button>
          </div>
        </div>
      </div>

      {/* Breaking News Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-red-600 dark:bg-red-800 text-white py-2"
      >
        <div className="container mx-auto px-4">
          <p className="font-bold">BREAKING NEWS: Latest updates on major developments across India</p>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNews.map((news) => (
              <motion.article
                key={news.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="news-card dark:bg-gray-800 dark:text-white"
              >
                <img 
                  alt={news.title}
                  className="w-full h-48 object-cover"
                  src={news.image_url} 
                />
                <div className="p-4">
                  <span className={`category-badge ${
                    news.category === "Breaking News" ? "breaking-news" : "bg-gray-200 dark:bg-gray-700"
                  } mb-2 inline-block`}>
                    {news.category}
                  </span>
                  <h2 className="news-title dark:text-white">{news.title}</h2>
                  <p className="news-description dark:text-gray-300">{news.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <Button className="bg-red-800 hover:bg-red-700 dark:bg-red-700">
                      Read More
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2"
                      onClick={() => handleLike(news.id)}
                    >
                      <Heart className={`h-5 w-5 ${news.likes > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                      <span>{news.likes || 0}</span>
                    </Button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </main>

      {/* Newsletter Section */}
      <section className="bg-red-800 dark:bg-red-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="mb-6">Stay updated with the latest news and updates delivered directly to your inbox.</p>
            <form onSubmit={handleSubscribe} className="flex gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg text-gray-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" className="bg-white text-red-800 hover:bg-gray-100">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">About India Live</h3>
              <p>Your trusted source for latest news and updates across India.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category}>
                    <a href="#" className="hover:text-red-500">{category}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <p>Email: news@indialive.com</p>
              <p>Phone: +91 123 456 7890</p>
            </div>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<NewsPortal />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
