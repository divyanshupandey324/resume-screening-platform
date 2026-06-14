import { useState } from "react";
import Sidebar from "../components/Sidebar";
import CandidatePieChart from "../charts/CandidatePieChart";
import RankingBarChart from "../charts/RankingBarChart";

export default function AnalyticsDashboard() {
    const [pieData, setPieData] = useState({ shortlisted: 0, rejected: 0, total_candidates: 0 });
    const [rankingsData, setRankingsData] = useState([]);

    const selectionRate = pieData.total_candidates > 0 
        ? ((pieData.shortlisted / pieData.total_candidates) * 100).toFixed(1) 
        : "0.0";
        
    const averageScore = rankingsData.length > 0 
        ? (rankingsData.reduce((acc, c) => acc + c.score, 0) / rankingsData.length).toFixed(1) 
        : "0.0";

    const topCandidate = rankingsData.length > 0 
        ? rankingsData.reduce((prev, curr) => (prev.score > curr.score) ? prev : curr) 
        : null;

    return (
        <div className="dashboard" style={{ background: "#0f172a", minHeight: "100vh", color: "#f8fafc" }}>
            <Sidebar />
            
            <div className="content" style={{ padding: "40px", flex: 1, overflowY: "auto" }}>
                <h1 style={{ fontSize: "2.2rem", fontWeight: "800", marginBottom: "10px" }}>
                    Recruitment Analytics
                </h1>
                <p style={{ color: "#94a3b8", marginBottom: "30px" }}>
                    Visual insights on screening outcomes, status ratios, and candidate performance.
                </p>
                
                <div style={{ display: "flex", flexWrap: "wrap", gap: "30px", alignItems: "stretch" }}>
                    <div style={{ flex: 1, minWidth: "300px" }}>
                        <CandidatePieChart onDataLoad={setPieData} />
                    </div>
                    <div style={{ flex: 1.5, minWidth: "450px" }}>
                        <RankingBarChart onDataLoad={setRankingsData} />
                    </div>
                </div>

                <div className="glass-card" style={{ marginTop: "30px", padding: "30px", background: "rgba(99, 102, 241, 0.03)", border: "1px solid rgba(99, 102, 241, 0.15)", textAlign: "left" }}>
                    <h3 style={{ fontSize: "1.3rem", color: "#f8fafc", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <span>📈</span> AI Recruitment Insights Summary
                    </h3>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px" }}>
                        <div>
                            <h4 style={{ color: "#a5b4fc", fontSize: "0.95rem", marginBottom: "8px", fontWeight: "600" }}>Pipeline Conversion</h4>
                            <p style={{ color: "#cbd5e1", fontSize: "0.9rem", lineHeight: "1.6" }}>
                                Out of <strong>{pieData.total_candidates}</strong> processed candidate application(s), <strong>{pieData.shortlisted}</strong> have successfully matched criteria and been Shortlisted, while <strong>{pieData.rejected}</strong> were Rejected.
                            </p>
                            <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{ fontSize: "1.8rem", fontWeight: "800", color: "#34d399" }}>{selectionRate}%</span>
                                <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Selection / Shortlist Ratio</span>
                            </div>
                        </div>

                        <div>
                            <h4 style={{ color: "#a5b4fc", fontSize: "0.95rem", marginBottom: "8px", fontWeight: "600" }}>Candidate Quality</h4>
                            <p style={{ color: "#cbd5e1", fontSize: "0.9rem", lineHeight: "1.6" }}>
                                The overall pool average ATS score is <strong>{averageScore}%</strong>. A selection rate of {selectionRate}% shows {parseFloat(selectionRate) > 40 ? "a balanced entry pipeline." : "a highly selective talent funnel ensuring only premium candidates match requirements."}
                            </p>
                        </div>

                        {topCandidate && (
                            <div>
                                <h4 style={{ color: "#a5b4fc", fontSize: "0.95rem", marginBottom: "8px", fontWeight: "600" }}>Top Performing Profile</h4>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <div style={{ color: "#f8fafc", fontSize: "1.1rem", fontWeight: "700" }}>{topCandidate.name}</div>
                                    <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Target Role: <strong style={{ color: "#cbd5e1" }}>{topCandidate.target_job_title || "General Software Engineer"}</strong></div>
                                    <div style={{ marginTop: "6px", background: "rgba(52, 211, 153, 0.1)", border: "1px solid rgba(52, 211, 153, 0.2)", padding: "8px 12px", borderRadius: "8px", display: "inline-block", width: "fit-content" }}>
                                        <span style={{ color: "#34d399", fontWeight: "bold" }}>⭐ Highest ATS Score: {topCandidate.score}%</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}