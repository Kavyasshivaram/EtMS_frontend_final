import { useState, useEffect } from "react";
import "./StudentProfile.css";

function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [fade, setFade] = useState(false);

  const [student, setStudent] = useState({
    name: "Vinayaka s h",
    email: "vinayaka@gmail.com",
    phone: "9876543210",
    course: "Java Full Stack",
    qualification: "B.Tech - CSE",
    year: "2025",
    skills: "Java, React, MySQL",
    bio: "Passionate developer eager to learn new technologies.",
    photo: "",
  });

  /* ================= LOAD FROM STORAGE ================= */
  useEffect(() => {
    const saved = localStorage.getItem("studentProfile");
    if (saved) {
      setStudent(JSON.parse(saved));
    }
  }, []);

  /* ================= HANDLE INPUT ================= */
  const handleChange = (e) => {
    setStudent({
      ...student,
      [e.target.name]: e.target.value,
    });
  };

  /* ================= HANDLE PHOTO UPLOAD ================= */
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFade(true); // start fade out

    const reader = new FileReader();
    reader.onloadend = () => {
      setTimeout(() => {
        setStudent((prev) => ({
          ...prev,
          photo: reader.result,
        }));
        setFade(false); // fade in new image
      }, 300);
    };

    reader.readAsDataURL(file);
  };

  /* ================= SAVE ================= */
  const handleSave = () => {
    localStorage.setItem("studentProfile", JSON.stringify(student));
    setIsEditing(false);
    alert("Profile Updated Successfully ✅");
  };

  return (
    <div className="student-profile-container">
      <h2 className="profile-title">👨‍🎓 Student Profile</h2>

      <div className="profile-card">
        {/* LEFT SIDE */}
        <div className="profile-left">
          <div className={`image-wrapper ${fade ? "fade-out" : ""}`}>
            {student.photo ? (
              <img
                src={student.photo}
                alt="Student"
                className="profile-image"
              />
            ) : (
              <img
                src="https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
                alt="Default"
                className="profile-image"
              />
            )}
          </div>

          {isEditing && (
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="photo-input"
            />
          )}

          <h3>{student.name}</h3>
          <p className="course">{student.course}</p>
        </div>

        {/* RIGHT SIDE */}
        <div className="profile-right">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={student.name}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={student.email}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              value={student.phone}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label>Qualification</label>
            <input
              type="text"
              name="qualification"
              value={student.qualification}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label>Year</label>
            <input
              type="text"
              name="year"
              value={student.year}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label>Skills</label>
            <input
              type="text"
              name="skills"
              value={student.skills}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              name="bio"
              value={student.bio}
              onChange={handleChange}
              disabled={!isEditing}
            ></textarea>
          </div>

          <div className="button-group">
            {!isEditing ? (
              <button
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                ✏ Edit Profile
              </button>
            ) : (
              <button
                className="save-btn"
                onClick={handleSave}
              >
                💾 Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentProfile;