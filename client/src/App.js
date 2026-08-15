import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "https://task-management-app-iy8z.vercel.app";

function App() {
  const [page, setPage] = useState("register");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);

  // REGISTER
  const register = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful! Now login.");
        setPage("login");
        setPassword("");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error(error);
      alert("Cannot connect to server");
    }
  };

  // LOGIN
  const login = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);

        setLoggedIn(true);
        alert("Login successful!");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error(error);
      alert("Cannot connect to server");
    }
  };

  // GET TASKS
  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const response = await fetch(`${API_URL}/api/tasks`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setTasks(data);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    if (loggedIn) {
      fetchTasks();
    }
  }, [loggedIn]);

  // ADD / UPDATE TASK
  const saveTask = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a task title");
      return;
    }

    const token = localStorage.getItem("token");

    const taskData = {
      title,
      description,
      status: "pending",
    };

    try {
      let url = `${API_URL}/api/tasks`;

      if (editingId) {
        url = `${API_URL}/api/tasks/${editingId}`;
      }

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(taskData),
      });

      const data = await response.json();

      if (response.ok) {
        setTitle("");
        setDescription("");
        setEditingId(null);
        fetchTasks();
      } else {
        alert(data.message || "Failed to save task");
      }
    } catch (error) {
      console.error(error);
      alert("Cannot connect to server");
    }
  };

  // EDIT TASK
  const editTask = (task) => {
    setEditingId(task._id);
    setTitle(task.title);
    setDescription(task.description || "");
  };

  // DELETE TASK
  const deleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();

      if (response.ok) {
        fetchTasks();
      } else {
        alert(data.message || "Failed to delete task");
      }
    } catch (error) {
      console.error(error);
      alert("Cannot connect to server");
    }
  };

  // CHANGE STATUS
  const changeStatus = async (task) => {
    const nextStatus = {
      pending: "in-progress",
      "in-progress": "completed",
      completed: "pending",
    };

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/tasks/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          status: nextStatus[task.status],
        }),
      });

      if (response.ok) {
        fetchTasks();
      } else {
        const data = await response.json();
        alert(data.message || "Failed to change status");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");

    setLoggedIn(false);
    setTasks([]);
    setTitle("");
    setDescription("");
    setEditingId(null);
    setEmail("");
    setPassword("");
    setPage("login");
  };

  // TASK PAGE
  if (loggedIn) {
    return (
      <div
        style={{
          maxWidth: "700px",
          margin: "40px auto",
          padding: "20px",
          fontFamily: "Arial",
        }}
      >
        <h1>Task Management App</h1>

        <button onClick={logout}>Logout</button>

        <hr />

        <form onSubmit={saveTask}>
          <h2>{editingId ? "Edit Task" : "Add Task"}</h2>

          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              marginBottom: "10px",
              padding: "10px",
            }}
          />

          <textarea
            placeholder="Task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              marginBottom: "10px",
              padding: "10px",
            }}
          />

          <button type="submit">
            {editingId ? "Update Task" : "Add Task"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setTitle("");
                setDescription("");
              }}
              style={{ marginLeft: "10px" }}
            >
              Cancel
            </button>
          )}
        </form>

        <hr />

        <h2>My Tasks</h2>

        {tasks.length === 0 ? (
          <p>No tasks available.</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                marginBottom: "15px",
              }}
            >
              <h3>{task.title}</h3>

              <p>{task.description}</p>

              <p>
                <strong>Status:</strong> {task.status}
              </p>

              <button onClick={() => editTask(task)}>
                Edit
              </button>

              <button
                onClick={() => changeStatus(task)}
                style={{ marginLeft: "10px" }}
              >
                Change Status
              </button>

              <button
                onClick={() => deleteTask(task._id)}
                style={{ marginLeft: "10px" }}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    );
  }

  // LOGIN / REGISTER PAGE
  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "50px auto",
        padding: "30px",
        fontFamily: "Arial",
      }}
    >
      <h1>Task Management App</h1>

      {page === "register" ? (
        <form onSubmit={register}>
          <h2>Register</h2>

          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              marginBottom: "10px",
              padding: "10px",
            }}
          />

          <input
            type="email"
            placeholder="Gmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              marginBottom: "10px",
              padding: "10px",
            }}
          />

          <input
            type="password"
            placeholder="Create password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              marginBottom: "10px",
              padding: "10px",
            }}
          />

          <button type="submit">Register</button>

          <p>
            Already registered?{" "}
            <button
              type="button"
              onClick={() => setPage("login")}
            >
              Login
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={login}>
          <h2>Login</h2>

          <input
            type="email"
            placeholder="Gmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              marginBottom: "10px",
              padding: "10px",
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              marginBottom: "10px",
              padding: "10px",
            }}
          />

          <button type="submit">Login</button>

          <p>
            New user?{" "}
            <button
              type="button"
              onClick={() => setPage("register")}
            >
              Register
            </button>
          </p>
        </form>
      )}
    </div>
  );
}

export default App;