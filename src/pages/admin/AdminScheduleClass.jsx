import { useEffect, useState } from "react";
import axios from "../../api/axiosConfig"; 
import "./AdminScheduleClass.css";

function AdminScheduleClass() {
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    courseId: "",
    batchId: "",
    startDate: "",
    endDate: "",
    startTime: "09:00",
    startPeriod: "AM",
    endTime: "10:00",
    endPeriod: "AM",
    status: "ACTIVE"
  });

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchSchedule();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("/admin/courses"); 
      setCourses(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchBatchesByCourse = async (courseId) => {
    try {
      const res = await axios.get(`/admin/batches/course/${courseId}`);
      setBatches(res.data);
    } catch (err) { setBatches([]); }
  };

  const fetchSchedule = async () => {
    try {
      const res = await axios.get("/admin/schedule-classes");
      setSchedule(res.data);
    } catch (err) { console.error(err); }
  };

  const convertTo24Hour = (time, period) => {
    let [hours, minutes] = time.split(":");
    hours = parseInt(hours, 10);

    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
  };

  const formatTo12Hour = (time) => {
    if (!time) return "";

    const parts = time.split(":");
    let hour = parseInt(parts[0], 10);

    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;

    return `${hour}:${parts[1]} ${ampm}`;
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ 
      courseId: "", 
      batchId: "", 
      startDate: "", 
      endDate: "", 
      startTime: "09:00", 
      startPeriod: "AM", 
      endTime: "10:00", 
      endPeriod: "AM", 
      status: "ACTIVE" 
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    if (name === "courseId") {
      fetchBatchesByCourse(value);
      setFormData(prev => ({ ...prev, courseId: value, batchId: "" }));
    }
  };

  const handleEdit = (s) => {
    setEditingId(s.id);

    fetchBatchesByCourse(s.course.id);

    setFormData({
      courseId: s.course.id,
      batchId: s.batch.id,
      startDate: s.startDate,
      endDate: s.endDate || s.startDate,
      startTime: s.startTime.substring(0, 5),
      startPeriod: parseInt(s.startTime.split(":")[0]) >= 12 ? "PM" : "AM",
      endTime: s.endTime.substring(0, 5),
      endPeriod: parseInt(s.endTime.split(":")[0]) >= 12 ? "PM" : "AM",
      status: s.status || "ACTIVE"
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMsg("");
    setSuccessMsg("");

    try {

      setLoading(true);

      const selectedBatch = batches.find(
        b => b.id === Number(formData.batchId)
      );

      const payload = {
        courseId: formData.courseId,
        batchId: formData.batchId,
        trainerId: selectedBatch?.trainer?.id || "",
        startDate: formData.startDate,

        /* ✅ FIX: Added endDate */
        endDate: formData.endDate,

        startTime: convertTo24Hour(
          formData.startTime,
          formData.startPeriod
        ),

        endTime: convertTo24Hour(
          formData.endTime,
          formData.endPeriod
        ),

        status: formData.status
      };

      if (editingId) {

        await axios.put(
          `/admin/schedule-classes/${editingId}`,
          payload
        );

        setSuccessMsg("Schedule updated successfully!");

      } else {

        await axios.post(
          "/admin/schedule-classes",
          payload
        );

        setSuccessMsg("Class scheduled successfully!");

      }

      resetForm();

      fetchSchedule();

      window.dispatchEvent(new Event("batchStatusUpdated"));

      setTimeout(() => setSuccessMsg(""), 3000);

    } catch (err) {

  if (err.response && err.response.data) {
    setErrorMsg(err.response.data);
  } else {
    setErrorMsg("Failed to save schedule.");
  }

} finally {

      setLoading(false);

    }
  };

  const filteredSchedule = [...schedule].reverse().filter((s) => {

    const term = searchTerm.toLowerCase();

    return (
      (s.course?.course_name || "").toLowerCase().includes(term) ||
      (s.batch?.batch_name || "").toLowerCase().includes(term) ||
      (s.trainer?.trainer_name || "").toLowerCase().includes(term)
    );

  });

  return (
    <div className="assign-layout">

      <div className="assign-form">

        <h2>
          {editingId ? "✏️ Edit Schedule" : "📅 Schedule Class"}
        </h2>

        {successMsg && (
          <p className="success-message">{successMsg}</p>
        )}

        {errorMsg && (
          <p className="error-message">{errorMsg}</p>
        )}

        <div className="form-scroll-container">

          <div className="form-group">

            <label>Course</label>

            <select
              name="courseId"
              className="custom-select"
              value={formData.courseId}
              onChange={handleChange}
            >
              <option value="">-- Select Course --</option>

              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.courseName}
                </option>
              ))}

            </select>

          </div>

          <div className="form-group">

            <label>Batch</label>

            <select
              name="batchId"
              className="custom-select"
              value={formData.batchId}
              onChange={handleChange}
              disabled={!formData.courseId}
            >
              <option value="">-- Select Batch --</option>

              {batches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.batchName}
                </option>
              ))}

            </select>

          </div>

          <div className="form-row">

            <div className="form-group">
              <label>Start Date</label>

              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>End Date</label>

              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>

          </div>

          <div className="form-row">

            <div className="form-group">

              <label>Start Time</label>

              <div className="time-input-container">

                <input
                  type="text"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  placeholder="09:00"
                />

                <select
                  name="startPeriod"
                  value={formData.startPeriod}
                  onChange={handleChange}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>

              </div>

            </div>

            <div className="form-group">

              <label>End Time</label>

              <div className="time-input-container">

                <input
                  type="text"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  placeholder="10:00"
                />

                <select
                  name="endPeriod"
                  value={formData.endPeriod}
                  onChange={handleChange}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>

              </div>

            </div>

          </div>

          {editingId && (
            <div className="form-group">

              <label>Status</label>

              <select
                name="status"
                className="custom-select"
                value={formData.status}
                onChange={handleChange}
              >

                <option value="ACTIVE">ACTIVE</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="INACTIVE">INACTIVE</option>

              </select>

            </div>
          )}

        </div>

        <div className="form-actions">

          <button
            className="assign-btn"
            onClick={handleSubmit}
            disabled={loading}
          >

            {loading
              ? "Processing..."
              : editingId
              ? "Update Schedule"
              : "Schedule Class"}

          </button>

          {editingId && (
            <button
              className="cancel-edit-btn"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}

        </div>

      </div>

      <div className="assign-list">

        <div className="list-header-row">

          <h3>Scheduled Classes</h3>

          <div className="search-container">

            <input
              type="text"
              className="list-search-input"
              placeholder="Search by course, batch, or trainer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

          </div>

        </div>

        <div className="scroll-area">

          {filteredSchedule.map((s) => (

            <div key={s.id} className="course-block">

              <span className={`status-badge ${s.status?.toLowerCase() || 'active'}`}>
                {s.status || "ACTIVE"}
              </span>

              <h4>{s.course?.course_name}</h4>

              <p>
                <strong>Batch:</strong> {s.batch?.batch_name}
              </p>

              <p>
                <strong>Trainer:</strong> {s.trainer?.trainer_name}
              </p>

              <p>
                📅 {s.startDate} to {s.endDate}
              </p>

              <p>
                ⏰ {formatTo12Hour(s.startTime)} - {formatTo12Hour(s.endTime)}
              </p>

              <button
                className="edit-action-btn"
                onClick={() => handleEdit(s)}
              >
                Edit Status/Details
              </button>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

export default AdminScheduleClass;