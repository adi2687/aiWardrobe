// Message.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
// Add this line before importing socket.io-client

import { io } from "socket.io-client"; // Import socket.io-client
import "./messageMain.css";

const socket = io("http://localhost:5000"); // Connect to server
useEffect(() => {
  // Inform the server of the connected user
  socket.emit("user_online", username);

  // Listen for incoming messages
  socket.on("receive_message", (data) => {
    console.log("New message received:", data);
    setFetchedMessages((prev) => [...prev, data]);
  });

  // Cleanup on component unmount
  return () => {
    socket.emit("user_offline", username); // Optional if needed
    socket.disconnect();
  };
}, [username]);

const Message = () => {
  const { username, id } = useParams();
  const [message, setMessage] = useState("");
  const [clothdetail, setClothDetail] = useState({});
  const [loading, setLoading] = useState(true);
  const [fetchedMessages, setFetchedMessages] = useState([]);

  // Send Message Function
  const sendmessage = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/user/message", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipient: username, message }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("");
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
        `http://localhost:5000/user/sellcloth/find/${id}`,
        {
          method: "GET",
          credentials: "include",
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
        `http://localhost:5000/user/message/${username}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      setFetchedMessages(data);
    } catch (error) {
      console.error("Couldn't fetch messages:", error);
    }
  };

  // Listen for real-time messages
  useEffect(() => {
    socket.on("receive_message", (data) => {
      console.log("New message received:", data);
      setFetchedMessages((prev) => [...prev, data]);
    });

    fetchClothDetails();
    fetchmessages();

    return () => {
      socket.off("receive_message"); // Clean up on unmount
    };
  }, []);

  return (
    <div className="messageContainer">
      <h1>Message Component</h1>
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
                ? `http://localhost:5000/uploadscloths/${clothdetail.clothImage}`
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
