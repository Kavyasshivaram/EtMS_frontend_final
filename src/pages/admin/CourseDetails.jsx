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
  FaFingerprint,
  FaDownload,
  FaBookOpen,
  FaCheckCircle,
  FaIdBadge
} from "react-icons/fa";
import "./CourseDetails.css";

function CourseDetails() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { id }    = useParams();

  const [course,      setCourse]      = useState(location.state || null);
  const [loading,     setLoading]     = useState(false);
  const [searchTerm,  setSearchTerm]  = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const studentsPerPage = 8;

  useEffect(() => {
    if (!course) fetchCourseDetails();
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
      <div className="cd2-loader">
        <div className="cd2-loader__spinner" />
        <p className="cd2-loader__text">Loading course details…</p>
      </div>
    );

  const filteredStudents =
    course.students?.filter((s) =>
      s.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const totalStudentsCount = filteredStudents.length;
  const totalPages         = Math.max(1, Math.ceil(filteredStudents.length / studentsPerPage));

  const currentStudents = filteredStudents.slice(
    (currentPage - 1) * studentsPerPage,
    currentPage * studentsPerPage
  );

  /* Avatar colour cycle */
  const AVATAR_COLORS = [
    { bg: "#eff6ff", color: "#2563eb" },
    { bg: "#f5f3ff", color: "#7c3aed" },
    { bg: "#ecfdf5", color: "#059669" },
    { bg: "#fff7ed", color: "#ea580c" },
    { bg: "#fdf2f8", color: "#db2777" },
    { bg: "#f0fdf4", color: "#16a34a" },
  ];

  return (
    <div className="cd2-portal">

      {/* ══════════════════════════════
          NAVBAR
         ══════════════════════════════ */}
      <nav className="cd2-nav">
        <div className="cd2-nav__inner">

          <div className="cd2-nav__left">
            <button className="cd2-back-btn" onClick={() => navigate(-1)} title="Back">
              <FaArrowLeft />
            </button>
            <div className="cd2-breadcrumb">
              <span className="cd2-breadcrumb__parent" onClick={() => navigate(-1)}>
                Academic Catalog
              </span>
              <span className="cd2-breadcrumb__sep">›</span>
              <span className="cd2-breadcrumb__current">{course.courseName}</span>
            </div>
          </div>

          <div className="cd2-nav__right">
            <div className="cd2-search">
              <FaSearch className="cd2-search__icon" />
              <input
                className="cd2-search__input"
                type="text"
                placeholder="Search students…"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

        </div>
      </nav>

      {/* ══════════════════════════════
          HERO
         ══════════════════════════════ */}
      <header className="cd2-hero">
        <div className="cd2-hero__inner">

          {/* Left — course info */}
          <div className="cd2-hero__info">
            <div className="cd2-hero__badge">
              <FaFingerprint />
              <span>COURSE_ID_{course.id}</span>
            </div>

            <h1 className="cd2-hero__title">{course.courseName}</h1>

            <p className="cd2-hero__desc">
              {course.description || "This course teaches the most popular industry tools and concepts."}
            </p>

            <div className="cd2-hero__actions">
              {course.syllabusFileName && (
                <a
                  href={`${api.defaults.baseURL}/admin/courses/download/${course.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cd2-syllabus-btn"
                >
                  <FaDownload />
                  <span>Download Syllabus</span>
                </a>
              )}
              <div className="cd2-hero__file-name">
                {course.syllabusFileName && (
                  <><FaBookOpen /> <span>{course.syllabusFileName}</span></>
                )}
              </div>
            </div>
          </div>

          {/* Right — metric cards */}
          <div className="cd2-hero__metrics">
            <div className="cd2-metric">
              <div className="cd2-metric__icon cd2-metric__icon--blue">
                <FaUsers />
              </div>
              <div className="cd2-metric__body">
                <span className="cd2-metric__val">{totalStudentsCount}</span>
                <span className="cd2-metric__lbl">Students Enrolled</span>
              </div>
            </div>

            <div className="cd2-metric">
              <div className="cd2-metric__icon cd2-metric__icon--purple">
                <FaRegCalendarAlt />
              </div>
              <div className="cd2-metric__body">
                <span className="cd2-metric__val">{course.duration}</span>
                <span className="cd2-metric__lbl">Course Duration</span>
              </div>
            </div>

            <div className="cd2-metric">
              <div className="cd2-metric__icon cd2-metric__icon--green">
                <FaIdBadge />
              </div>
              <div className="cd2-metric__body">
                <span className="cd2-metric__val">#{course.id}</span>
                <span className="cd2-metric__lbl">Course ID</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative orbs */}
        <div className="cd2-hero__orb cd2-hero__orb--1" />
        <div className="cd2-hero__orb cd2-hero__orb--2" />
      </header>

      {/* ══════════════════════════════
          STUDENTS TABLE
         ══════════════════════════════ */}
      <main className="cd2-main">
        {filteredStudents.length > 0 ? (
          <section className="cd2-section">

            {/* Section header */}
            <div className="cd2-section__header">
              <div className="cd2-section__header-left">
                <div className="cd2-section__icon">
                  <FaUserGraduate />
                </div>
                <div>
                  <h3 className="cd2-section__title">Enrolled Students</h3>
                  <p className="cd2-section__sub">
                    {totalStudentsCount} student{totalStudentsCount !== 1 ? "s" : ""} registered
                    {searchTerm && ` · filtered by "${searchTerm}"`}
                  </p>
                </div>
              </div>

              {/* Pagination */}
              <div className="cd2-pagination">
                <button
                  className="cd2-pag-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <FaChevronLeft />
                </button>
                <div className="cd2-pag-pages">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .map((p, idx, arr) => (
                      <>
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span key={`e${p}`} className="cd2-pag-ellipsis">…</span>
                        )}
                        <button
                          key={p}
                          className={`cd2-pag-num ${currentPage === p ? "cd2-pag-num--active" : ""}`}
                          onClick={() => setCurrentPage(p)}
                        >{p}</button>
                      </>
                    ))}
                </div>
                <button
                  className="cd2-pag-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <FaChevronRight />
                </button>
                <span className="cd2-pag-info">
                  {(currentPage - 1) * studentsPerPage + 1}–{Math.min(currentPage * studentsPerPage, totalStudentsCount)} of {totalStudentsCount}
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="cd2-table-wrap">
              <table className="cd2-table">
                <thead>
                  <tr>
                    <th className="cd2-th cd2-th--sn">#</th>
                    <th className="cd2-th">Student</th>
                    <th className="cd2-th">Email Address</th>
                    <th className="cd2-th">Phone</th>
                    <th className="cd2-th cd2-th--center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStudents.map((student, idx) => {
                    const colorScheme = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                    const rowNum = (currentPage - 1) * studentsPerPage + idx + 1;
                    return (
                      <tr key={student.studentId} className="cd2-row">

                        {/* # */}
                        <td className="cd2-td cd2-td--sn">
                          <span className="cd2-row-num">{rowNum}</span>
                        </td>

                        {/* Student identity */}
                        <td className="cd2-td">
                          <div className="cd2-student">
                            <div
                              className="cd2-avatar"
                              style={{ background: colorScheme.bg, color: colorScheme.color }}
                            >
                              {student.studentName.charAt(0).toUpperCase()}
                            </div>
                            <div className="cd2-student__info">
                              <span className="cd2-student__name">{student.studentName}</span>
                              <span className="cd2-student__id">ID #{student.studentId}</span>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="cd2-td">
                          <a href={`mailto:${student.studentEmail}`} className="cd2-contact-link cd2-contact-link--email">
                            <div className="cd2-contact-icon cd2-contact-icon--email">
                              <FaEnvelope />
                            </div>
                            <span>{student.studentEmail}</span>
                          </a>
                        </td>

                        {/* Phone */}
                        <td className="cd2-td">
                          <a href={`tel:${student.phone}`} className="cd2-contact-link cd2-contact-link--phone">
                            <div className="cd2-contact-icon cd2-contact-icon--phone">
                              <FaPhoneAlt />
                            </div>
                            <span>{student.phone || "—"}</span>
                          </a>
                        </td>

                        {/* Status */}
                        <td className="cd2-td cd2-td--center">
                          <span className="cd2-status">
                            <FaCheckCircle className="cd2-status__dot" />
                            Active
                          </span>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </section>
        ) : (
          <div className="cd2-empty">
            <div className="cd2-empty__icon-wrap">
              <FaUserGraduate />
            </div>
            <h3 className="cd2-empty__title">No Students Found</h3>
            <p className="cd2-empty__sub">
              {searchTerm
                ? `No students match "${searchTerm}"`
                : "No students are enrolled in this course yet."}
            </p>
            {searchTerm && (
              <button className="cd2-empty__clear" onClick={() => setSearchTerm("")}>
                Clear Search
              </button>
            )}
          </div>
        )}
      </main>

    </div>
  );
}

export default CourseDetails;
