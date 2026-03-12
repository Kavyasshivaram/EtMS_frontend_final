import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import {
  FaSave, FaSearch, FaBookReader, FaChartLine,
  FaFilter, FaUsers, FaCalendarAlt,
  FaHistory, FaEdit, FaArrowRight, FaEnvelope,
  FaChevronLeft, FaChevronRight
} from "react-icons/fa";
import "./TrainerAttendance.css";

function TrainerAttendance() {
  const user = JSON.parse(localStorage.getItem("user"));
  const trainerId = user?.id || 3;
  const trainerName = user?.name || "Rajesh Kumar";
  const today = new Date().toISOString().split("T")[0];

  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [topicTaught, setTopicTaught] = useState("");
  const [date, setDate] = useState(today);

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  const [viewMode, setViewMode] = useState("MARK");
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    if (trainerId) fetchActiveBatches();
  }, [trainerId]);

  useEffect(() => {
    if (viewMode === "MARK" && selectedBatch && date) {
      fetchBatchStudents();
    }
    setCurrentPage(1);
  }, [selectedBatch, date, viewMode]);

  const fetchActiveBatches = async () => {
    try {
      const res = await api.get(`/teacher/active-batches/${trainerId}`);
      setBatches(res.data);
    } catch (err) {
      console.error("Failed to fetch active batches", err);
    }
  };

  const fetchBatchStudents = async () => {
    setLoading(true);
    try {
      // First, check if attendance exists for this batch & date
      const res = await api.get(`/teacher/attendance/check?batchId=${selectedBatch}&date=${date}`);
      if (res.data && res.data.length > 0) {
        // Existing attendance found, enable edit
        const uniqueStudents = Array.from(new Map(res.data.map(s => [s.studentId, s])).values());
        setStudents(uniqueStudents.map(item => ({
          id: item.studentId,
          name: item.studentName || "Student",
          email: item.studentEmail || item.email || "N/A",
          status: item.status,
          attendanceId: item.id
        })));
        setTopicTaught(res.data[0].topic || "");
        setIsEditMode(true);
      } else {
        setIsEditMode(false);
        setTopicTaught("");
        // Fetch batch students
        const studentRes = await api.get(`/teacher/batches/${selectedBatch}/students`);
        const uniqueStudents = Array.from(new Map(studentRes.data.map(s => [s.id, s])).values());
        setStudents(uniqueStudents.map(s => ({
          ...s,
          email: s.email || "N/A",
          status: "PRESENT",
          attendanceId: null
        })));
      }
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const fetchAttendanceHistory = async () => {
    if (!selectedBatch) return alert("Please select a batch first.");
    if (fromDate > today || toDate > today) return alert("Future dates are not allowed for reports.");
    
    setLoading(true);
    try {
      const res = await api.get(`/teacher/attendance/history/${selectedBatch}?from=${fromDate}&to=${toDate}`);
      setAttendanceHistory(res.data.map(record => ({
        ...record,
        email: record.studentEmail || record.email || "N/A"
      })));
      setViewMode("HISTORY");
      setCurrentPage(1);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (date > today) return alert("Cannot mark attendance for future dates.");
    if (!selectedBatch || !topicTaught.trim()) return alert("Batch and Topic are required.");
    
    const payload = students.map(s => ({
      id: s.attendanceId,
      studentId: s.id,
      batchId: selectedBatch,
      attendanceDate: date,
      status: s.status,
      topic: topicTaught
    }));
    try {
      await api.post("/teacher/attendance/bulk", payload);
      alert(isEditMode ? "Records Updated ✅" : "Attendance Saved ✅");
      fetchBatchStudents();
    } catch (err) { alert("Save failed"); }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredData = viewMode === "MARK" 
    ? students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : attendanceHistory.filter(h => h.studentName.toLowerCase().includes(searchTerm.toLowerCase()));

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  return (
    <div className="attendance-page-wrapper">
      <div className="attendance-container">
        
        <header className="attendance-header-main">
          <div className="header-left">
            <h1 className="page-title">Session Roster</h1>
            <div className="trainer-info-tags">
              <span className="info-pill"><FaUsers /> {trainerName}</span>
              {isEditMode && <span className="info-pill revision">Revision Mode</span>}
            </div>
          </div>
          <div className="header-right">
            <div className="date-input-box">
              <FaCalendarAlt />
              <input type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} />
            </div>
            <button className={`save-btn ${isEditMode ? 'update' : ''}`} onClick={handleSave} disabled={viewMode === "HISTORY" || !selectedBatch}>
              <FaSave /> {isEditMode ? "Update Records" : "Commit Attendance"}
            </button>
          </div>
        </header>

        <div className="summary-section">
          <div className="summary-card stats-card">
            <div className="card-label"><FaChartLine /> Class Statistics & Bulk Actions</div>
            <div className="stats-row">
              <div className="stat-group total">
                <span className="val">{students.length}</span>
                <span className="lbl">Students</span>
              </div>
              <div className="vertical-divider"></div>
              <div className="bulk-control-item p">
                 <div className="count-display">{students.filter(s => s.status === 'PRESENT').length}</div>
                 <button className="bulk-trigger" onClick={() => setStudents(prev => prev.map(s => ({...s, status: 'PRESENT'})))}>Set All Present</button>
              </div>
              <div className="bulk-control-item a">
                 <div className="count-display">{students.filter(s => s.status === 'ABSENT').length}</div>
                 <button className="bulk-trigger" onClick={() => setStudents(prev => prev.map(s => ({...s, status: 'ABSENT'})))}>Set All Absent</button>
              </div>
              <div className="bulk-control-item l">
                 <div className="count-display">{students.filter(s => s.status === 'LEAVE').length}</div>
                 <button className="bulk-trigger" onClick={() => setStudents(prev => prev.map(s => ({...s, status: 'LEAVE'})))}>Set All Leave</button>
              </div>
            </div>
          </div>
          <div className="summary-card topic-card">
            <div className="card-label"><FaBookReader /> Learning Objective / Topic</div>
            <textarea 
              placeholder="e.g. Introduction to React Hooks..."
              value={topicTaught}
              onChange={(e) => setTopicTaught(e.target.value)}
              disabled={viewMode === "HISTORY"}
            />
          </div>
        </div>

        <div className="main-workspace">
          <aside className="control-panel">
            <div className="unified-card">
              <div className="card-section">
                <h3 className="section-title"><FaFilter /> Class Selection</h3>
                <div className="input-group">
                  <label>Active Batch</label>
                  <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
                    <option value="">Select Batch</option>
                    {batches.map(b => <option key={b.batchId} value={b.batchId}>{b.batchName}</option>)}
                  </select>
                </div>
              </div>
              <div className="divider-solid"></div>
              <div className="card-section">
                <h3 className="section-title"><FaHistory /> Attendance Archive</h3>
                <div className="date-range-inputs">
                  <div className="range-field">
                    <label>Start Date</label>
                    <input type="date" value={fromDate} max={today} onChange={(e) => setFromDate(e.target.value)} />
                  </div>
                  <div className="range-field">
                    <label>End Date</label>
                    <input type="date" value={toDate} max={today} onChange={(e) => setToDate(e.target.value)} />
                  </div>
                </div>
                <button className="history-fetch-btn" onClick={fetchAttendanceHistory}>Generate Report <FaArrowRight /></button>
              </div>
            </div>
          </aside>

          <main className="roster-area">
            <div className="tab-bar">
              <button className={viewMode === "MARK" ? "active" : ""} onClick={() => setViewMode("MARK")}><FaEdit /> Attendance Marking</button>
              <button className={viewMode === "HISTORY" ? "active" : ""} onClick={() => setViewMode("HISTORY")}><FaHistory /> Past Records</button>
              <div className="tab-search">
                <FaSearch />
                <input type="text" placeholder="Search by name..." value={searchTerm} onChange={handleSearch} />
              </div>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  {viewMode === "MARK" ? (
                    <tr>
                      <th>Student Details</th>
                      <th>Email Address</th>
                      <th className="center-text">Attendance Status</th>
                    </tr>
                  ) : (
                    <tr>
                      <th>Date</th>
                      <th>Student Name</th>
                      <th>Topic</th>
                      <th className="center-text">Status</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" className="loading-state">Loading records...</td></tr>
                  ) : currentRecords.length === 0 ? (
                    <tr><td colSpan="5" className="loading-state">No records found.</td></tr>
                  ) : (
                    currentRecords.map((item, i) => (
                      <tr key={indexOfFirstRecord + i}>
                        {viewMode === "MARK" ? (
                          <>
                            <td>
                              <div className="student-info">
                                <span className="avatar">{item.name.charAt(0)}</span>
                                <span className="name">{item.name}</span>
                              </div>
                            </td>
                            <td className="email-text"><FaEnvelope className="mail-icon"/>{item.email}</td>
                            <td>
                              <div className="status-label-group">
                                <button className={`label-btn p ${item.status === 'PRESENT' ? 'active' : ''}`} onClick={() => setStudents(prev => prev.map(s => s.id === item.id ? {...s, status: 'PRESENT'} : s))}>Present</button>
                                <button className={`label-btn a ${item.status === 'ABSENT' ? 'active' : ''}`} onClick={() => setStudents(prev => prev.map(s => s.id === item.id ? {...s, status: 'ABSENT'} : s))}>Absent</button>
                                <button className={`label-btn l ${item.status === 'LEAVE' ? 'active' : ''}`} onClick={() => setStudents(prev => prev.map(s => s.id === item.id ? {...s, status: 'LEAVE'} : s))}>Leave</button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>

                            <td className="date-col">{item.attendanceDate}</td>
                            <td className="name">{item.studentName}</td>
                            <td className="topic-text">{item.topic}</td>
                            <td className="center-text">
                              <span className={`status-text-badge ${item.status.toLowerCase()}`}>{item.status}</span>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading && totalPages > 1 && (
              <div className="pagination-wrapper">
                <div className="pagination-info">
                  Showing <b>{indexOfFirstRecord + 1}</b> to <b>{Math.min(indexOfLastRecord, filteredData.length)}</b> of <b>{filteredData.length}</b> records
                </div>
                <div className="pagination-btns">
                  <button 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="p-btn"
                  >
                    <FaChevronLeft /> Previous
                  </button>
                  <div className="page-numbers">
                    {[...Array(totalPages)].map((_, idx) => (
                      <button 
                        key={idx} 
                        className={`num-btn ${currentPage === idx + 1 ? 'active' : ''}`}
                        onClick={() => setCurrentPage(idx + 1)}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                  <button 
                    disabled={currentPage === totalPages} 
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="p-btn"
                  >
                    Next <FaChevronRight />
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default TrainerAttendance;