import { useEffect, useState } from "react";
import api from "../../api/axiosConfig"; 
import { 
  FaEdit, FaTrashAlt, FaCalendarAlt, FaUserTie, 
  FaBook, FaSearch, FaChevronLeft, FaChevronRight, FaEnvelope 
} from "react-icons/fa";
import "./CreateBatch.css";

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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; 

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Reset to first page whenever search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchInitialData = async () => {
    try {
      const [courseRes, trainerRes, batchRes] = await Promise.all([
        api.get("/admin/courses"),
        api.get("/admin/trainers"),
        api.get("/admin/batches")
      ]);
      setCourses(courseRes.data);
      setTrainers(trainerRes.data);
      setBatches(batchRes.data);
    } catch (err) {
      console.error("Failed to load initial data", err);
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await api.get("/admin/batches");
      setBatches(res.data);
    } catch (err) { console.error("Failed to load batches."); }
  };

  const resetForm = () => {
    setBatchName(""); setStartDate(""); setEndDate(""); setCourseId(""); setTrainerId("");
    setStatus("ONGOING"); setEditingId(null); setError(""); setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!batchName || !startDate || !endDate || !courseId || !trainerId) {
      return setError("Please fill all required fields.");
    }
    setLoading(true); setMessage(""); setError("");

    const payload = { batchName, startDate, endDate, courseId, trainerId, status };
    try {
      if (editingId) {
        await api.put(`/admin/batches/${editingId}`, payload);
        setMessage("Batch updated successfully!");
      } else {
        await api.post("/admin/create-batch", payload);
        setMessage("Batch created successfully!");
      }
      resetForm(); 
      fetchBatches();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) { 
      setError(err.response?.data?.message || "Failed to save batch."); 
    } finally { 
      setLoading(false); 
    }
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
    if (!window.confirm("Are you sure you want to remove this batch?")) return;
    try {
      await api.delete(`/admin/batches/${id}`);
      fetchBatches();
    } catch (err) { alert("Delete operation failed."); }
  };

  // PROPER SEARCH LOGIC: Filter by Name, Course, or Trainer
  const filteredBatches = batches.filter(b => {
    const search = searchTerm.toLowerCase();
    return (
      b.batchName?.toLowerCase().includes(search) ||
      b.course?.courseName?.toLowerCase().includes(search) ||
      b.trainer?.name?.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(filteredBatches.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBatches = filteredBatches.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="batch-page-container">
      <div className="batch-main-layout">
        
        {/* LEFT CARD: FORM */}
        <div className="left-form-card">
          <div className="form-header">
            <h2>{editingId ? "Update Batch" : "Create New Batch"}</h2>
            <p className="form-subtitle">Assign courses and trainers to schedules</p>
          </div>

          <form className="form-body" onSubmit={handleSubmit}>
            {message && <div className="batch-alert success">{message}</div>}
            {error && <div className="batch-alert error">{error}</div>}

            <div className="input-box">
              <label>Batch Name</label>
              <input 
                type="text" 
                placeholder="e.g. Java Fullstack - Jan" 
                value={batchName} 
                onChange={(e) => setBatchName(e.target.value)} 
              />
            </div>

            <div className="input-box">
              <label>Course</label>
              <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                <option value="">-- Select Course --</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.courseName}</option>)}
              </select>
            </div>

            <div className="input-box">
              <label>Trainer</label>
              <select value={trainerId} onChange={(e) => setTrainerId(e.target.value)}>
                <option value="">-- Select Trainer --</option>
                {trainers.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                ))}
              </select>
            </div>

            <div className="input-flex-row">
              <div className="input-box">
                <label>Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="input-box">
                <label>End Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="input-box">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="ONGOING">ONGOING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            <div className="form-footer">
              <button type="submit" className="btn-primary-batch" disabled={loading}>
                {loading ? "Processing..." : editingId ? "Update Batch" : "Save Batch"}
              </button>
              {editingId && (
                <button type="button" className="btn-cancel-batch" onClick={resetForm}>Cancel</button>
              )}
            </div>
          </form>
        </div>

        {/* RIGHT SECTION: DIRECTORY (STRICTLY NO SCROLL) */}
        <div className="right-directory-card">
          <div className="directory-header">
            <div className="header-text">
              <h3>Batch Directory</h3>
              <span className="entry-count">{filteredBatches.length} Total</span>
            </div>

            <div className="header-actions">
              <div className="search-bar">
                <FaSearch className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search by name, course..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </div>

              {totalPages > 1 && (
                <div className="pagination-controls">
                  <button disabled={currentPage === 1} onClick={() => paginate(currentPage - 1)}>
                    <FaChevronLeft />
                  </button>
                  <span className="page-indicator">{currentPage} of {totalPages}</span>
                  <button disabled={currentPage === totalPages} onClick={() => paginate(currentPage + 1)}>
                    <FaChevronRight />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="directory-list-static">
            {currentBatches.length > 0 ? (
              currentBatches.map(batch => (
                <div key={batch.id} className="batch-card-item">
                  <div className="card-top">
                    <h4>{batch.batchName}</h4>
                    <span className={`status-tag ${batch.status?.toLowerCase()}`}>{batch.status}</span>
                  </div>
                  
                  <div className="card-info-grid">
                    <div className="info-item"><FaBook /> {batch.course?.courseName}</div>
                    <div className="info-item"><FaUserTie /> {batch.trainer?.name}</div>
                    <div className="info-item"><FaCalendarAlt /> {batch.startDate} to {batch.endDate}</div>
                    <div className="info-item"><FaEnvelope /> <small>{batch.trainer?.email}</small></div>
                  </div>

                  <div className="card-actions">
                    <button onClick={() => handleEdit(batch)} className="edit-act"><FaEdit /> Edit</button>
                    <button onClick={() => handleDelete(batch.id)} className="delete-act"><FaTrashAlt /> Inactivate</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">No batches found matching your search.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default CreateBatch;