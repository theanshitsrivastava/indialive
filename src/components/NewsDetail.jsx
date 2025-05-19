import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';  // adjust path
import { supabase } from "@/lib/supabase";

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setNews(data);
      } catch (err) {
        setError(err.message || "News not found");
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="container mx-auto py-10 text-center text-red-500">
        {error || "News not found."}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-6 flex items-center gap-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-5 w-5" /> Back
      </Button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <img src={news.image_url} alt={news.title} className="w-full h-64 object-cover" />

        <div className="p-6">
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
            news.category === "Breaking News" ? "bg-red-100 text-red-700" : "bg-gray-200 dark:bg-gray-700 dark:text-white"
          }`}>
            {news.category}
          </span>

          <h1 className="text-3xl font-bold mt-4 mb-4 text-gray-800 dark:text-white">{news.title}</h1>

          <p className="text-gray-600 dark:text-gray-300 mb-4">{news.description}</p>

          <div className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
            {news.content}
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div>Views: {news.views}</div>
            <div>Likes: {news.likes}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
