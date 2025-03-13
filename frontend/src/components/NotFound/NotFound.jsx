import React, { useEffect, useState } from "react";
import "./NotFound.css";

const NotFound = () => {
  const [count, setCount] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    setTimeout(() => {
      window.location.href = "/";
    }, 5000); 

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="notfound-container">
      <div className="notfound-card">
        <h2>Oops! Page Not Found</h2>
        <p>
          The page you are trying to visit does not exist.<br />
          We are working on developing this page.
        </p>
        <p className="redirect-message">
          Redirecting you to the home page in <span className="countdown">{count}</span> seconds...
        </p>
      </div>
    </div>
  );
};

export default NotFound;
