// Message.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { getAuthHeaders } from '../../utils/auth';
import "./messageMain.css";

const Message = () => {
  const { username, id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [clothdetail, setClothDetail] = useState({});
  const [loading, setLoading] = useState(true);
  const [fetchedMessages, setFetchedMessages] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Track authentication status
  const [user, setUser] = useState(null);
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  // Send Message Function
  const sendmessage = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/user/message`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: JSON.stringify({ recipient: username, message }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("");
        fetchmessages(); // Fetch messages after sending
      } else {
        alert(data.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error messaging the user:", error);
    }
  };

  // Fetch Cloth Details
  const fetchClothDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}/user/sellcloth/find/${id}`,
        {
          method: "GET",
          credentials: "include",
          headers: getAuthHeaders()
        }
      );

      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      setClothDetail(data);
    } catch (error) {
      console.error("Couldn't get the data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Messages
  const fetchmessages = async () => {
    try {
      const response = await fetch(
        `${apiUrl}/user/message/${username}`,
        {
          method: "GET",
          credentials: "include",
          headers: getAuthHeaders()
        }
      );

      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      setFetchedMessages(data);
    } catch (error) {
      console.error("Couldn't fetch messages:", error);
    }
  };

  // Check authentication status
  useEffect(() => {
    fetch(`${apiUrl}/user/profile`, {
      method: "GET",
      credentials: "include",
      headers: getAuthHeaders(),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Success") {
          setUser(data.user);
          setIsAuthenticated(true);
          // Only fetch data if authenticated
          fetchClothDetails();
          fetchmessages();
          
          // Set up polling for messages
          const intervalId = setInterval(fetchmessages, 3000); // Poll every 3 seconds
          return () => clearInterval(intervalId); // Clean up on unmount
        } else {
          setIsAuthenticated(false);
          console.log("User not authenticated");
        }
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
        setIsAuthenticated(false);
      });
  }, [apiUrl]);

  // If authentication status is still loading
  if (isAuthenticated === null) {
    return (
      <div className="messageContainer">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated
  if (isAuthenticated === false) {
    return (
      <div className="messageContainer">
        <div className="auth-required">
          <FaUser className="auth-icon" />
          <h2>Authentication Required</h2>
          <p>You need to be logged in to send and receive messages.</p>
          <div className="auth-buttons">
            <button className="primary-button" onClick={() => navigate('/auth')}>
              Log In
            </button>
            <button className="secondary-button" onClick={() => {
              navigate('/auth');
              // This will trigger the signup form in the Auth component
              localStorage.setItem('showSignup', 'true');
            }}>
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="messageContainer">
      <h3>Previous Messages</h3>
      {fetchedMessages.length > 0 ? (
        <ul>
          {fetchedMessages.map((message, index) => (
            <li key={index}>
              <strong>From:</strong> {message.sender} <br />
              <strong>Message:</strong> {message.message} <br />
              <strong>Timestamp:</strong> {new Date(message.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>No messages yet.</p>
      )}
      <p>Messaging user: {username}</p>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <br />
      <button onClick={sendmessage} type="submit">Send</button>

      {loading ? (
        <p>Loading cloth details...</p>
      ) : (
        <>
          <h3>Cloth Details</h3>
          <img
            src={
              clothdetail?.clothImage
                ? `${clothdetail.clothImage}`
                : "default-image.jpg"
            }
            alt={clothdetail?.description || "Cloth image"}
          />
          <p>Description: {clothdetail?.description}</p>
          <p>Price: ₹{clothdetail?.price}</p>
          <p>Seller: {clothdetail?.username}</p>
        </>
      )}
    </div>
  );
};

export default Message;
