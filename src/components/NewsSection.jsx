import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const NewsSection = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching news:", error);
      } else {
        setNews(data);
      }
      setLoading(false);
    };

    fetchNews();
  }, []);

  const handleShare = async (article) => {
    const shareUrl = `https://yourdomain.com/news/${article.id}`; // Replace with your domain
    const shareData = {
      title: article.title,
      text: article.description,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error("Sharing failed:", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard!");
      } catch (err) {
        alert("Failed to copy link.");
      }
    }
  };

  if (loading) return <p>Loading news...</p>;

  return (
    <aside className="w-full md:w-80 bg-gray-100 p-4 shadow-md rounded-md">
      <h2 className="text-xl font-bold text-red-700 mb-4">📰 Latest News</h2>
      <div className="space-y-4">
        {news.map((article) => (
          <div
            key={article.id}
            className="bg-white border rounded-md shadow-sm p-3"
          >
            {article.image_url && (
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-32 object-cover rounded mb-2"
              />
            )}
            <h3 className="text-md font-semibold text-gray-800">
              {article.title}
            </h3>
            <p className="text-xs text-gray-500 mb-1">
              {new Date(article.created_at).toLocaleDateString()} |{" "}
              {article.category}
            </p>
            <p className="text-sm text-gray-600 line-clamp-3 mb-2">
              {article.description}
            </p>
            <div className="flex justify-between text-xs text-gray-600">
              <span>👁 {article.views || 0}</span>
              <span>❤️ {article.likes || 0}</span>
              <button
                onClick={() => handleShare(article)}
                className="text-blue-600 hover:underline"
              >
                Share
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default NewsSection;
