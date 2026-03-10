import { useState, useEffect, useRef } from "react";
import api from "../../api/axiosConfig";
import "./TrainerProfile.css";

function TrainerProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });
  const fileInputRef = useRef(null);

  const MALE_AVATAR = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
  const FEMALE_AVATAR = "https://cdn-icons-png.flaticon.com/512/3135/3135789.png";

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userEmail = storedUser?.email || "";

  // Synchronized with MySQL Schema
  const [trainer, setTrainer] = useState({
    name: "",
    email: userEmail,
    phone: "",
    gender: "",
    specialization: "",
    experience: "",
    qualification: "",
    bio: "",
    profilePic: "", // Maps to profile_pic LONGTEXT
    address: "",
    city: "",
    state: "",
    pincode: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/trainer/profile/${userEmail}`);
        if (res.data) setTrainer(res.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    if (userEmail) fetchProfile();
  }, [userEmail]);

  const calculateProgress = () => {
    const fields = [trainer.name, trainer.phone, trainer.gender, trainer.specialization, trainer.experience, trainer.address];
    const filled = fields.filter(f => f && f.toString().trim() !== "").length;
    return Math.round((filled / fields.length) * 100);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTrainer({ ...trainer, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 2 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => setTrainer({ ...trainer, profilePic: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      await api.put("/trainer/update-profile", trainer);
      setIsEditing(false);
      setStatusMsg({ type: "success", text: "Profile Updated Successfully ✅" });
    } catch (err) {
      console.error("Update Error:", err);
      setStatusMsg({ type: "error", text: "Update Failed ❌ Check Backend Connection" });
    }
    setTimeout(() => setStatusMsg({ type: "", text: "" }), 3000);
  };

  if (loading) return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p>Initializing Trainer Profile...</p>
    </div>
  );

  return (
    <div className="trainer-profile-container">
      <h2 className="profile-title">👤 Trainer Profile</h2>

      {statusMsg.text && (
        <div className={`status-toast ${statusMsg.type}`}>
          {statusMsg.text}
        </div>
      )}

      <div className="profile-card">
        {/* LEFT SIDEBAR: IDENTITY */}
        <div className="profile-left">
          <div className="avatar-uploader">
            <div 
              className={`avatar-frame ${isEditing ? "editable" : ""}`} 
              onClick={() => isEditing && fileInputRef.current.click()}
            >
              <img 
                src={trainer.profilePic || (trainer.gender === "Female" ? FEMALE_AVATAR : MALE_AVATAR)} 
                alt="Trainer" 
                className="profile-image"
              />
              {isEditing && <div className="upload-overlay">Change Photo</div>}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} hidden />
          </div>

          <h3>{trainer.name || "Set Name"}</h3>
          <p className="specialization-text">{trainer.specialization || "Professional Trainer"}</p>
          
          <div className="profile-strength-box">
             <div className="strength-header">
               <label>Profile Strength</label>
               <span>{calculateProgress()}%</span>
             </div>
             <div className="strength-bar">
               <div className="strength-fill" style={{ width: `${calculateProgress()}%` }}></div>
             </div>
          </div>
        </div>

        {/* RIGHT SIDE: FORMS */}
        <div className="profile-right">
          {/* Section: Basic Info */}
          <div className="form-section-label">Basic Information</div>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" value={trainer.name} onChange={handleChange} disabled={!isEditing} placeholder="Enter Full Name" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={trainer.email} disabled className="readonly-input" />
            </div>

           <div className="form-group">
  <label>Phone Number</label>
  <input
    type="text"
    name="phone"
    value={trainer.phone}
    onChange={handleChange}
    disabled={!isEditing}
    placeholder="+91 00000 00000"
  />
</div>
             


            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={trainer.gender} onChange={handleChange} disabled={!isEditing}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Section: Professional Info */}
          <div className="form-section-label">Professional Details</div>
          <div className="form-row">
            <div className="form-group">
              <label>Qualification</label>
              <input type="text" name="qualification" value={trainer.qualification} onChange={handleChange} disabled={!isEditing} placeholder="Enter Qualification" />
            </div>
            <div className="form-group">
              <label>Experience</label>
              <input type="text" name="experience" value={trainer.experience} onChange={handleChange} disabled={!isEditing} placeholder="Enter Experience in Years" />
            </div>
          </div>

          <div className="form-group">
            <label>Specialization</label>
            <input type="text" name="specialization" value={trainer.specialization} onChange={handleChange} disabled={!isEditing} placeholder="Enter Specialization" />
          </div>

          {/* Section: Address */}
          <div className="form-section-label">Address & Location</div>
          <div className="form-group">
            <label>Street Address</label>
            <input type="text" name="address" value={trainer.address} onChange={handleChange} disabled={!isEditing} placeholder="Enter Street Address" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input type="text" name="city" value={trainer.city} onChange={handleChange} disabled={!isEditing} placeholder="Enter City" />
            </div>
            <div className="form-group">
              <label>State</label>
              <input type="text" name="state" value={trainer.state} onChange={handleChange} disabled={!isEditing} placeholder="Enter State" />
            </div>
            <div className="form-group">
              <label>Pincode</label>
              <input type="text" name="pincode" value={trainer.pincode} onChange={handleChange} disabled={!isEditing} placeholder="Enter Pincode" />
            </div>
          </div>

          <div className="form-group">
            <label>Professional Bio</label>
            <textarea name="bio" value={trainer.bio} onChange={handleChange} disabled={!isEditing} placeholder="Enter your professional bio here..." />
          </div>

          <div className="button-group">
            {!isEditing ? (
              <button className="edit-btn" onClick={() => setIsEditing(true)}>✏ Edit Profile</button>
            ) : (
              <div className="edit-actions">
                <button className="save-btn" onClick={handleSave}>💾 Save Changes</button>
                <button className="discard-btn" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrainerProfile;