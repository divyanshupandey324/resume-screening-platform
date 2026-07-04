import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

const JOB_ROLES = [
    "Software Engineer",
    "Java Developer",
    "Python Developer",
    "Full Stack Developer",
    "Frontend Developer",
    "Backend Developer",
    "React Developer",
    "Angular Developer",
    "Node.js Developer",
    "AI Engineer",
    "Machine Learning Engineer",
    "Deep Learning Engineer",
    "Data Scientist",
    "Data Analyst",
    "Data Engineer",
    "Cloud Engineer",
    "AWS Engineer",
    "Azure Engineer",
    "DevOps Engineer",
    "Cyber Security Engineer",
    "Blockchain Developer",
    "Android Developer",
    "Flutter Developer",
    "UI/UX Designer",
    "QA Engineer",
    "Automation Tester",
    "Embedded Systems Engineer",
    "Network Engineer",
    "Database Administrator",
    "Product Manager",
    "Business Analyst",
    "System Administrator"
];

export default function Rankings() {
    const [jobs, setJobs] = useState([]);
    const [selectedRole, setSelectedRole] = useState("Software Engineer");
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [isRanking, setIsRanking] = useState(false);
    const [rankingLogs, setRankingLogs] = useState([]);

    useEffect(() => {
        // Fetch custom job openings
        API.get("/job/all")
            .then(res => setJobs(res.data))
            .catch(err => console.error("Error fetching jobs:", err));
    }, []);

    const handleFileChange = (e) => {
        setSelectedFiles(Array.from(e.target.files));
    };

    const runResumeRanking = async () => {
        if (selectedFiles.length === 0) {
            alert("Please select one or more candidate resumes to rank.");
            return;
        }

        setIsRanking(true);
        setCandidates([]);
        setRankingLogs(["🔄 Starting batch evaluation pipeline...", "📁 Reading uploaded resume files..."]);

        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append("files", file);
        });
        formData.append("job_id", selectedRole);
        const username = localStorage.getItem("username") || "";
        formData.append("username", username);

        try {
            setRankingLogs(prev => [...prev, `🤖 Submitting ${selectedFiles.length} resumes to Gemini ATS Parser...`]);
            const response = await API.post("/resume/rank-multiple", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            setRankingLogs(prev => [...prev, "⚡ Computing weighted score matrix...", "🏆 Sorting candidate list...", "✓ Rankings generated successfully!"]);
            setCandidates(response.data);
        } catch (error) {
            console.error(error);
            setRankingLogs(prev => [...prev, "❌ Failed to generate rankings. Make sure the API is online."]);
        } finally {
            setIsRanking(false);
        }
    };

    return (
        <div className="dashboard" style={{ background: "#0f172a", minHeight: "100vh", color: "#f8fafc" }}>
            <Sidebar />

            <div className="content" style={{ padding: "40px", flex: 1, overflowY: "auto" }}>
                <div style={{ marginBottom: "30px" }}>
                    <h1 style={{ fontSize: "2.2rem", fontWeight: "800", margin: 0, color: "#f8fafc" }}>
                        Candidate Rankings
                    </h1>
                    <p style={{ color: "#94a3b8", marginTop: "5px" }}>
                        Upload multiple candidate resumes to rank them dynamically for a specific job profile.
                    </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "30px", alignItems: "flex-start" }}>
                    {/* Left Panel: Inputs & Logs */}
                    <div className="glass-card" style={{ padding: "30px", background: "rgba(30, 41, 59, 0.45)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 8px 32px 0 rgba(0,0,0,0.3)" }}>
                        <h2 style={{ fontSize: "1.2rem", color: "#f1f5f9", margin: "0 0 20px 0", fontWeight: "700" }}>Evaluation Parameters</h2>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: "600" }}>Target Job Profile</label>
                                <select 
                                    value={selectedRole} 
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    style={{
                                        padding: "12px",
                                        borderRadius: "8px",
                                        border: "1px solid #334155",
                                        background: "#0f172a",
                                        color: "#f8fafc",
                                        outline: "none"
                                    }}
                                >
                                    <optgroup label="Standard Roles" style={{ color: "#a5b4fc", background: "#0f172a" }}>
                                        {JOB_ROLES.map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </optgroup>
                                    {jobs.length > 0 && (
                                        <optgroup label="Custom Job Openings" style={{ color: "#a5b4fc", background: "#0f172a" }}>
                                            {jobs.map(job => (
                                                <option key={job._id} value={job._id}>{job.title}</option>
                                            ))}
                                        </optgroup>
                                    )}
                                </select>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: "600" }}>Resumes (Select Multiple PDFs)</label>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    multiple
                                    onChange={handleFileChange}
                                    style={{
                                        padding: "10px",
                                        borderRadius: "8px",
                                        border: "1px solid #334155",
                                        background: "#0f172a",
                                        color: "#f8fafc",
                                        cursor: "pointer"
                                    }}
                                />
                                {selectedFiles.length > 0 && (
                                    <span style={{ fontSize: "0.75rem", color: "#6366f1", fontWeight: "600" }}>
                                        {selectedFiles.length} file(s) selected
                                    </span>
                                )}
                            </div>

                            <button
                                className="btn"
                                onClick={runResumeRanking}
                                disabled={isRanking}
                                style={{
                                    padding: "14px",
                                    fontSize: "1rem",
                                    fontWeight: "700",
                                    marginTop: "10px",
                                    background: isRanking ? "#475569" : "linear-gradient(135deg, #6366f1, #4f46e5)",
                                    color: "white",
                                    borderRadius: "8px",
                                    border: "none",
                                    cursor: isRanking ? "not-allowed" : "pointer",
                                    boxShadow: isRanking ? "none" : "0 4px 14px 0 rgba(99, 102, 241, 0.4)"
                                }}
                            >
                                {isRanking ? "Evaluating..." : "Upload & Rank Candidates"}
                            </button>
                        </div>

                        {rankingLogs.length > 0 && (
                            <div style={{ marginTop: "30px" }}>
                                <h3 style={{ fontSize: "0.9rem", color: "#e2e8f0", marginBottom: "12px", fontWeight: "600" }}>Pipeline Progress logs</h3>
                                <div style={{
                                    background: "#020617",
                                    padding: "12px",
                                    borderRadius: "8px",
                                    fontFamily: "Fira Code, monospace",
                                    fontSize: "0.75rem",
                                    color: "#34d399",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "6px",
                                    border: "1px solid rgba(255,255,255,0.04)"
                                }}>
                                    {rankingLogs.map((log, idx) => (
                                        <div key={idx} style={{ borderLeft: "2px solid #34d399", paddingLeft: "8px" }}>{log}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Ranked Leaderboard */}
                    <div className="glass-card" style={{ padding: "35px", background: "rgba(30, 41, 59, 0.25)", borderRadius: "16px", border: "1px solid rgba(99,102,241,0.15)", boxShadow: "0 8px 32px 0 rgba(0,0,0,0.3)" }}>
                        <h2 style={{ fontSize: "1.3rem", color: "#f1f5f9", margin: "0 0 25px 0", fontWeight: "800", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px" }}>Ranked Results</h2>

                        {candidates.length === 0 ? (
                            <div style={{ color: "#94a3b8", textAlign: "center", padding: "60px" }}>
                                Select files and click rank to load the candidate rankings.
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                                {candidates.map((candidate, index) => {
                                    const isTop1 = index === 0;
                                    const isTop2 = index === 1;
                                    const isTop3 = index === 2;
                                    const medal = isTop1 ? "🥇" : isTop2 ? "🥈" : isTop3 ? "🥉" : `Rank ${index + 1}`;
                                    
                                    return (
                                        <div 
                                            key={index} 
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                background: isTop1 ? "rgba(251, 191, 36, 0.05)" : "rgba(255,255,255,0.02)",
                                                padding: "20px",
                                                borderRadius: "12px",
                                                border: isTop1 ? "1px solid rgba(251, 191, 36, 0.2)" : "1px solid rgba(255,255,255,0.05)",
                                                boxShadow: isTop1 ? "0 4px 20px 0 rgba(251, 191, 36, 0.05)" : "none",
                                                transition: "all 0.2s"
                                            }}
                                        >
                                            <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
                                                <div style={{
                                                    fontSize: "1.3rem",
                                                    fontWeight: "800",
                                                    color: isTop1 ? "#fbbf24" : isTop2 ? "#cbd5e1" : isTop3 ? "#d97706" : "#64748b",
                                                    width: "60px",
                                                    textAlign: "center"
                                                }}>
                                                    {medal}
                                                </div>
                                                <div>
                                                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "#f8fafc" }}>{candidate.name}</h3>
                                                    <span style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>{candidate.email}</span>
                                                    <div style={{ marginTop: "6px" }}>
                                                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Exp: {candidate.experience_years} yrs</span>
                                                        <span style={{ margin: "0 8px", color: "#334155" }}>•</span>
                                                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Skills: {candidate.skills.slice(0, 4).join(", ")}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ textAlign: "right" }}>
                                                <div style={{
                                                    fontSize: "1.6rem",
                                                    fontWeight: "800",
                                                    color: candidate.score >= 50 ? "#34d399" : "#f87171"
                                                }}>
                                                    {candidate.score}%
                                                </div>
                                                <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>ATS Score</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}