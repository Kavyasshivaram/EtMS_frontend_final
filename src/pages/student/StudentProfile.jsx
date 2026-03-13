import { useState, useEffect, useRef } from "react";
import api from "../../api/axiosConfig";
import "./StudentProfile.css";

function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });
  const fileInputRef = useRef(null);

  const MALE_AVATAR = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
  const FEMALE_AVATAR = "https://cdn-icons-png.flaticon.com/512/3135/3135789.png";

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userEmail = storedUser?.email || "";

  // Synchronized with MySQL Schema
  const [student, setStudent] = useState({
    name: "",
    email: userEmail,
    phone: "",
    gender: "",
    qualification: "",
    year: "",
    skills: "",
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
        const res = await api.get(`/student/profile/${userEmail}`);
        if (res.data) setStudent(res.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    if (userEmail) fetchProfile();
  }, [userEmail]);

  const calculateProgress = () => {
    const fields = [student.name, student.phone, student.gender, student.qualification, student.year, student.address];
    const filled = fields.filter(f => f && f.toString().trim() !== "").length;
    return Math.round((filled / fields.length) * 100);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent({ ...student, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 2 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => setStudent({ ...student, profilePic: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      await api.put("/student/update-profile", student);
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
      <p>Initializing Student Profile...</p>
    </div>
  );

  return (
    <div className="student-profile-container">
      <h2 className="profile-title">🎓 Student Profile</h2>

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
                src={student.profilePic || (student.gender === "Female" ? FEMALE_AVATAR : MALE_AVATAR)} 
                alt="Student" 
                className="profile-image"
              />
              {isEditing && <div className="upload-overlay">Change Photo</div>}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} hidden />
          </div>

          <h3>{student.name || "Set Name"}</h3>
          <p className="specialization-text">{student.qualification || "Student"}</p>
          
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
            <input type="text" name="name" value={student.name} onChange={handleChange} disabled={!isEditing} placeholder="Enter Full Name" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={student.email} disabled className="readonly-input" />
            </div>

           <div className="form-group">
  <label>Phone Number</label>
  <input
    type="text"
    name="phone"
    value={student.phone}
    onChange={handleChange}
    disabled={!isEditing}
    placeholder="+91 00000 00000"
  />
</div>
             

            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={student.gender} onChange={handleChange} disabled={!isEditing}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Section: Academic Info */}
          <div className="form-section-label">Academic Details</div>
          <div className="form-row">
            <div className="form-group">
              <label>Qualification</label>
              <input type="text" name="qualification" value={student.qualification} onChange={handleChange} disabled={!isEditing} placeholder="Enter Qualification" />
            </div>
            <div className="form-group">
              <label>Year/Semester</label>
              <input type="text" name="year" value={student.year} onChange={handleChange} disabled={!isEditing} placeholder="Enter Year/Semester" />
            </div>
          </div>

          <div className="form-group">
            <label>Skills</label>
            <input type="text" name="skills" value={student.skills} onChange={handleChange} disabled={!isEditing} placeholder="Enter Your Skills" />
          </div>

          {/* Section: Address */}
          <div className="form-section-label">Address & Location</div>
          <div className="form-group">
            <label>Street Address</label>
            <input type="text" name="address" value={student.address} onChange={handleChange} disabled={!isEditing} placeholder="Enter Street Address" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input type="text" name="city" value={student.city} onChange={handleChange} disabled={!isEditing} placeholder="Enter City" />
            </div>
            <div className="form-group">
              <label>State</label>
              <input type="text" name="state" value={student.state} onChange={handleChange} disabled={!isEditing} placeholder="Enter State" />
            </div>
            <div className="form-group">
              <label>Pincode</label>
              <input type="text" name="pincode" value={student.pincode} onChange={handleChange} disabled={!isEditing} placeholder="Enter Pincode" />
            </div>
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea name="bio" value={student.bio} onChange={handleChange} disabled={!isEditing} placeholder="Enter your bio here..." />
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

export default StudentProfile;