import { useState } from "react";
import api from "../../api/axiosConfig";
import "./CreateUser.css";
import {
  FaUserPlus, FaShieldAlt, FaIdCard,
  FaLock, FaEnvelope, FaPhone, FaCheckCircle, FaTimesCircle,
  FaEye, FaEyeSlash
} from "react-icons/fa";

/* Role config */
const ROLES = [
  {
    value: "STUDENT",
    label: "Student",
    desc: "Learning access",
    icon: "🎓",
    color: "blue",
  },
  {
    value: "TRAINER",
    label: "Trainer",
    desc: "Instructive access",
    icon: "👨‍🏫",
    color: "green",
  },
  {
    value: "ADMIN",
    label: "Administrator",
    desc: "Operational access",
    icon: "🏫",
    color: "purple",
  },
  {
    value: "MARKETER",
    label: "Marketer",
    desc: "Expansion access",
    icon: "📣",
    color: "orange",
  },
];

export default function CreateUser() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    roleName: "STUDENT",
    studentId: "",
  });
  const [loading, setLoading]     = useState(false);
  const [message, setMessage]     = useState({ type: "", text: "" });
  const [showPass, setShowPass]   = useState(false);
  const [touched, setTouched]     = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage({ type: "", text: "" });
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const handleRoleSelect = async (role) => {
    setFormData({ ...formData, roleName: role, studentId: "" });
    if (role === "STUDENT") {
      try {
        const res = await api.get("/superadmin/users/get-next-id");
        if (res.data?.nextId) {
          setFormData(prev => ({ ...prev, roleName: role, studentId: res.data.nextId }));
        }
      } catch (err) {
        console.error("Failed to fetch next student ID:", err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await api.post("/superadmin/users/create", formData);
      setMessage({
        type: "success",
        text: `${ROLES.find(r => r.value === formData.roleName)?.label || formData.roleName} account created successfully!`,
      });
      setFormData({ name: "", email: "", password: "", phone: "", roleName: "STUDENT", studentId: "" });
      setTouched({});
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to create user. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = ROLES.find((r) => r.value === formData.roleName);

  /* Simple field validation */
  const errors = {
    name:     touched.name     && !formData.name.trim()   ? "Name is required" : "",
    email:    touched.email    && !/\S+@\S+\.\S+/.test(formData.email) ? "Valid email required" : "",
    password: touched.password && formData.password.length < 8 ? "Min 8 characters" : "",
  };

  return (
    <div className="cu-page">
      <div className="cu-wrapper">

        {/* ── LEFT PANEL ── */}
        <div className="cu-side">
          <div className="cu-side-brand">
            <span className="cu-side-et">Et</span><span className="cu-side-ms">MS</span>
          </div>
          <h2 className="cu-side-title">Create New User</h2>
          <p className="cu-side-desc">
            Register students, trainers, administrators, or marketers to the EtMS platform in seconds.
          </p>

          {/* Role Preview */}
          <div className="cu-side-role-preview">
            <div className={`cu-srp-icon ${selectedRole?.color}`}>{selectedRole?.icon}</div>
            <div className="cu-srp-info">
              <span className="cu-srp-label">Selected Role</span>
              <span className="cu-srp-name">{selectedRole?.label}</span>
              <span className="cu-srp-desc">{selectedRole?.desc}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="cu-side-stats">
            <div className="cu-ss-item">
              <span className="cu-ss-val">4</span>
              <span className="cu-ss-lbl">Role Types</span>
            </div>
            <div className="cu-ss-divider" />
            <div className="cu-ss-item">
              <span className="cu-ss-val">🔒</span>
              <span className="cu-ss-lbl">Secured Access</span>
            </div>
            <div className="cu-ss-divider" />
            <div className="cu-ss-item">
              <span className="cu-ss-val">⚡</span>
              <span className="cu-ss-lbl">Instant Setup</span>
            </div>
          </div>
        </div>

        {/* ── FORM PANEL ── */}
        <div className="cu-form-panel">

          {/* Header */}
          <div className="cu-form-header">
            <div className="cu-form-header-icon">
              <FaUserPlus />
            </div>
            <div>
              <h1 className="cu-form-title">Provision New User</h1>
              <p className="cu-form-subtitle">Fill in the details below to create a new account.</p>
            </div>
          </div>

          {/* Alert */}
          {message.text && (
            <div className={`cu-alert cu-alert--${message.type}`}>
              {message.type === "success"
                ? <FaCheckCircle className="cu-alert-icon" />
                : <FaTimesCircle className="cu-alert-icon" />
              }
              <span>{message.text}</span>
            </div>
          )}

          <form className="cu-form" onSubmit={handleSubmit} noValidate>

            {/* Role Selector */}
            <div className="cu-section-label">Select Role</div>
            <div className="cu-role-grid">
              {ROLES.map((role) => (
                <button
                  type="button"
                  key={role.value}
                  className={`cu-role-card ${formData.roleName === role.value ? "selected" : ""} ${role.color}`}
                  onClick={() => handleRoleSelect(role.value)}
                >
                  <span className="cu-rc-icon">{role.icon}</span>
                  <span className="cu-rc-label">{role.label}</span>
                  <span className="cu-rc-desc">{role.desc}</span>
                  {formData.roleName === role.value && (
                    <span className="cu-rc-check">✓</span>
                  )}
                </button>
              ))}
            </div>

            {/* Full Name */}
            <div className="cu-section-label">Account Details</div>
            <div className="cu-field-row two">

              <div className={`cu-field ${errors.name ? "has-error" : touched.name && formData.name ? "has-success" : ""}`}>
                <label className="cu-label">
                  <FaIdCard className="cu-label-icon" /> Full Name
                </label>
                <div className="cu-input-wrap">
                  <input
                    name="name"
                    type="text"
                    placeholder="e.g. Vinayaka Reddy"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    autoComplete="off"
                  />
                  {touched.name && formData.name && <span className="cu-valid-ic">✓</span>}
                </div>
                {errors.name && <span className="cu-error-msg">{errors.name}</span>}
              </div>

              <div className={`cu-field ${errors.email ? "has-error" : touched.email && !errors.email && formData.email ? "has-success" : ""}`}>
                <label className="cu-label">
                  <FaEnvelope className="cu-label-icon" /> Email Address
                </label>
                <div className="cu-input-wrap">
                  <input
                    name="email"
                    type="email"
                    placeholder="user@institution.com"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    autoComplete="off"
                  />
                  {touched.email && !errors.email && formData.email && (
                    <span className="cu-valid-ic">✓</span>
                  )}
                </div>
                {errors.email && <span className="cu-error-msg">{errors.email}</span>}
              </div>

            </div>

            {formData.roleName === "STUDENT" && (
              <div className="cu-field">
                <label className="cu-label">
                  <FaIdCard className="cu-label-icon" /> Student ID
                  <span className="cu-optional">Automatic if empty</span>
                </label>
                <div className="cu-input-wrap">
                  <input
                    name="studentId"
                    type="text"
                    placeholder="e.g. ETMS-ST-2024-0001"
                    value={formData.studentId}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                </div>
                <p className="cu-field-note">Leave empty to auto-generate based on current year and sequence.</p>
              </div>
            )}

            <div className="cu-field-row two">

              <div className={`cu-field ${errors.password ? "has-error" : touched.password && !errors.password && formData.password ? "has-success" : ""}`}>
                <label className="cu-label">
                  <FaLock className="cu-label-icon" /> Password
                </label>
                <div className="cu-input-wrap">
                  <input
                    name="password"
                    type={showPass ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                  <button
                    type="button"
                    className="cu-toggle-pass"
                    onClick={() => setShowPass(!showPass)}
                    tabIndex={-1}
                  >
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <span className="cu-error-msg">{errors.password}</span>}
                {formData.password && (
                  <div className="cu-pass-strength">
                    <div className={`cu-ps-bar ${formData.password.length >= 12 ? "strong" : formData.password.length >= 8 ? "medium" : "weak"}`} />
                    <span className="cu-ps-label">
                      {formData.password.length >= 12 ? "Strong" : formData.password.length >= 8 ? "Medium" : "Weak"}
                    </span>
                  </div>
                )}
              </div>

              <div className="cu-field">
                <label className="cu-label">
                  <FaPhone className="cu-label-icon" /> Phone Number
                  <span className="cu-optional">Optional</span>
                </label>
                <div className="cu-input-wrap">
                  <input
                    name="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                </div>
              </div>

            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`cu-submit ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="cu-spinner" />
                  Creating Account…
                </>
              ) : (
                <>
                  <FaUserPlus />
                  Create {selectedRole?.label} Account
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}