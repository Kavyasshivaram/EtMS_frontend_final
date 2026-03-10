import DashboardLayout from "../../layouts/DashboardLayout";

function Marketers() {

  const marketers = [
    { id: 1, name: "Kiran", email: "kiran@gmail.com", revenue: 50000 },
    { id: 2, name: "Sneha", email: "sneha@gmail.com", revenue: 75000 },
    { id: 3, name: "Rohit", email: "rohit@gmail.com", revenue: 30000 },
  ];

  return (
    <DashboardLayout>
      <div className="page-content">
        <h2>📈 Marketers Management</h2>

        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {marketers.map((marketer) => (
              <tr key={marketer.id}>
                <td>{marketer.id}</td>
                <td>{marketer.name}</td>
                <td>{marketer.email}</td>
                <td>₹ {marketer.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default Marketers;