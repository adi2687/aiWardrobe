  import React, { useEffect, useState } from "react";
  import { useNavigate } from "react-router-dom";
  import "./Profile.css"; // Importing the new CSS file

  const Profile = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
      fetch("http://localhost:5000/user/profile", {
        method: "GET",
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          setUser(data.user);
        })
        .catch((error) => console.error("Error fetching profile:", error));
    }, []);

    function LogOut() {
      fetch("http://localhost:5000/user/logout", {
        method: "POST",
        credentials: "include",
      })
        .then((response) => response.json())
        .then(() => {
          navigate("/auth");
          window.location.href='/'
        })
        .catch((error) => {
          console.log("Couldn't logout", error);
        });
    }

    return (
      <div className="profile-container">
        {user ? (
          <div className="profile-card">
            <img
              src={
                user.profilePicture ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.username)}`
              }
              alt="Profile"
              className="profile-image"
            />
            <h2 className="profile-name">{user.username}</h2>
            <p className="profile-email">{user.email}</p>

            <div className="profile-actions">
              <button className="edit-btn">Edit Profile</button>
              <button className="logout-btn" onClick={LogOut}>
                Logout
              </button>
            </div>
          </div>
        ) : (
          <p className="loading-text">Loading profile...</p>
        )}
      </div>
    );
  };

  export default Profile;
