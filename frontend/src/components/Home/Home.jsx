import "./Home.css";

export default function FindYourVibe() {
  return (
    <div className="container">
      <h1 className="title">
        FIND <br /> YOUR <br /> VIBE
      </h1>
      <p className="subtitle">
        Check out our Captivating Cities shirt collection
      </p>
      <button className="explore-button">
        EXPLORE HERE
      </button>
      <img
        src="/your-shirt-image.png"
        alt="T-Shirt"
        className="shirt-image"
      />
    </div>
  );
}