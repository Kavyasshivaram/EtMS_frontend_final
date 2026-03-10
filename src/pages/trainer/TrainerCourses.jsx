import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  FaBell, FaSearch, FaUser, FaCog, FaSignOutAlt, 
  FaBookOpen, FaLayerGroup, FaGraduationCap, FaChevronRight,
  FaFileExport, FaInbox, FaUsers
} from "react-icons/fa";
import "./TrainerCourses.css";

function TrainerCourses() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const trainerId = user?.id;

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState({ courses: true, batches: false, students: false });

  useEffect(() => {
    if (trainerId) fetchCourses();
  }, [trainerId]);

  const fetchCourses = async () => {
    setLoading(prev => ({ ...prev, courses: true }));
    try {
      const res = await axios.get(`http://localhost:8080/api/teacher/courses/${trainerId}`);
      setCourses(res.data);
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(prev => ({ ...prev, courses: false }));
    }
  };

  const handleCourseClick = async (course) => {
    setSelectedCourse(course);
    setSelectedBatch(null); // Reset lower levels
    setStudents([]);
    setLoading(prev => ({ ...prev, batches: true }));
    try {
      const res = await axios.get(`http://localhost:8080/api/teacher/courses/${trainerId}/${course.courseId}/batches`);
      setBatches(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, batches: false }));
    }
  };

  const handleBatchClick = async (batch) => {
    setSelectedBatch(batch);
    setLoading(prev => ({ ...prev, students: true }));
    try {
      const res = await axios.get(`http://localhost:8080/api/teacher/batches/${batch.batchId}/students`);
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, students: false }));
    }
  };

  return (
    <div className="trainer-app-container">
      

      <main className="dashboard-content">
       

        {/* STEP 1: COURSE SELECTION */}
        <section className="section-block">
          
          <div className="card-grid">
            {courses.map(course => (
              <div 
                key={course.courseId} 
                className={`selection-card course-card ${selectedCourse?.courseId === course.courseId ? 'selected' : ''}`}
                onClick={() => handleCourseClick(course)}
              >
                <div className="card-icon"><FaBookOpen /></div>
                <div className="card-details">
                  <h3>{course.courseName}</h3>
                  <p>{course.totalBatches || 0} Batches Assigned</p>
                </div>
                <FaChevronRight className="go-icon" />
              </div>
            ))}
          </div>
        </section>

        {/* STEP 2: BATCH SELECTION (Appears only after Course is selected) */}
        {selectedCourse && (
          <section className="section-block anim-fade-in">
            <h2 className="section-title">Select Batch for {selectedCourse.courseName}</h2>
            <div className="card-grid">
              {batches.length > 0 ? batches.map(batch => (
                <div 
                  key={batch.batchId} 
                  className={`selection-card batch-card ${selectedBatch?.batchId === batch.batchId ? 'selected' : ''}`}
                  onClick={() => handleBatchClick(batch)}
                >
                  <div className="card-icon"><FaLayerGroup /></div>
                  <div className="card-details">
                    <h3>{batch.batchName}</h3>
                    <span className={`status ${batch.status?.toLowerCase()}`}>{batch.status}</span>
                  </div>
                  <FaChevronRight className="go-icon" />
                </div>
              )) : <div className="no-data-msg">No batches found for this course.</div>}
            </div>
          </section>
        )}

        {/* STEP 3: STUDENT LIST (Appears only after Batch is selected) */}
        {selectedBatch && (
          <section className="section-block anim-fade-in">
            <div className="section-header-flex">
              <h2 className="section-title"><FaUsers /> Enrolled Students ({students.length})</h2>
              <div className="nav-center">
          <div className="nav-search">
            <FaSearch className="s-icon" />
            <input type="text" placeholder="Search for courses or students..." />
          </div>
        </div>
              
            </div>
            <div className="data-table-container">
              {loading.students ? <div className="loader">Loading Students...</div> : 
                students.length > 0 ? (
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email Address</th>
                      <th>Phone Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => (
                      <tr key={s.id}>
                        <td>
                          <div className="name-cell">
                            <div className="initial-avatar">{s.name.charAt(0)}</div>
                            {s.name}
                          </div>
                        </td>
                        <td>{s.email}</td>
                        <td>{s.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <FaInbox size={40} />
                  <p>No students enrolled in this batch yet.</p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default TrainerCourses;