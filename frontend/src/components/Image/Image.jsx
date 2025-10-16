import React, { useState } from "react";
import { getAuthHeaders } from '../../utils/auth';

const Image = () => {
  const [imageUrl, setImageUrl] = useState("");
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  const imageGenerate = async () => {
    const prompt = `
    Generate an image of a mannequin wearing all of the following outfits:
    
    Option 1 (Casual Chic): A red shirt, red jeans, a gray hoodie, and brown boots.
    Option 2 (Smart Casual): A pink/red plaid shirt, brown pants, a brown jacket, and brown boots.
    Option 3 (Layered Warmth): A white shirt, a navy blue sweater, a gray jacket, a gray scarf, a gray beanie, and brown boots.
    
    Each outfit should be clearly visible on the mannequin, and the mannequin should be standing in a neutral pose to showcase the different styles.
    `;
    try {
      const response = await fetch(`${apiUrl}/getimage`, {
        method: "POST", 
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      console.log("Image data:", data);

      if (data.image) {
        setImageUrl(data.image);
      }
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={imageGenerate}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Generate Image
      </button>

      {/* Display the generated image */}
      {imageUrl && (
        <div className="mt-4">
          <img src={imageUrl} alt="Generated" className="w-full h-auto" />
        </div>
      )}
    </div>
  );
};

export default Image;
