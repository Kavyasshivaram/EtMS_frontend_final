import { useEffect, useState } from "react";

function Students() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    setStudents([
      { id: 1, name: "Arun", course: "Java", status: "Active" },
      { id: 2, name: "Divya", course: "React", status: "Active" }
    ]);
  }, []);

  return (
    <div>
      <div className="page-header">
        <h2>Student Management</h2>
      </div>

      <div className="data-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Course</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.course}</td>
                <td><span className="badge-active">{s.status}</span></td>
                <td>
                  <button className="action-btn edit-btn">View</button>
                  <button className="action-btn delete-btn">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Students;