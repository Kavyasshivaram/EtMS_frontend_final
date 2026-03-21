import "./SuperAdminLists.css";
import { FaLayerGroup, FaPlus } from "react-icons/fa6";

function Batches() {

  const batches = [
    { id: 1, name: "Batch Alpha", course: "Full Stack Development", trainer: "Rahul Sharma", schedule: "Mon-Fri 10AM - 12PM" },
    { id: 2, name: "Batch Beta", course: "Data Science & AI", trainer: "Priya Verma", schedule: "Tue-Thu 02PM - 04PM" },
    { id: 3, name: "Batch Gamma", course: "UI/UX Design Systems", trainer: "Arjun Reddy", schedule: "Sat-Sun 11AM - 01PM" },
  ];

  return (
    <div className="sa-page">
        <div className="sa-wrapper sl-wrapper-extra">
            
            {/* ── SIDE PANEL ── */}
            <div className="sa-side-panel">
                <div className="sa-side-brand">
                    <span className="cu-side-et">Et</span><span className="cu-side-ms">MS</span>
                </div>
                <h2 className="sa-side-title">Batch Hub</h2>
                <p className="sa-side-desc">
                    Orchestrating academic cohorts and temporal scheduling across various institutional departments.
                </p>

                <div className="sl-side-card">
                    <span className="sl-sc-label">ACTIVE COHORTS</span>
                    <div className="sl-sc-value">{batches.length} Ready</div>
                </div>

                <div className="sl-side-illustration">
                    <FaLayerGroup size={120} style={{opacity: 0.15}} />
                </div>
            </div>

            {/* ── MAIN CONTENT ── */}
            <div className="sl-main-panel">
                <div className="sl-header">
                    <div className="sl-header-left">
                        <h1>Cohort Management</h1>
                        <p>Detailed overview of active training batches and scheduling</p>
                    </div>
                    <button className="sl-btn-primary">
                        <FaPlus /> Initialize Batch
                    </button>
                </div>

                <div className="sl-table-card">
                    <table className="sl-table">
                        <thead>
                            <tr>
                                <th>Batch ID</th>
                                <th>Cohort Name</th>
                                <th>Academic Stream</th>
                                <th>Assigned Lead</th>
                                <th>Temporal Slot</th>
                            </tr>
                        </thead>
                        <tbody>
                            {batches.map((batch) => (
                                <tr key={batch.id}>
                                    <td>#BT-{batch.id}</td>
                                    <td style={{fontWeight: 700}}>{batch.name}</td>
                                    <td>{batch.course}</td>
                                    <td>{batch.trainer}</td>
                                    <td style={{fontSize: '0.85rem'}}>{batch.schedule}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );
}

export default Batches;