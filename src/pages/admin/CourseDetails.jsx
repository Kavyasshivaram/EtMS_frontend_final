import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import api from "../../api/axiosConfig";
import {
  FaArrowLeft, FaUserGraduate, FaEnvelope, FaSearch,
  FaUsers, FaRegCalendarAlt, FaPhoneAlt, FaChevronLeft,
  FaChevronRight, FaFingerprint, FaDownload, FaBookOpen,
  FaCheckCircle, FaIdBadge, FaTimes, FaMapMarkerAlt,
  FaGraduationCap, FaUser, FaInfoCircle, FaEdit,
  FaUserCheck, FaUserSlash, FaSave, FaBan
} from "react-icons/fa";
import "./CourseDetails.css";

/* ── Avatar colours ── */
const AVATAR_COLORS = [
  { bg: "#eff6ff", color: "#2563eb" },
  { bg: "#f5f3ff", color: "#7c3aed" },
  { bg: "#ecfdf5", color: "#059669" },
  { bg: "#fff7ed", color: "#ea580c" },
  { bg: "#fdf2f8", color: "#db2777" },
  { bg: "#f0fdf4", color: "#16a34a" },
];

/* ══════════════════════════════════════════════════
   EDIT CONTACT MODAL
   Lets admin update a student's email and phone number
   ══════════════════════════════════════════════════ */
