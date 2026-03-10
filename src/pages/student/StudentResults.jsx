import "./StudentModule.css";

function StudentResults() {
  return (
    <div className="module-container">
      <h2>Results & Grades</h2>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Assignment</th>
              <th>Exam</th>
              <th>Total</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Java</td>
              <td>18/20</td>
              <td>70/80</td>
              <td>88%</td>
              <td>A</td>
            </tr>
            <tr>
              <td>React</td>
              <td>17/20</td>
              <td>65/80</td>
              <td>82%</td>
              <td>A</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentResults;