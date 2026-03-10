import { useEffect, useState } from "react";
import axios from "axios";
import "./CreateBatch.css";

const API_BASE = "http://localhost:8080/api/admin";

function CreateBatch() {
  const [batchName, setBatchName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [courseId, setCourseId] = useState("");
  const [trainerId, setTrainerId] = useState("");
  const [status, setStatus] = useState("ONGOING");
  
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCourses();
    fetchTrainers();
    fetchBatches();

    const handleBatchUpdate = () => {
      fetchBatches();
    };

    window.addEventListener("batchStatusUpdated", handleBatchUpdate);
    return () => {
      window.removeEventListener("batchStatusUpdated", handleBatchUpdate);
    };
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${API_BASE}/courses`, { headers: { Authorization: `Bearer ${token}` } });
      setCourses(res.data);
    } catch (err) { console.error("Failed to load courses."); }
  };

  const fetchTrainers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/trainers`, { headers: { Authorization: `Bearer ${token}` } });
      setTrainers(res.data);
    } catch (err) { console.error("Failed to load trainers."); }
  };

  const fetchBatches = async () => {
    try {
      const res = await axios.get(`${API_BASE}/batches`, { headers: { Authorization: `Bearer ${token}` } });
      setBatches(res.data);
    } catch (err) { console.error("Failed to load batches."); }
  };

  const resetForm = () => {
    setBatchName(""); setStartDate(""); setEndDate(""); setCourseId(""); setTrainerId("");
    setStatus("ONGOING"); setEditingId(null); setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!batchName || !startDate || !endDate || !courseId || !trainerId) return setError("Fill all fields.");
    setLoading(true); setMessage(""); setError("");

    const payload = { batchName, startDate, endDate, courseId, trainerId, status };
    try {
      if (editingId) {
        await axios.put(`${API_BASE}/batches/${editingId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        setMessage("Batch updated!");
      } else {
        await axios.post(`${API_BASE}/create-batch`, payload, { headers: { Authorization: `Bearer ${token}` } });
        setMessage("Batch created!");
      }
      resetForm(); fetchBatches();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) { setError("Save failed"); } 
    finally { setLoading(false); }
  };

  const handleEdit = (batch) => {
    setEditingId(batch.id);
    setBatchName(batch.batchName);
    setStartDate(batch.startDate);
    setEndDate(batch.endDate);
    setCourseId(batch.course?.id || "");
    setTrainerId(batch.trainer?.id || "");
    setStatus(batch.status || "ONGOING");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Mark as Inactive?")) return;
    try {
      await axios.delete(`${API_BASE}/batches/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchBatches();
    } catch (err) { alert("Delete failed"); }
  };

  const filteredBatches = batches.filter(b => 
    b.batchName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.course?.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.trainer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="assign-layout">
      <div className="assign-form">
        <h2>{editingId ? "Update Batch" : "Create Batch"}</h2>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label>Batch Name</label>
          <input type="text" value={batchName} onChange={(e) => setBatchName(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Course</label>
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            <option value="">-- Course --</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.courseName}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Trainer</label>
          <select value={trainerId} onChange={(e) => setTrainerId(e.target.value)}>
            <option value="">-- Trainer --</option>
            {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Start</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
          <div className="form-group"><label>End</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ONGOING">ONGOING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
        <button className="assign-btn" onClick={handleSubmit} disabled={loading}>{loading ? "Saving..." : "Save Batch"}</button>
        {editingId && <button className="cancel-btn" onClick={resetForm}>Cancel</button>}
      </div>

      <div className="assign-list">
        <div className="list-header">
          <h3>All Batches</h3>
          <div className="search-box">
            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div className="scroll-area">
          {filteredBatches.map(batch => (
            <div key={batch.id} className="course-block">
              <div className="header-flex">
                <h4>{batch.batchName}</h4>
                <span className={`status-badge ${batch.status?.toLowerCase()}`}>{batch.status}</span>
              </div>
              <p><strong>Course:</strong> {batch.course?.courseName}</p>
              <p><strong>Trainer:</strong> {batch.trainer?.name}</p>
              <p>📅 {batch.startDate} to {batch.endDate}</p>
              <div className="card-actions-row">
                <button className="edit-action-btn" onClick={() => handleEdit(batch)}>
                  ✏️ Edit
                </button>
                <button className="delete-action-btn" onClick={() => handleDelete(batch.id)}>
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CreateBatch;