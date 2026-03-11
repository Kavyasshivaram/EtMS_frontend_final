import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import {
  FaArrowLeft,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaEnvelope,
  FaSearch,
  FaUsers,
  FaRegCalendarAlt,
  FaPhoneAlt,
  FaChevronLeft,
  FaChevronRight,
  FaFingerprint,
} from "react-icons/fa";
import "./CourseDetails.css";

function CourseDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [course, setCourse] = useState(location.state || null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 8;

  useEffect(() => {
    if (!course) {
      fetchCourseDetails();
    }
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/courses/details");
      const found = res.data.find((c) => c.id === parseInt(id));
      setCourse(found);
    } catch (err) {
      console.error("Error fetching course details", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !course)
    return (
      <div className="cd-loader-container">
        <div className="cd-spinner"></div>
        <p>Analyzing Course Intelligence...</p>
      </div>
    );

  const totalStudentsCount = course.batches?.reduce((acc, b) => acc + (b.students?.length || 0), 0) || 0;

  return (
    <div className="cd-details-portal">
      {/* SECTION 1: NAVIGATION BAR */}
      <nav className="cd-navbar">
        <div className="cd-nav-content">
          <div className="cd-nav-left">
            <button className="cd-back-btn" onClick={() => navigate(-1)} title="Go Back">
              <FaArrowLeft />
            </button>
            <div className="cd-breadcrumb-box">
           
              <h2 className="cd-nav-title">{course.courseName}</h2>
            </div>
          </div>

          <div className="cd-nav-right">
            <div className="cd-search-box">
              <FaSearch className="cd-search-icon" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* SECTION 2: DARK HERO HEADER */}
      <header className="cd-hero">
        <div className="cd-hero-inner">
          <div className="cd-hero-info">
            <div className="cd-id-tag">
              <FaFingerprint /> COURSE_ID_{course.id}
            </div>
            <p className="cd-hero-desc">
              {course.description || "This is a complete course that teaches the most popular tools used in the industry today and shows you how to use them in real projects."}
            </p>
          </div>
          
          <div className="cd-hero-metrics">
            <div className="cd-metric-card">
              <div className="cd-metric-icon"><FaUsers /></div>
              <div className="cd-metric-data">
                <span className="cd-metric-val">{totalStudentsCount}</span>
                <span className="cd-metric-label">Enrolled</span>
              </div>
            </div>
            <div className="cd-metric-card">
              <div className="cd-metric-icon"><FaRegCalendarAlt /></div>
              <div className="cd-metric-data">
                <span className="cd-metric-val">{course.duration}</span>
                <span className="cd-metric-label">Duration</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* SECTION 3: BATCH TABLES */}
      <main className="cd-main-content">
        {course.batches && course.batches.length > 0 ? (
          <div className="cd-batch-list">
            {course.batches.map((batch) => {
              // Ensure student list exists and filter based on search
              const allFilteredStudents = batch.students?.filter((s) => {
                const name = typeof s === 'string' ? s : s.name;
                return name.toLowerCase().includes(searchTerm.toLowerCase());
              }) || [];

              const totalPages = Math.ceil(allFilteredStudents.length / studentsPerPage);
              const currentStudents = allFilteredStudents.slice(
                (currentPage - 1) * studentsPerPage,
                currentPage * studentsPerPage
              );

              return (
                <section key={batch.batchId} className="cd-batch-section">
                  <div className="cd-batch-header">
                    <div className="cd-batch-title-group">
                      <h3>{batch.batchName}</h3>
                      <div className="cd-instructor-badge">
                        <FaChalkboardTeacher /> 
                        <span>Lead: {batch.trainerName || "Unassigned"}</span>
                      </div>
                    </div>

                    <div className="cd-pagination">
                      <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                        <FaChevronLeft />
                      </button>
                      <span className="cd-page-info"><strong>{currentPage}</strong> / {totalPages || 1}</span>
                      <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}>
                        <FaChevronRight />
                      </button>
                    </div>
                  </div>

                  <div className="cd-table-wrapper">
                    <table className="cd-table">
                      <thead>
                        <tr>
                          <th>STUDENT IDENTITY</th>
                          <th>CONTACT</th>
                          <th>EMAIL ADDRESS</th>
                          <th className="cd-txt-center">STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentStudents.length > 0 ? (
                          currentStudents.map((student, idx) => {
                            // Logic to handle if student is a string or object
                            const name = typeof student === 'string' ? student : student.name;
                            const phone = typeof student === 'object' && student.phone ? student.phone : `+91 900${idx}5521`;
                            const email = typeof student === 'object' && student.email ? student.email : `${name.toLowerCase().replace(/ /g, ".")}@edu.com`;

                            return (
                              <tr key={idx}>
                                <td>
                                  <div className="cd-student-identity">
                                    <div className="cd-avatar">{name.charAt(0)}</div>
                                    <span className="cd-student-name">{name}</span>
                                  </div>
                                </td>
                                <td>
                                  <a href={`tel:${phone}`} className="cd-link">
                                    <FaPhoneAlt className="cd-icon-small" /> {phone}
                                  </a>
                                </td>
                                <td>
                                  <a href={`mailto:${email}`} className="cd-link">
                                    <FaEnvelope className="cd-icon-small" /> {email}
                                  </a>
                                </td>
                                <td className="cd-txt-center">
                                  <span className="cd-status-pill">Active</span>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr><td colSpan="4" className="cd-empty-row">No students found in this batch.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="cd-empty-state">
            <FaUserGraduate className="cd-empty-icon" />
            <h3>No Active Batches Found</h3>
            <p>Assign a trainer and create a batch to see student records.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default CourseDetails;