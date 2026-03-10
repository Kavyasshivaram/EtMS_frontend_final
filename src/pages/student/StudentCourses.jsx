import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  FaBook, FaDownload, FaCalendarAlt, FaClock, 
  FaLink, FaUserGraduate, FaExclamationCircle 
} from "react-icons/fa";
import "./StudentCourses.css";

const API_BASE = "http://localhost:8080/api/student";

function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      // This endpoint should perform the JOIN between student_course, course_master, and batches
      const res = await axios.get(`${API_BASE}/my-courses`, {
  headers: { Authorization: `Bearer ${token}` },
  withCredentials: true
});
      setCourses(res.data);
    } catch (err) {
      setError("Unable to load your curriculum. Please check your connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="loader-container">
      <div className="custom-loader"></div>
      <p>Loading your learning journey...</p>
    </div>
  );

  return (
    <div className="student-container">
      <header className="student-header">
        <div className="welcome-section">
          <h1>Welcome, {user?.name || "Student"}!</h1>
          <p>Track your enrolled courses and upcoming batch schedules.</p>
        </div>
        <div className="student-stats">
          <div className="stat-card">
            <span className="stat-value">{courses.length}</span>
            <span className="stat-label">Active Courses</span>
          </div>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <FaExclamationCircle /> {error}
        </div>
      )}

      <div className="course-grid">
        {courses.length > 0 ? (
          courses.map((course) => (
            <div key={course.id} className="course-card-modern">
              <div className="card-accent"></div>
              
              <div className="card-main-content">
                <div className="course-type-tag">{course.duration}</div>
                <h2 className="course-title">{course.courseName}</h2>
                <p className="course-desc">{course.description}</p>

                <div className="batch-status-box">
                  <div className="batch-header">
                    <FaUserGraduate className="icon" />
                    <span>Assigned Batch: <strong>{course.batchName || "Allocation Pending"}</strong></span>
                  </div>
                  {course.batchStatus && (
                    <span className={`status-pill ${course.batchStatus.toLowerCase()}`}>
                      {course.batchStatus}
                    </span>
                  )}
                </div>

                {/* Next Scheduled Class (from scheduled_classes table) */}
                <div className="schedule-preview">
                   <div className="schedule-row">
                      <FaCalendarAlt className="icon" />
                      <span>Next Class: {course.nextClassDate || "Not scheduled"}</span>
                   </div>
                   <div className="schedule-row">
                      <FaClock className="icon" />
                      <span>Time: {course.startTime || "--:--"} - {course.endTime || "--:--"}</span>
                   </div>
                </div>
              </div>

              <div className="card-actions-row">
                {course.syllabusFileName && (
                  <button 
                    className="action-btn outline"
                    onClick={() => window.open(`http://localhost:8080/api/student/courses/download/${course.id}`, "_blank")}
                  >
                    <FaDownload /> Syllabus
                  </button>
                )}
                <button className="action-btn primary">
                  <FaLink /> Enter Classroom
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-enrollment">
            <FaBook className="empty-icon" />
            <h3>No Enrollments Found</h3>
            <p>You haven't been assigned to any courses yet. Contact administration for access.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentCourses;