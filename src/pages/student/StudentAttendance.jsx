import React, { useEffect, useState } from "react";

import api from "../../api/axiosConfig";  
import { 
  FaCalendarCheck, 
  FaUserCheck, 
  FaUserTimes, 
  FaWalking, 
  FaPercentage, 
  FaSearch, 
  FaFilter 
} from "react-icons/fa";
import "./StudentAttendance.css";

function StudentAttendance() {
  const user = JSON.parse(localStorage.getItem("user"));
  const studentId = user?.id;
  const token = localStorage.getItem("token");

  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filter, setFilter] = useState({
    fromDate: "",
    toDate: "",
  });

  const [summary, setSummary] = useState({
    totalClasses: 0,
    presentCount: 0,
    absentCount: 0,
    leaveCount: 0,
    attendancePercentage: 0,
  });

  // Fetch courses on mount
  useEffect(() => {
    if (studentId) fetchStudentCourses();
  }, [studentId]);

  const fetchStudentCourses = async () => {
    try {
      const res = await api.get("/student/my-courses", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      const data = res.data;
      const uniqueCourses = [...new Map(data.map((item) => [item.id, item])).values()];

      setCourses(uniqueCourses);

      if (uniqueCourses.length > 0) {
        setSelectedCourse(uniqueCourses[0].id);
        const firstBatchList = data.filter((c) => c.id === uniqueCourses[0].id);
        setBatches(firstBatchList);
        setSelectedBatch(firstBatchList[0].batchId);
      }
    } catch (err) {
      console.error("Course fetch error:", err);
    }
  };

  // Update batches when course changes
  useEffect(() => {
    if (!selectedCourse) return;
    const filteredBatches = courses.filter((c) => c.id === Number(selectedCourse));
    setBatches(filteredBatches);
    if (filteredBatches.length > 0) {
      setSelectedBatch(filteredBatches[0].batchId);
    }
  }, [selectedCourse]);

  // Fetch data when batch or filter changes
  useEffect(() => {
    if (studentId && selectedBatch) fetchAttendanceData();
  }, [selectedBatch, filter]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      let url = `/student/attendance/details/${studentId}?batchId=${selectedBatch}`;
      if (filter.fromDate) url += `&from=${filter.fromDate}`;
      if (filter.toDate) url += `&to=${filter.toDate}`;

      const res = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      const data = res.data;
      setRecords(data);

      const total = data.length;
      const present = data.filter((r) => r.status === "PRESENT").length;
      const absent = data.filter((r) => r.status === "ABSENT").length;
      const leave = data.filter((r) => r.status === "LEAVE").length;
      
      // Percentage calculation: (Present + Leave) / Total
      const percentage = total > 0 ? Math.round(((present + leave) / total) * 100) : 0;

      setSummary({
        totalClasses: total,
        presentCount: present,
        absentCount: absent,
        leaveCount: leave,
        attendancePercentage: percentage,
      });
    } catch (err) {
      console.error("Attendance fetch error:", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="attendance-portal">
      <div className="portal-header">
        <div className="title-area">
          <h1>Attendance Dashboard</h1>
          <p>Review your academic presence and session logs</p>
        </div>
      </div>

      {/* FILTER SECTION */}
      <div className="filter-wrapper">
        <div className="filter-item">
          <label><FaSearch className="label-icon" /> Course</label>
          <select value={selectedCourse} onChange={(e) => setSelectedCourse(Number(e.target.value))}>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>{course.courseName}</option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label><FaFilter className="label-icon" /> Batch</label>
          <select value={selectedBatch} onChange={(e) => setSelectedBatch(Number(e.target.value))}>
            {batches.map((batch) => (
              <option key={batch.batchId} value={batch.batchId}>{batch.batchName}</option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label>From</label>
          <input type="date" value={filter.fromDate} onChange={(e) => setFilter({ ...filter, fromDate: e.target.value })} />
        </div>

        <div className="filter-item">
          <label>To</label>
          <input type="date" value={filter.toDate} onChange={(e) => setFilter({ ...filter, toDate: e.target.value })} />
        </div>
      </div>

      {/* SUMMARY GRID */}
      <div className="summary-grid">
        <div className="metric-card total">
          <FaCalendarCheck className="metric-icon" />
          <div className="metric-content">
            <h3>{summary.totalClasses}</h3>
            <p>Total Classes</p>
          </div>
        </div>

        <div className="metric-card present">
          <FaUserCheck className="metric-icon" />
          <div className="metric-content">
            <h3>{summary.presentCount}</h3>
            <p>Present</p>
          </div>
        </div>

        <div className="metric-card leave">
          <FaWalking className="metric-icon" />
          <div className="metric-content">
            <h3>{summary.leaveCount}</h3>
            <p>Leave</p>
          </div>
        </div>

        <div className="metric-card absent">
          <FaUserTimes className="metric-icon" />
          <div className="metric-content">
            <h3>{summary.absentCount}</h3>
            <p>Absent</p>
          </div>
        </div>

        <div className="metric-card percentage">
          <FaPercentage className="metric-icon" />
          <div className="metric-content">
            <h3>{summary.attendancePercentage}%</h3>
            <p>Attendance</p>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="table-wrapper">
        {loading ? (
          <div className="table-loader">Fetching attendance records...</div>
        ) : (
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Topic / Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map((r, idx) => (
                  <tr key={idx}>
                    <td className="date-col">{new Date(r.attendance_date).toLocaleDateString()}</td>
                    <td>{r.topic || "Regular Session"}</td>
                    <td>
                      <span className={`status-label ${r.status.toLowerCase()}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="no-data-msg">No attendance logs found for the selected criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default StudentAttendance;