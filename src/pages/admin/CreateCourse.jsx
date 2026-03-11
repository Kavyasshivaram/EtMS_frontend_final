import { useEffect, useState, useRef } from "react";
import api from "../../api/axiosConfig"; 

import "./CreateCourse.css";

const API_BASE = "/admin";

function CreateCourse() {
  const [courseName, setCourseName] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  
  // Used to reset the file input field physically
  const fileInputRef = useRef(null);

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
      const activeRes = await api.get(`${API_BASE}/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const inactiveRes = await api.get(`${API_BASE}/courses/inactive`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCourses(activeRes.data);
      setInactiveCourses(inactiveRes.data);
    } catch (err) {
      setError("Failed to load courses.");
    }
  };

  const resetForm = () => {
    setCourseName("");
    setDuration("");
    setDescription("");
    setFile(null);
    setEditingId(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the actual input
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!courseName || !duration || description.length < 10) {
      return setError("Please fill all fields correctly (Description min 10 chars).");
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("courseName", courseName);
      formData.append("duration", duration);
      formData.append("description", description);

      if (file) {
        formData.append("file", file);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      };

      if (editingId) {
        // Use 'api' instance instead of 'axios'
        await api.put(`${API_BASE}/courses/${editingId}`, formData, config);
        setMessage("Course updated successfully!");
      } else {
        // Use 'api' instance instead of 'axios'
        await api.post(`${API_BASE}/course`, formData, config);
        setMessage("Course created successfully!");
      }

      resetForm();
      fetchCourses();
      setTimeout(() => setMessage(""), 3000);

    } catch (err) {
      setError(
        err.response?.data?.message || err.response?.data || "Operation failed."
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
    // Note: We don't set the file here because you can't "pre-fill" an <input type="file" />
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Mark this course as inactive?")) return;
    try {
      await api.delete(`${API_BASE}/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("Course marked as Inactive.");
      fetchCourses();
    } catch (err) {
      setError("Failed to delete course.");
    }
  };

  const handleReactivate = async (id) => {
    try {
      await api.put(`${API_BASE}/courses/reactivate/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("Course reactivated successfully.");
      fetchCourses();
    } catch (err) {
      setError("Failed to reactivate course.");
    }
  };

  const displayedCourses = viewMode === "ACTIVE" ? courses : inactiveCourses;

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
            maxLength="500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter course description..."
          />
          <small>{description.length}/500 characters</small>
        </div>

        <div className="form-group">
          <label>Upload Syllabus (PDF / DOC / DOCX)</label>
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files[0])}
          />
          {editingId && <small style={{color: '#666'}}>Leave blank to keep existing file.</small>}
        </div>

        <button
          className="assign-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Saving..." : editingId ? "Update Course" : "Create Course"}
        </button>

        {editingId && (
          <button className="cancel-btn" onClick={resetForm} style={{ marginLeft: '10px' }}>
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
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <div key={course.id} className="course-block">
                <h4>{course.courseName}</h4>
                <p><strong>Duration:</strong> {course.duration}</p>
                <p>{course.description}</p>

                {course.syllabusFileName && (
                  <div className="syllabus-section">
                    <div className="syllabus-info">
                      <span className="syllabus-label">Syllabus:</span>
                      <span className="syllabus-name">{course.syllabusFileName}</span>
                    </div>
                    <button
                      className="download-btn"
                      onClick={() =>
                        window.open(
                          `${api.defaults.baseURL}${API_BASE}/courses/download/${course.id}`,
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
                      <button className="edit-icon" onClick={() => handleEdit(course)}>
                        ✏️
                      </button>
                      <button className="delete-icon" onClick={() => handleDelete(course.id)}>
                        🗑️
                      </button>
                    </>
                  )}
                  {viewMode === "INACTIVE" && (
                    <button className="reactivate-btn" onClick={() => handleReactivate(course.id)}>
                      🔄
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="no-data">No courses found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateCourse;