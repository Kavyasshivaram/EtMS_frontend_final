import DashboardLayout from "../../layouts/DashboardLayout";

function Trainers() {

  const trainers = [
    { id: 1, name: "Rahul Sharma", email: "rahul@gmail.com", phone: "9876543210" },
    { id: 2, name: "Priya Verma", email: "priya@gmail.com", phone: "9876543211" },
    { id: 3, name: "Arjun Reddy", email: "arjun@gmail.com", phone: "9876543212" },
  ];

  return (
    <DashboardLayout>
      <div className="page-content">
        <h2>👨‍🏫 Trainers Management</h2>

        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {trainers.map((trainer) => (
              <tr key={trainer.id}>
                <td>{trainer.id}</td>
                <td>{trainer.name}</td>
                <td>{trainer.email}</td>
                <td>{trainer.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default Trainers;