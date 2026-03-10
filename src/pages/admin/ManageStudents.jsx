import { useEffect, useState } from "react";
import axios from "axios";
import "./ManageStudents.css";

const API_BASE = "http://localhost:8080/api/admin";

function ManageStudents() {
  const token = localStorage.getItem("token");
  const headers = { headers: { Authorization: `Bearer ${token}` } };

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [s, c, cm, bm] = await Promise.all([
        axios.get(`${API_BASE}/students`, headers),
        axios.get(`${API_BASE}/courses`, headers),
        axios.get(`${API_BASE}/student-course-mappings`, headers),
        axios.get(`${API_BASE}/student-batch-mappings`, headers)
      ]);
      setStudents(s.data);
      setCourses(c.data);
      setCourseMappings(cm.data);
      setBatchMappings(bm.data);
    } catch (err) { console.error(err); }
  };

  // Logic: When student is selected for batch, find courses they are enrolled in
  const handleStudentSelectForBatch = (studentId) => {
    setSelectedStudentBatch(studentId);
    setSelectedCourseForBatch("");
    setBatches([]);
    
    if (!studentId) {
      setEnrolledCourses([]);
      return;
    }

    // Filter course mappings for this student
    const studentEnrolled = courseMappings
      .filter(m => Number(m.studentId) === Number(studentId))
      .map(m => ({ id: m.courseId, name: m.courseName }));
    
    setEnrolledCourses(studentEnrolled);
  };

  const fetchActiveBatches = async (courseId) => {
    setSelectedCourseForBatch(courseId);
    if (!courseId) return setBatches([]);
    try {
      const res = await axios.get(`${API_BASE}/batches/course/${courseId}`, headers);
      // 🔥 Filter: Show only ONGOING/ACTIVE batches
      const activeOnly = res.data.filter(b => b.status === "ONGOING" || b.status === "ACTIVE");
      setBatches(activeOnly);
    } catch (err) { console.error(err); }
  };

  const handleCourseSubmit = async () => {
    if (!selectedStudentCourse || !selectedCourse) return alert("Select all fields");
    try {
      await axios.post(`${API_BASE}/student-course-mappings`, null, {
        ...headers, params: { studentId: selectedStudentCourse, courseId: selectedCourse }
      });
      alert("Enrolled successfully!");
      fetchData();
    } catch (err) { alert(err.response?.data || "Enrollment failed"); }
  };

  const handleBatchSubmit = async () => {
    if (!selectedStudentBatch || !selectedBatch) return alert("Select all fields");
    try {
      await axios.post(`${API_BASE}/student-batch-mappings`, null, {
        ...headers, params: { studentId: selectedStudentBatch, batchId: selectedBatch }
      });
      alert("Batch allotted successfully!");
      fetchData();
    } catch (err) { alert(err.response?.data || "Allotment failed"); }
  };

  const filteredList = batchMappings.filter(item => 
    `${item.studentName} ${item.courseName} ${item.batchName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="assign-layout">
      <div className="assign-form">
        <div className="form-scroll-container">
          
          <div className="form-section">
            <h3>Step 1: Student Enrollment</h3>
            <label>Student</label>
            <select value={selectedStudentCourse} onChange={(e) => setSelectedStudentCourse(e.target.value)}>
              <option value="">-- Select --</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <label>Course</label>
            <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
              <option value="">-- Select --</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.courseName}</option>)}
            </select>
            <button className="assign-btn" onClick={handleCourseSubmit}>Link Course</button>
          </div>

          <hr style={{margin: '20px 0', border: '0.5px solid #eee'}} />

          <div className="form-section">
            <h3>Step 2: Batch Allotment</h3>
            <label>Select Student</label>
            <select value={selectedStudentBatch} onChange={(e) => handleStudentSelectForBatch(e.target.value)}>
              <option value="">-- Select --</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            <label>Select Course (Enrollments only)</label>
            <select 
              value={selectedCourseForBatch} 
              onChange={(e) => fetchActiveBatches(e.target.value)}
              disabled={enrolledCourses.length === 0}
            >
              <option value="">{enrolledCourses.length === 0 ? "Enroll in course first" : "-- Select --"}</option>
              {enrolledCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <label>Select Active Batch</label>
            <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} disabled={batches.length === 0}>
              <option value="">{batches.length === 0 ? "No Active Batches" : "-- Select --"}</option>
              {batches.map(b => <option key={b.id} value={b.id}>{b.batchName}</option>)}
            </select>
            
            <button className="assign-btn" onClick={handleBatchSubmit} disabled={!selectedBatch}>Link Batch</button>
          </div>
        </div>
      </div>

      <div className="assign-list">
        <div className="list-header-row">
          <h3>Current Assignments</h3>
          <input className="list-search-input" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="scroll-area">
          {filteredList.map((item) => (
            <div key={item.mappingId} className="course-block">
              <div style={{display:'flex', justifyContent:'space-between'}}>
                 <h4>{item.studentName}</h4>
                 <span className="status-badge ongoing">{item.batchStatus}</span>
              </div>
              <p><strong>Email:</strong> {item.studentEmail}</p>
              <p><strong>Course:</strong> {item.courseName}</p>
              <p><strong>Batch:</strong> {item.batchName}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ManageStudents;