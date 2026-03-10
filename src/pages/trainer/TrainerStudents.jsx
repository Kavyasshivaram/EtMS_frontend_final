import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "./TrainerStudents.css";

function TrainerStudents() {
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const trainerId = user?.id;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/teacher/students/${trainerId}`);
        setStudents(res.data);
      } catch (err) {
        console.error("Error fetching students:", err);
      } finally {
        setLoading(false);
      }
    };
    if (trainerId) fetchStudents();
  }, [trainerId]);

  // Derived State: Unique Courses
  const courses = useMemo(() => [...new Set(students.map(s => s.courseName))], [students]);

  // Derived State: Unique Batches based on selected course
  const batches = useMemo(() => {
    if (!selectedCourse) return [];
    const filtered = students.filter(s => s.courseName === selectedCourse);
    return [...new Set(filtered.map(s => s.batchName))];
  }, [students, selectedCourse]);

  // Derived State: The actual list to display
  const displayedStudents = useMemo(() => {
    return students.filter(s => {
      const matchCourse = selectedCourse ? s.courseName === selectedCourse : true;
      const matchBatch = selectedBatch ? s.batchName === selectedBatch : true;
      return matchCourse && matchBatch;
    });
  }, [students, selectedCourse, selectedBatch]);

  if (loading) return <div className="loader">Loading Students...</div>;

  return (
    <div className="trainer-container">
      <header className="page-header">
        <h2>Student Directory</h2>
        <p>Manage and view students assigned to your courses.</p>
      </header>

      <section className="filter-card">
        <div className="filter-group">
          <label>Course</label>
          <select value={selectedCourse} onChange={(e) => { setSelectedCourse(e.target.value); setSelectedBatch(""); }}>
            <option value="">All Courses</option>
            {courses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className={`filter-group ${!selectedCourse ? 'disabled' : ''}`}>
          <label>Batch</label>
          <select 
            value={selectedBatch} 
            onChange={(e) => setSelectedBatch(e.target.value)}
            disabled={!selectedCourse}
          >
            <option value="">All Batches</option>
            {batches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <button className="btn-reset" onClick={() => { setSelectedCourse(""); setSelectedBatch(""); }}>
          Reset Filters
        </button>
      </section>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact Info</th>
              <th>Course</th>
              <th>Batch</th>
            </tr>
          </thead>
          <tbody>
            {displayedStudents.map(student => (
              <tr key={student.id}>
                <td className="font-bold">{student.name}</td>
                <td>
                  <div className="email-text">{student.email}</div>
                  <div className="phone-text">{student.phone}</div>
                </td>
                <td><span className="badge-course">{student.courseName}</span></td>
                <td><span className="badge-batch">{student.batchName}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {displayedStudents.length === 0 && <div className="no-data">No students found for the selected criteria.</div>}
      </div>
    </div>
  );
}

export default TrainerStudents;