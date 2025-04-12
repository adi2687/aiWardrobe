import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import { div } from "three/tsl";
import { FaShare } from "react-icons/fa";
// import { response } from "express";
const Profile = () => {
  const [user, setUser] = useState(null);
  const [wardrobeImages, setWardrobeImages] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imageName, setImageName] = useState("No file chosen");
  const [zoomedImage, setZoomedImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();
  const [sharecloths, setshare] = useState("");
  const apiUrl=import.meta.env.VITE_BACKEND_URL
  const mlUrl=import.meta.env.VITE_ML_URL
  const frontedUrl=import.meta.env.VITE_FRONTEND_URL
  // const [isVisible,setIsVisible]=useState(false)
  useEffect(() => {
    fetch(`${apiUrl}/user/profile`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => setUser(data.user))
      .catch((error) => console.error("Error fetching profile:", error));
  }, []);

  const LogOut = () => {
    fetch(`${apiUrl}/user/logout`, {
      method: "POST",
      credentials: "include",
    })
      .then(() => (window.location.href = "/"))
      .catch((error) => console.log("Couldn't logout", error));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageName(file.name);
    }
  };

  // const SellCloth=()=>{
  // const navigate=useNavigate()
  const handleNav = () => {
    navigate("/sellcloth");
  };
  // }
  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!imageFile) alert("Upload an image !");

    const formData = new FormData();
    formData.append("wardrobeImage", imageFile);

    try {
      const response = await fetch(`${apiUrl}/user/upload-image`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setWardrobeImages([...wardrobeImages, data.imageUrl]);
        setImageFile(null);
        setImageName("No file chosen");
        document.getElementById("image-upload-input").value = "";
        setIsScanning(true); // Start scanning

        setTimeout(() => {
          setIsScanning(false); // Stop scanning
          navigate("/wardrobe"); // Navigate only after 5s
        }, 5000);
      } else {
        console.error("Upload failed:", data.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }

    formData.append("images", imageFile);

    try {
      const response = await fetch(`${mlUrl}/classify`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Image classification result:", data);
      console.log("clothes", data.results[0].raw_response);

      const clothes = data.results[0].raw_response;
      const clothesData = clothes;
      console.log("Sending clothes data:", clothesData);

      console.log("colthes data ", clothesData);
      const clothesres = await fetch(
        `${apiUrl}/user/clothesUpload`,
        {
          method: "POST",
          credentials: "include",
          body: JSON.stringify({ clothes: clothesData }),
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      if (!clothesres.ok) {
        throw new Error(`Http error! status:${clothesres.status}`);
      }
      const clothesdata = await clothesres.json();
      console.log("clothes save data : ", clothesdata);
    } catch (error) {
      console.error("Error classifying image:", error);
    }
  };
  const [clothsForWeek, setClothesForWeek] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isLoadingClothes, setIsLoadingClothes] = useState(false);

  const toggleClothesForWeek = () => {
    if (!isVisible) {
      console.log(isVisible);
      setIsLoadingClothes(true);
      fetch(`${apiUrl}/user/clothsforweek`, {
        method: "GET",
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          setClothesForWeek(data);
          setIsVisible(true);
        })
        .catch((error) => {
          console.error("Error fetching clothes for week:", error);
        })
        .finally(() => {
          setIsLoadingClothes(false);
        });
    } else {
      setIsVisible(false);
    }
  };
  const [favourites, setFavourites] = useState([]);
  const clothesforweek = () => {
    fetch(`${apiUrl}/user/clothsforweek`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        setFavourites(data.favourites);
        setClothesForWeek(data.clothforweek); // adjust key if API response differs
      })
      .catch((error) => {
        console.error("Error fetching clothes for week:", error);
      });
  };
  useEffect(() => {
    clothesforweek();
  }, []);

  const wardrobenav = () => {
    navigate("/wardrobe");
  };
  const recommedationnav = () => {
    navigate("/recommendations");
  };

  const recommedationforweek = () => {
    navigate("/planner");
  };

  const [favoritevisible, setfavouritevivile] = useState(false);

  const togglefavourite = () => {
    setfavouritevivile(!favoritevisible);
  };
  const deletefavourite = (clothsuggestion) => {
    fetch(`${apiUrl}/user/cloth/deletefavourite`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ clothsuggestion }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setFavourites(data.favourite);
      })
      .catch((error) => {
        console.error("Error deleting favourite:", error);
      });
  };

  const SharetoFriends = async (clothesToShare) => {
    const res = await fetch(`${apiUrl}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clothes: clothesToShare }),
      credentials: "include",
    });
    const data = await res.json();
    const shareLink = `${frontedUrl}/share/${data.id}`;
    setshare(shareLink);
    // console.log("Share this link:", shareLink);
  };
  const reset_link = () => {
    console.log("reset is cliked");
    setshare("");
  };

  const previewoutfit = async (clothesToShare) => {
    const res = await fetch(`${apiUrl}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clothes: clothesToShare }),
      credentials: "include",
    });
    const data = await res.json();
    console.log(data);
    const shareLink = `../share/${data.id}`;
    navigate(shareLink);
  };
  const [newPassword, setnewPassword] = useState("");

  const setnewpass = (password) => {
    console.log(newPassword);
    console.log("new pass", password);
    if (!password) {
      alert("Please enter a new password");
    }
    fetch(`${apiUrl}/user/updatepassword`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newpassword: password }),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        // console.log(data.status);
        if (data.status === true) {
          alert("Password updated successfully");
          setnewPassword("");
        }
      })
      .catch((error) => {
        console.error("Error setting new password:", error);
      });
  };
  const [showPassword, setShowPassword] = useState(false);
  const [age, setAge] = useState(0);
  const [preferences, setPreferences] = useState("");
  const [gender, setGender] = useState("");
  
  const personalinfosubmit = () => {
    console.log("Info clicked");
    console.log(age, preferences, gender);
  
  
    fetch(`${apiUrl}/user/updateinfo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ age, preferences, gender }),
      credentials: "include"
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.status === true) {
          alert("Info updated successfully!");
          // setAge(0);
          // setPreferences("");
          // setGender("");
        } else {
          alert("Something went wrong while updating info.");
        }
      })
      .catch((error) => {
        console.error("Error updating info:", error);
        alert("An error occurred. Please try again later.");
      });
  };
  

  // const loadwishlist=()=>{
  //   fetch("http://localhost:5000/user/wishlist", {
  //     method: "GET",
  //     credentials: "include"
  //     })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log(data)

  // }

  const navigatewishlist=()=>{
    navigate("/wishlist");
  }
  return (
    <div className="profile-container">
      {user ? (
        <div className="profile-card">
          <button className="logout" onClick={LogOut}>
            Logout
          </button>
          <div className="profile-header">
            <img
              src={
                user.profilePicture ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                  user.username
                )}`
              }
              alt="Profile"
              className="profile-image"
            />

            <div className="user-info">
              <h2 className="profile-name">{user.username}</h2>
              <p className="profile-email">{user.email}</p>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                onChange={(e) => setnewPassword(e.target.value)}
              />
              <div className="passbuttons">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="showpassword"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>

                <button
                  type="button"
                  className="changepassbutton"
                  onClick={() => setnewpass(newPassword)}
                >
                  Change Password
                </button>
              </div>
              <div class="ai-form-container">
                <h3>Get Personalized Outfit Suggestions</h3>

                <input
                  type="number"
                  placeholder="Enter your age"
                  class="ai-input"
                  style={{border:"2px solid white"}}
                  min={10}
                  max={80}
                  onChange={(e)=>setAge(e.target.value)}
                />

                <select class="ai-input" onChange={(e)=>setGender(e.target.value)}>
                  <option value="" disabled selected>
                    Select Gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>

                <input
                  type="text"
                  placeholder="Style Preferences (e.g. streetwear, ethnic, casual)"
                  class="ai-input"
                  style={{border:"2px solid white",marginTop:"10px"}}
                  onChange={(e)=>setPreferences(e.target.value)}
                />

                <button class="ai-btn" onClick={personalinfosubmit}>Submit</button>
              </div>

              <br />
              <br />
              <div className="sellClothes">
                <button onClick={handleNav}>Sell old Clothes</button>
                <button onClick={wardrobenav}>Wardrobe</button>
                <button onClick={recommedationnav}>Recommendations</button>
                <br />
                <button onClick={recommedationforweek}>
                  Recommedation for week
                </button>
                <button onClick={navigatewishlist}>Your wishlist</button>
              </div>
              <div className="clothforweek">
                <button onClick={toggleClothesForWeek}>
                  {isVisible
                    ? "▲ Hide weekly outfits"
                    : "▼ Show your outfits for the week"}
                </button>
                <button
                  onClick={togglefavourite}
                  style={{ marginBottom: "10px" }}
                  className="favouritebutton "
                >
                  {favoritevisible ? "Hide Favourites" : "Show Favourites"}
                </button>

                <div
                  className={`weekly-outfits-container ${
                    isVisible ? "visible" : ""
                  }`}
                  style={{
                    background: "white",
                    padding: "1rem",
                    borderRadius: "8px",
                    marginTop: "0.5rem",
                    backgroundColor: "#333",
                    color: "blue",
                  }}
                >
                  {isVisible && (
                    <>
                      {isLoadingClothes ? (
                        <p>Loading your weekly outfits...</p>
                      ) : clothsForWeek && clothsForWeek.clothforweek ? (
                        <p style={{ whiteSpace: "pre-line" }}>
                          <h2>Your weekly clothes</h2>
                          {clothsForWeek.clothforweek}
                        </p>
                      ) : (
                        <p>No clothing suggestions saved yet.</p>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div>
                {favoritevisible && (
                  <div>
                    {favourites.length > 0 ? (
                      favourites?.map((ele, i) => (
                        <div
                          key={i}
                          className="fav-item"
                          style={{ padding: "8px 0" }}
                        >
                          <b>{ele}</b>
                          <br />
                          <button
                            className="sharebutton"
                            onClick={() => deletefavourite(ele)}
                          >
                            Delete favourite
                          </button>

                          <button
                            className="sharefriends"
                            onClick={() => SharetoFriends(ele)}
                          >
                            Share to friends
                          </button>
                          <button
                            className="previewbutton"
                            onClick={() => {
                              previewoutfit(ele);
                            }}
                          >
                            Preview outfit
                          </button>

                          <div className="sharedclothes">
                            {sharecloths ? (
                              <a href={sharecloths} onClick={reset_link}>
                                Share clothes <FaShare />
                              </a>
                            ) : (
                              <p>Share cloths link not available</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="fav-item">No favourites yet.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="upload-section">
            <br />
            <br />
            <br />
            <label htmlFor="image-upload-input" className="file-label">
              Choose Image
            </label>

            <input
              type="file"
              id="image-upload-input"
              onChange={handleImageChange}
              className="file-input"
            />
            {imageName && <span className="file-name">{imageName}</span>}
            <button
              onClick={handleImageUpload}
              className="upload-btn"
              disabled={!imageName}
            >
              {isScanning ? "Uploading..." : "Upload"}
            </button>
          </div>

          {isScanning && (
            <div className="loading-screen">
              <p>Uploading & Scanning...</p>
            </div>
          )}
        </div>
      ) : (
        <p className="loading-text">
          Loading profile... <br />
          Try logging or Signing Up
        </p>
      )}

      {zoomedImage && (
        <div className="zoom-overlay" onClick={closeZoom}>
          <img src={zoomedImage} alt="Zoomed" className="zoomed-image" />
        </div>
      )}
    </div>
  );
};

export default Profile;
