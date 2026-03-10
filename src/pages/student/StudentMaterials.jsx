import { useState, useRef } from "react";
import "./StudentMaterials.css";

function StudentMaterials() {
  const fileInputRef = useRef(null);

  const [filter, setFilter] = useState("All");

  const [notifications] = useState([
    "📢 New task assigned: Build REST API",
    "⭐ React Task graded: 85/100",
  ]);

  const [chatMessages, setChatMessages] = useState([
    { sender: "trainer", text: "Please submit assignment before due date." },
  ]);

  const [newMessage, setNewMessage] = useState("");

  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Build REST API",
      description: "Create CRUD APIs using Spring Boot",
      dueDate: "2026-02-25",
      status: "Pending",
      file: null,
      grade: null,
      feedback: "",
    },
    {
      id: 2,
      title: "React Form Validation",
      description: "Create login form with validation",
      dueDate: "2026-02-28",
      status: "Completed",
      file: "react-task.zip",
      grade: 85,
      feedback: "Good validation logic. Improve UI spacing.",
    },
  ]);

  /* ================= COUNTDOWN ================= */
  const getDaysLeft = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diff = due - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  /* ================= FILE UPLOAD ================= */
  const updateTaskFile = (taskId, fileName) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId
        ? { ...task, file: fileName, status: "Submitted" }
        : task
    );
    setTasks(updatedTasks);
  };

  const handleDrop = (e, taskId) => {
    e.preventDefault();
    const uploadedFile = e.dataTransfer.files[0];
    if (uploadedFile) {
      updateTaskFile(taskId, uploadedFile.name);
    }
  };

  const handleFileSelect = (e, taskId) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      updateTaskFile(taskId, uploadedFile.name);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  /* ================= MARK COMPLETE ================= */
  const markCompleted = (taskId) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, status: "Completed" } : task
    );
    setTasks(updatedTasks);
  };

  /* ================= FILTER ================= */
  const filteredTasks =
    filter === "All"
      ? tasks
      : tasks.filter((task) => task.status === filter);

  /* ================= PROGRESS ================= */
  const completedCount = tasks.filter(
    (task) => task.status === "Completed"
  ).length;
  const progress = Math.round((completedCount / tasks.length) * 100);

  /* ================= CHAT ================= */
  const sendMessage = () => {
    if (!newMessage.trim()) return;

    setChatMessages([
      ...chatMessages,
      { sender: "student", text: newMessage },
    ]);
    setNewMessage("");
  };

  return (
    <div className="module-container">
      <h2>📚 My Study Dashboard</h2>

      {/* Notifications */}
      <div className="notification-box">
        <h4>🔔 Notifications</h4>
        {notifications.map((note, index) => (
          <p key={index}>{note}</p>
        ))}
      </div>

      {/* Progress */}
      <div className="progress-section">
        <h4>📊 Task Progress</h4>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p>{progress}% Completed</p>
      </div>

      {/* Filter */}
      <div className="filter-section">
        {["All", "Pending", "Submitted", "Completed"].map((status) => (
          <button key={status} onClick={() => setFilter(status)}>
            {status}
          </button>
        ))}
      </div>

      {/* Tasks */}
      {filteredTasks.map((task) => (
        <div key={task.id} className="task-card">
          <div className="task-header">
            <h3>{task.title}</h3>
            <span className={`status ${task.status.toLowerCase()}`}>
              {task.status}
            </span>
          </div>

          <p>{task.description}</p>

          <p className="countdown">
            ⏳ {getDaysLeft(task.dueDate)} days left
          </p>

          {/* Drag + Click Upload */}
          {task.status === "Pending" && (
            <div
              className="drop-zone"
              onDrop={(e) => handleDrop(e, task.id)}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current.click()}
            >
              📁 Drag & Drop OR Click to Upload
              <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={(e) => handleFileSelect(e, task.id)}
              />
            </div>
          )}

          {task.file && <p className="file-name">📎 {task.file}</p>}

          {task.status === "Submitted" && (
            <button
              className="complete-btn"
              onClick={() => markCompleted(task.id)}
            >
              ✔ Mark Completed
            </button>
          )}

          {task.grade && (
            <div className="grade-box">
              <p>⭐ Grade: {task.grade}/100</p>
              <p>💬 Feedback: {task.feedback}</p>
            </div>
          )}
        </div>
      ))}

      {/* ================= LIVE CHAT ================= */}
      <div className="chat-box">
        <h3>💬 Live Chat with Trainer</h3>

        <div className="chat-messages">
          {chatMessages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${msg.sender}`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        <div className="chat-input">
          <input
            type="text"
            placeholder="Type message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default StudentMaterials;