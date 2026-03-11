import React, { useEffect, useState, useMemo } from "react";
import api from "../../api/axiosConfig";
import { 
  FaBook, FaLayerGroup, FaUsers, FaSearch, 
  FaGraduationCap, FaEnvelope, FaPhoneAlt, FaChevronDown, FaInbox,
  FaChartLine, FaChevronLeft, FaChevronRight
} from "react-icons/fa";
import "./TrainerCourses.css";

function TrainerCourses() {
  const user = JSON.parse(localStorage.getItem("user"));
  const trainerId = user?.id;

  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 8;

  useEffect(() => {
    if (trainerId) loadInitialData();
  }, [trainerId]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/teacher/courses/${trainerId}`);
      setCourses(res.data);
    } catch (err) {
      console.error("Failed to load courses", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = async (courseId) => {
    const course = courses.find(c => c.courseId === parseInt(courseId));
    setSelectedCourse(course);
    setSelectedBatch(null);
    setStudents([]);
    setCurrentPage(1);
    
    if (course) {
      setLoading(true);
      try {
        const res = await api.get(`/teacher/courses/${trainerId}/${course.courseId}/batches`);
        setBatches(res.data);
      } catch (err) {
        console.error("Failed to load batches", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBatchChange = async (batchId) => {
    const batch = batches.find(b => b.batchId === parseInt(batchId));
    setSelectedBatch(batch);
    setCurrentPage(1);
    
    if (batch) {
      setLoading(true);
      try {
        const res = await api.get(`/teacher/batches/${batch.batchId}/students`);
        setStudents(res.data);
      } catch (err) {
        console.error("Failed to load students", err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Memoized Stats
  const globalStats = useMemo(() => {
    return {
      courseCount: courses.length,
      batchCount: courses.reduce((acc, curr) => acc + (curr.totalBatches || 0), 0),
      currentBatchStudents: students.length
    };
  }, [courses, students]);

  // Filter and Paginate Logic
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudentsPage = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="trainer-container">
      <header className="trainer-top-nav">
      

        <div className="selection-controls">
          <div className="dropdown-wrapper">
            <label><FaBook /> Course</label>
            <div className="select-custom">
              <select 
                value={selectedCourse?.courseId || ""} 
                onChange={(e) => handleCourseChange(e.target.value)}
              >
                <option value="" disabled>Select a Course</option>
                {courses.map(c => (
                  <option key={c.courseId} value={c.courseId}>{c.courseName}</option>
                ))}
              </select>
              <FaChevronDown className="select-arrow" />
            </div>
          </div>

          <div className={`dropdown-wrapper ${!selectedCourse ? 'is-disabled' : ''}`}>
            <label><FaLayerGroup /> Batch</label>
            <div className="select-custom">
              <select 
                value={selectedBatch?.batchId || ""} 
                onChange={(e) => handleBatchChange(e.target.value)}
                disabled={!selectedCourse}
              >
                <option value="" disabled>Select a Batch</option>
                {batches.map(b => (
                  <option key={b.batchId} value={b.batchId}>{b.batchName}</option>
                ))}
              </select>
              <FaChevronDown className="select-arrow" />
            </div>
          </div>
        </div>

        <div className="nav-search">
          <FaSearch />
          <input 
            type="text" 
            placeholder="Search students..." 
            value={searchTerm}
            onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
            }}
            disabled={!selectedBatch}
          />
        </div>
      </header>

      <section className="stats-strip">
        <div className="stat-card">
          <div className="stat-icon course-bg"><FaBook /></div>
          <div className="stat-info">
            <span className="stat-value">{globalStats.courseCount}</span>
            <span className="stat-label">Assigned Courses</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon batch-bg"><FaLayerGroup /></div>
          <div className="stat-info">
            <span className="stat-value">{globalStats.batchCount}</span>
            <span className="stat-label">Total Batches</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon student-bg"><FaUsers /></div>
          <div className="stat-info">
            <span className="stat-value">{globalStats.currentBatchStudents}</span>
            <span className="stat-label">Students in Batch</span>
          </div>
        </div>
      </section>

      <main className="trainer-content">
        {loading ? (
          <div className="loading-overlay">
            <div className="loader-spinner"></div>
            <p>Processing request...</p>
          </div>
        ) : !selectedCourse ? (
          <div className="empty-state-hero">
            <div className="hero-illustration"><FaChartLine /></div>
            <h2>Dashboard Overview</h2>
            <p>Select a course from the dropdown to manage your educational workspace.</p>
          </div>
        ) : !selectedBatch ? (
          <div className="empty-state-hero">
            <FaLayerGroup size={60} className="faint" />
            <h2>{selectedCourse.courseName}</h2>
            <p>Please select an active batch to view the student directory.</p>
          </div>
        ) : (
          <div className="student-list-container fade-in">
            <div className="list-header">
              <div className="list-title">
                <FaUsers />
                <h2>Enrolled Students</h2>
              </div>
              
              {/* Pagination Controls on Top of Table */}
              {totalPages > 1 && (
                <div className="pagination-wrapper">
                  <span className="page-info">
                    Page <strong>{currentPage}</strong> of {totalPages}
                  </span>
                  <div className="page-buttons">
                    <button 
                      className="page-btn" 
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <FaChevronLeft />
                    </button>
                    <button 
                      className="page-btn" 
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {filteredStudents.length > 0 ? (
              <div className="table-responsive">
                <table className="student-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Email Address</th>
                      <th>Phone Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStudentsPage.map(student => (
                      <tr key={student.id}>
                        <td>
                          <div className="student-info-cell">
                            <div className="name-avatar">{student.name.charAt(0)}</div>
                            <span className="name-text">{student.name}</span>
                          </div>
                        </td>
                        <td>
                          <a href={`mailto:${student.email}`} className="contact-link">
                            <FaEnvelope className="link-icon" /> {student.email}
                          </a>
                        </td>
                        <td>
                          <div className="contact-item">
                            <FaPhoneAlt className="link-icon" /> {student.phone || "N/A"}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-results">
                <FaInbox size={40} />
                <p>No student records found.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default TrainerCourses;