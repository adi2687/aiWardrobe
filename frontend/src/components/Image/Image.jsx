import React from "react";

const Image = () => {
  const imageGenerate = async () => {
    try {
      const response = await fetch("http://localhost:5000/getimage", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();
      console.log("Image data:", data); // Or display it in state
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
    </div>
  );
};

export default Image;
