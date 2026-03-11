import { useEffect, useState } from "react";
import api from "../../api/axiosConfig"; 
import { 
  FaUserGraduate, 
  FaBookOpen, 
  FaLayerGroup, 
  FaSearch, 
  FaLink, 
  FaCheckCircle,
  FaInfoCircle 
} from "react-icons/fa";
import "./ManageStudents.css";

function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [courseMappings, setCourseMappings] = useState([]);
  const [batchMappings, setBatchMappings] = useState([]);

  // Form 1: Student -> Course
  const [selectedStudentCourse, setSelectedStudentCourse] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  // Form 2: Student -> Batch (Dependent)
  const [selectedStudentBatch, setSelectedStudentBatch] = useState("");
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourseForBatch, setSelectedCourseForBatch] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [s, c, cm, bm] = await Promise.all([
        api.get("/admin/students"),
        api.get("/admin/courses"),
        api.get("/admin/student-course-mappings"),
        api.get("/admin/student-batch-mappings")
      ]);
      setStudents(s.data);
      setCourses(c.data);
      setCourseMappings(cm.data);
      setBatchMappings(bm.data);
    } catch (err) {
      setError("Failed to fetch data. Please refresh.");
    }
  };

  const handleStudentSelectForBatch = (studentId) => {
    setSelectedStudentBatch(studentId);
    setSelectedCourseForBatch("");
    setBatches([]);
    
    if (!studentId) {
      setEnrolledCourses([]);
      return;
    }

    const studentEnrolled = courseMappings
      .filter(m => Number(m.studentId) === Number(studentId))
      .map(m => ({ id: m.courseId, name: m.courseName }));
    
    setEnrolledCourses(studentEnrolled);
  };

  const fetchActiveBatches = async (courseId) => {
    setSelectedCourseForBatch(courseId);
    if (!courseId) return setBatches([]);
    try {
      const res = await api.get(`/admin/batches/course/${courseId}`);
      const activeOnly = res.data.filter(b => b.status === "ONGOING" || b.status === "ACTIVE");
      setBatches(activeOnly);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCourseSubmit = async () => {
    if (!selectedStudentCourse || !selectedCourse) return setError("Select student and course");
    try {
      setLoading(true);
      await api.post("/admin/student-course-mappings", null, {
        params: { studentId: selectedStudentCourse, courseId: selectedCourse }
      });
      setMessage("Student enrolled in course successfully!");
      fetchData();
      setSelectedStudentCourse("");
      setSelectedCourse("");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data || "Enrollment failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBatchSubmit = async () => {
    if (!selectedStudentBatch || !selectedBatch) return setError("Select student and batch");
    try {
      setLoading(true);
      await api.post("/admin/student-batch-mappings", null, {
        params: { studentId: selectedStudentBatch, batchId: selectedBatch }
      });
      setMessage("Batch allotted successfully!");
      fetchData();
      setSelectedStudentBatch("");
      setSelectedBatch("");
      setEnrolledCourses([]);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data || "Allotment failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredList = batchMappings.filter(item => 
    `${item.studentName} ${item.courseName} ${item.batchName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="etms-container">
      <div className="etms-layout">
        
        {/* LEFT PANEL: ASSIGNMENT FORMS */}
        <div className="etms-card form-card">
          <h2 className="etms-title">Student Management</h2>
          
          {message && <p className="msg-success"><FaCheckCircle /> {message}</p>}
          {error && <p className="msg-error"><FaInfoCircle /> {error}</p>}

          <div className="form-scroll-container">
            {/* STEP 1: ENROLLMENT */}
            <div className="form-section-box">
              <h4 className="section-subtitle"><FaBookOpen /> Step 1: Course Enrollment</h4>
              <div className="etms-group">
                <label>Select Student</label>
                <select value={selectedStudentCourse} onChange={(e) => setSelectedStudentCourse(e.target.value)}>
                  <option value="">-- Choose Student --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="etms-group">
                <label>Select Course</label>
                <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                  <option value="">-- Choose Course --</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.courseName}</option>)}
                </select>
              </div>
              <button className="btn-primary" onClick={handleCourseSubmit} disabled={loading}>
                <FaLink /> Link Course
              </button>
            </div>

           

            {/* STEP 2: BATCH ALLOTMENT */}
            <div className="form-section-box">
              <h4 className="section-subtitle"><FaLayerGroup /> Step 2: Batch Allotment</h4>
              <div className="etms-group">
                <label>Student</label>
                <select value={selectedStudentBatch} onChange={(e) => handleStudentSelectForBatch(e.target.value)}>
                  <option value="">-- Choose Student --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="etms-group">
                <label>Course (Must be enrolled)</label>
                <select 
                  value={selectedCourseForBatch} 
                  onChange={(e) => fetchActiveBatches(e.target.value)}
                  disabled={enrolledCourses.length === 0}
                >
                  <option value="">{enrolledCourses.length === 0 ? "Enroll in course first" : "-- Select Course --"}</option>
                  {enrolledCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="etms-group">
                <label>Active Batch</label>
                <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} disabled={batches.length === 0}>
                  <option value="">{batches.length === 0 ? "No Active Batches" : "-- Select Batch --"}</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.batchName}</option>)}
                </select>
              </div>
              
              <button className="btn-primary navy" onClick={handleBatchSubmit} disabled={!selectedBatch || loading}>
                 Assign Batch
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: CURRENT ASSIGNMENTS */}
        <div className="etms-card list-card">
          <div className="list-header">
            <h3>Current Assignments</h3>
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search by name, course, or batch..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="course-scroll">
            {filteredList.length > 0 ? (
              filteredList.map((item) => (
                <div key={item.mappingId} className="course-row">
                  <div className="row-content">
                    <div className="row-header">
                      <h4>{item.studentName}</h4>
                      <span className={`status-pill ${item.batchStatus?.toLowerCase()}`}>
                        {item.batchStatus}
                      </span>
                    </div>
                    <div className="assignment-details">
                      <p><strong><FaUserGraduate /> Email:</strong> {item.studentEmail}</p>
                      <p><strong><FaBookOpen /> Course:</strong> {item.courseName}</p>
                      <p><strong><FaLayerGroup /> Batch:</strong> {item.batchName}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <FaInfoCircle size={40} />
                <p>No assignments found.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default ManageStudents;