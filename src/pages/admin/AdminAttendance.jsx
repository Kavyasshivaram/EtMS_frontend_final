import { useState, useEffect } from "react";
import api from "../../api/axiosConfig";
import "./AdminAttendance.css";

function AdminAttendance() {
  const [batches, setBatches] = useState([]);
  const [records, setRecords] = useState([]);
  const [batchId, setBatchId] = useState("");
  const [date, setDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { loadBatches(); }, []);

  const loadBatches = async () => {
    const res = await api.get("/admin/batches", { headers });
    setBatches(res.data);
  };

  const fetchAttendance = async () => {
    if (!batchId) return alert("Select batch");
    setLoading(true);
    let url = `/admin/attendance/batch/${batchId}`;
    if (fromDate && toDate) url += `?fromDate=${fromDate}&toDate=${toDate}`;
    else if (date) url += `?date=${date}`;
    const res = await api.get(url, { headers });
    setRecords(res.data.map(r => ({ ...r, status: r.status || "ABSENT", topic: r.topic || "" })));
    setLoading(false);
  };

  const updateStatus = (id, status) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status, isModified: true } : r));
  };

  const saveUpdates = async () => {
    const modified = records.filter(r => r.isModified);
    if (modified.length === 0) return alert("No changes");
    const payload = modified.map(r => ({
      id: r.id || null,
      studentId: r.studentId,
      batchId: r.batchId,
      date: r.date,
      topic: r.topic || "",
      status: r.status || "ABSENT"
    }));
    await api.put("/admin/attendance/update", payload, { headers });
    alert("Attendance Updated");
    fetchAttendance();
  };

  const downloadCSV = () => {
    const header = ["Name", "Email", "Date", "Status", "Topic"];
    const rows = records.map(r => [r.studentName, r.studentEmail, r.date, r.status, r.topic]);
    const csv = [header, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "attendance.csv"; a.click();
  };

  const total = records.length;
  const present = records.filter(r => r.status === "PRESENT").length;
  const absent = records.filter(r => r.status === "ABSENT").length;
  const percentage = total ? Math.round((present / total) * 100) : 0;

  return (
    <div className="aa-page">

      <div className="aa-header">
        <h1>Attendance Management</h1>
        <p>View, edit and export student attendance records</p>
      </div>

      <div className="aa-card">

        {/* ── FILTERS ── */}
        <div className="aa-filters">
          <div className="aa-filter-group">
            <div className="aa-field">
              <label>Select Batch</label>
              <select value={batchId} onChange={e => setBatchId(e.target.value)}>
                <option value="">— Choose Batch —</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id}>{b.batchName}</option>
                ))}
              </select>
            </div>

            <div className="aa-field">
              <label>Date</label>
              <input type="date" value={date}
                onChange={e => { setDate(e.target.value); setFromDate(""); setToDate(""); }} />
            </div>

            <div className="aa-or">OR</div>

            <div className="aa-field">
              <label>From Date</label>
              <input type="date" value={fromDate}
                onChange={e => { setFromDate(e.target.value); setDate(""); }} />
            </div>

            <div className="aa-field">
              <label>To Date</label>
              <input type="date" value={toDate}
                onChange={e => { setToDate(e.target.value); setDate(""); }} />
            </div>
          </div>

          <button className="aa-fetch-btn" onClick={fetchAttendance}>
            Fetch Attendance
          </button>
        </div>

        {/* ── STATS ── */}
        {records.length > 0 && (
          <div className="aa-stats">
            <div className="aa-stat aa-stat--indigo">
              <div className="aa-stat__icon">👥</div>
              <div className="aa-stat__body">
                <div className="aa-stat__label">Total Students</div>
                <div className="aa-stat__val">{total}</div>
              </div>
            </div>
            <div className="aa-stat aa-stat--green">
              <div className="aa-stat__icon">✓</div>
              <div className="aa-stat__body">
                <div className="aa-stat__label">Present</div>
                <div className="aa-stat__val">{present}</div>
              </div>
            </div>
            <div className="aa-stat aa-stat--red">
              <div className="aa-stat__icon">✗</div>
              <div className="aa-stat__body">
                <div className="aa-stat__label">Absent</div>
                <div className="aa-stat__val">{absent}</div>
              </div>
            </div>
            <div className="aa-stat aa-stat--amber">
              <div className="aa-stat__icon">%</div>
              <div className="aa-stat__body">
                <div className="aa-stat__label">Attendance Rate</div>
                <div className="aa-stat__val">{percentage}%</div>
              </div>
            </div>
          </div>
        )}

        {/* ── TABLE ── */}
        <div className="aa-table-section">
          {loading ? (
            <div className="aa-empty">
              <div className="aa-spinner" />
              <p>Loading attendance data...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="aa-empty">
              <div className="aa-empty-icon">📋</div>
              <h3>No Records Found</h3>
              <p>Select a batch and date, then click Fetch Attendance</p>
            </div>
          ) : (
            <>
              <div className="aa-toolbar">
                <div className="aa-toolbar-left">
                  <h3>Attendance Records</h3>
                  <span className="aa-count-badge">{total} students</span>
                </div>
                <button className="aa-csv-btn" onClick={downloadCSV}>↓ Export CSV</button>
              </div>

              <div className="aa-table-wrap">
                <table className="aa-table">
                  <colgroup>
                    <col style={{ width: "44px" }} />
                    <col style={{ width: "160px" }} />
                    <col style={{ width: "200px" }} />
                    <col style={{ width: "108px" }} />
                    <col />
                    <col style={{ width: "108px" }} />
                    <col style={{ width: "128px" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Date</th>
                      <th>Topic</th>
                      <th className="th-center">Status</th>
                      <th className="th-center">Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r, i) => (
                      <tr key={r.id} className={r.isModified ? "row-modified" : ""}>
                        <td className="td-num">{i + 1}</td>
                        <td className="td-name">{r.studentName}</td>
                        <td className="td-email">{r.studentEmail}</td>
                        <td className="td-date">{r.date}</td>
                        <td className="td-topic">{r.topic || "—"}</td>
                        <td className="td-center">
                          <span className={`aa-badge aa-badge--${(r.status || "ABSENT").toLowerCase()}`}>
                            {r.status || "ABSENT"}
                          </span>
                        </td>
                        <td className="td-center">
                          <div className="aa-toggle">
                            <button
                              className={`aa-btn-p ${r.status === "PRESENT" ? "aa-btn-p--on" : ""}`}
                              onClick={() => updateStatus(r.id, "PRESENT")}
                              title="Mark Present"
                            >P</button>
                            <button
                              className={`aa-btn-a ${r.status === "ABSENT" ? "aa-btn-a--on" : ""}`}
                              onClick={() => updateStatus(r.id, "ABSENT")}
                              title="Mark Absent"
                            >A</button>
                            <button
                              className={`aa-btn-l ${r.status === "LEAVE" ? "aa-btn-l--on" : ""}`}
                              onClick={() => updateStatus(r.id, "LEAVE")}
                              title="Mark Leave"
                            >L</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="aa-footer">
                <span className="aa-unsaved">
                  {records.filter(r => r.isModified).length > 0
                    ? `⚠ ${records.filter(r => r.isModified).length} unsaved change(s)`
                    : ""}
                </span>
                <button className="aa-save-btn" onClick={saveUpdates}>
                  Save Changes
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminAttendance;
