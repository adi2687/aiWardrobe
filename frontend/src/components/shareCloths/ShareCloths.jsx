import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./sharecloths.css"; // Import the CSS file
import { FaWhatsapp, FaTwitter, FaEnvelope } from "react-icons/fa"
const ShareCloths = () => {
  const { id } = useParams();

  const [sharecloth, setSharedCloth] = useState([]);
  const [username, setUsername] = useState("Users");
  const [imageUrl, setImageUrl] = useState("");
  const apiUrl = import.meta.env.VITE_BACKEND_URL
  const frontendUrl=import.meta.env.VITE_FRONTEND_URL
  // Fetch the username of the logged-in user
  useEffect(() => {
    fetch(`${apiUrl}/user/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setUsername(data.user.username);
      })
      .catch((error) => console.error(error));
  }, []);

  // Fetch shared clothes for the user based on 'id' and 'usernamemain'
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiUrl}/share/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });

        const data = await response.json();
        console.log("Shared clothes data:", data);
        if (data && data.share) {
          setSharedCloth(data.share[0].sharecloths);
          setUsername(data.share[0].username);
        } else {
          console.error("No shared clothes found");
        }
      } catch (error) {
        console.error("Error fetching shared clothes:", error);
      }
    };

    fetchData();
  }, [id]);

  // Generate the image using the sharecloth data
  const imageGenerate = async () => {
    if (!sharecloth || sharecloth.length === 0) return;

    const prompt = `
    Generate an image of a mannequin wearing all of the following outfits:

    ${sharecloth} 
    
    Each outfit should be clearly visible on the mannequin, and the mannequin should be standing in a neutral pose to showcase the different styles.
    `;

    try {
      const response = await fetch(
        `${apiUrl}/imagegenerate/generate-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ shareid: id, prompt: prompt }),
        }
      );

      const data = await response.json();

      if (data.image) {
        setImageUrl(data.image);
      }
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  // Run image generation when sharecloth data is fetched
  useEffect(() => {
    imageGenerate();
  }, [sharecloth]); // Trigger image generation when sharecloth is updated

  const [copyurl, setcopyurl] = useState(false);

  const CopyToClipboard = (id) => {
    const url = `${frontendUrl}/share/${id}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        // console.log("Link copied to clipboard:", url);
        setcopyurl(true);
        setTimeout(() => {
          setcopyurl(false);
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  const sharewithfriends = () => {
    const link = `${frontendUrl}/share/${id}`;

    // Example: open WhatsApp share
    const whatsappUrl = `https://wa.me/?text=Check%20out%20this%20outfit%20I%20shared%20with%20you!%20${encodeURIComponent(
      link
    )}`;

    // You can add other platforms similarly
    window.open(whatsappUrl, "_blank");
  };
const url=`${frontendUrl}/share/${id}`
const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="share-cloths-container">
      <h3>{username}'s Outfits</h3>
      <div className="share-cloths-list">{sharecloth}</div>

      <div className="imagecontainer">
        <h3>Outfits preview</h3>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Generated Outfit"
            className="w-full h-auto"
          />
        ) : (
          <p>Loading preview of the outfits...</p>
        )}
      </div>

      <button onClick={() => CopyToClipboard(id)} className="copybutton">
        {copyurl ? <p>Copied</p> : <p>Copy link</p>}
      </button>
      {/* <button onClick={sharewithfriends}>
        <p>Share to friends</p>
      </button> */}
      <div className="share-wrapper">
      <button
        className="share-button"
        onClick={() => setShowOptions((prev) => !prev)}
      >
        Share to Friends
      </button>

      {showOptions && (
        <div className="share-dropdown">
        <button className="share-btn whatsapp" style={{backgroundColor:"green",color:"white"}}
          onClick={() =>
            window.open(
              `https://wa.me/?text=${encodeURIComponent(`Check this out! ${url}`)}`,
              "_blank"
            )
          }
        >
          <FaWhatsapp className="icon" />
          WhatsApp
        </button>
      
        <button className="share-btn twitter" style={{backgroundColor:"#1DA1F2",color:"white"}}
          onClick={() =>
            window.open(
              `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Look at this outfit! ${url}`)}`,
              "_blank"
            )
          }
        >
          <FaTwitter className="icon" />
          Twitter
        </button>
      
        <button className="share-btn email" style={{backgroundColor:"#FF6F61",color:"white"}}
          onClick={() =>
            window.open(
              `mailto:?subject=Check this outfit&body=${encodeURIComponent(`Here’s the outfit link: ${url}`)}`
            )
          }
        >
          <FaEnvelope className="icon" />
          Email
        </button>
      </div>
      )}
    </div>
    </div>
  );
};

export default ShareCloths;