function EditContactModal({ student, onClose, onSaved }) {
  const [email,   setEmail]   = useState(student.studentEmail || "");
  const [phone,   setPhone]   = useState(student.phone        || "");
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const overlayRef            = useRef(null);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleSave = async () => {
    setError("");
    if (!email.trim()) { setError("Email is required."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email address."); return; }

    setSaving(true);
    try {
      await api.put(`/admin/students/${student.studentId}/contact`, {
        email: email.trim(),
        phone: phone.trim(),
      });
      onSaved({ ...student, studentEmail: email.trim(), phone: phone.trim() });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div
      className="ecm-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="ecm-modal" role="dialog" aria-modal="true">

        {/* Header */}
        <div className="ecm-header">
          <div className="ecm-header__left">
            <div className="ecm-header__icon"><FaEdit /></div>
            <div>
              <h2 className="ecm-header__title">Edit Student Contact</h2>
              <p className="ecm-header__sub">{student.studentName}</p>
            </div>
          </div>
          <button className="ecm-close" onClick={onClose} title="Close (Esc)"><FaTimes /></button>
        </div>

        {/* Body */}
        <div className="ecm-body">
          {error && (
            <div className="ecm-error">
              <FaBan className="ecm-error__ico" />
              <span>{error}</span>
            </div>
          )}

          <div className="ecm-field">
            <label className="ecm-label">
              <FaEnvelope className="ecm-label__ico ecm-label__ico--blue" />
              Email Address
            </label>
            <input
              className="ecm-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              autoFocus
            />
          </div>

          <div className="ecm-field">
            <label className="ecm-label">
              <FaPhoneAlt className="ecm-label__ico ecm-label__ico--green" />
              Phone Number
            </label>
            <input
              className="ecm-input"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 00000 00000"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="ecm-footer">
          <button className="ecm-btn ecm-btn--cancel" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="ecm-btn ecm-btn--save" onClick={handleSave} disabled={saving}>
            {saving ? (
              <><div className="ecm-spinner" /> Saving…</>
            ) : (
              <><FaSave /> Save Changes</>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ══════════════════════════════════════════════════
   STUDENT PROFILE MODAL
   ══════════════════════════════════════════════════ */
function StudentProfileModal({ student, colorScheme, onClose }) {
  const [enrichedProfile, setEnrichedProfile] = useState(null);
  const [profileLoading,  setProfileLoading]  = useState(true);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!student?.studentEmail) { setProfileLoading(false); return; }
    const fetchP = async () => {
      try {
        const res = await api.get(`/student/profile/${student.studentEmail}`);
        if (res.data && Object.keys(res.data).length > 0) setEnrichedProfile(res.data);
      } catch { /* profile not filled yet */ }
      finally { setProfileLoading(false); }
    };
    fetchP();
  }, [student]);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const avatarBg    = colorScheme?.bg    || "#eff6ff";
  const avatarColor = colorScheme?.color || "#2563eb";

  const displayName  = enrichedProfile?.name  || student.studentName;
  const displayPhone = enrichedProfile?.phone || student.phone || null;
  const displayEmail = student.studentEmail;

  const gender        = enrichedProfile?.gender        || null;
  const year          = enrichedProfile?.year          || null;
  const qualification = enrichedProfile?.qualification || null;
  const skills        = enrichedProfile?.skills        || null;
  const city          = enrichedProfile?.city          || null;
  const state         = enrichedProfile?.state         || null;
  const address       = enrichedProfile?.address       || null;
  const pincode       = enrichedProfile?.pincode       || null;
  const bio           = enrichedProfile?.bio           || null;
  const profilePic    = enrichedProfile?.profilePic    || null;

  const completionFields = enrichedProfile
    ? [enrichedProfile.name, enrichedProfile.phone, enrichedProfile.gender,
       enrichedProfile.qualification, enrichedProfile.year, enrichedProfile.address]
    : [];
  const completion = completionFields.length
    ? Math.round(completionFields.filter(f => f?.toString().trim()).length / completionFields.length * 100)
    : 0;

  const MALE_AVATAR   = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
  const FEMALE_AVATAR = "https://cdn-icons-png.flaticon.com/512/3135/3135789.png";
  const avatarImg     = profilePic || (gender === "Female" ? FEMALE_AVATAR : MALE_AVATAR);

  return createPortal(
    <div
      className="spm-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="spm-modal" role="dialog" aria-modal="true">

        <div className="spm-modal__header">
          <div className="spm-modal__header-left">
            <div className="spm-modal__header-icon"><FaUserGraduate /></div>
            <div>
              <h2 className="spm-modal__header-title">Student Profile</h2>
              <p className="spm-modal__header-sub">Registration &amp; profile details</p>
            </div>
          </div>
          <button className="spm-close-btn" onClick={onClose} title="Close (Esc)"><FaTimes /></button>
        </div>

        <div className="spm-body">

          <div className="spm-identity">
            <div className="spm-identity__avatar-wrap">
              {profilePic
                ? <img src={avatarImg} alt={displayName} className="spm-identity__avatar-img" />
                : <div className="spm-identity__avatar-letter" style={{ background: avatarBg, color: avatarColor }}>
                    {displayName?.charAt(0).toUpperCase()}
                  </div>
              }
              <span className="spm-identity__status-dot" />
            </div>

            <div className="spm-identity__info">
              <h3 className="spm-identity__name">{displayName}</h3>
              <p className="spm-identity__qual">{qualification || "Student"}</p>
              <div className="spm-identity__badges">
                <span className="spm-badge spm-badge--id"><FaIdBadge /> ID #{student.studentId}</span>
                <span className="spm-badge spm-badge--active"><FaCheckCircle /> Active</span>
              </div>
            </div>

            {enrichedProfile && (
              <div className="spm-strength">
                <div className="spm-strength__label">
                  <span>Profile Strength</span>
                  <span className="spm-strength__pct">{completion}%</span>
                </div>
                <div className="spm-strength__bar">
                  <div className="spm-strength__fill" style={{ width: `${completion}%` }} />
                </div>
              </div>
            )}
          </div>

          <div className="spm-grid">

            <div className="spm-section">
              <h4 className="spm-section__title"><FaEnvelope className="spm-section__ico" /> Contact</h4>
              <div className="spm-fields">
                <div className="spm-field">
                  <span className="spm-field__lbl">Email</span>
                  <a href={`mailto:${displayEmail}`} className="spm-field__val spm-field__val--link">{displayEmail}</a>
                </div>
                <div className="spm-field">
                  <span className="spm-field__lbl">Phone</span>
                  {displayPhone
                    ? <a href={`tel:${displayPhone}`} className="spm-field__val spm-field__val--link">{displayPhone}</a>
                    : <span className="spm-field__val spm-field__val--empty">Not provided</span>
                  }
                </div>
              </div>
            </div>

            <div className="spm-section">
              <h4 className="spm-section__title"><FaUser className="spm-section__ico" /> Personal</h4>
              {profileLoading
                ? <div className="spm-section-loading"><div className="spm-mini-spinner" /></div>
                : <div className="spm-fields">
                    <div className="spm-field">
                      <span className="spm-field__lbl">Gender</span>
                      <span className="spm-field__val">{gender || <span className="spm-field__val--empty">—</span>}</span>
                    </div>
                    <div className="spm-field">
                      <span className="spm-field__lbl">Year / Sem</span>
                      <span className="spm-field__val">{year || <span className="spm-field__val--empty">—</span>}</span>
                    </div>
                  </div>
              }
            </div>

            <div className="spm-section">
              <h4 className="spm-section__title"><FaGraduationCap className="spm-section__ico" /> Academic</h4>
              {profileLoading
                ? <div className="spm-section-loading"><div className="spm-mini-spinner" /></div>
                : <div className="spm-fields">
                    <div className="spm-field">
                      <span className="spm-field__lbl">Qualification</span>
                      <span className="spm-field__val">{qualification || <span className="spm-field__val--empty">—</span>}</span>
                    </div>
                    <div className="spm-field">
                      <span className="spm-field__lbl">Skills</span>
                      <span className="spm-field__val">
                        {skills
                          ? skills.split(",").map((s, i) => <span key={i} className="spm-skill-tag">{s.trim()}</span>)
                          : <span className="spm-field__val--empty">—</span>
                        }
                      </span>
                    </div>
                  </div>
              }
            </div>

            <div className="spm-section">
              <h4 className="spm-section__title"><FaMapMarkerAlt className="spm-section__ico" /> Location</h4>
              {profileLoading
                ? <div className="spm-section-loading"><div className="spm-mini-spinner" /></div>
                : <div className="spm-fields">
                    <div className="spm-field">
                      <span className="spm-field__lbl">City</span>
                      <span className="spm-field__val">{city || <span className="spm-field__val--empty">—</span>}</span>
                    </div>
                    <div className="spm-field">
                      <span className="spm-field__lbl">State</span>
                      <span className="spm-field__val">{state || <span className="spm-field__val--empty">—</span>}</span>
                    </div>
                    <div className="spm-field spm-field--full">
                      <span className="spm-field__lbl">Address</span>
                      <span className="spm-field__val">
                        {[address, city, state, pincode].filter(Boolean).join(", ") ||
                          <span className="spm-field__val--empty">—</span>}
                      </span>
                    </div>
                  </div>
              }
            </div>

            {!profileLoading && bio && (
              <div className="spm-section spm-section--full">
                <h4 className="spm-section__title"><FaInfoCircle className="spm-section__ico" /> Bio</h4>
                <p className="spm-bio">{bio}</p>
              </div>
            )}
          </div>

          {!profileLoading && !enrichedProfile && (
            <div className="spm-notice">
              <span className="spm-notice__ico">ℹ️</span>
              <p>This student has not filled their extended profile yet. Contact and ID details are from their registration.</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════ */
function CourseDetails() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { id }    = useParams();

  const [course,      setCourse]      = useState(location.state || null);
  const [loading,     setLoading]     = useState(false);
  const [searchTerm,  setSearchTerm]  = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  /* modals */
  const [profileStudent,     setProfileStudent]     = useState(null);
  const [profileColorScheme, setProfileColorScheme] = useState(null);
  const [editStudent,        setEditStudent]        = useState(null);

  /* per-row action loading state  { [studentId]: 'toggle' | 'edit' | null } */
  const [actionLoading, setActionLoading] = useState({});

  /* inline toast */
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg: string }

  const studentsPerPage = 8;

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

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

  /* ── Toggle student status ── */
  const handleToggleStatus = async (student) => {
    setActionLoading(prev => ({ ...prev, [student.studentId]: "toggle" }));
    try {
      const res = await api.put(`/admin/students/${student.studentId}/toggle-status`);
      const newStatus = res.data.newStatus; // "ACTIVE" or "INACTIVE"

      /* Update local course state so table re-renders instantly */
      setCourse(prev => ({
        ...prev,
        students: prev.students.map(s =>
          s.studentId === student.studentId ? { ...s, status: newStatus } : s
        ),
      }));

      showToast("success", `${student.studentName} is now ${newStatus === "ACTIVE" ? "Active ✅" : "Inactive 🚫"}`);
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to update status.");
    } finally {
      setActionLoading(prev => ({ ...prev, [student.studentId]: null }));
    }
  };

  /* ── Callback when edit modal saves successfully ── */
  const handleContactSaved = (updatedStudent) => {
    setCourse(prev => ({
      ...prev,
      students: prev.students.map(s =>
        s.studentId === updatedStudent.studentId ? { ...s, ...updatedStudent } : s
      ),
    }));
    showToast("success", `Contact updated for ${updatedStudent.studentName} ✅`);
  };

  if (loading || !course)
    return (
      <div className="cd2-loader">
        <div className="cd2-loader__spinner" />
        <p className="cd2-loader__text">Loading course details…</p>
      </div>
    );

  const filteredStudents =
    course.students?.filter(s =>
      s.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const totalStudentsCount = filteredStudents.length;
  const totalPages         = Math.max(1, Math.ceil(filteredStudents.length / studentsPerPage));

  const currentStudents = filteredStudents.slice(
    (currentPage - 1) * studentsPerPage,
    currentPage * studentsPerPage
  );

  return (
    <div className="cd2-portal">

      {/* ── Inline toast ── */}
      {toast && (
        <div className={`cd2-toast cd2-toast--${toast.type}`}>
          {toast.type === "success" ? <FaCheckCircle /> : <FaBan />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── Modals ── */}
      {profileStudent && (
        <StudentProfileModal
          student={profileStudent}
          colorScheme={profileColorScheme}
          onClose={() => { setProfileStudent(null); setProfileColorScheme(null); }}
        />
      )}
      {editStudent && (
        <EditContactModal
          student={editStudent}
          onClose={() => setEditStudent(null)}
          onSaved={handleContactSaved}
        />
      )}

      {/* ── Navbar ── */}
      <nav className="cd2-nav">
        <div className="cd2-nav__inner">
          <div className="cd2-nav__left">
            <button className="cd2-back-btn" onClick={() => navigate(-1)} title="Back">
              <FaArrowLeft />
            </button>
            <div className="cd2-breadcrumb">
              <span className="cd2-breadcrumb__parent" onClick={() => navigate(-1)}>Academic Catalog</span>
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

      {/* ── Hero ── */}
      <header className="cd2-hero">
        <div className="cd2-hero__inner">
          <div className="cd2-hero__info">
            <div className="cd2-hero__badge"><FaFingerprint /><span>COURSE_ID_{course.id}</span></div>
            <h1 className="cd2-hero__title">{course.courseName}</h1>
            <p className="cd2-hero__desc">
              {course.description || "This course teaches the most popular industry tools and concepts."}
            </p>
            <div className="cd2-hero__actions">
              {course.syllabusFileName && (
                <a
                  href={`${api.defaults.baseURL}/admin/courses/download/${course.id}`}
                  target="_blank" rel="noopener noreferrer"
                  className="cd2-syllabus-btn"
                >
                  <FaDownload /><span>Download Syllabus</span>
                </a>
              )}
              {course.syllabusFileName && (
                <div className="cd2-hero__file-name">
                  <FaBookOpen /><span>{course.syllabusFileName}</span>
                </div>
              )}
            </div>
          </div>

          <div className="cd2-hero__metrics">
            <div className="cd2-metric">
              <div className="cd2-metric__icon cd2-metric__icon--blue"><FaUsers /></div>
              <div className="cd2-metric__body">
                <span className="cd2-metric__val">{totalStudentsCount}</span>
                <span className="cd2-metric__lbl">Students Enrolled</span>
              </div>
            </div>
            <div className="cd2-metric">
              <div className="cd2-metric__icon cd2-metric__icon--purple"><FaRegCalendarAlt /></div>
              <div className="cd2-metric__body">
                <span className="cd2-metric__val">{course.duration}</span>
                <span className="cd2-metric__lbl">Course Duration</span>
              </div>
            </div>
            <div className="cd2-metric">
              <div className="cd2-metric__icon cd2-metric__icon--green"><FaIdBadge /></div>
              <div className="cd2-metric__body">
                <span className="cd2-metric__val">#{course.id}</span>
                <span className="cd2-metric__lbl">Course ID</span>
              </div>
            </div>
          </div>
        </div>
        <div className="cd2-hero__orb cd2-hero__orb--1" />
        <div className="cd2-hero__orb cd2-hero__orb--2" />
      </header>

      {/* ── Students table ── */}
      <main className="cd2-main">
        {filteredStudents.length > 0 ? (
          <section className="cd2-section">

            <div className="cd2-section__header">
              <div className="cd2-section__header-left">
                <div className="cd2-section__icon"><FaUserGraduate /></div>
                <div>
                  <h3 className="cd2-section__title">Enrolled Students</h3>
                  <p className="cd2-section__sub">
                    {totalStudentsCount} student{totalStudentsCount !== 1 ? "s" : ""} registered
                    {searchTerm && ` · filtered by "${searchTerm}"`}
                  </p>
                </div>
              </div>

              <div className="cd2-pagination">
                <button className="cd2-pag-btn" disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}>
                  <FaChevronLeft />
                </button>
                <div className="cd2-pag-pages">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .map((p, idx, arr) => (
                      <span key={p}>
                        {idx > 0 && arr[idx - 1] !== p - 1 && <span className="cd2-pag-ellipsis">…</span>}
                        <button
                          className={`cd2-pag-num ${currentPage === p ? "cd2-pag-num--active" : ""}`}
                          onClick={() => setCurrentPage(p)}
                        >{p}</button>
                      </span>
                    ))}
                </div>
                <button className="cd2-pag-btn" disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}>
                  <FaChevronRight />
                </button>
                <span className="cd2-pag-info">
                  {(currentPage - 1) * studentsPerPage + 1}–
                  {Math.min(currentPage * studentsPerPage, totalStudentsCount)} of {totalStudentsCount}
                </span>
              </div>
            </div>

            {/* Hint */}
            <p className="cd2-click-hint">
              💡 Click a student's name to view their profile &nbsp;·&nbsp;
              Use <strong>Edit</strong> to update contact &nbsp;·&nbsp;
              Use <strong>Activate / Deactivate</strong> to manage access
            </p>

            <div className="cd2-table-wrap">
              <table className="cd2-table">
                <thead>
                  <tr>
                    <th className="cd2-th cd2-th--sn">#</th>
                    <th className="cd2-th">Student</th>
                    <th className="cd2-th">Email Address</th>
                    <th className="cd2-th">Phone</th>
                    <th className="cd2-th cd2-th--center">Status</th>
                    <th className="cd2-th cd2-th--center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStudents.map((student, idx) => {
                    const scheme   = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                    const rowNum   = (currentPage - 1) * studentsPerPage + idx + 1;
                    const isActive = (student.status || "ACTIVE") === "ACTIVE";
                    const busy     = actionLoading[student.studentId] === "toggle";

                    return (
                      <tr
                        key={student.studentId}
                        className={`cd2-row ${!isActive ? "cd2-row--inactive" : ""}`}
                      >

                        <td className="cd2-td cd2-td--sn">
                          <span className="cd2-row-num">{rowNum}</span>
                        </td>

                        {/* Clickable name → profile modal */}
                        <td className="cd2-td">
                          <div
                            className="cd2-student cd2-student--clickable"
                            onClick={() => { setProfileStudent(student); setProfileColorScheme(scheme); }}
                            title="View profile"
                          >
                            <div
                              className={`cd2-avatar ${!isActive ? "cd2-avatar--inactive" : ""}`}
                              style={{ background: scheme.bg, color: scheme.color }}
                            >
                              {student.studentName.charAt(0).toUpperCase()}
                            </div>
                            <div className="cd2-student__info">
                              <span className="cd2-student__name cd2-student__name--link">
                                {student.studentName}
                              </span>
                              <span className="cd2-student__id">ID #{student.studentId}</span>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="cd2-td">
                          <a href={`mailto:${student.studentEmail}`} className="cd2-contact-link cd2-contact-link--email">
                            <div className="cd2-contact-icon cd2-contact-icon--email"><FaEnvelope /></div>
                            <span>{student.studentEmail}</span>
                          </a>
                        </td>

                        {/* Phone */}
                        <td className="cd2-td">
                          {student.phone ? (
                            <a href={`tel:${student.phone}`} className="cd2-contact-link cd2-contact-link--phone">
                              <div className="cd2-contact-icon cd2-contact-icon--phone"><FaPhoneAlt /></div>
                              <span>{student.phone}</span>
                            </a>
                          ) : (
                            <span className="cd2-no-phone">—</span>
                          )}
                        </td>

                        {/* Status badge */}
                        <td className="cd2-td cd2-td--center">
                          <span className={`cd2-status ${isActive ? "cd2-status--active" : "cd2-status--inactive"}`}>
                            {isActive
                              ? <><FaCheckCircle className="cd2-status__dot" /> Active</>
                              : <><FaBan className="cd2-status__dot" /> Inactive</>
                            }
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="cd2-td cd2-td--center">
                          <div className="cd2-action-group">

                            {/* Edit contact */}
                            <button
                              className="cd2-action-btn cd2-action-btn--edit"
                              onClick={() => setEditStudent(student)}
                              title="Edit email & phone"
                            >
                              <FaEdit /> Edit
                            </button>

                            {/* Activate / Deactivate */}
                            <button
                              className={`cd2-action-btn ${isActive ? "cd2-action-btn--deactivate" : "cd2-action-btn--activate"}`}
                              onClick={() => handleToggleStatus(student)}
                              disabled={busy}
                              title={isActive ? "Deactivate student" : "Activate student"}
                            >
                              {busy ? (
                                <div className="cd2-action-spinner" />
                              ) : isActive ? (
                                <><FaUserSlash /> Deactivate</>
                              ) : (
                                <><FaUserCheck /> Activate</>
                              )}
                            </button>

                          </div>
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
            <div className="cd2-empty__icon-wrap"><FaUserGraduate /></div>
            <h3 className="cd2-empty__title">No Students Found</h3>
            <p className="cd2-empty__sub">
              {searchTerm ? `No students match "${searchTerm}"` : "No students are enrolled in this course yet."}
            </p>
            {searchTerm && (
              <button className="cd2-empty__clear" onClick={() => setSearchTerm("")}>Clear Search</button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default CourseDetails;
