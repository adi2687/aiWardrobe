import React, { useEffect, useState } from "react";
import "./Sellcloth.css";
import { useNavigate } from 'react-router-dom';

const Sellcloth = () => {
  const [imageFile, setImageFile] = useState(null);
  const [description, setDescription] = useState("");
  const [cloth, setCloth] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clothall, setClothall] = useState([]);
  const [clothuser, setClothuser] = useState([]);
  const [price, setPrice] = useState("");

  const navigate=useNavigate()

  const handlepricechange = (e) => {
    setPrice(e.target.value);
  };

  const fetchClothes = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/user/allClothesSell", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch clothes data");

      const data = await response.json();
      console.log("Clothes Data:", data);
      setCloth(data);
      setClothall(data.cloths);
      setClothuser(data.usercloth);
      console.log("clothall", data.cloths);
    } catch (error) {
      console.error("Error fetching clothes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClothes();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
    } else {
      alert("Please select a valid image file");
    }
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile || !description || !price) {
      alert("Please fill all the fields");
      return;
    }

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("description", description);
    formData.append("price", price);

    try {
      const response = await fetch("http://localhost:5000/user/sellcloth", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();
      console.log("Response Data:", data);

      if (response.ok) {
        alert("Cloth listed for sale successfully");
        setImageFile(null);
        setDescription("");
        setPrice("");
        fetchClothes(); // Refresh list after submission
      } else {
        alert(data.error || "Error listing clothes for sale");
      }
    } catch (error) {
      console.error("Error uploading the file:", error);
      alert("Error uploading the file");
    }
  };

  
  const messageuser=(username,id)=>{
    navigate(`/message/${username}/${id}`)
  }
  const sold=(clothid)=>{
    fetch(`http://localhost:5000/user/soldcloth/delete/${clothid}`,{
      method:"POST",
      credentials:"include",
      body:JSON.stringify({clothid:clothid})
    })
    .then(response=>response.json())
    .then(data=>{
      // console.log(data)
      if (data.message==="cloth deleted successfully"){
        fetchClothes()
      }
  })
    .catch(error=>console.error("Error:", error));

  }
  return (
    <div className="sellclothcontainer">
      <h1>Sell Your Clothes</h1>
      <form onSubmit={handleSubmit}>
          <input
            type="file"
            id="image-input"
            onChange={handleImageChange}
            accept="image/*"
          />
        <input
          type="text"
          value={description}
          onChange={handleDescriptionChange}
          placeholder="Describe your cloth"
        />
        <input
          type="number"
          value={price}
          onChange={handlepricechange}
          placeholder="Enter price"
        />
        <button type="submit" style={{color:"white",backgroundColor:"red"}}>Sell Clothes</button>
      </form>
      <h2>Your Clothes</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="sellclothlist">
          <ul>
            {clothuser.map((item, index) => (
              <li key={index}>
                <img
                  src={`http://localhost:5000/uploadscloths/${item.clothImage}`}
                  alt="Cloth"
                  width="100"
                />
                <p>{item.description}</p>
                <p>{item.username}</p>
                <p className="price">{item.price}</p>
                <button className="soldbutton" onClick={()=>sold(item._id)} style={{backgroundColor:"Red"}}>Sold?</button>
              </li>
            ))}
          </ul>
        </div>
      )} 
      <h2>Available Clothes</h2>
      <div className="allcloths">
      {loading ? (
        <p>Loading clothes...</p>
      ) : (
        <ul>
          {clothall.length > 0 ? (
            clothall.map((item, index) => (
              <li key={index}>
                <img
                  src={`http://localhost:5000/uploadscloths/${item.clothImage}`}
                  alt="Cloth"
                  width="100"
                />
                <p><h4>Product description:</h4>
                  {item.description}
                </p>
                <p>
                  <h4>Product seller</h4>
                  {item.username}</p>
                <p className="pricecloth">
                  <h4>Product price</h4>
                  ₹ {item.price}</p>
                <button onClick={()=>messageuser(item.username,item._id)}>Message {item.username}</button>
              </li>
            ))
          ) : (
            <p>No clothes available for sale</p>
          )}
        </ul>
      )}
      </div>
    </div>
  );
};

export default Sellcloth;
