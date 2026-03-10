import { useState } from "react";
import "./TrainerMaterials.css";

function TrainerMaterials() {
  const [selectedCourse, setSelectedCourse] = useState("Java Full Stack");

  /* ================= MATERIAL STATE ================= */
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialFile, setMaterialFile] = useState(null);
  const [materials, setMaterials] = useState([]);

  /* ================= TASK STATE ================= */
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedStudent, setAssignedStudent] = useState("");
  const [tasks, setTasks] = useState([]);

  const students = ["Rahul", "Anjali", "Kiran", "Sneha", "Arjun"];

  /* ================= ADD MATERIAL ================= */
  const handleAddMaterial = () => {
    if (!materialTitle || !materialFile) {
      alert("Please enter title and upload file");
      return;
    }

    const newMaterial = {
      id: Date.now(),
      course: selectedCourse,
      title: materialTitle,
      fileName: materialFile.name,
      date: new Date().toLocaleDateString(),
    };

    setMaterials([...materials, newMaterial]);
    setMaterialTitle("");
    setMaterialFile(null);
  };

  /* ================= ADD TASK ================= */
  const handleAddTask = () => {
    if (!taskTitle || !assignedStudent || !dueDate) {
      alert("Please fill required fields");
      return;
    }

    const newTask = {
      id: Date.now(),
      course: selectedCourse,
      title: taskTitle,
      description: taskDesc,
      dueDate,
      student: assignedStudent,
      status: "Pending",
    };

    setTasks([...tasks, newTask]);
    setTaskTitle("");
    setTaskDesc("");
    setDueDate("");
    setAssignedStudent("");
  };

  const markCompleted = (id) => {
    const updated = tasks.map((task) =>
      task.id === id ? { ...task, status: "Completed" } : task
    );
    setTasks(updated);
  };

  const deleteItem = (id, type) => {
    if (type === "material") {
      setMaterials(materials.filter((m) => m.id !== id));
    } else {
      setTasks(tasks.filter((t) => t.id !== id));
    }
  };

  return (
    <div className="trainer-materials-container">
      <h2 className="page-title">📂 Study Materials & Daily Tasks</h2>

      {/* Course Selector */}
      <div className="course-selector">
        <label>Select Course:</label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option>Java Full Stack</option>
          <option>React Development</option>
          <option>Spring Boot</option>
        </select>
      </div>

      {/* ================= MATERIAL SECTION ================= */}
      <div className="card">
        <h3>📘 Upload Study Material</h3>

        <input
          type="text"
          placeholder="Material Title"
          value={materialTitle}
          onChange={(e) => setMaterialTitle(e.target.value)}
        />

        <input
          type="file"
          onChange={(e) => setMaterialFile(e.target.files[0])}
        />

        <button className="primary-btn" onClick={handleAddMaterial}>
          Upload Material
        </button>

        <div className="list">
          {materials
            .filter((m) => m.course === selectedCourse)
            .map((m) => (
              <div key={m.id} className="list-item">
                <div>
                  <strong>{m.title}</strong>
                  <p>{m.fileName}</p>
                  <span>{m.date}</span>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => deleteItem(m.id, "material")}
                >
                  ❌
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* ================= TASK SECTION ================= */}
      <div className="card">
        <h3>📝 Assign Daily Task</h3>

        <input
          type="text"
          placeholder="Task Title"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
        />

        <textarea
          placeholder="Task Description"
          value={taskDesc}
          onChange={(e) => setTaskDesc(e.target.value)}
        />

        <div className="task-row">
          <select
            value={assignedStudent}
            onChange={(e) => setAssignedStudent(e.target.value)}
          >
            <option value="">Assign To Student</option>
            {students.map((s, index) => (
              <option key={index}>{s}</option>
            ))}
          </select>

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <button className="primary-btn" onClick={handleAddTask}>
          Assign Task
        </button>

        <div className="list">
          {tasks
            .filter((t) => t.course === selectedCourse)
            .map((t) => (
              <div key={t.id} className="list-item">
                <div>
                  <strong>{t.title}</strong>
                  <p>
                    Student: {t.student} | Due: {t.dueDate}
                  </p>
                  <span
                    className={
                      t.status === "Completed"
                        ? "status completed"
                        : "status pending"
                    }
                  >
                    {t.status}
                  </span>
                </div>

                <div className="action-buttons">
                  {t.status !== "Completed" && (
                    <button
                      className="complete-btn"
                      onClick={() => markCompleted(t.id)}
                    >
                      ✔ Complete
                    </button>
                  )}

                  <button
                    className="delete-btn"
                    onClick={() => deleteItem(t.id, "task")}
                  >
                    ❌
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default TrainerMaterials;