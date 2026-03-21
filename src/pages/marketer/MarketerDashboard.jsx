import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaChartLine, FaWallet, FaFire, FaHistory } from "react-icons/fa6";
import "./MarketerDashboard.css";

function MarketerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    // Get user from local storage
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(storedUser);

    // Set greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const stats = [
    { label: "Total Leads", val: "154", icon: <FaUsers />, color: "blue" },
    { label: "Conversion Rate", val: "26%", icon: <FaChartLine />, color: "green" },
    { label: "Pipeline Value", val: "₹12.5L", icon: <FaWallet />, color: "orange" },
  ];

  const recentLeads = [
    { id: "L-2403-01", name: "Rahul Kumar", status: "HOT", source: "Facebook Ad" },
    { id: "L-2403-02", name: "Sneha Reddy", status: "WARM", source: "Website" },
    { id: "L-2403-03", name: "Anish Gupta", status: "COLD", source: "Referral" },
  ];

  return (
    <div className="md-page">
      
      {/* ══════════ HERO HEADER ══════════ */}
      <header className="md-hero">
        <div className="md-hero__orb md-hero__orb--1" />
        <div className="md-hero__orb md-hero__orb--2" />

        <div className="md-hero__inner">
          <div className="md-hero__left">
            <div className="md-greeting-chip">{greeting} 🚀</div>
            <h1 className="md-hero__name">{user?.name || "Growth Specialist"}</h1>
            {(user?.portalId || user?.studentId) && (
              <div className="md-hero__id-badge">System ID: {user.portalId || user.studentId}</div>
            )}
            <p className="md-hero__role">Growth & Marketing · EtMS Global</p>
          </div>
          <div className="md-hero__right">
            {/* Action buttons could go here */}
          </div>
        </div>
      </header>

      {/* ══════════ STAT CARDS ══════════ */}
      <div className="md-stats">
        {stats.map((s, idx) => (
          <div key={idx} className={`md-stat-card md-stat--${s.color}`}>
            <div className="md-stat__icon">{s.icon}</div>
            <div className="md-stat__body">
              <span className="md-stat__val">{s.val}</span>
              <span className="md-stat__label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ══════════ RECENT LEADS ══════════ */}
      <section className="md-section">
        <div className="md-section-header">
          <h2 className="md-section-title"><FaFire color="#f97316"/> High Potential Leads</h2>
          <button className="um-btn--primary" style={{padding: '8px 16px', fontSize: '0.85rem'}} onClick={() => navigate("/marketer/leads")}>
            View All Leads
          </button>
        </div>

        <table className="md-table">
          <thead>
            <tr>
              <th>Lead ID</th>
              <th>Lead Name</th>
              <th>Status</th>
              <th>Channel</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {recentLeads.map(lead => (
              <tr key={lead.id}>
                <td style={{fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: '0.85rem'}}>{lead.id}</td>
                <td style={{fontWeight: 600}}>{lead.name}</td>
                <td>
                  <span className={`md-badge md-badge--${lead.status.toLowerCase()}`}>
                    {lead.status}
                  </span>
                </td>
                <td>{lead.source}</td>
                <td>
                  <button className="um-action-pill edit" style={{fontSize: '0.75rem', padding: '4px 10px'}}>Reach Out</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

    </div>
  );
}

export default MarketerDashboard;