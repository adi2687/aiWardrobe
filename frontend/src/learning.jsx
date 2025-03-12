import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
function Greeting(props) {
  return (
    <h2>
      Hello, {props.firstname} {props.lastn}
    </h2>
  );
}
function Counter() {
  const [count, setC] = useState(0);
  return (
    <div>
      <h2>Count : {count}</h2>
      <button onClick={() => setC(count + 1)}>Increment</button>
      <button onClick={() => setC(count - 1)}>Decrement</button>
    </div>
  );
}

function App() {
  const name = "aditya";
  return (
    <div>
      <Greeting firstname="aditya" lastn="kurani" />
    </div>
  );
}

function FormExample() {
  const [name, setName] = useState("");

  return (
    <div>
      <input
        type="text"
        placeholder="enter the name "
        onChange={(e) => setName(e.target.value)}
      ></input>
      <p>Name:{name}</p>
    </div>
  );
}

function Toggle() {
  const [isvisible, setis] = useState(true);
  return (
    <div>
      {isvisible && <p>Hello this is a toggle text</p>}
      <button onClick={() => setis(!isvisible)}>
        {isvisible ? "hide" : "sho"}
      </button>
    </div>
  );
}

function loginform() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("email", email, "password", password);
  };
  return (
    <div>
      <form action="" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="enter tur emauk"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">login</button>
      </form>
    </div>
  );
}

function random() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetch("https://randomuser.me/api/")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setUser(data.results[0]);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div>
      {user ? (
        <div>
          <h3>
            {user.name.first} {user.name.last}
          </h3>
          <img src={user.picture.large} alt="User" />
        </div>
      ) : (
        <p>Uploading</p>
      )}
    </div>
  );
}

function UserCard(props) {
  return (
    <div>
      <h2>{props.name}</h2>
      <h2>{props.age}</h2>
    </div>
  );
}

function user() {
  return <UserCard name="aditya kurani" age="21" />;
}

function Home() {
  return <h2>home page</h2>;
}

function About() {
  return <h2>about page </h2>;
}

function myroute() {
  return (
    <Router>
      <nav>
        <Link to="/">Home</Link> | <Link to="/about">About</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

function Userlist() {
  const users = ["alice", "adtya", "di"];
  return (
    <div>
      <ul>
        {users.map((user) => (
          <li>{user}</li>
        ))}
      </ul>
    </div>
  );
}

function todoapp()
{
  const [tasks,setTasks]=useState([])
  const [newTask, setNewTask] = useState("");

  const addTask=(e)=>{
    e.preventDefault()
    if (!newTask) return

    setTasks([...tasks,newTask])
    setNewTask("")
  }
  
  
  const deletetasks =(e)=>{
    setTasks(tasks.filter((_,i)=>i!==e))
  }
  
  const editTask = (index, updatedTask) => {
    setTasks(tasks.map((task, i) => (i === index ? updatedTask : task)));
  };
  

  return(
    <div>
      <h1>To do list</h1>
      <form action="" onSubmit={addTask}>
      <input type="text" placeholder="add task" value={newTask} onChange={(e)=>{
        setNewTask(e.target.value)
      }}/>
      <button type="submit">Add task</button>
      </form>
      <ul>
        {tasks.map((task,index)=>(
          <div>
          <li key={index}>{task} <button onClick={()=>deletetasks(index)}>delete </button></li>
          <li key={index}>{task} <button onClick={()=>editTask(index,prompt("new task", task))} > Edit </button></li>
          </div>
        ))}
      </ul>
    </div>
  )
}
export default todoapp;
