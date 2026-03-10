import DashboardLayout from "../../layouts/DashboardLayout";

function Batches() {

  const batches = [
    { id: 1, name: "Batch A", course: "Full Stack", trainer: "Rahul", schedule: "Mon-Fri 10AM" },
    { id: 2, name: "Batch B", course: "Data Science", trainer: "Priya", schedule: "Tue-Thu 2PM" },
    { id: 3, name: "Batch C", course: "UI/UX", trainer: "Arjun", schedule: "Weekend 11AM" },
  ];

  return (
    <DashboardLayout>
      <div className="page-content">
        <h2>🏫 Batches Management</h2>

        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Batch Name</th>
              <th>Course</th>
              <th>Trainer</th>
              <th>Schedule</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => (
              <tr key={batch.id}>
                <td>{batch.id}</td>
                <td>{batch.name}</td>
                <td>{batch.course}</td>
                <td>{batch.trainer}</td>
                <td>{batch.schedule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default Batches;