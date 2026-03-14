import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import api from "../../api/axiosConfig";
import {
  FaEdit, FaTrashAlt, FaCalendarAlt, FaUserTie,
  FaSearch, FaChevronLeft, FaChevronRight, FaEnvelope,
  FaPlus, FaTimes, FaUsers, FaLink, FaCheckCircle,
  FaBan, FaPhoneAlt, FaEye, FaLayerGroup, FaIdBadge,
  FaUserGraduate, FaSave, FaExternalLinkAlt, FaSync
} from "react-icons/fa";
import "./CreateBatch.css";

/* ── Avatar colours ── */
const AVATAR_COLORS = [
  { bg: "#eff6ff", color: "#2563eb" },
  { bg: "#f5f3ff", color: "#7c3aed" },
  { bg: "#ecfdf5", color: "#059669" },
  { bg: "#fff7ed", color: "#ea580c" },
  { bg: "#fdf2f8", color: "#db2777" },
  { bg: "#f0fdf4", color: "#16a34a" },
];

/* ══════════════════════════════════════════════
   STUDENTS PANEL MODAL
   Shows all students mapped to a specific batch
   ══════════════════════════════════════════════ */
function StudentsModal({ batch, onClose }) {
  const overlayRef = useRef(null);
  const students   = batch.studentBatches?.filter(sb => sb.status === "ACTIVE" || !sb.status) || [];

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div
      className="cb-modal-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="cb-modal" role="dialog" aria-modal="true">

        {/* Header */}
        <div className="cb-modal__header">
          <div className="cb-modal__header-left">
            <div className="cb-modal__header-icon"><FaUserGraduate /></div>
            <div>
              <h2 className="cb-modal__title">Enrolled Students</h2>
              <p className="cb-modal__sub">{batch.batchName} · {students.length} student{students.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <button className="cb-modal__close" onClick={onClose} title="Close (Esc)"><FaTimes /></button>
        </div>

        {/* Body */}
        <div className="cb-modal__body">
          {students.length === 0 ? (
            <div className="cb-modal__empty">
              <FaUserGraduate className="cb-modal__empty-ico" />
              <p>No students assigned to this batch yet.</p>
            </div>
          ) : (
            <div className="cb-students-list">
              {students.map((sb, idx) => {
                const scheme = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                const stu    = sb.student;
                return (
                  <div key={sb.id || idx} className="cb-student-row">
                    <div
                      className="cb-student-avatar"
                      style={{ background: scheme.bg, color: scheme.color }}
                    >
                      {stu?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="cb-student-info">
                      <span className="cb-student-name">{stu?.name || "—"}</span>
                      <span className="cb-student-meta">
                        <FaEnvelope /> {stu?.email || "—"}
                      </span>
                      {stu?.phone && (
                        <span className="cb-student-meta">
                          <FaPhoneAlt /> {stu.phone}
                        </span>
                      )}
                    </div>
                    <span className="cb-student-id">ID #{stu?.id}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════ */
function CreateBatch() {
  /* ── Form state ── */
  const [batchName,    setBatchName]    = useState("");
  const [startDate,    setStartDate]    = useState("");
  const [endDate,      setEndDate]      = useState("");
  const [trainerId,    setTrainerId]    = useState("");
  const [status,       setStatus]       = useState("ONGOING");
  const [meetingLink,  setMeetingLink]  = useState("");

  /* ── Data state ── */
  const [batches,      setBatches]      = useState([]);
  const [trainers,     setTrainers]     = useState([]);

  /* ── UI state ── */
  const [searchTerm,   setSearchTerm]   = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [editingId,    setEditingId]    = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [refreshing,   setRefreshing]   = useState(false);
  const [message,      setMessage]      = useState("");
  const [error,        setError]        = useState("");
  const [currentPage,  setCurrentPage]  = useState(1);
  const [viewingBatch, setViewingBatch] = useState(null); // for students modal
  const [expandedBatch,setExpandedBatch]= useState(null); // inline expand

  const itemsPerPage = 5;
  const today        = new Date().toISOString().split("T")[0];
  const formRef      = useRef(null);

  useEffect(() => { fetchInitialData(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  /* ── Toast helper ── */
  const showMsg = (type, text) => {
    if (type === "success") { setMessage(text); setError(""); }
    else                    { setError(text);   setMessage(""); }
    setTimeout(() => { setMessage(""); setError(""); }, 3500);
  };

  const fetchInitialData = async () => {
    try {
      const [trainerRes, batchRes] = await Promise.all([
        api.get("/admin/trainers"),
        api.get("/admin/batches"),
      ]);
      setTrainers(trainerRes.data);
      setBatches(batchRes.data);
    } catch (err) { console.error("Failed to load initial data", err); }
  };

  const fetchBatches = async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await api.get("/admin/batches");
      setBatches(res.data);
    } catch (err) { console.error("Failed to load batches."); }
    finally { setRefreshing(false); }
  };

  const resetForm = () => {
    setBatchName(""); setStartDate(""); setEndDate("");
    setTrainerId(""); setStatus("ONGOING"); setMeetingLink("");
    setEditingId(null); setError(""); setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!batchName || !startDate || !endDate || !trainerId)
      return showMsg("error", "Please fill all required fields.");
    if (startDate < today) return showMsg("error", "Start date cannot be in the past.");
    if (endDate < startDate) return showMsg("error", "End date must be after start date.");

    setLoading(true);
    const payload = { batchName, startDate, endDate, trainerId, status, meetingLink };
    try {
      if (editingId) {
        await api.put(`/admin/batches/${editingId}`, payload);
        showMsg("success", "Batch updated successfully ✅");
      } else {
        await api.post("/admin/create-batch", payload);
        showMsg("success", "Batch created successfully ✅");
      }
      resetForm();
      fetchBatches(true);
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to save batch.");
    } finally { setLoading(false); }
  };

  const handleEdit = (batch) => {
    setEditingId(batch.id);
    setBatchName(batch.batchName);
    setStartDate(batch.startDate);
    setEndDate(batch.endDate);
    setTrainerId(batch.trainer?.id || "");
    setStatus(batch.status || "ONGOING");
    setMeetingLink(batch.meetingLink || "");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Mark this batch as Inactive?")) return;
    try {
      await api.delete(`/admin/batches/${id}`);
      fetchBatches(true);
      showMsg("success", "Batch marked as Inactive.");
    } catch { showMsg("error", "Failed to deactivate batch."); }
  };

  /* ── Filtered + paginated batches ── */
  const filtered = batches.filter(b => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || b.batchName?.toLowerCase().includes(q)
      || b.trainer?.name?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages    = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated     = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  /* ── Status meta ── */
  const statusMeta = {
    ONGOING:   { label: "Ongoing",   cls: "cb-tag--ongoing"   },
    COMPLETED: { label: "Completed", cls: "cb-tag--completed" },
    INACTIVE:  { label: "Inactive",  cls: "cb-tag--inactive"  },
  };

  const counts = {
    ALL:       batches.length,
    ONGOING:   batches.filter(b => b.status === "ONGOING").length,
    COMPLETED: batches.filter(b => b.status === "COMPLETED").length,
    INACTIVE:  batches.filter(b => b.status === "INACTIVE").length,
  };

  return (
    <div className="cb-page">

      {/* Students Modal */}
      {viewingBatch && (
        <StudentsModal batch={viewingBatch} onClose={() => setViewingBatch(null)} />
      )}

      {/* ── Page header ── */}
      <div className="cb-page-header">
        <div className="cb-page-header__left">
          <div className="cb-page-header__icon"><FaLayerGroup /></div>
          <div>
            <h1 className="cb-page-header__title">Batch Management</h1>
            <p className="cb-page-header__sub">Create, manage and monitor all training batches</p>
          </div>
        </div>
        <div className="cb-page-header__stats">
          <div className="cb-stat-pill">
            <span className="cb-stat-pill__num">{counts.ALL}</span>
            <span className="cb-stat-pill__lbl">Total</span>
          </div>
          <div className="cb-stat-pill cb-stat-pill--green">
            <span className="cb-stat-pill__num">{counts.ONGOING}</span>
            <span className="cb-stat-pill__lbl">Ongoing</span>
          </div>
          <div className="cb-stat-pill cb-stat-pill--muted">
            <span className="cb-stat-pill__num">{counts.COMPLETED}</span>
            <span className="cb-stat-pill__lbl">Completed</span>
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="cb-layout">

        {/* ═══════════════════════════
            LEFT — CREATE / EDIT FORM
            ═══════════════════════════ */}
        <aside className="cb-form-card" ref={formRef}>
          <div className="cb-form-card__header">
            <div className="cb-form-card__header-left">
              <div className={`cb-form-card__header-icon ${editingId ? "cb-form-card__header-icon--edit" : ""}`}>
                {editingId ? <FaEdit /> : <FaPlus />}
              </div>
              <div>
                <h2 className="cb-form-card__title">
                  {editingId ? "Update Batch" : "Create New Batch"}
                </h2>
                <p className="cb-form-card__sub">
                  {editingId ? "Modify batch details below" : "Fill in the details to create a batch"}
                </p>
              </div>
            </div>
            {editingId && (
              <button className="cb-cancel-icon-btn" onClick={resetForm} title="Cancel editing">
                <FaTimes />
              </button>
            )}
          </div>

          <form className="cb-form" onSubmit={handleSubmit}>

            {message && (
              <div className="cb-alert cb-alert--success">
                <FaCheckCircle /> {message}
              </div>
            )}
            {error && (
              <div className="cb-alert cb-alert--error">
                <FaBan /> {error}
              </div>
            )}

            <div className="cb-field">
              <label className="cb-label">Batch Name <span className="cb-req">*</span></label>
              <input
                className="cb-input"
                type="text"
                placeholder="e.g. Java Fullstack — Batch A"
                value={batchName}
                onChange={e => setBatchName(e.target.value)}
              />
            </div>

            <div className="cb-field">
              <label className="cb-label">Trainer <span className="cb-req">*</span></label>
              <div className="cb-select-wrap">
                <select className="cb-select" value={trainerId} onChange={e => setTrainerId(e.target.value)}>
                  <option value="">— Select Trainer —</option>
                  {trainers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                  ))}
                </select>
                <FaUserTie className="cb-select-ico" />
              </div>
            </div>

            <div className="cb-field-row">
              <div className="cb-field">
                <label className="cb-label">Start Date <span className="cb-req">*</span></label>
                <div className="cb-input-wrap">
                  <input className="cb-input" type="date" value={startDate} min={today}
                    onChange={e => setStartDate(e.target.value)} />
                  <FaCalendarAlt className="cb-input-ico" />
                </div>
              </div>
              <div className="cb-field">
                <label className="cb-label">End Date <span className="cb-req">*</span></label>
                <div className="cb-input-wrap">
                  <input className="cb-input" type="date" value={endDate} min={startDate || today}
                    onChange={e => setEndDate(e.target.value)} />
                  <FaCalendarAlt className="cb-input-ico" />
                </div>
              </div>
            </div>

            <div className="cb-field">
              <label className="cb-label">Meeting Link</label>
              <div className="cb-input-wrap">
                <input className="cb-input" type="url"
                  placeholder="https://meet.google.com/xyz-abc"
                  value={meetingLink} onChange={e => setMeetingLink(e.target.value)} />
                <FaLink className="cb-input-ico" />
              </div>
            </div>

            <div className="cb-field">
              <label className="cb-label">Status</label>
              <div className="cb-select-wrap">
                <select className="cb-select" value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <div className="cb-form-actions">
              <button type="submit" className="cb-btn-primary" disabled={loading}>
                {loading
                  ? <><div className="cb-btn-spinner" /> Processing…</>
                  : editingId
                    ? <><FaSave /> Update Batch</>
                    : <><FaPlus /> Create Batch</>
                }
              </button>
              {editingId && (
                <button type="button" className="cb-btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </aside>

        {/* ═══════════════════════════
            RIGHT — BATCH DIRECTORY
            ═══════════════════════════ */}
        <section className="cb-directory">

          {/* Directory header */}
          <div className="cb-directory__header">
            <div className="cb-directory__header-top">
              <div>
                <h3 className="cb-directory__title">Batch Directory</h3>
                <p className="cb-directory__sub">{filtered.length} batch{filtered.length !== 1 ? "es" : ""} found</p>
              </div>
              <button
                className={`cb-refresh-btn ${refreshing ? "cb-refresh-btn--spin" : ""}`}
                onClick={() => fetchBatches(false)}
                title="Refresh"
              >
                <FaSync />
              </button>
            </div>

            {/* Filter tabs */}
            <div className="cb-filter-tabs">
              {["ALL", "ONGOING", "COMPLETED", "INACTIVE"].map(s => (
                <button
                  key={s}
                  className={`cb-ftab ${statusFilter === s ? "cb-ftab--active" : ""}`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                  <span className="cb-ftab-count">{counts[s]}</span>
                </button>
              ))}
            </div>

            {/* Search + Pagination row */}
            <div className="cb-search-pag-row">
              <div className="cb-search">
                <FaSearch className="cb-search__ico" />
                <input
                  className="cb-search__input"
                  type="text"
                  placeholder="Search by name or trainer…"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="cb-search__clear" onClick={() => setSearchTerm("")}>
                    <FaTimes />
                  </button>
                )}
              </div>

              {totalPages > 1 && (
                <div className="cb-header-pagination">
                  <span className="cb-pagination__info">
                    {currentPage} / {totalPages}
                  </span>
                  <div className="cb-pagination__btns">
                    <button
                      className="cb-pag-btn"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                    >
                      <FaChevronLeft />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        className={`cb-pag-btn cb-pag-btn--num ${currentPage === p ? "cb-pag-btn--active" : ""}`}
                        onClick={() => setCurrentPage(p)}
                      >{p}</button>
                    ))}
                    <button
                      className="cb-pag-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Batch list */}
          <div className="cb-batch-list">
            {paginated.length === 0 ? (
              <div className="cb-empty">
                <FaLayerGroup className="cb-empty__ico" />
                <p>No batches found.</p>
                {searchTerm && <button className="cb-empty__clear" onClick={() => setSearchTerm("")}>Clear search</button>}
              </div>
            ) : (
              paginated.map(batch => {
                const meta       = statusMeta[batch.status] || statusMeta.ONGOING;
                const isExpanded = expandedBatch === batch.id;
                const students   = batch.studentBatches?.filter(sb => sb.status === "ACTIVE" || !sb.status) || [];
                const trainer    = batch.trainer;

                return (
                  <div
                    key={batch.id}
                    className={`cb-batch-card ${isExpanded ? "cb-batch-card--expanded" : ""} ${batch.status === "INACTIVE" ? "cb-batch-card--inactive" : ""}`}
                  >
                    {/* Card top */}
                    <div className="cb-batch-card__top">
                      <div className="cb-batch-card__left">
                        <div className="cb-batch-card__icon">
                          <FaLayerGroup />
                        </div>
                        <div>
                          <h4 className="cb-batch-card__name">{batch.batchName}</h4>
                          <span className="cb-batch-card__id">Batch #{batch.id}</span>
                        </div>
                      </div>
                      <div className="cb-batch-card__right">
                        <span className={`cb-tag ${meta.cls}`}>{meta.label}</span>
                        <button
                          className="cb-expand-btn"
                          onClick={() => setExpandedBatch(isExpanded ? null : batch.id)}
                          title={isExpanded ? "Collapse" : "Expand details"}
                        >
                          <FaChevronRight className={`cb-expand-ico ${isExpanded ? "cb-expand-ico--open" : ""}`} />
                        </button>
                      </div>
                    </div>

                    {/* Info row — always visible */}
                    <div className="cb-batch-card__info">
                      <div className="cb-info-chip">
                        <FaUserTie />
                        <span>{trainer?.name || "No Trainer"}</span>
                      </div>
                      <div className="cb-info-chip">
                        <FaCalendarAlt />
                        <span>{batch.startDate} → {batch.endDate}</span>
                      </div>
                      <div className="cb-info-chip">
                        <FaUsers />
                        <span>{students.length} student{students.length !== 1 ? "s" : ""}</span>
                      </div>
                      {batch.meetingLink && (
                        <a
                          href={batch.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cb-info-chip cb-info-chip--link"
                          onClick={e => e.stopPropagation()}
                        >
                          <FaExternalLinkAlt />
                          <span>Join Meeting</span>
                        </a>
                      )}
                    </div>

                    {/* Expanded detail panel */}
                    {isExpanded && (
                      <div className="cb-batch-card__detail">

                        {/* Trainer detail */}
                        <div className="cb-detail-section">
                          <h5 className="cb-detail-section__title">
                            <FaUserTie /> Trainer Details
                          </h5>
                          {trainer ? (
                            <div className="cb-trainer-row">
                              <div
                                className="cb-trainer-avatar"
                                style={{ background: "#eff6ff", color: "#2563eb" }}
                              >
                                {trainer.name?.charAt(0).toUpperCase()}
                              </div>
                              <div className="cb-trainer-info">
                                <span className="cb-trainer-name">{trainer.name}</span>
                                <span className="cb-trainer-email">
                                  <FaEnvelope /> {trainer.email}
                                </span>
                                {trainer.phone && (
                                  <span className="cb-trainer-email">
                                    <FaPhoneAlt /> {trainer.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <p className="cb-detail-empty">No trainer assigned.</p>
                          )}
                        </div>

                        {/* Students detail */}
                        <div className="cb-detail-section">
                          <h5 className="cb-detail-section__title">
                            <FaUserGraduate />
                            Enrolled Students
                            <span className="cb-detail-count">{students.length}</span>
                          </h5>

                          {students.length === 0 ? (
                            <p className="cb-detail-empty">No students assigned yet.</p>
                          ) : (
                            <div className="cb-students-mini">
                              {students.slice(0, 4).map((sb, i) => {
                                const s      = sb.student;
                                const scheme = AVATAR_COLORS[i % AVATAR_COLORS.length];
                                return (
                                  <div key={sb.id || i} className="cb-student-mini-row">
                                    <div
                                      className="cb-student-mini-avatar"
                                      style={{ background: scheme.bg, color: scheme.color }}
                                    >
                                      {s?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="cb-student-mini-info">
                                      <span className="cb-student-mini-name">{s?.name}</span>
                                      <span className="cb-student-mini-email">{s?.email}</span>
                                    </div>
                                    {s?.phone && (
                                      <span className="cb-student-mini-phone">
                                        <FaPhoneAlt /> {s.phone}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                              {students.length > 4 && (
                                <p className="cb-students-more">
                                  +{students.length - 4} more student{students.length - 4 !== 1 ? "s" : ""}
                                </p>
                              )}
                            </div>
                          )}

                          {students.length > 0 && (
                            <button
                              className="cb-view-all-btn"
                              onClick={() => setViewingBatch(batch)}
                            >
                              <FaEye /> View All Students
                            </button>
                          )}
                        </div>

                      </div>
                    )}

                    {/* Card actions */}
                    <div className="cb-batch-card__actions">
                      <button className="cb-act-btn cb-act-btn--edit" onClick={() => handleEdit(batch)}>
                        <FaEdit /> Edit
                      </button>
                      {students.length > 0 && (
                        <button className="cb-act-btn cb-act-btn--view" onClick={() => setViewingBatch(batch)}>
                          <FaUsers /> Students ({students.length})
                        </button>
                      )}
                      <button className="cb-act-btn cb-act-btn--delete" onClick={() => handleDelete(batch.id)}>
                        <FaTrashAlt /> Deactivate
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </section>
      </div>
    </div>
  );
}

export default CreateBatch;
