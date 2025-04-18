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
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  // const mlUrl=import.meta.env.VITE_ML_URL
  const frontedUrl = import.meta.env.VITE_FRONTEND_URL;
  // const [isVisible,setIsVisible]=useState(false)
  useEffect(() => {
    fetch(`${apiUrl}/user/profile`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => setUser(data.user))
      .catch((error) => console.error("Error fetching profile:", error));
  }, []);

  const LogOut = () => {
    fetch(`${apiUrl}/user/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then((response) => response.json())
      .then(() => {
        console.log("cliked");
        navigate("/");
      })
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

  const [userclothes, setuserclothes] = useState({});
  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!imageFile) return alert("Upload an image!");

    setIsScanning(true);

    // ----- Upload to wardrobe -----
    const uploadForm = new FormData();
    uploadForm.append("wardrobeImage", imageFile);

    try {
      const uploadRes = await fetch(`${apiUrl}/user/upload-image`, {
        method: "POST",
        credentials: "include",
        body: uploadForm,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        console.error("Upload failed:", uploadData.error || "Unknown error");
        setIsScanning(false);
        return;
      }

      // Set image in wardrobe state
      setWardrobeImages((prev) => [...prev, uploadData.imageUrl]);
      setImageFile(null);
      setImageName("No file chosen");
      document.getElementById("image-upload-input").value = "";
    } catch (error) {
      console.error("Error uploading image:", error);
      setIsScanning(false);
      return;
    }

    // ----- Send to /classify -----
    const classifyForm = new FormData();
    classifyForm.append("images", imageFile);

    try {
      const classifyRes = await fetch(`${apiUrl}/clothid/classify`, {
        method: "POST",
        body: classifyForm,
      });

      if (!classifyRes.ok) {
        throw new Error(`HTTP error! Status: ${classifyRes.status}`);
      }

      const classifyData = await classifyRes.json();
      console.log("Image classification result:", classifyData);
      console.log(classifyData.clothing_items);
      setuserclothes(classifyData.clothing_items);
      const clothes = classifyData.clothing_items;

      console.log("Sending clothes data:", clothes);

      const saveRes = await fetch(`${apiUrl}/user/clothesUpload`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clothes }),
      });

      if (!saveRes.ok) {
        throw new Error(`Http error! status: ${saveRes.status}`);
      }

      const savedData = await saveRes.json();
      console.log("Clothes saved:", savedData);

      // Wait 5s before redirect
      setTimeout(() => {
        setIsScanning(false);
        navigate("/wardrobe");
      }, 5000);
    } catch (error) {
      console.error("Error classifying image:", error);
      setIsScanning(false);
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
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ age, preferences, gender }),
      credentials: "include",
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

  const navigatewishlist = () => {
    navigate("/wishlist");
  };
  const [passwordshow, setpassword] = useState(false);
  const [personalinfovisible,changepersonalinfo]=useState(false)
  return (
    <div className="profile-container">
      {user ? (
        <div className="profile-card">
          <div className="profile-header">
            <div className="user-info">
              {/* details */}
              <div className="details">
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
                <div>
                  <h2 className="profile-name">{user.username}</h2>
                  <p className="profile-email" style={{ color: "white" }}>
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setpassword(!passwordshow);
                }}
                style={{margin:"10px"}}
              >
                {passwordshow ? (
                  <div>Hide password details</div>
                ) : (
                  <div>Change password</div>
                )}
              </button>
              <button onClick={()=>{
                changepersonalinfo(!personalinfovisible)
              }}>
                {personalinfovisible ? (
                  <div>Hide personal info</div>
                ) : ( 
                  <div>Change personal info</div>
                )}
              </button>
              {passwordshow ? (
              <div className="passdiv">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  onChange={(e) => setnewPassword(e.target.value)}
                />
                <div>
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
                
              </div>
              ) : ( 
                <div>
                  
                </div>
              )}
            {personalinfovisible ? (
              <div className="ai-form-container">
                <h3>Get Personalized Outfit Suggestions</h3>

                <input
                  type="number"
                  placeholder="Enter your age"
                  className="ai-input"
                  min={10}
                  max={80}
                  onChange={(e) => setAge(e.target.value)}
                  style={{ border: "2px solid white" }}
                />

                <select
                  className="ai-input"
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="" disabled selected>
                    Select Gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>

                <input
                  type="text"
                  placeholder="Style Preferences (e.g. streetwear, ethnic, casual)"
                  className="ai-input"
                  onChange={(e) => setPreferences(e.target.value)}
                  style={{ border: "2px solid white" }}
                />

                <button className="ai-btn" onClick={personalinfosubmit}>
                  Upload your preferences
                </button>
              </div>
            ) : (
              <div>
                </div>
            )
          }

              <br />
              <br />
              <div className="sellClothes">
                <div className="buttons">
                  <button onClick={handleNav}>Sell old Clothes</button>
                  <button onClick={wardrobenav}>Wardrobe</button>
                  <button onClick={recommedationnav}>Recommendations</button>
                  <button onClick={recommedationforweek}>
                    Recommedation for week
                  </button>
                </div>
              </div>
              <div className="clothforweek">
                <button onClick={toggleClothesForWeek}>
                  {isVisible
                    ? "▲ Hide weekly outfits"
                    : "▼ Show your outfits for the week"}
                </button>
                <button onClick={togglefavourite} className="favouritebutton ">
                  {favoritevisible ? "Hide Favourites" : "Show Favourites"}
                </button>

                <div
                  className={`weekly-outfits-container ${
                    isVisible ? "visible" : ""
                  }`}
                >
                  {isVisible && (
                    <>
                      {isLoadingClothes ? (
                        <p>Loading your weekly outfits...</p>
                      ) : clothsForWeek && clothsForWeek.clothforweek ? (
                        <p>
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
              <div className="favourite">
                {favoritevisible && (
                  <div>
                    {favourites.length > 0 ? (
                      favourites?.map((ele, i) => (
                        <div key={i} className="fav-item">
                          <b>{ele}</b>
                          <br />
                          <div>
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
                          </div>

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
            {/* <label htmlFor="image-upload-input" className="custom-file-label">
  Choose Image
</label> */}
            {/* <p className="file-description">Upload your clothes images</p> */}
<h3 >Upload your clothes and get the best recommedation !!!</h3>
            <input
              type="file"
              id="image-upload-input"
              onChange={handleImageChange}
              className="custom-file-input"
              accept="image/*"
              aria-label="Upload clothing image"
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
    <div className="spinner"></div>
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
