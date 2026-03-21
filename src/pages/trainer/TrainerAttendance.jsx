import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import {
  FaSave, FaSearch, FaBookReader, FaChartLine,
  FaFilter, FaUsers, FaCalendarAlt,
  FaHistory, FaEdit, FaArrowRight, FaEnvelope,
  FaChevronLeft, FaChevronRight, FaCheckCircle,
  FaTimesCircle, FaBed, FaLayerGroup, FaClock
} from "react-icons/fa";
import "./TrainerAttendance.css";

function TrainerAttendance() {
  const user        = JSON.parse(localStorage.getItem("user"));
  const trainerId   = user?.id || 3;
  const trainerName = user?.name || "Rajesh Kumar";
  const today       = new Date().toISOString().split("T")[0];

  const [batches,            setBatches]            = useState([]);
  const [selectedBatch,      setSelectedBatch]      = useState("");
  const [students,           setStudents]           = useState([]);
  const [searchTerm,         setSearchTerm]         = useState("");
  const [topicTaught,        setTopicTaught]        = useState("");
  const [date,               setDate]               = useState(today);
  const [fromDate,           setFromDate]           = useState(today);
  const [toDate,             setToDate]             = useState(today);
  const [viewMode,           setViewMode]           = useState("MARK");
  const [attendanceHistory,  setAttendanceHistory]  = useState([]);
  const [loading,            setLoading]            = useState(false);
  const [isEditMode,         setIsEditMode]         = useState(false);
  const [currentPage,        setCurrentPage]        = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    if (trainerId) fetchActiveBatches();
  }, [trainerId]);

  useEffect(() => {
    if (viewMode === "MARK" && selectedBatch && date) fetchBatchStudents();
    setCurrentPage(1);
  }, [selectedBatch, date, viewMode]);

  const fetchActiveBatches = async () => {
    try {
      const res = await api.get(`/teacher/active-batches/${trainerId}`);
      setBatches(res.data);
    } catch (err) { console.error("Failed to fetch active batches", err); }
  };

  const fetchBatchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/teacher/attendance/check?batchId=${selectedBatch}&date=${date}`);
      if (res.data && res.data.length > 0) {
        const uniqueStudents = Array.from(new Map(res.data.map(s => [s.studentId, s])).values());
        setStudents(uniqueStudents.map(item => ({
          id: item.studentId || item.id, name: item.studentName || "Student",
          email: item.studentEmail || item.email || "N/A",
          studentId: item.formattedId || item.studentId,
          status: item.status, attendanceId: item.id
        })));
        setTopicTaught(res.data[0].topic || "");
        setIsEditMode(true);
      } else {
        setIsEditMode(false);
        setTopicTaught("");
        const studentRes = await api.get(`/teacher/batches/${selectedBatch}/students`);
        const uniqueStudents = Array.from(new Map(studentRes.data.map(s => [s.id, s])).values());
        setStudents(uniqueStudents.map(s => ({
          ...s, email: s.email || "N/A", studentId: s.studentId, status: "PRESENT", attendanceId: null
        })));
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchAttendanceHistory = async () => {
    if (!selectedBatch) return alert("Please select a batch first.");
    if (fromDate > today || toDate > today) return alert("Future dates are not allowed for reports.");
    setLoading(true);
    try {
      const res = await api.get(`/teacher/attendance/history/${selectedBatch}?from=${fromDate}&to=${toDate}`);
      setAttendanceHistory(res.data.map(record => ({
        ...record, email: record.studentEmail || record.email || "N/A"
      })));
      setViewMode("HISTORY");
      setCurrentPage(1);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (date > today) return alert("Cannot mark attendance for future dates.");
    if (!selectedBatch || !topicTaught.trim()) return alert("Batch and Topic are required.");
    const payload = students.map(s => ({
      id: s.attendanceId, studentId: s.id, batchId: selectedBatch,
      attendanceDate: date, status: s.status, topic: topicTaught
    }));
    try {
      await api.post("/teacher/attendance/bulk", payload);
      alert(isEditMode ? "Records Updated ✅" : "Attendance Saved ✅");
      fetchBatchStudents();
    } catch (err) { alert("Save failed"); }
  };

  const handleSearch = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };

  const filteredData = viewMode === "MARK"
    ? students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : attendanceHistory.filter(h => h.studentName.toLowerCase().includes(searchTerm.toLowerCase()));

  const indexOfLastRecord  = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords     = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages         = Math.ceil(filteredData.length / recordsPerPage);

  /* Stats */
  const presentCount = students.filter(s => s.status === "PRESENT").length;
  const absentCount  = students.filter(s => s.status === "ABSENT").length;
  const leaveCount   = students.filter(s => s.status === "LEAVE").length;
  const lateCount    = students.filter(s => s.status === "LATE").length;
  const attendancePct = students.length > 0
    ? Math.round((presentCount / students.length) * 100) : 0;

  /* Avatar colour cycle */
  const AVATAR_COLORS = [
    { bg: "#eff6ff", color: "#2563eb" },
    { bg: "#f5f3ff", color: "#7c3aed" },
    { bg: "#ecfdf5", color: "#059669" },
    { bg: "#fff7ed", color: "#ea580c" },
    { bg: "#fdf2f8", color: "#db2777" },
    { bg: "#ecfeff", color: "#0891b2" },
  ];

  /* Pagination page numbers with ellipsis */
  const getPageNums = () => {
    const pages = [];
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
        pages.push(p);
      } else if (p === 2 && currentPage > 3) {
        pages.push("...");
      } else if (p === totalPages - 1 && currentPage < totalPages - 2) {
        pages.push("...");
      }
    }
    return [...new Set(pages)]; // dedupe ellipsis
  };

  return (
    <div className="ta-page">

      {/* ══════════ PAGE HEADER ══════════ */}
      <div className="ta-header">
        <div className="ta-header__left">
          <div className="ta-header__icon">📋</div>
          <div>
            <h1 className="ta-header__title">Attendance Management</h1>
            <p className="ta-header__sub">
              <span className="ta-trainer-chip"><FaUsers /> {trainerName}</span>
              {isEditMode && <span className="ta-revision-chip">✏️ Revision Mode</span>}
            </p>
          </div>
        </div>

        <div className="ta-header__right">
          {/* Date picker */}
          <div className="ta-date-box">
            <FaCalendarAlt className="ta-date-box__icon" />
            <input
              type="date"
              className="ta-date-box__input"
              value={date}
              max={today}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          {/* Save / Update */}
          <button
            className={`ta-save-btn ${isEditMode ? "ta-save-btn--update" : ""}`}
            onClick={handleSave}
            disabled={viewMode === "HISTORY" || !selectedBatch}
          >
            <FaSave />
            {isEditMode ? "Update Records" : "Commit Attendance"}
          </button>
        </div>
      </div>

      {/* ══════════ STATS STRIP ══════════ */}
      <div className="ta-stats">
        <div className="ta-stat ta-stat--total">
          <div className="ta-stat__icon"><FaUsers /></div>
          <div className="ta-stat__body">
            <span className="ta-stat__val">{students.length}</span>
            <span className="ta-stat__label">Total Students</span>
          </div>
        </div>
        <div className="ta-stat ta-stat--present">
          <div className="ta-stat__icon"><FaCheckCircle /></div>
          <div className="ta-stat__body">
            <span className="ta-stat__val">{presentCount}</span>
            <span className="ta-stat__label">Present</span>
          </div>
        </div>
        <div className="ta-stat ta-stat--absent">
          <div className="ta-stat__icon"><FaTimesCircle /></div>
          <div className="ta-stat__body">
            <span className="ta-stat__val">{absentCount}</span>
            <span className="ta-stat__label">Absent</span>
          </div>
        </div>
        <div className="ta-stat ta-stat--leave">
          <div className="ta-stat__icon"><FaBed /></div>
          <div className="ta-stat__body">
            <span className="ta-stat__val">{leaveCount}</span>
            <span className="ta-stat__label">On Leave</span>
          </div>
        </div>
        <div className="ta-stat ta-stat--late">
          <div className="ta-stat__icon"><FaClock /></div>
          <div className="ta-stat__body">
            <span className="ta-stat__val">{lateCount}</span>
            <span className="ta-stat__label">Late</span>
          </div>
        </div>

        {/* Attendance % bar */}
        <div className="ta-stat ta-stat--pct">
          <div className="ta-stat__body ta-stat__body--wide">
            <div className="ta-pct-row">
              <span className="ta-stat__label">Attendance Rate</span>
              <span className="ta-pct-val">{attendancePct}%</span>
            </div>
            <div className="ta-pct-bar">
              <div
                className="ta-pct-bar__fill"
                style={{
                  width: `${attendancePct}%`,
                  background: attendancePct >= 75 ? "#16a34a"
                            : attendancePct >= 50 ? "#d97706"
                            : "#dc2626"
                }}
              />
            </div>
          </div>
        </div>

        {/* Bulk actions */}
        {viewMode === "MARK" && students.length > 0 && (
          <div className="ta-bulk-actions">
            <span className="ta-bulk-actions__label">Bulk:</span>
            <button className="ta-bulk-btn ta-bulk-btn--present"
              onClick={() => setStudents(p => p.map(s => ({ ...s, status: "PRESENT" })))}>
              All Present
            </button>
            <button className="ta-bulk-btn ta-bulk-btn--absent"
              onClick={() => setStudents(p => p.map(s => ({ ...s, status: "ABSENT" })))}>
              All Absent
            </button>
            <button className="ta-bulk-btn ta-bulk-btn--leave"
              onClick={() => setStudents(p => p.map(s => ({ ...s, status: "LEAVE" })))}>
              All Leave
            </button>
            <button className="ta-bulk-btn ta-bulk-btn--late"
              onClick={() => setStudents(p => p.map(s => ({ ...s, status: "LATE" })))}>
              All Late
            </button>
          </div>
        )}
      </div>

      {/* ══════════ TOP CONTROL BAR ══════════ */}
      <div className="ta-control-bar">

        {/* Batch selection */}
        <div className="ta-ctrl-group">
          <label className="ta-ctrl-label">
            <FaFilter className="ta-ctrl-label__icon" /> Active Batch
          </label>
          <div className="ta-select-wrap">
            <select
              className="ta-select"
              value={selectedBatch}
              onChange={e => setSelectedBatch(e.target.value)}
            >
              <option value="">— Select Batch —</option>
              {batches.map(b => (
                <option key={b.batchId} value={b.batchId}>{b.batchName}</option>
              ))}
            </select>
            <span className="ta-select-arrow">▾</span>
          </div>
        </div>

        {/* Topic */}
        <div className="ta-ctrl-group ta-ctrl-group--topic">
          <label className="ta-ctrl-label">
            <FaBookReader className="ta-ctrl-label__icon" /> Learning Topic
          </label>
          <input
            className="ta-input ta-input--topic"
            type="text"
            placeholder="e.g. Introduction to React Hooks…"
            value={topicTaught}
            onChange={e => setTopicTaught(e.target.value)}
            disabled={viewMode === "HISTORY"}
          />
        </div>

        {/* Archive date range */}
        <div className="ta-ctrl-group">
          <label className="ta-ctrl-label">
            <FaHistory className="ta-ctrl-label__icon" /> From Date
          </label>
          <input
            className="ta-input"
            type="date"
            value={fromDate}
            max={today}
            onChange={e => setFromDate(e.target.value)}
          />
        </div>

        <div className="ta-ctrl-group">
          <label className="ta-ctrl-label">📅 To Date</label>
          <input
            className="ta-input"
            type="date"
            value={toDate}
            max={today}
            onChange={e => setToDate(e.target.value)}
          />
        </div>

        <div className="ta-ctrl-group ta-ctrl-group--btn">
          <label className="ta-ctrl-label ta-ctrl-label--invisible">Report</label>
          <button className="ta-report-btn" onClick={fetchAttendanceHistory}>
            <FaHistory /> Generate Report
          </button>
        </div>
      </div>

      {/* ══════════ ROSTER AREA (full width) ══════════ */}
      <div className="ta-layout">
        <div className="ta-roster">

          {/* Tab bar */}
          <div className="ta-tab-bar">
            <button
              className={`ta-tab ${viewMode === "MARK" ? "ta-tab--active" : ""}`}
              onClick={() => setViewMode("MARK")}
            >
              <FaEdit /> Attendance Marking
            </button>
            <button
              className={`ta-tab ${viewMode === "HISTORY" ? "ta-tab--active" : ""}`}
              onClick={() => setViewMode("HISTORY")}
            >
              <FaHistory /> Past Records
            </button>

            <div className="ta-search">
              <FaSearch className="ta-search__icon" />
              <input
                className="ta-search__input"
                type="text"
                placeholder="Search by name…"
                value={searchTerm}
                onChange={handleSearch}
              />
              {searchTerm && (
                <button className="ta-search__clear" onClick={() => { setSearchTerm(""); setCurrentPage(1); }}>✕</button>
              )}
            </div>
          </div>

          {/* Pagination — ABOVE the table */}
          {!loading && totalPages > 1 && (
            <div className="ta-pagination ta-pagination--top">
              <span className="ta-pag-info">
                {indexOfFirstRecord + 1}–{Math.min(indexOfLastRecord, filteredData.length)} of {filteredData.length}
              </span>

              <div className="ta-pag-controls">
                <button
                  className="ta-pag-btn ta-pag-btn--nav"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  <FaChevronLeft /> Prev
                </button>

                {getPageNums().map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="ta-pag-ellipsis">…</span>
                  ) : (
                    <button
                      key={p}
                      className={`ta-pag-btn ${currentPage === p ? "ta-pag-btn--active" : ""}`}
                      onClick={() => setCurrentPage(p)}
                    >{p}</button>
                  )
                )}

                <button
                  className="ta-pag-btn ta-pag-btn--nav"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Next <FaChevronRight />
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="ta-table-wrap">
            <table className="ta-table">
              <thead>
                <tr>
                  {viewMode === "MARK" ? (
                    <>
                      <th className="ta-th ta-th--num">#</th>
                      <th className="ta-th">Student ID</th>
                      <th className="ta-th">Student Name</th>
                      <th className="ta-th">Email</th>
                      <th className="ta-th ta-th--center">Status</th>
                    </>
                  ) : (
                    <>
                      <th className="ta-th">Date</th>
                      <th className="ta-th">Student ID</th>
                      <th className="ta-th">Student Name</th>
                      <th className="ta-th">Topic</th>
                      <th className="ta-th ta-th--center">Status</th>
                    </>
                  )}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="ta-td-state">
                      <div className="ta-loader">
                        <div className="ta-spinner" />
                        <span>Loading records…</span>
                      </div>
                    </td>
                  </tr>
                ) : currentRecords.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="ta-td-state">
                      <div className="ta-empty-state">
                        <span className="ta-empty-state__icon">📭</span>
                        <span>No records found.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentRecords.map((item, i) => {
                    const scheme = AVATAR_COLORS[(indexOfFirstRecord + i) % AVATAR_COLORS.length];
                    const rowNum = indexOfFirstRecord + i + 1;
                    return (
                      <tr key={indexOfFirstRecord + i} className="ta-row">
                        {viewMode === "MARK" ? (
                          <>
                            <td className="ta-td ta-td--num">
                              <span className="ta-row-num">{rowNum}</span>
                            </td>
                            <td className="ta-td ta-td--id">
                              <span className="ta-student-id">{item.studentId || "—"}</span>
                            </td>
                            <td className="ta-td">
                              <div className="ta-student">
                                <div
                                  className="ta-avatar"
                                  style={{ background: scheme.bg, color: scheme.color }}
                                >
                                  {item.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="ta-student__name">{item.name}</div>
                              </div>
                            </td>
                            <td className="ta-td">
                              <a href={`mailto:${item.email}`} className="ta-email-link">
                                <FaEnvelope className="ta-email-link__icon" />
                                {item.email}
                              </a>
                            </td>
                            <td className="ta-td ta-td--center">
                              <div className="ta-status-group">
                                <button
                                  className={`ta-status-btn ta-status-btn--present ${item.status === "PRESENT" ? "active" : ""}`}
                                  onClick={() => setStudents(prev => prev.map(s => s.id === item.id ? { ...s, status: "PRESENT" } : s))}
                                >
                                  <FaCheckCircle /> Present
                                </button>
                                <button
                                  className={`ta-status-btn ta-status-btn--absent ${item.status === "ABSENT" ? "active" : ""}`}
                                  onClick={() => setStudents(prev => prev.map(s => s.id === item.id ? { ...s, status: "ABSENT" } : s))}
                                >
                                  <FaTimesCircle /> Absent
                                </button>
                                <button
                                  className={`ta-status-btn ta-status-btn--leave ${item.status === "LEAVE" ? "active" : ""}`}
                                  onClick={() => setStudents(prev => prev.map(s => s.id === item.id ? { ...s, status: "LEAVE" } : s))}
                                >
                                  <FaBed /> Leave
                                </button>
                                <button
                                  className={`ta-status-btn ta-status-btn--late ${item.status === "LATE" ? "active" : ""}`}
                                  onClick={() => setStudents(prev => prev.map(s => s.id === item.id ? { ...s, status: "LATE" } : s))}
                                >
                                  <FaClock /> Late
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="ta-td ta-td--date">{item.attendanceDate}</td>
                            <td className="ta-td ta-td--id">
                              <span className="ta-student-id">{item.formattedId || item.studentId || "—"}</span>
                            </td>
                            <td className="ta-td">
                              <div className="ta-student">
                                <div
                                  className="ta-avatar"
                                  style={{ background: scheme.bg, color: scheme.color }}
                                >
                                  {(item.studentName || "?").charAt(0).toUpperCase()}
                                </div>
                                <span className="ta-student__name">{item.studentName}</span>
                              </div>
                            </td>
                            <td className="ta-td ta-td--topic">{item.topic}</td>
                            <td className="ta-td ta-td--center">
                              <span className={`ta-badge ta-badge--${(item.status || "").toLowerCase()}`}>
                                {item.status === "PRESENT" && <FaCheckCircle />}
                                {item.status === "ABSENT"  && <FaTimesCircle />}
                                {item.status === "LEAVE"   && <FaBed />}
                                {item.status === "LATE"    && <FaClock />}
                                {item.status}
                              </span>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrainerAttendance;
