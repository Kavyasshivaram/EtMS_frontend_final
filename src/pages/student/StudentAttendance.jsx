import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import {
  FaCalendarCheck,
  FaUserCheck,
  FaUserTimes,
  FaWalking,
  FaFilter,
  FaDownload,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaHistory,
  FaRegCalendarAlt,
  FaLayerGroup,
  FaCheckCircle,
  FaTimesCircle,
  FaBed,
  FaTimes,
} from "react-icons/fa";
import "./StudentAttendance.css";

const PAGE_SIZE = 10;

/* ─────────────────────────────────────────────────────────────
   parseDate  — handles ALL formats the backend can send:
     "2026-03-12"              → plain ISO date string
     "2026-03-12 00:00:00.0"   → JdbcTemplate timestamp string
     "2026-03-12T00:00:00"     → ISO datetime string
     {year,month,day} object   → some JDBC drivers serialize LocalDate as JSON
   ───────────────────────────────────────────────────────────── */
function parseDate(raw) {
  if (!raw) return null;

  // Already a Date object
  if (raw instanceof Date) return isNaN(raw) ? null : raw;

  // Object like { year: 2026, monthValue: 3, dayOfMonth: 12 }
  if (typeof raw === "object") {
    const y = raw.year || raw.Year;
    const m = raw.monthValue || raw.month || raw.Month;
    const d = raw.dayOfMonth || raw.day || raw.Day;
    if (y && m && d) return new Date(y, m - 1, d);
    return null;
  }

  // String — strip everything after the first space (removes " 00:00:00.0")
  // then ensure we parse as local date, not UTC (append T00:00:00)
  const str = String(raw).trim();

  // Already "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, mo, d] = str.split("-").map(Number);
    return new Date(y, mo - 1, d);
  }

  // "YYYY-MM-DD HH:MM:SS" or "YYYY-MM-DD HH:MM:SS.S"
  if (/^\d{4}-\d{2}-\d{2}[\s]/.test(str)) {
    const datePart = str.split(" ")[0];
    const [y, mo, d] = datePart.split("-").map(Number);
    return new Date(y, mo - 1, d);
  }

  // "YYYY-MM-DDTHH:MM:SS"
  if (/^\d{4}-\d{2}-\d{2}T/.test(str)) {
    const datePart = str.split("T")[0];
    const [y, mo, d] = datePart.split("-").map(Number);
    return new Date(y, mo - 1, d);
  }

  // Fallback
  const d = new Date(str);
  return isNaN(d) ? null : d;
}

