// src/components/CelebrityNews/CelebrityNews.js
import React, { useEffect, useState } from "react";
import { getCelebrityNews } from "./News";
import './CelebrityNews.css'
const CelebrityNews = () => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      const news = await getCelebrityNews();
      setArticles(news);
    };
console.log(articles)
    fetchNews();
  }, []);

  return (
    <div className="news-container">
      <h2>Celebrity Trends</h2>
      {articles.length > 0 ? (
        articles.map((article, index) => (
          <div key={index} className="news-article">
            <h3>{article.title}</h3>
            <p>{article.description}</p>
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              Read More
            </a>
          </div>
        ))
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default CelebrityNews;
