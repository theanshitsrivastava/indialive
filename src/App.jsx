import React, { useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Search, Moon, Sun, Settings } from "lucide-react";
import NewsDetail from "./components/NewsDetail.jsx";
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

      {/* Slider */}
      <div className="container mx-auto px-4 mt-4">
        <Slider items={sliderItems} />
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 py-4 shadow-md mt-4">
        <div className="container mx-auto px-4 flex flex-col md:flex-row gap-4 items-center">
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
            variant={selectedCategory === "All" ? "default" : "outline"}
            onClick={() => setSelectedCategory("All")}
          >
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* News List */}
      <main className="container mx-auto px-4 py-8">
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

                  <div className="flex justify-between items-center text-gray-500 dark:text-gray-400 text-sm">
                    <span>{new Date(news.created_at).toLocaleDateString()}</span>
                    <span>Likes: {news.likes || 0}</span>
                  </div>
                </div>
              </motion.article>
            ))}
            {filteredNews.length === 0 && (
              <p className="text-center text-gray-600 dark:text-gray-400">
                No news found.
              </p>
            )}
          </div>
        )}
      </main>

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
        title: "Error",
        description: "Please fill all news fields.",
        variant: "destructive",
      });
      return;
    }

    setNewsUploading(true);

    let publicUrl = null;

    try {
      if (newsMediaFile) {
        // Upload media for news
        const fileExt = newsMediaFile.name.split(".").pop();
        const fileName = `news_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("news-media")
          .upload(fileName, newsMediaFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: newsMediaFile.type,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("news-media")
          .getPublicUrl(fileName);

        if (!publicUrlData || !publicUrlData.publicUrl) {
          throw new Error("Failed to get public URL");
        }

        publicUrl = publicUrlData.publicUrl;
      }

      // Insert news record into DB
      const { error: insertError } = await supabase.from("news").insert([
        {
          title: newsTitle,
          description: newsDescription,
          category: newsCategory,
          image_url: publicUrl,
          view: 0,
          likes: 0,
          created_at: new Date().toISOString(),
        },
      ]);

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "News uploaded successfully.",
      });

      // Clear inputs
      setNewsTitle("");
      setNewsDescription("");
      setNewsCategory("");
      setNewsMediaFile(null);

      fetchNewsItems();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Upload failed",
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
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleNewsMediaChange}
          />
          <Button onClick={handleNewsUpload} disabled={newsUploading}>
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