function formatDisplayDate(raw) {
  const d = parseDate(raw);
  if (!d) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function formatDayName(raw) {
  const d = parseDate(raw);
  if (!d) return "—";
  return d.toLocaleDateString("en-IN", { weekday: "long" });
}

/* ── FILTER MODE ENUM ── */
const FILTER_MODES = {
  ALL:    "ALL",
  SINGLE: "SINGLE",
  RANGE:  "RANGE",
};

function StudentAttendance() {
  const user      = JSON.parse(localStorage.getItem("user") || "{}");
  const studentId = user?.id;
  const token     = localStorage.getItem("token");

  const [batches, setBatches]             = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [records, setRecords]             = useState([]);
  const [loading, setLoading]             = useState(false);
  const [filterMode, setFilterMode]       = useState(FILTER_MODES.ALL);
  const [singleDate, setSingleDate]       = useState("");
  const [fromDate, setFromDate]           = useState("");
  const [toDate, setToDate]               = useState("");
  const [searchTerm, setSearchTerm]       = useState("");
  const [currentPage, setCurrentPage]     = useState(1);
  const [summary, setSummary]             = useState({
    totalClasses: 0, presentCount: 0,
    absentCount: 0, leaveCount: 0, attendancePercentage: 0,
  });

  /* ── fetch batches on mount ── */
  useEffect(() => { if (studentId) fetchStudentBatches(); }, [studentId]);

  const fetchStudentBatches = async () => {
    try {
      const res  = await api.get(`/student/my-batches`, {
        headers: { Authorization: `Bearer ${token}` }, withCredentials: true,
      });
      const data = res.data || [];
      setBatches(data);
      if (data.length > 0) setSelectedBatch(data[0].batchId);
    } catch (err) { console.error("Batch fetch error:", err); }
  };

  /* ── Auto-load ALL records whenever batch changes ── */
  useEffect(() => {
    if (studentId && selectedBatch) {
      setFilterMode(FILTER_MODES.ALL);
      setSingleDate("");
      setFromDate("");
      setToDate("");
      fetchAttendanceData({ batchId: selectedBatch });
    }
  }, [selectedBatch]);

  /* ── Core fetch — builds URL based on mode ── */
  const fetchAttendanceData = async ({ batchId, mode, single, from, to } = {}) => {
    const bid  = batchId  ?? selectedBatch;
    const m    = mode     ?? filterMode;
    const sd   = single   ?? singleDate;
    const fd   = from     ?? fromDate;
    const td   = to       ?? toDate;

    if (!bid) return;
    setLoading(true);
    setCurrentPage(1);

    try {
      let url = `/student/attendance/details/${studentId}?batchId=${bid}`;

      if (m === FILTER_MODES.SINGLE && sd) {
        // single date: send same value as both from and to
        url += `&from=${sd}&to=${sd}`;
      } else if (m === FILTER_MODES.RANGE && fd && td) {
        url += `&from=${fd}&to=${td}`;
      }
      // FILTER_MODES.ALL → no date params → backend returns everything

      const res  = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` }, withCredentials: true,
      });
      const data = res.data || [];
      setRecords(data);
      computeSummary(data);
    } catch (err) {
      console.error("Attendance fetch error:", err);
      setRecords([]);
    } finally { setLoading(false); }
  };

  const computeSummary = (data) => {
    const total   = data.length;
    const present = data.filter(r => r.status?.toUpperCase() === "PRESENT").length;
    const absent  = data.filter(r => r.status?.toUpperCase() === "ABSENT").length;
    const leave   = data.filter(r => r.status?.toUpperCase() === "LEAVE").length;
    const pct     = total > 0 ? Math.round(((present + leave) / total) * 100) : 0;
    setSummary({ totalClasses: total, presentCount: present,
                 absentCount: absent, leaveCount: leave, attendancePercentage: pct });
  };

  /* ── Apply filter button ── */
  const handleApplyFilter = () => {
    if (filterMode === FILTER_MODES.SINGLE && !singleDate) {
      alert("Please select a date.");
      return;
    }
    if (filterMode === FILTER_MODES.RANGE && (!fromDate || !toDate)) {
      alert("Please select both From and To dates.");
      return;
    }
    fetchAttendanceData({ mode: filterMode, single: singleDate, from: fromDate, to: toDate });
  };

  /* ── Clear all filters → reload all ── */
  const handleClear = () => {
    setFilterMode(FILTER_MODES.ALL);
    setSingleDate("");
    setFromDate("");
    setToDate("");
    setSearchTerm("");
    fetchAttendanceData({ mode: FILTER_MODES.ALL, single: "", from: "", to: "" });
  };

  /* ── CSV download ── */
  const handleDownload = async () => {
    try {
      let url = `/student/attendance/download/${studentId}?batchId=${selectedBatch}`;
      if (filterMode === FILTER_MODES.SINGLE && singleDate) {
        url += `&from=${singleDate}&to=${singleDate}`;
      } else if (filterMode === FILTER_MODES.RANGE && fromDate && toDate) {
        url += `&from=${fromDate}&to=${toDate}`;
      }
      const res  = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true, responseType: "blob",
      });
      const link    = document.createElement("a");
      link.href     = URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
      link.download = "attendance_report.csv";
      link.click();
    } catch (err) { console.error("Download error:", err); }
  };

  /* ── Search + paginate ── */
  const filtered = records.filter(r => {
    const topic   = (r.topic || "Regular Session").toLowerCase();
    const dateStr = formatDisplayDate(r.attendance_date).toLowerCase();
    const day     = formatDayName(r.attendance_date).toLowerCase();
    const q       = searchTerm.toLowerCase();
    return topic.includes(q) || dateStr.includes(q) || day.includes(q);
  });

  const totalPages     = Math.ceil(filtered.length / PAGE_SIZE);
  const idxFirst       = (currentPage - 1) * PAGE_SIZE;
  const idxLast        = idxFirst + PAGE_SIZE;
  const currentRecords = filtered.slice(idxFirst, idxLast);

  const getPageNums = () => {
    const pages = [];
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1))
        pages.push(p);
      else if ((p === 2 && currentPage > 3) || (p === totalPages - 1 && currentPage < totalPages - 2))
        pages.push("...");
    }
    return [...new Set(pages)];
  };

  /* ── SVG ring ── */
  const R        = 40;
  const circum   = 2 * Math.PI * R;
  const pct      = summary.attendancePercentage;
  const dash     = circum - (pct / 100) * circum;
  const pctColor = pct >= 75 ? "#16a34a" : pct >= 50 ? "#d97706" : "#dc2626";

  const batchName    = batches.find(b => b.batchId === selectedBatch)?.batchName || "—";
  const isFiltered   = filterMode !== FILTER_MODES.ALL;

  return (
    <div className="sa-page">

      {/* ══════════════════════════════════
          PAGE HEADER
          ══════════════════════════════════ */}
      <div className="sa-header">
        <div className="sa-header__left">
          <div className="sa-header__icon"><FaCalendarCheck /></div>
          <div>
            <h1 className="sa-header__title">Attendance Dashboard</h1>
            <div className="sa-header__sub">
              <span className="sa-batch-chip"><FaLayerGroup /> {batchName}</span>
              {isFiltered && (
                <span className="sa-filter-chip"><FaHistory /> Filtered View</span>
              )}
            </div>
          </div>
        </div>
        <button className="sa-dl-btn" onClick={handleDownload}>
          <FaDownload /> Download Report
        </button>
      </div>

      {/* ══════════════════════════════════
          STATS STRIP
          ══════════════════════════════════ */}
      <div className="sa-stats">
        <div className="sa-stat sa-stat--total">
          <div className="sa-stat__icon"><FaCalendarCheck /></div>
          <div className="sa-stat__body">
            <span className="sa-stat__val">{summary.totalClasses}</span>
            <span className="sa-stat__label">Total Classes</span>
          </div>
        </div>
        <div className="sa-stat sa-stat--present">
          <div className="sa-stat__icon"><FaUserCheck /></div>
          <div className="sa-stat__body">
            <span className="sa-stat__val">{summary.presentCount}</span>
            <span className="sa-stat__label">Present</span>
          </div>
        </div>
        <div className="sa-stat sa-stat--absent">
          <div className="sa-stat__icon"><FaUserTimes /></div>
          <div className="sa-stat__body">
            <span className="sa-stat__val">{summary.absentCount}</span>
            <span className="sa-stat__label">Absent</span>
          </div>
        </div>
        <div className="sa-stat sa-stat--leave">
          <div className="sa-stat__icon"><FaWalking /></div>
          <div className="sa-stat__body">
            <span className="sa-stat__val">{summary.leaveCount}</span>
            <span className="sa-stat__label">On Leave</span>
          </div>
        </div>

        {/* Attendance % ring + bar */}
        <div className="sa-stat sa-stat--pct">
          <div className="sa-ring-mini-wrap">
            <svg width="62" height="62" viewBox="0 0 100 100"
                 style={{ transform: "rotate(-90deg)" }}>
              <circle cx="50" cy="50" r={R} fill="none"
                      stroke="#e2e8f0" strokeWidth="12" />
              <circle cx="50" cy="50" r={R} fill="none"
                      stroke={pctColor} strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={circum}
                      strokeDashoffset={dash}
                      style={{ transition: "stroke-dashoffset .8s ease, stroke .4s" }} />
            </svg>
            <span className="sa-ring-mini-pct" style={{ color: pctColor }}>{pct}%</span>
          </div>
          <div className="sa-stat__body sa-stat__body--wide">
            <div className="sa-pct-row">
              <span className="sa-stat__label">Attendance Rate</span>
              <span className="sa-pct-val">{pct}%</span>
            </div>
            <div className="sa-pct-bar">
              <div className="sa-pct-bar__fill"
                   style={{ width: `${pct}%`, background: pctColor }} />
            </div>
            <p className="sa-pct-hint" style={{ color: pctColor }}>
              {pct >= 75 ? "✓ Good Standing"
               : pct >= 50 ? "⚠ Needs Improvement"
               : "✗ Critically Low"}
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════
          FILTER CONTROL BAR
          ══════════════════════════════════ */}
      <div className="sa-control-bar">

        {/* Batch */}
        <div className="sa-ctrl-group">
          <label className="sa-ctrl-label">
            <FaFilter className="sa-ctrl-ic" /> Batch
          </label>
          <div className="sa-sel-wrap">
            <select className="sa-select" value={selectedBatch}
                    onChange={e => setSelectedBatch(Number(e.target.value))}>
              {batches.map(b => (
                <option key={b.batchId} value={b.batchId}>{b.batchName}</option>
              ))}
            </select>
            <FaChevronDown className="sa-sel-arrow" />
          </div>
        </div>

        {/* Filter mode toggle */}
        <div className="sa-ctrl-group">
          <label className="sa-ctrl-label">
            <FaRegCalendarAlt className="sa-ctrl-ic" /> Filter Mode
          </label>
          <div className="sa-mode-toggle">
            <button
              className={`sa-mode-btn ${filterMode === FILTER_MODES.ALL ? "active" : ""}`}
              onClick={() => setFilterMode(FILTER_MODES.ALL)}
            >All</button>
            <button
              className={`sa-mode-btn ${filterMode === FILTER_MODES.SINGLE ? "active" : ""}`}
              onClick={() => setFilterMode(FILTER_MODES.SINGLE)}
            >Single Date</button>
            <button
              className={`sa-mode-btn ${filterMode === FILTER_MODES.RANGE ? "active" : ""}`}
              onClick={() => setFilterMode(FILTER_MODES.RANGE)}
            >Date Range</button>
          </div>
        </div>

        {/* Single date input */}
        {filterMode === FILTER_MODES.SINGLE && (
          <div className="sa-ctrl-group">
            <label className="sa-ctrl-label">
              <FaRegCalendarAlt className="sa-ctrl-ic" /> Date
            </label>
            <input className="sa-input" type="date" value={singleDate}
                   onChange={e => setSingleDate(e.target.value)} />
          </div>
        )}

        {/* Date range inputs */}
        {filterMode === FILTER_MODES.RANGE && (
          <>
            <div className="sa-ctrl-group">
              <label className="sa-ctrl-label">
                <FaRegCalendarAlt className="sa-ctrl-ic" /> From
              </label>
              <input className="sa-input" type="date" value={fromDate}
                     onChange={e => setFromDate(e.target.value)} />
            </div>
            <div className="sa-ctrl-group">
              <label className="sa-ctrl-label">
                <FaRegCalendarAlt className="sa-ctrl-ic" /> To
              </label>
              <input className="sa-input" type="date" value={toDate}
                     onChange={e => setToDate(e.target.value)} />
            </div>
          </>
        )}

        {/* Apply */}
        {filterMode !== FILTER_MODES.ALL && (
          <div className="sa-ctrl-group sa-ctrl-group--btn">
            <label className="sa-ctrl-label sa-ctrl-label--ghost">Apply</label>
            <button className="sa-apply-btn" onClick={handleApplyFilter}>
              <FaSearch /> Apply
            </button>
          </div>
        )}

        {/* Clear */}
        {isFiltered && (
          <div className="sa-ctrl-group sa-ctrl-group--btn">
            <label className="sa-ctrl-label sa-ctrl-label--ghost">Clear</label>
            <button className="sa-clear-btn" onClick={handleClear}>
              <FaTimes /> Clear
            </button>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════
          SESSION LOG TABLE
          ══════════════════════════════════ */}
      <div className="sa-roster">

        {/* Tab header */}
        <div className="sa-tab-bar">
          <span className="sa-tab-active">
            <FaHistory /> Session Log
          </span>
          <span className="sa-tab-sub">
            {isFiltered ? "Filtered records" : "All records"} for{" "}
            <strong>{batchName}</strong>
          </span>

          <div className="sa-search">
            <FaSearch className="sa-search__ic" />
            <input
              className="sa-search__input"
              type="text"
              placeholder="Search by topic, date, or day…"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
            {searchTerm && (
              <button className="sa-search__clear"
                      onClick={() => { setSearchTerm(""); setCurrentPage(1); }}>✕</button>
            )}
          </div>
        </div>

        {/* Pagination above table */}
        {!loading && totalPages > 1 && (
          <div className="sa-pagination">
            <span className="sa-pag-info">
              {idxFirst + 1}–{Math.min(idxLast, filtered.length)} of {filtered.length} records
            </span>
            <div className="sa-pag-controls">
              <button className="sa-pag-btn sa-pag-btn--nav"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}>
                <FaChevronLeft /> Prev
              </button>
              {getPageNums().map((p, i) =>
                p === "..." ? (
                  <span key={`e-${i}`} className="sa-pag-ellipsis">…</span>
                ) : (
                  <button key={p}
                          className={`sa-pag-btn ${currentPage === p ? "sa-pag-btn--active" : ""}`}
                          onClick={() => setCurrentPage(p)}>{p}</button>
                )
              )}
              <button className="sa-pag-btn sa-pag-btn--nav"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}>
                Next <FaChevronRight />
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th className="sa-th sa-th--num">#</th>
                <th className="sa-th">Date</th>
                <th className="sa-th">Day</th>
                <th className="sa-th">Topic / Session</th>
                <th className="sa-th sa-th--center">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="sa-td-state">
                    <div className="sa-loader">
                      <div className="sa-spinner" />
                      <span>Fetching attendance records…</span>
                    </div>
                  </td>
                </tr>
              ) : currentRecords.length === 0 ? (
                <tr>
                  <td colSpan="5" className="sa-td-state">
                    <div className="sa-empty">
                      <FaCalendarCheck className="sa-empty__ic" />
                      <span>No records found for the selected batch or filter.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                currentRecords.map((r, i) => {
                  const status  = r.status?.toUpperCase();
                  const rowNum  = idxFirst + i + 1;
                  const dateStr = formatDisplayDate(r.attendance_date);
                  const dayStr  = formatDayName(r.attendance_date);

                  return (
                    <tr key={i} className={`sa-row sa-row--${status?.toLowerCase()}`}>
                      <td className="sa-td sa-td--num">
                        <span className="sa-row-num">{rowNum}</span>
                      </td>
                      <td className="sa-td sa-td--date">
                        <span className="sa-date-val">
                          <FaRegCalendarAlt className="sa-date-ic" />
                          {dateStr}
                        </span>
                      </td>
                      <td className="sa-td sa-td--day">{dayStr}</td>
                      <td className="sa-td sa-td--topic">
                        {r.topic || <em className="sa-dim">Regular Session</em>}
                      </td>
                      <td className="sa-td sa-td--center">
                        <span className={`sa-badge sa-badge--${status?.toLowerCase()}`}>
                          {status === "PRESENT" && <FaCheckCircle />}
                          {status === "ABSENT"  && <FaTimesCircle />}
                          {status === "LEAVE"   && <FaBed />}
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="sa-table-footer">
            Showing {idxFirst + 1}–{Math.min(idxLast, filtered.length)} of{" "}
            {filtered.length} records
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentAttendance;
