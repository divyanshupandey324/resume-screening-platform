import { useEffect, useState } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import DashboardCard from "../components/DashboardCard";

export default function RecruiterDashboard() {
    const [stats, setStats] = useState({
        totalCandidates: 0,
        shortlisted: 0,
        rejected: 0,
        averageScore: 0,
        averageSkillMatch: 0
    });

    const [recentCandidates, setRecentCandidates] = useState([]);
    const [activities, setActivities] = useState([]);
    const [atsReports, setAtsReports] = useState([]);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Fetch stats
        API.get("/analytics")
            .then((res) => {
                const data = res.data;
                setStats({
                    totalCandidates: data.total_candidates || 0,
                    shortlisted: data.shortlisted || 0,
                    rejected: data.rejected || 0,
                    averageScore: data.average_score || 0,
                    averageSkillMatch: data.average_skill_match || 0
                });
            })
            .catch(console.error);

        // Fetch recent candidates
        API.get("/candidate/all")
            .then((res) => {
                // sort candidates by latest
                const sorted = [...res.data].reverse().slice(0, 5);
                setRecentCandidates(sorted);
            })
            .catch(console.error);

        // Fetch recent activities
        API.get("/recruiter/recent-activity")
            .then((res) => {
                setActivities(res.data.slice(0, 6));
            })
            .catch(console.error);

        // Fetch recent ATS reports
        API.get("/recruiter/ats-reports")
            .then((res) => {
                setAtsReports(res.data.slice(0, 5));
            })
            .catch(console.error);

        // Fetch latest system notifications
        API.get("/recruiter/notifications")
            .then((res) => {
                setNotifications(res.data.slice(0, 6));
            })
            .catch(console.error);
    }, []);

    return (
        <div className="dashboard" style={{ background: "#0f172a", minHeight: "100vh", color: "#f8fafc" }}>
            <Sidebar />

            <div className="content" style={{ padding: "40px", flex: 1, overflowY: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "35px" }}>
                    <div>
                        <h1 style={{ fontSize: "2.2rem", fontWeight: "800", margin: 0 }}>
                            Recruiter Operations Center
                        </h1>
                        <p style={{ color: "#94a3b8", marginTop: "5px" }}>
                            Real-time overview of active candidates, screen results, and pipeline dispatch history.
                        </p>
                    </div>
                    <button 
                        onClick={() => { localStorage.clear(); window.location.href="/login"; }}
                        style={{ 
                            background: "rgba(248, 113, 113, 0.1)", 
                            border: "1px solid #f87171", 
                            color: "#fb7185", 
                            padding: "8px 16px", 
                            borderRadius: "6px", 
                            cursor: "pointer", 
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            transition: "all 0.2s" 
                        }}
                        onMouseEnter={(e) => e.target.style.background = "rgba(248, 113, 113, 0.2)"}
                        onMouseLeave={(e) => e.target.style.background = "rgba(248, 113, 113, 0.1)"}
                    >
                        🚪 Logout
                    </button>
                </div>

                {/* KPI Metrics Cards */}
                <div className="grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "40px" }}>
                    <DashboardCard title="Total Candidates" value={stats.totalCandidates} />
                    <DashboardCard title="Shortlisted Candidates" value={stats.shortlisted} />
                    <DashboardCard title="Rejected Candidates" value={stats.rejected} />
                    <DashboardCard title="Average ATS Match" value={`${stats.averageScore}%`} />
                    <DashboardCard title="Average Skill Match" value={`${stats.averageSkillMatch}%`} />
                </div>

                {/* Dashboard Grid Sections */}
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "30px" }}>
                    
                    {/* Left Column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                        
                        {/* Recent Candidates */}
                        <div className="glass-card" style={{ padding: "25px", background: "rgba(255,255,255,0.02)" }}>
                            <h2 style={{ fontSize: "1.3rem", color: "#cbd5e1", marginBottom: "20px", marginTop: 0 }}>Recent Candidates</h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {recentCandidates.length === 0 ? (
                                    <div style={{ color: "#64748b", fontSize: "0.9rem" }}>No candidates evaluated yet.</div>
                                ) : (
                                    recentCandidates.map(c => (
                                        <div key={c._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.01)", padding: "15px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.04)" }}>
                                            <div>
                                                <h4 style={{ margin: 0, color: "#f1f5f9" }}>{c.name}</h4>
                                                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{c.email} • Target: {c.target_job_title || "General Application"}</span>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <span style={{ 
                                                    background: c.score >= 50 ? "rgba(52, 211, 153, 0.12)" : "rgba(248, 113, 113, 0.12)",
                                                    color: c.score >= 50 ? "#34d399" : "#f87171",
                                                    padding: "4px 10px",
                                                    borderRadius: "15px",
                                                    fontSize: "0.75rem",
                                                    fontWeight: "bold"
                                                }}>
                                                    Score: {c.score}%
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                        
                        {/* Recent Recruiter Activity */}
                        <div className="glass-card" style={{ padding: "25px", background: "rgba(255,255,255,0.02)" }}>
                            <h2 style={{ fontSize: "1.3rem", color: "#cbd5e1", marginBottom: "20px", marginTop: 0 }}>Recent Recruiter Activity</h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                                {activities.length === 0 ? (
                                    <div style={{ color: "#64748b", fontSize: "0.9rem" }}>No recruiter logs recorded.</div>
                                ) : (
                                    activities.map(act => (
                                        <div key={act._id} style={{ borderLeft: "3px solid #6366f1", paddingLeft: "15px", paddingVertical: "4px" }}>
                                            <p style={{ margin: 0, fontSize: "0.85rem", color: "#e2e8f0" }}>{act.description}</p>
                                            <span style={{ fontSize: "0.7rem", color: "#64748b" }}>{new Date(act.timestamp).toLocaleTimeString()} • {new Date(act.timestamp).toLocaleDateString()}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>


                    </div>

                </div>

            </div>
        </div>
    );
}