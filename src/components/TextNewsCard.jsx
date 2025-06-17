import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { TextNewsListItem } from "./TextNewsListItem";

type Article = {
  id: string;
  title: string;
  created_at: string;
  category: string;
};

const TextNewsList: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      const { data, error } = await supabase
        .from("news")
        .select("id, title, created_at, category")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching news:", error);
      } else {
        setArticles(data || []);
      }

      setLoading(false);
    };

    fetchNews();
  }, []);

  return (
    <aside className="bg-white p-4 rounded-lg shadow-md w-full">
      <h2 className="text-lg font-bold text-red-700 mb-3">📰 Latest Headlines</h2>
      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : (
        <div className="divide-y divide-gray-200">
          {articles.map((article) => (
            <TextNewsListItem key={article.id} article={article} />
          ))}
        </div>
      )}
    </aside>
  );
};

export default TextNewsList;
