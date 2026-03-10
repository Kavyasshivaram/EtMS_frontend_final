import { useEffect, useState } from "react";
import axios from "axios";

function PendingUsers() {

  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await axios.get(
      "http://localhost:8080/api/admin/pending-users"
    );
    setUsers(res.data);
  };

  const approveUser = async (id) => {
    await axios.put(
      `http://localhost:8080/api/admin/approve-user/${id}`
    );
    fetchUsers();
  };

  const rejectUser = async (id) => {
    await axios.put(
      `http://localhost:8080/api/admin/reject-user/${id}`
    );
    fetchUsers();
  };

  return (
    <div>
      <h2>Pending Approvals</h2>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role.roleName}</td>
              <td>
                <button onClick={() => approveUser(user.id)}>Approve</button>
                <button onClick={() => rejectUser(user.id)}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default PendingUsers;
