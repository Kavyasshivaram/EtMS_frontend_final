import { useEffect, useState } from "react";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./AssignTrainer.css";

const API_BASE = "http://localhost:8080/api/admin";

function AssignTrainer() {
  const [trainers, setTrainers] = useState([]);
  const [search, setSearch] = useState("");
  const [showPasswordId, setShowPasswordId] = useState(null);
  const [editId, setEditId] = useState(null);

  const [newTrainer, setNewTrainer] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/all-trainers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrainers(res.data);
    } catch (err) {
      console.error("Error fetching trainers");
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!newTrainer.name.trim()) tempErrors.name = "Name is required";
    if (!/^[A-Za-z0-9+_.-]+@(.+)$/.test(newTrainer.email)) tempErrors.email = "Invalid email format";
    if (!/^[6-9]\d{9}$/.test(newTrainer.phone)) tempErrors.phone = "Enter valid 10-digit phone number";
    if (newTrainer.password.length < 6) tempErrors.password = "Password must be at least 6 characters";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = name === "phone" ? value.replace(/\D/g, "") : value;
    setNewTrainer(prev => ({ ...prev, [name]: updatedValue }));
  };

  const handleEdit = (trainer) => {
    setNewTrainer({
      name: trainer.name,
      email: trainer.email,
      phone: trainer.phone,
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
      if (editId) {
        await axios.put(`${API_BASE}/update-trainer/${editId}`, newTrainer, { 
            headers: { Authorization: `Bearer ${token}` } 
        });
        setMessage("Trainer updated successfully");
      } else {
        const res = await axios.post(`${API_BASE}/create-trainer`, newTrainer, { 
            headers: { Authorization: `Bearer ${token}` } 
        });
        setMessage(res.data.message);
      }
      resetForm();
      fetchTrainers();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const filtered = trainers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="assign-layout">
      {/* LEFT FORM SECTION */}
      <div className="assign-form">
        <h2>{editId ? "Edit Trainer" : "Create Trainer"}</h2>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label>Name</label>
          <input type="text" name="name" value={newTrainer.name} onChange={handleChange} placeholder="Enter name" />
          {errors.name && <small className="text-danger">{errors.name}</small>}
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={newTrainer.email} onChange={handleChange} placeholder="admin@gmail.com" />
          {errors.email && <small className="text-danger">{errors.email}</small>}
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input type="text" name="phone" maxLength="10" value={newTrainer.phone} onChange={handleChange} placeholder="Phone number" />
          {errors.phone && <small className="text-danger">{errors.phone}</small>}
        </div>

        <div className="form-group">
          <label>Password</label>
          <input type="password" name="password" value={newTrainer.password} onChange={handleChange} placeholder="..." />
          {errors.password && <small className="text-danger">{errors.password}</small>}
        </div>

        <div className="form-actions">
          <button className="assign-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : editId ? "Update Trainer" : "Create Trainer"}
          </button>
          {editId && <button className="cancel-btn" onClick={resetForm}>Cancel</button>}
        </div>
      </div>

      {/* RIGHT LIST SECTION */}
      <div className="assign-list">
        <div className="list-header">
          <h3>Registered Trainers</h3>
          <div className="search-box">
            <input type="text" placeholder="Search trainer..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="scroll-area">
          {filtered.map(t => (
            <div key={t.id} className="course-block">
              <div className="block-content">
                <h4>{t.name}</h4>
                <p><strong>Email:</strong> {t.email}</p>
                <p><strong>Phone:</strong> {t.phone}</p>
                <div className="password-row">
                  <span>{showPasswordId === t.id ? t.password : "••••••••"}</span>
                  <span className="eye-icon" onClick={() => setShowPasswordId(showPasswordId === t.id ? null : t.id)}>
                    {showPasswordId === t.id ? <FaEyeSlash size={14}/> : <FaEye size={14}/>}
                  </span>
                </div>
              </div>

              {/* FIXED ACTIONS GROUP */}
              <div className="status-action-group">
                <span className={`status-badge ${t.status?.toLowerCase()}`}>
                  {t.status}
                </span>
                <div className="action-icons">
                  <button className="edit-icon" onClick={() => handleEdit(t)}>✏️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AssignTrainer;