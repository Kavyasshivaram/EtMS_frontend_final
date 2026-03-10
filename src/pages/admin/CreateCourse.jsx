import { useEffect, useState } from "react";
import axios from "axios";
import "./CreateCourse.css";

const API_BASE = "http://localhost:8080/api/admin";

function CreateCourse() {

  const [courseName, setCourseName] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null); // ✅ NEW

  const [courses, setCourses] = useState([]);
  const [inactiveCourses, setInactiveCourses] = useState([]);
  const [viewMode, setViewMode] = useState("ACTIVE");

  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const activeRes = await axios.get(`${API_BASE}/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const inactiveRes = await axios.get(`${API_BASE}/courses/inactive`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCourses(activeRes.data);
      setInactiveCourses(inactiveRes.data);
    } catch {
      setError("Failed to load courses.");
    }
  };

  const resetForm = () => {
    setCourseName("");
    setDuration("");
    setDescription("");
    setFile(null); // ✅ reset file
    setEditingId(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!courseName || !duration || description.length < 10) {
      return setError("Please fill all fields correctly.");
    }

    try {
      setLoading(true);

      // ✅ Use FormData instead of JSON
      const formData = new FormData();
      formData.append("courseName", courseName);
      formData.append("duration", duration);
      formData.append("description", description);

      if (file) {
        formData.append("file", file);
      }

      if (editingId) {
        await axios.put(`${API_BASE}/courses/${editingId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });
        setMessage("Course updated successfully!");
      } else {
        await axios.post(`${API_BASE}/course`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });
        setMessage("Course created successfully!");
      }

      resetForm();
      fetchCourses();
      setTimeout(() => setMessage(""), 3000);

    } catch (err) {
      setError(
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message || "Operation failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setEditingId(course.id);
    setCourseName(course.courseName);
    setDuration(course.duration);
    setDescription(course.description);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Mark this course as inactive?")) return;
    try {
      await axios.delete(`${API_BASE}/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("Course marked as Inactive.");
      fetchCourses();
    } catch {
      setError("Failed to delete course.");
    }
  };

  const handleReactivate = async (id) => {
    try {
      await axios.put(`${API_BASE}/courses/reactivate/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("Course reactivated successfully.");
      fetchCourses();
    } catch {
      setError("Failed to reactivate course.");
    }
  };

  const displayedCourses =
    viewMode === "ACTIVE" ? courses : inactiveCourses;

  const filteredCourses = displayedCourses.filter((course) =>
    course.courseName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="assign-layout">

      {/* LEFT FORM */}
      <div className="assign-form">
        <h2>{editingId ? "Edit Course" : "Create New Course"}</h2>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label>Course Name</label>
          <input
            type="text"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="Enter course name"
          />
        </div>

        <div className="form-group">
          <label>Duration</label>
          <select value={duration} onChange={(e) => setDuration(e.target.value)}>
            <option value="">-- Select Duration --</option>
            <option>1 Month</option>
            <option>3 Months</option>
            <option>6 Months</option>
            <option>1 Year</option>
          </select>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            rows="5"
            maxLength="500"   // ✅ Increased to 500
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter course description..."
          />
          <small>{description.length}/500 characters</small>
        </div>

        {/* ✅ NEW FILE UPLOAD */}
        <div className="form-group">
          <label>Upload Syllabus (PDF / DOC / DOCX)</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        <button
          className="assign-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : editingId
            ? "Update Course"
            : "Create Course"}
        </button>

        {editingId && (
          <button className="cancel-btn" onClick={resetForm}>
            Cancel
          </button>
        )}
      </div>

      {/* RIGHT LIST */}
      <div className="assign-list">

        <div className="list-header">
          <h3>Course Management</h3>

          <div className="toggle-buttons">
            <button
              className={viewMode === "ACTIVE" ? "active-tab" : ""}
              onClick={() => setViewMode("ACTIVE")}
            >
              Active
            </button>
            <button
              className={viewMode === "INACTIVE" ? "active-tab" : ""}
              onClick={() => setViewMode("INACTIVE")}
            >
              Inactive
            </button>
          </div>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="scroll-area">
          {filteredCourses.map((course) => (
            <div key={course.id} className="course-block">
              <h4>{course.courseName}</h4>
              <p><strong>Duration:</strong> {course.duration}</p>
              <p>{course.description}</p>

              {course.syllabusFileName && (
  <div className="syllabus-section">
    <div className="syllabus-info">
      <span className="syllabus-label">Syllabus:</span>
      <span className="syllabus-name">
        {course.syllabusFileName}
      </span>
    </div>

    <button
      className="download-btn"
      onClick={() =>
        window.open(
          `${API_BASE}/courses/download/${course.id}`,
          "_blank"
        )
      }
    >
      ⬇ Download
    </button>
  </div>
)}

              <div className="action-icons">
                {viewMode === "ACTIVE" && (
                  <>
                    <button
                      className="edit-icon"
                      onClick={() => handleEdit(course)}
                    >
                      ✏️
                    </button>
                    <button
                      className="delete-icon"
                      onClick={() => handleDelete(course.id)}
                    >
                      🗑️
                    </button>
                  </>
                )}

                {viewMode === "INACTIVE" && (
                  <button
                    className="reactivate-btn"
                    onClick={() => handleReactivate(course.id)}
                  >
                    🔄
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default CreateCourse;