import React, { useState, useEffect } from "react";
import api from "../../api/axiosConfig";
//import axios from "axios";
import "./AdminAttendance.css";

const AdminAttendance = () => {
  const [activeTab, setActiveTab] = useState("mark");
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]); 
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    const res = await api.get(`/admin/courses`, { headers });
    setCourses(res.data);
  };

  const handleCourseChange = async (courseId) => {
    setSelectedCourse(courseId);
    setSelectedBatch("");
    setStudents([]);
    const res = await api.get(`/admin/batches/course/${courseId}`, { headers });
    setBatches(res.data);
  };

  const handleBatchSelection = async (batchId) => {
    setSelectedBatch(batchId);
    if (!batchId) return;
    
    setLoading(true);
    try {
      const res = await api.get(`/admin/attendance/students/${batchId}`, { headers });
      setStudents(res.data.map(s => ({ ...s, status: 'PRESENT' })));
    } catch (err) {
      console.error("Failed to fetch batch students");
    } finally {
      setLoading(false);
    }
  };

  const updateStudentStatus = (id, newStatus) => {
    setStudents(prev => prev.map(s => s.studentId === id ? { ...s, status: newStatus } : s));
  };

  const saveAttendance = async () => {
    if (students.length === 0) return alert("No students in this batch to mark.");
    
    setLoading(true);
    const payload = students.map(s => ({
      studentId: s.studentId,
      status: s.status,
      date: attendanceDate
    }));

    try {
      await api.post(`/admin/attendance/mark`, payload, { headers });
      alert("Success: Attendance stored in database.");
    } catch (e) {
      alert("Failed to save attendance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="attendance-page">
      <div className="attendance-card">
        <div className="card-header">
          <h1>Attendance Management</h1>
          <div className="tab-buttons">
            <button className={activeTab === 'mark' ? 'active' : ''} onClick={() => setActiveTab('mark')}>Mark Attendance</button>
            <button className={activeTab === 'view' ? 'active' : ''} onClick={() => setActiveTab('view')}>View Reports</button>
          </div>
        </div>

        <div className="filters-container">
          <div className="filter-item">
            <label>Course</label>
            <select value={selectedCourse} onChange={(e) => handleCourseChange(e.target.value)}>
              <option value="">-- Choose Course --</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.courseName}</option>)}
            </select>
          </div>

          <div className="filter-item">
            <label>Batch</label>
            <select value={selectedBatch} onChange={(e) => handleBatchSelection(e.target.value)} disabled={!selectedCourse}>
              <option value="">-- Choose Batch --</option>
              {batches.map(b => <option key={b.id} value={b.id}>{b.batchName}</option>)}
            </select>
          </div>

          <div className="filter-item">
            <label>Session Date</label>
            <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} />
          </div>
        </div>

        <div className="content-area">
          {loading ? <div className="loader">Loading Students...</div> : 
           students.length > 0 ? (
            <div className="attendance-table-wrapper">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th className="center">Attendance Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.studentId}>
                      <td>{s.studentName}</td>
                      <td className="email-cell">{s.email}</td>
                      <td className="center">
                        <div className="status-toggle">
                          <button 
                            className={`p-btn ${s.status === 'PRESENT' ? 'selected' : ''}`}
                            onClick={() => updateStudentStatus(s.studentId, 'PRESENT')}
                          >P</button>
                          <button 
                            className={`a-btn ${s.status === 'ABSENT' ? 'selected' : ''}`}
                            onClick={() => updateStudentStatus(s.studentId, 'ABSENT')}
                          >A</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="submit-attendance-btn" onClick={saveAttendance} disabled={loading}>
                {loading ? "Saving..." : "Submit Attendance"}
              </button>
            </div>
          ) : (
            <div className="empty-state">No students found mapped to this batch.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAttendance;