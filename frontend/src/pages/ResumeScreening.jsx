import { useEffect, useState } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";

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

export default function ResumeScreening() {
    const [file, setFile] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState("Software Engineer");
    const [statusLogs, setStatusLogs] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        // Fetch jobs for dropdown selection
        API.get("/job/all")
            .then(res => {
                setJobs(res.data);
            })
            .catch(err => console.error("Error fetching jobs:", err));
    }, []);

    const uploadResume = async () => {
        if (!file) {
            alert("Please select a resume first");
            return;
        }

        setIsProcessing(true);
        setStatusLogs([]);
        setResult(null);

        const logSteps = [
            "📂 Opening PDF document...",
            "📝 Extracting resume plain text...",
            "🤖 Querying Gemini 3.5 Flash API...",
            "🧠 Parsing candidate profile, credentials, and achievements...",
            "⚡ Running skill gap analysis against target job profile...",
            "📊 Scoring candidate parameters (experience, projects, education)...",
            "💾 Saving candidate profile & metrics to MongoDB...",
            "🚀 Screening Pipeline completed successfully!"
        ];

        for (let i = 0; i < logSteps.length - 1; i++) {
            setStatusLogs(prev => [...prev, logSteps[i]]);
            await new Promise(r => setTimeout(r, 450));
        }

        const formData = new FormData();
        formData.append("file", file);
        if (selectedJobId) {
            formData.append("job_id", selectedJobId);
        }
        const sessionUser = localStorage.getItem("username") || "";
        formData.append("username", sessionUser);
 
        try {
            const response = await API.post("/resume/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
 
            setStatusLogs(prev => [...prev, logSteps[logSteps.length - 1]]);
            setResult(response.data);
        } catch (error) {
            console.error(error);
            setStatusLogs(prev => [...prev, "❌ Screening Pipeline encountered an error."]);
        } finally {
            setIsProcessing(false);
        }
    };
 
    return (
        <div className="dashboard" style={{ background: "#0f172a", minHeight: "100vh", color: "#f8fafc" }}>
            <Sidebar />
 
            <div className="content" style={{ padding: "40px", flex: 1, overflowY: "auto" }}>
                <h1 style={{ fontSize: "2.2rem", fontWeight: "800", marginBottom: "10px", color: "#f8fafc", textShadow: "0 0 20px rgba(99, 102, 241, 0.2)" }}>
                    Resume Screening
                </h1>
                <p style={{ color: "#94a3b8", marginBottom: "30px" }}>
                    Upload candidate PDF resumes to run the automated AI-powered ATS screening pipeline.
                </p>
 
                <div style={{ display: "flex", gap: "30px", alignItems: "flex-start", flexWrap: "wrap" }}>
                    {/* Left Panel: Upload Form & Log Console */}
                    <div className="glass-card" style={{ flex: 1, minWidth: "350px", padding: "30px", background: "rgba(30, 41, 59, 0.4)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 8px 32px 0 rgba(0,0,0,0.3)" }}>
                        <h2 style={{ fontSize: "1.3rem", color: "#f1f5f9", marginBottom: "20px", fontWeight: "700", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "10px" }}>Select Parameters</h2>
 
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: "600" }}>Target Job Profile *</label>
                                <select 
                                    value={selectedJobId} 
                                    onChange={(e) => setSelectedJobId(e.target.value)}
                                    style={{
                                        padding: "12px",
                                        borderRadius: "8px",
                                        border: "1px solid #334155",
                                        background: "#0f172a",
                                        color: "#f8fafc",
                                        outline: "none",
                                        transition: "all 0.3s ease"
                                    }}
                                    required
                                >
                                    <option value="">-- Select Target Job Profile * --</option>
                                    <optgroup label="Standard Roles" style={{ color: "#a5b4fc", background: "#0f172a" }}>
                                        {JOB_ROLES.map(role => (
                                            <option key={role} value={role}>
                                                {role}
                                            </option>
                                        ))}
                                    </optgroup>
                                    {jobs.length > 0 && (
                                        <optgroup label="Custom Job Openings" style={{ color: "#a5b4fc", background: "#0f172a" }}>
                                            {jobs.map(job => (
                                                <option key={job._id} value={job._id}>
                                                    {job.title}
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}
                                </select>
                            </div>
 
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: "600" }}>Resume File (PDF)</label>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    style={{
                                        padding: "10px",
                                        borderRadius: "8px",
                                        border: "1px solid #334155",
                                        background: "#0f172a",
                                        color: "#f8fafc",
                                        cursor: "pointer"
                                    }}
                                />
                            </div>
 
                            <button
                                className="btn"
                                onClick={uploadResume}
                                disabled={isProcessing}
                                style={{
                                    padding: "14px",
                                    fontSize: "1rem",
                                    fontWeight: "700",
                                    marginTop: "10px",
                                    background: isProcessing ? "#475569" : "linear-gradient(135deg, #6366f1, #4f46e5)",
                                    color: "white",
                                    borderRadius: "8px",
                                    border: "none",
                                    cursor: isProcessing ? "not-allowed" : "pointer",
                                    boxShadow: isProcessing ? "none" : "0 4px 14px 0 rgba(99, 102, 241, 0.4)",
                                    transition: "all 0.3s ease"
                                }}
                            >
                                {isProcessing ? "Processing Resume..." : "Run AI Screener"}
                            </button>
                        </div>
 
                        {statusLogs.length > 0 && (
                            <div style={{ marginTop: "30px" }}>
                                <h3 style={{ fontSize: "0.95rem", color: "#e2e8f0", marginBottom: "12px", fontWeight: "600" }}>Pipeline Console Logs</h3>
                                <div style={{
                                    background: "#020617",
                                    padding: "15px",
                                    borderRadius: "8px",
                                    fontFamily: "Fira Code, monospace",
                                    fontSize: "0.8rem",
                                    color: "#34d399",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "6px",
                                    maxHeight: "220px",
                                    overflowY: "auto",
                                    border: "1px solid rgba(255,255,255,0.04)"
                                }}>
                                    {statusLogs.map((log, index) => (
                                        <div key={index} style={{ borderLeft: "2px solid #34d399", paddingLeft: "8px" }}>{log}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
 
                    {/* Right Panel: Re-designed Premium ATS Report */}
                    {result && (
                        <div className="glass-card" style={{ flex: 1.5, minWidth: "450px", padding: "30px", background: "rgba(30, 41, 59, 0.25)", borderRadius: "16px", border: "1px solid rgba(99, 102, 241, 0.2)", boxShadow: "0 8px 32px 0 rgba(0,0,0,0.3)" }}>
                            
                            {/* Header Widget */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "25px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "20px", flexWrap: "wrap", gap: "15px" }}>
                                <div>
                                    <h2 style={{ fontSize: "1.6rem", color: "#f8fafc", margin: 0, fontWeight: "800" }}>{result.name}</h2>
                                    <p style={{ color: "#94a3b8", margin: "4px 0 0 0", fontSize: "0.9rem" }}>{result.email}</p>
                                    <span style={{ display: "inline-block", background: "rgba(99, 102, 241, 0.15)", color: "#a5b4fc", fontSize: "0.8rem", padding: "4px 10px", borderRadius: "20px", marginTop: "10px", fontWeight: "600" }}>
                                        Target Role: {result.target_job_title}
                                    </span>
                                </div>
                                <span style={{
                                    background: result.status === "Shortlisted" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                                    color: result.status === "Shortlisted" ? "#34d399" : "#f87171",
                                    border: result.status === "Shortlisted" ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)",
                                    padding: "8px 18px",
                                    borderRadius: "30px",
                                    fontSize: "0.9rem",
                                    fontWeight: "800",
                                    letterSpacing: "0.5px"
                                }}>
                                    {result.status}
                                </span>
                            </div>
 
                            <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                                
                                {/* Score Indicator & AI Classifier Grid */}
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                                    {/* Overall Weighted ATS Match */}
                                    <div style={{ background: "rgba(15, 23, 42, 0.4)", padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: "20px" }}>
                                        <div style={{
                                            width: "70px",
                                            height: "70px",
                                            borderRadius: "50%",
                                            border: `5px solid ${result.score >= 50 ? "#10b981" : "#ef4444"}`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "1.2rem",
                                            fontWeight: "800",
                                            color: result.score >= 50 ? "#34d399" : "#f87171",
                                            background: "rgba(0,0,0,0.2)"
                                        }}>
                                            {result.score}%
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, color: "#94a3b8", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Weighted Match</h4>
                                            <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "#f1f5f9" }}>ATS Screening score</span>
                                        </div>
                                    </div>

                                    {/* AI Classifier Widget */}
                                    {result.ats_breakdown && (
                                        <div style={{ background: "rgba(15, 23, 42, 0.4)", padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                                <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: "600" }}>AI Resume Classifier</span>
                                                <span style={{ 
                                                    color: result.ats_breakdown.ai_result.includes("AI") ? "#f87171" : "#34d399",
                                                    fontWeight: "800",
                                                    fontSize: "0.8rem",
                                                    background: result.ats_breakdown.ai_result.includes("AI") ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                                                    padding: "2px 8px",
                                                    borderRadius: "4px"
                                                }}>
                                                    {result.ats_breakdown.ai_result}
                                                </span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: "0.75rem", color: "#cbd5e1", lineHeight: "1.4" }}>
                                                {result.ats_breakdown.ai_explanation}
                                            </p>
                                        </div>
                                    )}
                                </div>
 
                                {/* Score Breakdown Matrix */}
                                {result.ats_breakdown && (
                                    <div style={{ background: "rgba(15, 23, 42, 0.3)", padding: "24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)" }}>
                                        <h3 style={{ fontSize: "1rem", color: "#e2e8f0", margin: "0 0 15px 0", fontWeight: "700" }}>Weighted Dimension Breakdowns</h3>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px 25px" }}>
                                            {[
                                                { label: "Skills Match (25%)", val: result.ats_breakdown.skills_score, max: 25 },
                                                { label: "Experience (15%)", val: result.ats_breakdown.experience_score, max: 15 },
                                                { label: "Education (10%)", val: result.ats_breakdown.education_score, max: 10 },
                                                { label: "Projects (10%)", val: result.ats_breakdown.projects_score, max: 10 },
                                                { label: "Certificates (5%)", val: result.ats_breakdown.certifications_score, max: 5 },
                                                { label: "Structure (5%)", val: result.ats_breakdown.resume_structure_score, max: 5 },
                                                { label: "Keywords Match (10%)", val: result.ats_breakdown.keyword_score, max: 10 },
                                                { label: "Grammar (10%)", val: result.ats_breakdown.grammar_score, max: 10 },
                                                { label: "Formatting (5%)", val: result.ats_breakdown.formatting_score, max: 5 },
                                                { label: "Completeness (5%)", val: result.ats_breakdown.completeness_score, max: 5 },
                                            ].map((item, idx) => (
                                                <div key={idx}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#cbd5e1", marginBottom: "4px" }}>
                                                        <span>{item.label}</span>
                                                        <span style={{ fontWeight: "bold" }}>{item.val} / {item.max}</span>
                                                    </div>
                                                    <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                                                        <div style={{ width: `${(item.val / item.max) * 100}%`, height: "100%", background: "linear-gradient(90deg, #6366f1, #818cf8)", borderRadius: "4px" }}></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
 
                                {/* Score Deductions Panel */}
                                {result.ats_breakdown && result.ats_breakdown.deductions && result.ats_breakdown.deductions.length > 0 && (
                                    <div style={{ background: "rgba(239, 68, 68, 0.02)", border: "1px solid rgba(239, 68, 68, 0.12)", padding: "20px", borderRadius: "12px" }}>
                                        <strong style={{ color: "#f87171", fontSize: "0.9rem", display: "block", marginBottom: "12px", fontWeight: "700" }}>🚨 Critical Score Deductions</strong>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                            {result.ats_breakdown.deductions.map((d, idx) => (
                                                <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#cbd5e1", borderBottom: "1px solid rgba(239,68,68,0.05)", paddingBottom: "8px" }}>
                                                    <span><strong>{d.metric}</strong>: {d.reason}</span>
                                                    <span style={{ color: "#f87171", fontWeight: "700" }}>-{d.points} pts</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
 
                                {/* Strengths and Weaknesses Columns */}
                                {result.ats_breakdown && (
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                                        {/* Pros */}
                                        <div style={{ background: "rgba(16, 185, 129, 0.01)", border: "1px solid rgba(16, 185, 129, 0.12)", padding: "20px", borderRadius: "12px" }}>
                                            <strong style={{ color: "#34d399", display: "block", marginBottom: "10px", fontSize: "0.9rem" }}>✅ Identified Strengths</strong>
                                            <ul style={{ margin: 0, paddingLeft: "15px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.8rem", color: "#cbd5e1", lineHeight: "1.4" }}>
                                                {result.ats_breakdown.good_points.map((pt, idx) => (
                                                    <li key={idx}>{pt}</li>
                                                ))}
                                            </ul>
                                        </div>
 
                                        {/* Cons */}
                                        <div style={{ background: "rgba(239, 68, 68, 0.01)", border: "1px solid rgba(239, 68, 68, 0.12)", padding: "20px", borderRadius: "12px" }}>
                                            <strong style={{ color: "#f87171", display: "block", marginBottom: "10px", fontSize: "0.9rem" }}>⚠️ Areas for Improvement</strong>
                                            <ul style={{ margin: 0, paddingLeft: "15px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.8rem", color: "#cbd5e1", lineHeight: "1.4" }}>
                                                {result.ats_breakdown.weak_points.map((pt, idx) => (
                                                    <li key={idx}>{pt}</li>
                                                ))}
                                                {result.ats_breakdown.missing_skills.length > 0 && (
                                                    <li style={{ color: "#fb7185", fontWeight: "700", listStyleType: "square" }}>
                                                        Missing Skills: {result.ats_breakdown.missing_skills.join(", ")}
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                )}
 
                                {/* Actionable Improvement Checklist */}
                                {result.ats_breakdown && (
                                    <div style={{ background: "rgba(255, 255, 255, 0.01)", border: "1px solid rgba(255, 255, 255, 0.04)", padding: "24px", borderRadius: "12px" }}>
                                        <h3 style={{ color: "#a5b4fc", fontSize: "1rem", margin: "0 0 15px 0", fontWeight: "700" }}>Actionable Improvement Checklist</h3>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "15px", fontSize: "0.82rem" }}>
                                            <div>
                                                <strong style={{ color: "#f1f5f9" }}>✍ Resume & Format Suggestions:</strong>
                                                <p style={{ margin: "4px 0 0 0", color: "#94a3b8", lineHeight: "1.4" }}>
                                                    {result.ats_breakdown.resume_suggestions.length > 0 ? result.ats_breakdown.resume_suggestions.join(" ") : "Resume layout is structured correctly."} 
                                                    {result.ats_breakdown.formatting_issues.length > 0 && ` • Formatting issues: ${result.ats_breakdown.formatting_issues.join(" ")}`}
                                                </p>
                                            </div>
 
                                            <div>
                                                <strong style={{ color: "#f1f5f9" }}>🔑 Keyword & Grammar Adjustments:</strong>
                                                <p style={{ margin: "4px 0 0 0", color: "#94a3b8", lineHeight: "1.4" }}>
                                                    {result.ats_breakdown.keyword_suggestions.length > 0 ? `Targeted Keywords to add: ${result.ats_breakdown.keyword_suggestions.join(", ")}.` : "No significant missing target keywords."} 
                                                    {result.ats_breakdown.grammar_suggestions.length > 0 && ` • Grammar suggestions: ${result.ats_breakdown.grammar_suggestions.join(" ")}`}
                                                </p>
                                            </div>
 
                                            {result.ats_breakdown.missing_sections.length > 0 && (
                                                <div>
                                                    <strong style={{ color: "#fb7185" }}>⚠️ Missing Critical Sections:</strong>
                                                    <p style={{ margin: "4px 0 0 0", color: "#fb7185", fontWeight: "600" }}>{result.ats_breakdown.missing_sections.join(", ")}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
 
                                {/* Extracted Skills list */}
                                <div>
                                    <h4 style={{ margin: "0 0 10px 0", color: "#e2e8f0", fontSize: "0.9rem", fontWeight: "700" }}>Extracted Skills</h4>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                        {(result.skills || []).map((skill, idx) => (
                                            <span 
                                                key={idx}
                                                style={{
                                                    background: "rgba(99, 102, 241, 0.15)",
                                                    color: "#a5b4fc",
                                                    padding: "5px 10px",
                                                    borderRadius: "6px",
                                                    fontSize: "0.75rem",
                                                    fontWeight: "600",
                                                    border: "1px solid rgba(99,102,241,0.15)"
                                                }}
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
 
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
