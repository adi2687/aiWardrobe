import React, { useEffect, useState } from "react";
import "./Profile.css";
import { useNavigate } from "react-router-dom";
const Profile = () => {
  const [user, setUser] = useState(null);
const navigate=useNavigate()
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
function LogOut(){
  
    fetch("http://localhost:5000/user/logout",{
method:"POST",
credentials:'include'
    })
    .then((response)=>response.json())
    .then((data)=>{
      console.log(data)
      navigate("/auth")
    })
    .catch((error)=>{
      console.log('couldnt logout',error)
    })
    

}
  return (
    <div className="profile-container">
      
      {user ? (
        
        <div className="profile-card">
          <div className="logout"><button onClick={LogOut}>Logout</button></div>
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
            alt="Profile"
            className="profile-image"
          />
          <h2>{user.username}</h2>
          <p>Email: {user.email}</p>
          <button className="edit-btn">Edit Profile</button>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
};

export default Profile;
