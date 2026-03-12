import React, { useEffect, useState, useMemo } from "react";
import api from "../../api/axiosConfig";
import { 
  FaLayerGroup, FaUsers, FaSearch, 
  FaEnvelope, FaPhoneAlt, FaChevronDown, FaInbox,
  FaChartLine, FaChevronLeft, FaChevronRight
} from "react-icons/fa";
import "./TrainerCourses.css";

function TrainerCourses() {

  const user = JSON.parse(localStorage.getItem("user"));
  const trainerId = user?.id;

  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 8;

  useEffect(() => {
    if (trainerId) loadInitialData();
  }, [trainerId]);

  // ===============================
  // FETCH ACTIVE BATCHES
  // ===============================
  const loadInitialData = async () => {

    setLoading(true);

    try {

      const res = await api.get(`/teacher/active-batches/${trainerId}`);

      setBatches(res.data);

    } catch (err) {

      console.error("Failed to load batches", err);

    } finally {

      setLoading(false);

    }
  };

  // ===============================
  // FETCH STUDENTS BY BATCH
  // ===============================
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

  // ===============================
  // STATS
  // ===============================
  const globalStats = useMemo(() => {

    return {
      batchCount: batches.length,
      currentBatchStudents: students.length
    };

  }, [batches, students]);

  // ===============================
  // SEARCH FILTER
  // ===============================
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ===============================
  // PAGINATION
  // ===============================
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;

  const currentStudentsPage =
    filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  const totalPages =
    Math.ceil(filteredStudents.length / studentsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (

    <div className="trainer-container">

      {/* ===============================
         HEADER
      =============================== */}

      <header className="trainer-top-nav">

        <div className="selection-controls">

          <div className="dropdown-wrapper">

            <label><FaLayerGroup /> Batch</label>

            <div className="select-custom">

              <select
                value={selectedBatch?.batchId || ""}
                onChange={(e) => handleBatchChange(e.target.value)}
              >

                <option value="" disabled>Select Active Batch</option>

                {batches.map(b => (
                  <option key={b.batchId} value={b.batchId}>
                    {b.batchName}
                  </option>
                ))}

              </select>

              <FaChevronDown className="select-arrow" />

            </div>

          </div>

        </div>

        {/* SEARCH */}

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

      {/* ===============================
         STATS
      =============================== */}

      <section className="stats-strip">

        <div className="stat-card">

          <div className="stat-icon batch-bg"><FaLayerGroup /></div>

          <div className="stat-info">
            <span className="stat-value">{globalStats.batchCount}</span>
            <span className="stat-label">Active Batches</span>
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

      {/* ===============================
         MAIN CONTENT
      =============================== */}

      <main className="trainer-content">

        {loading ? (

          <div className="loading-overlay">
            <div className="loader-spinner"></div>
            <p>Processing request...</p>
          </div>

        ) : !selectedBatch ? (

          <div className="empty-state-hero">

            <div className="hero-illustration">
              <FaChartLine />
            </div>

            <h2>Select a Batch</h2>

            <p>Please select an active batch to view the student directory.</p>

          </div>

        ) : (

          <div className="student-list-container fade-in">

            <div className="list-header">

              <div className="list-title">
                <FaUsers />
                <h2>Enrolled Students</h2>
              </div>

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

                            <div className="name-avatar">
                              {student.name.charAt(0)}
                            </div>

                            <span className="name-text">
                              {student.name}
                            </span>

                          </div>

                        </td>

                        <td>

                          <a
                            href={`mailto:${student.email}`}
                            className="contact-link"
                          >
                            <FaEnvelope className="link-icon" />
                            {student.email}
                          </a>

                        </td>

                        <td>

                          <div className="contact-item">
                            <FaPhoneAlt className="link-icon" />
                            {student.phone || "N/A"}
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