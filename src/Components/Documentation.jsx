import React, { useState, useEffect } from "react";
import { client } from "../lib/sanity";
import { Link } from "react-router-dom";

const Documentation = () => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    // Fetch all articles, return just title, slug, and category
    const query = `*[_type == "article"]{ title, slug, category }`;

    client
      .fetch(query)
      .then((data) => setArticles(data))
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-10 text-[#EAE4D5]">
      <h1 className="text-3xl font-serif mb-8">Support & Documentation</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((article) => (
          <Link
            key={article.slug.current}
            to={`/docs/${article.slug.current}`}
            className="p-6 bg-[#111] border border-[#B6B09F]/20 rounded-xl hover:border-[#EAE4D5] transition-all"
          >
            <span className="text-[10px] uppercase text-[#B6B09F]">
              {article.category}
            </span>
            <h2 className="text-xl mt-2">{article.title}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Documentation;
