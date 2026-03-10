import DashboardLayout from "../../layouts/DashboardLayout";

function Attendance() {

  const attendanceData = [
    { id: 1, student: "Anil", course: "Full Stack", percent: 90 },
    { id: 2, student: "Meena", course: "Data Science", percent: 65 },
    { id: 3, student: "Vijay", course: "UI/UX", percent: 80 },
  ];

  const getStatus = (percent) => {
    return percent >= 75 ? "Good" : "Low";
  };

  return (
    <DashboardLayout>
      <div className="page-content">
        <h2>📅 Attendance Management</h2>

        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Student Name</th>
              <th>Course</th>
              <th>Attendance %</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.student}</td>
                <td>{item.course}</td>
                <td>{item.percent}%</td>
                <td>{getStatus(item.percent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default Attendance;