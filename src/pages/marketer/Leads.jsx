import React from "react";
import { FaUserPlus, FaFilter, FaSearch, FaEnvelope, FaPhone } from "react-icons/fa6";
import "./MarketerDashboard.css"; // Reuse themed styles

function Leads() {
  const leads = [
    { id: "LD-001", name: "Rahul Sharma", email: "rahul@gmail.com", phone: "9876543210", status: "Interested", source: "Facebook" },
    { id: "LD-002", name: "Priya Singh", email: "priya@outlook.com", phone: "9876543211", status: "Hot", source: "Google" },
    { id: "LD-003", name: "Amit Patel", email: "amit@yahoo.com", phone: "9876543212", status: "Contacted", source: "Reference" },
  ];

  const getStatusClass = (status) => {
    const s = status.toLowerCase();
    if (s === 'hot') return 'md-badge--hot';
    if (s === 'interested') return 'md-badge--warm';
    return 'md-badge--cold';
  };

  return (
    <div className="md-page">
      <div className="sl-header">
        <div className="sl-header-left">
          <h1>Lead Management</h1>
          <p>Global acquisition pipeline and conversion tracking</p>
        </div>
        <div style={{display: 'flex', gap: '1rem'}}>
           <div className="um-search" style={{marginBottom: 0}}>
             <FaSearch className="um-search-icon" />
             <input type="text" placeholder="Search leads..." />
           </div>
           <button className="um-btn--primary">
             <FaUserPlus /> New Lead
           </button>
        </div>
      </div>

      <div className="md-section" style={{marginTop: '2rem'}}>
        <table className="md-table">
          <thead>
            <tr>
              <th>Tracking ID</th>
              <th>Prospect Name</th>
              <th>Status</th>
              <th>Channel</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id}>
                <td style={{fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--sa-blue)'}}>{l.id}</td>
                <td>
                  <div style={{fontWeight: 700}}>{l.name}</div>
                  <div style={{fontSize: '0.75rem', color: '#64748b'}}>{l.email}</div>
                </td>
                <td>
                  <span className={`md-badge ${getStatusClass(l.status)}`}>
                    {l.status}
                  </span>
                </td>
                <td>{l.source}</td>
                <td>
                  <div style={{display: 'flex', gap: '0.5rem'}}>
                    <button className="um-action-pill edit" title="Call"><FaPhone /></button>
                    <button className="um-action-pill help" title="Email"><FaEnvelope /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Leads;