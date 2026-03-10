import DashboardLayout from "../../layouts/DashboardLayout";

function Courses() {

  const courses = [
    { id: 1, name: "Full Stack Development", trainer: "Rahul", students: 120, status: "Active" },
    { id: 2, name: "Data Science", trainer: "Priya", students: 80, status: "Active" },
    { id: 3, name: "UI/UX Design", trainer: "Arjun", students: 45, status: "Inactive" },
  ];

  return (
    <DashboardLayout>
      <div className="page-content">
        <h2>📚 Courses Management</h2>

        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Course Name</th>
              <th>Trainer</th>
              <th>Students Count</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td>{course.id}</td>
                <td>{course.name}</td>
                <td>{course.trainer}</td>
                <td>{course.students}</td>
                <td>{course.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default Courses;