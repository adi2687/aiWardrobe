import { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/user/profile", {
      method: "GET",
      credentials: "include", 
    })
      .then((response) => {
        console.log("Raw Response:", response);
        return response.json();
      })
      .then((data) => {
        console.log("Received Data:", data);
        setData(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);
  
  

  return (
    <div>
      {/* <h1>React + Node.js Connection</h1> */}
      {/* {data ? (
        <div>
          <p>
            <strong>Message:</strong> {data.message}
          </p>
          {data.user && (
            <div>
              <p>
                <strong>Username:</strong> {data.user.username}
              </p>
              <p>
                <strong>Email:</strong> {data.user.email}
              </p>
            </div>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )} */}


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
