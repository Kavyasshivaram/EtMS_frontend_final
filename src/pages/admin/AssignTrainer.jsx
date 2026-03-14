import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./AssignTrainer.css";

const PAGE_SIZE     = 5;
const AVATAR_COLORS = [
  { bg: "#eff6ff", color: "#2563eb" },
  { bg: "#f5f3ff", color: "#7c3aed" },
  { bg: "#ecfdf5", color: "#059669" },
  { bg: "#fff7ed", color: "#ea580c" },
  { bg: "#fdf2f8", color: "#db2777" },
  { bg: "#ecfeff", color: "#0891b2" },
];

function AssignTrainer() {
  const [trainers,        setTrainers]        = useState([]);
  const [search,          setSearch]          = useState("");
  const [showPasswordId,  setShowPasswordId]  = useState(null);
  const [editId,          setEditId]          = useState(null);
  const [currentPage,     setCurrentPage]     = useState(1);
  const [filterStatus,    setFilterStatus]    = useState("ALL");
  const [confirmInactive,  setConfirmInactive]  = useState(null); // trainer object pending confirm
  const [togglingId,       setTogglingId]       = useState(null);
  const [showFormPassword, setShowFormPassword] = useState(false); // eye toggle on form password field

  const [newTrainer, setNewTrainer] = useState({
    name: "", email: "", phone: "", password: ""
  });

  const [errors,  setErrors]  = useState({});
  const [message, setMessage] = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchTrainers(); }, []);

  // Reset page on search / filter change
  useEffect(() => { setCurrentPage(1); }, [search, filterStatus]);

  const fetchTrainers = async () => {
    try {
      const res = await api.get("/admin/all-trainers");
      setTrainers(res.data);
    } catch (err) {
      console.error("Error fetching trainers", err);
      setError("Failed to load trainers list.");
    }
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!newTrainer.name.trim())                             tempErrors.name     = "Name is required";
    if (!/^[A-Za-z0-9+_.-]+@(.+)$/.test(newTrainer.email)) tempErrors.email    = "Invalid email format";
    if (!/^[6-9]\d{9}$/.test(newTrainer.phone))             tempErrors.phone    = "Enter valid 10-digit phone number";
    if (newTrainer.password.length < 6)                     tempErrors.password = "Password must be at least 6 characters";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedValue = name === "phone" ? value.replace(/\D/g, "") : value;
    setNewTrainer(prev => ({ ...prev, [name]: updatedValue }));
  };

  const handleEdit = (trainer) => {
    setNewTrainer({
      name:     trainer.name,
      email:    trainer.email,
      phone:    trainer.phone,
      password: trainer.password
    });
    setEditId(trainer.id);
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setNewTrainer({ name: "", email: "", phone: "", password: "" });
    setEditId(null);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setLoading(true);
      setError("");
      if (editId) {
        await api.put(`/admin/update-trainer/${editId}`, newTrainer);
        setMessage("Trainer updated successfully");
      } else {
        const res = await api.post("/admin/create-trainer", newTrainer);
        setMessage(res.data.message || "Trainer created successfully");
      }
      resetForm();
      fetchTrainers();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong during the save process.");
    } finally {
      setLoading(false);
    }
  };

  /* Inactivate — uses /admin/inactivate-trainer/:id (soft, not delete) */
  const handleInactivate = async (trainer) => {
    setConfirmInactive(null);
    setTogglingId(trainer.id);
    try {
      await api.put(`/admin/inactivate-trainer/${trainer.id}`);
      setMessage(`${trainer.name} has been marked as Inactive.`);
      fetchTrainers();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to inactivate trainer.");
    } finally {
      setTogglingId(null);
    }
  };

  /* Reactivate — uses /admin/toggle-trainer-status/:id */
  const handleReactivate = async (trainer) => {
    setTogglingId(trainer.id);
    try {
      await api.put(`/admin/toggle-trainer-status/${trainer.id}`);
      setMessage(`${trainer.name} has been reactivated.`);
      fetchTrainers();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reactivate trainer.");
    } finally {
      setTogglingId(null);
    }
  };

  /* Derived list */
  const filtered = trainers.filter(t => {
    const matchesSearch = t.name?.toLowerCase().includes(search.toLowerCase());
    const statusLower   = (t.status || "active").toLowerCase();
    const matchesFilter =
      filterStatus === "ALL"      ? true :
      filterStatus === "ACTIVE"   ? statusLower === "active" :
      filterStatus === "INACTIVE" ? statusLower === "inactive" : true;
    return matchesSearch && matchesFilter;
  });

  const totalPages    = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedTrainers = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const activeCount   = trainers.filter(t => (t.status || "active").toLowerCase() === "active").length;
  const inactiveCount = trainers.filter(t => (t.status || "active").toLowerCase() === "inactive").length;

  return (
    <div className="at-page">

      {/* ══════ CONFIRM MODAL ══════ */}
      {confirmInactive && (
        <div className="at-modal-overlay" onClick={() => setConfirmInactive(null)}>
          <div className="at-modal" onClick={e => e.stopPropagation()}>
            <div className="at-modal__icon">🚫</div>
            <h3 className="at-modal__title">Inactivate Trainer?</h3>
            <p className="at-modal__body">
              <strong>{confirmInactive.name}</strong> will be marked as <em>Inactive</em> and
              will lose system access. This can be reversed at any time by clicking Reactivate.
            </p>
            <div className="at-modal__actions">
              <button className="at-modal__cancel" onClick={() => setConfirmInactive(null)}>
                Cancel
              </button>
              <button className="at-modal__confirm" onClick={() => handleInactivate(confirmInactive)}>
                Yes, Inactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ PAGE HEADER ══════ */}
      <div className="at-page-header">
        <div className="at-page-header__left">
          <div className="at-page-header__icon">🧑‍🏫</div>
          <div>
            <h1 className="at-page-header__title">Trainer Management</h1>
            <p className="at-page-header__sub">Create and manage your training faculty</p>
          </div>
        </div>
        <div className="at-page-header__stats">
          <div className="at-stat-pill at-stat-pill--blue">
            <span className="at-stat-pill__num">{trainers.length}</span>
            <span className="at-stat-pill__label">Total</span>
          </div>
          <div className="at-stat-pill at-stat-pill--green">
            <span className="at-stat-pill__num">{activeCount}</span>
            <span className="at-stat-pill__label">Active</span>
          </div>
          <div className="at-stat-pill at-stat-pill--amber">
            <span className="at-stat-pill__num">{inactiveCount}</span>
            <span className="at-stat-pill__label">Inactive</span>
          </div>
        </div>
      </div>

      <div className="at-layout">

        {/* ══════ LEFT — FORM ══════ */}
        <div className="at-form-panel">
          <div className="at-form-panel__head">
            <div className="at-form-panel__head-icon">{editId ? "✏️" : "➕"}</div>
            <div>
              <h2 className="at-form-panel__title">{editId ? "Edit Trainer" : "New Trainer"}</h2>
              <p className="at-form-panel__sub">
                {editId ? "Update the trainer's profile details" : "Fill in details to onboard a trainer"}
              </p>
            </div>
          </div>

          {message && (
            <div className="at-alert at-alert--success">
              <span className="at-alert__icon">✅</span><span>{message}</span>
            </div>
          )}
          {error && (
            <div className="at-alert at-alert--error">
              <span className="at-alert__icon">⚠️</span><span>{error}</span>
            </div>
          )}

          <div className="at-form">
            <div className="at-field">
              <label className="at-label"><span className="at-label__icon">👤</span>Full Name</label>
              <input
                className={`at-input ${errors.name ? "at-input--error" : ""}`}
                type="text" name="name" value={newTrainer.name}
                onChange={handleChange} placeholder="e.g. Rajesh Kumar"
              />
              {errors.name && <span className="at-error-hint">{errors.name}</span>}
            </div>

            <div className="at-field">
              <label className="at-label"><span className="at-label__icon">📧</span>Email Address</label>
              <input
                className={`at-input ${errors.email ? "at-input--error" : ""}`}
                type="email" name="email" value={newTrainer.email}
                onChange={handleChange} placeholder="trainer@example.com"
              />
              {errors.email && <span className="at-error-hint">{errors.email}</span>}
            </div>

            <div className="at-field">
              <label className="at-label"><span className="at-label__icon">📱</span>Phone Number</label>
              <input
                className={`at-input ${errors.phone ? "at-input--error" : ""}`}
                type="text" name="phone" maxLength="10"
                value={newTrainer.phone} onChange={handleChange}
                placeholder="10-digit mobile number"
              />
              {errors.phone && <span className="at-error-hint">{errors.phone}</span>}
            </div>

            <div className="at-field">
              <label className="at-label"><span className="at-label__icon">🔒</span>Password</label>
              <div className="at-input-wrap">
                <input
                  className={`at-input at-input--with-icon ${errors.password ? "at-input--error" : ""}`}
                  type={showFormPassword ? "text" : "password"}
                  name="password" value={newTrainer.password}
                  onChange={handleChange} placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  className="at-input-eye"
                  onClick={() => setShowFormPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showFormPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                </button>
              </div>
              {errors.password && <span className="at-error-hint">{errors.password}</span>}
            </div>

            <div className="at-form-actions">
              <button
                className={`at-btn-primary ${loading ? "at-btn-primary--loading" : ""}`}
                onClick={handleSubmit} disabled={loading}
              >
                {loading
                  ? <><span className="at-spinner" /> Saving…</>
                  : editId
                  ? <><span>💾</span> Update Trainer</>
                  : <><span>🚀</span> Create Trainer</>
                }
              </button>
              {editId && (
                <button className="at-btn-cancel" onClick={resetForm}>✕ Cancel</button>
              )}
            </div>
          </div>
        </div>

        {/* ══════ RIGHT — LIST ══════ */}
        <div className="at-list-panel">

          {/* List header */}
          <div className="at-list-header">
            <div className="at-list-header__left">
              <h3 className="at-list-title">Registered Trainers</h3>
              <span className="at-list-count">
                {filtered.length} trainer{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Filter tabs + Search */}
          <div className="at-toolbar">
            <div className="at-filter-tabs">
              {[
                { key: "ALL",      label: `All`,        count: trainers.length   },
                { key: "ACTIVE",   label: `Active`,     count: activeCount       },
                { key: "INACTIVE", label: `Inactive`,   count: inactiveCount     },
              ].map(f => (
                <button
                  key={f.key}
                  className={`at-filter-tab ${filterStatus === f.key ? `at-filter-tab--active-${f.key.toLowerCase()}` : ""}`}
                  onClick={() => setFilterStatus(f.key)}
                >
                  {f.label}
                  <span className="at-filter-tab__count">{f.count}</span>
                </button>
              ))}
            </div>

            <div className="at-search">
              <span className="at-search__icon">🔍</span>
              <input
                className="at-search__input"
                type="text"
                placeholder="Search by name…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="at-search__clear" onClick={() => setSearch("")}>✕</button>
              )}
            </div>
          </div>

          {/* ══════ PAGINATION ══════ */}
          {totalPages > 1 && (
            <div className="at-pagination">
              <button
                className="at-page-btn at-page-btn--nav"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >‹ Prev</button>

              <div className="at-page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
                  if (
                    p === 1 || p === totalPages ||
                    (p >= currentPage - 1 && p <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={p}
                        className={`at-page-btn ${currentPage === p ? "at-page-btn--active" : ""}`}
                        onClick={() => setCurrentPage(p)}
                      >{p}</button>
                    );
                  }
                  if (p === 2 && currentPage > 3)
                    return <span key="e1" className="at-page-ellipsis">…</span>;
                  if (p === totalPages - 1 && currentPage < totalPages - 2)
                    return <span key="e2" className="at-page-ellipsis">…</span>;
                  return null;
                })}
              </div>

              <button
                className="at-page-btn at-page-btn--nav"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >Next ›</button>

              <span className="at-page-info">
                {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)}
                <span className="at-page-info__sep">·</span>
                {filtered.length} total
              </span>
            </div>
          )}

          {/* Cards */}
          <div className="at-scroll-area">
            {pagedTrainers.length === 0 ? (
              <div className="at-empty">
                <div className="at-empty__icon">🧑‍🏫</div>
                <p className="at-empty__text">
                  {search
                    ? `No trainers match "${search}"`
                    : filterStatus !== "ALL"
                    ? `No ${filterStatus.toLowerCase()} trainers.`
                    : "No trainers registered yet."}
                </p>
              </div>
            ) : (
              pagedTrainers.map((t, idx) => {
                const globalIdx   = (currentPage - 1) * PAGE_SIZE + idx;
                const scheme      = AVATAR_COLORS[globalIdx % AVATAR_COLORS.length];
                const statusLower = (t.status || "active").toLowerCase();
                const isInactive  = statusLower === "inactive";
                const isToggling  = togglingId === t.id;

                return (
                  <div
                    key={t.id}
                    className={[
                      "at-trainer-card",
                      editId === t.id   ? "at-trainer-card--editing"  : "",
                      isInactive        ? "at-trainer-card--inactive" : "",
                    ].join(" ")}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    {/* Accent stripe */}
                    <div className={`at-trainer-card__stripe ${isInactive ? "at-trainer-card__stripe--inactive" : ""}`} />

                    <div className="at-trainer-card__body">

                      {/* Top row: avatar · name/status · action buttons */}
                      <div className="at-trainer-card__top">
                        <div
                          className="at-trainer-avatar"
                          style={{
                            background: isInactive ? "#f1f5f9" : scheme.bg,
                            color:      isInactive ? "#94a3b8" : scheme.color,
                          }}
                        >
                          {t.name?.charAt(0).toUpperCase()}
                        </div>

                        <div className="at-trainer-card__identity">
                          <h4 className="at-trainer-card__name">{t.name}</h4>
                          <span className={`at-status-badge at-status-badge--${statusLower}`}>
                            {isInactive ? "○ Inactive" : "● Active"}
                          </span>
                        </div>

                        <div className="at-trainer-card__actions">
                          {/* Edit — only when active */}
                          {!isInactive && (
                            <button
                              className="at-icon-btn at-icon-btn--edit"
                              title="Edit trainer"
                              onClick={() => handleEdit(t)}
                            >✏️</button>
                          )}

                          {/* Inactivate / Reactivate */}
                          {isInactive ? (
                            <button
                              className="at-icon-btn at-icon-btn--reactivate"
                              title="Reactivate trainer"
                              disabled={isToggling}
                              onClick={() => handleReactivate(t)}
                            >
                              {isToggling
                                ? <span className="at-spinner at-spinner--sm" />
                                : <span className="at-icon-btn__label">🔄 Reactivate</span>}
                            </button>
                          ) : (
                            <button
                              className="at-icon-btn at-icon-btn--deactivate"
                              title="Mark trainer as Inactive (resigned/left)"
                              disabled={isToggling}
                              onClick={() => setConfirmInactive(t)}
                            >
                              {isToggling
                                ? <span className="at-spinner at-spinner--sm" />
                                : <span className="at-icon-btn__label">🚫 Inactivate</span>}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Details row */}
                      <div className="at-trainer-card__details">
                        <div className="at-detail-row">
                          <span className="at-detail-row__icon">📧</span>
                          <a href={`mailto:${t.email}`} className="at-detail-link">{t.email}</a>
                        </div>
                        <div className="at-detail-row">
                          <span className="at-detail-row__icon">📱</span>
                          <a href={`tel:${t.phone}`} className="at-detail-link">{t.phone}</a>
                        </div>
                        <div className="at-detail-row">
                          <span className="at-detail-row__icon">🔒</span>
                          <div className="at-password-row">
                            <span className="at-password-row__val">
                              {showPasswordId === t.id ? t.password : "••••••••••"}
                            </span>
                            <button
                              className="at-eye-btn"
                              onClick={() =>
                                setShowPasswordId(showPasswordId === t.id ? null : t.id)
                              }
                            >
                              {showPasswordId === t.id
                                ? <FaEyeSlash size={13} />
                                : <FaEye size={13} />}
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default AssignTrainer;
