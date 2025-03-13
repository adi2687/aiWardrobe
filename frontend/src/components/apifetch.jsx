import { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/user/profile", {
      method: "GET",
      credentials: "include", 
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setData(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);
  
  

  return (
    <div>
      


      {data ? (
        
        <div>
          <p>
        {data.message}
        </p>
        <h3>User details</h3>
        <p>{data.user.username}</p>
        <p>{data.user.email}</p>
        
          </div>
      ) : (
        <p>Loading...</p>
      )

    }
    </div>
  );
}

export default App;
