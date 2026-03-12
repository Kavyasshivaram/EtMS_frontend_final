import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import {
  FaArrowLeft,
  FaUserGraduate,
  FaEnvelope,
  FaSearch,
  FaUsers,
  FaRegCalendarAlt,
  FaPhoneAlt,
  FaChevronLeft,
  FaChevronRight,
  FaFingerprint
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
      const res = await api.get(`/admin/course-full-details/${id}`);
      setCourse(res.data);
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

  const filteredStudents =
    course.students?.filter((s) =>
      s.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const totalStudentsCount = filteredStudents.length;

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const currentStudents = filteredStudents.slice(
    (currentPage - 1) * studentsPerPage,
    currentPage * studentsPerPage
  );

  return (
    <div className="cd-details-portal">

      {/* NAVBAR */}
      <nav className="cd-navbar">
        <div className="cd-nav-content">

          <div className="cd-nav-left">
            <button
              className="cd-back-btn"
              onClick={() => navigate(-1)}
              title="Go Back"
            >
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

      {/* HERO */}
      <header className="cd-hero">
        <div className="cd-hero-inner">

          <div className="cd-hero-info">

            <div className="cd-id-tag">
              <FaFingerprint /> COURSE_ID_{course.id}
            </div>

            <p className="cd-hero-desc">
              {course.description ||
                "This course teaches the most popular industry tools and concepts."}
            </p>

            {/* VIEW SYLLABUS */}

            <div style={{ marginTop: "15px" }}>
              {course.syllabusFileName && (
                <a
                  href={`${api.defaults.baseURL}/admin/courses/download/${course.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cd-view-btn"
                >
                  View Syllabus
                </a>
              )}
            </div>

          </div>

          <div className="cd-hero-metrics">

            <div className="cd-metric-card">
              <div className="cd-metric-icon">
                <FaUsers />
              </div>

              <div className="cd-metric-data">
                <span className="cd-metric-val">{totalStudentsCount}</span>
                <span className="cd-metric-label">Enrolled</span>
              </div>
            </div>

            <div className="cd-metric-card">
              <div className="cd-metric-icon">
                <FaRegCalendarAlt />
              </div>

              <div className="cd-metric-data">
                <span className="cd-metric-val">{course.duration}</span>
                <span className="cd-metric-label">Duration</span>
              </div>
            </div>

          </div>

        </div>
      </header>

      {/* STUDENT TABLE */}

      <main className="cd-main-content">

        {filteredStudents.length > 0 ? (

          <section className="cd-batch-section">

            <div className="cd-batch-header">

              <h3>Students Enrolled</h3>

              <div className="cd-pagination">

                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <FaChevronLeft />
                </button>

                <span className="cd-page-info">
                  <strong>{currentPage}</strong> / {totalPages || 1}
                </span>

                <button
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
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

                  {currentStudents.map((student) => (

                    <tr key={student.studentId}>

                      <td>
                        <div className="cd-student-identity">
                          <div className="cd-avatar">
                            {student.studentName.charAt(0)}
                          </div>

                          <span className="cd-student-name">
                            {student.studentName}
                          </span>
                        </div>
                      </td>

                      <td>
                        <a
                          href={`tel:${student.phone}`}
                          className="cd-link cd-phone-link"
                        >
                          <FaPhoneAlt className="cd-icon-small" />
                          {student.phone}
                        </a>
                      </td>

                      <td>
                        <a
                          href={`mailto:${student.studentEmail}`}
                          className="cd-link"
                        >
                          <FaEnvelope className="cd-icon-small" />
                          {student.studentEmail}
                        </a>
                      </td>

                      <td className="cd-txt-center">
                        <span className="cd-status-pill">Active</span>
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </section>

        ) : (

          <div className="cd-empty-state">

            <FaUserGraduate className="cd-empty-icon" />

            <h3>No Students Found</h3>

            <p>No students are assigned to this course yet.</p>

          </div>

        )}

      </main>

    </div>
  );
}

export default CourseDetails;