import { useEffect, useState } from "react";
import API from "../services/api";
import AIFeedbackSection from "../components/AIFeedbackSection";

export default function CandidateDashboard() {
    const [file, setFile] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [statusLogs, setStatusLogs] = useState([]);

    useEffect(() => {
        // Fetch jobs for target matching selection
        API.get("/job/all")
            .then(res => {
                setJobs(res.data);
                if (res.data.length > 0) {
                    setSelectedJobId(res.data[0]._id);
                }
            })
            .catch(err => console.error("Error fetching jobs:", err));
    }, []);

    const handleUpload = async () => {
        if (!file) {
            alert("Please select your resume PDF first");
            return;
        }

        setIsProcessing(true);
        setStatusLogs([]);
        setResult(null);

        const logs = [
            "📂 Opening PDF resume...",
            "📝 Extracting plain text content...",
            "🤖 Querying Gemini for profile extraction & feedback...",
            "⚡ Comparing profile against target job role...",
            "📊 Evaluating ATS parameters and scoring...",
            "🎉 Resume evaluation complete!"
        ];

        for (let i = 0; i < logs.length - 1; i++) {
            setStatusLogs(prev => [...prev, logs[i]]);
            await new Promise(r => setTimeout(r, 500));
        }

        const formData = new FormData();
        formData.append("file", file);
        if (selectedJobId) {
            formData.append("job_id", selectedJobId);
        }

        try {
            const response = await API.post("/resume/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            setStatusLogs(prev => [...prev, logs[logs.length - 1]]);
            setResult(response.data);
        } catch (error) {
            console.error("Error evaluating resume:", error);
            setStatusLogs(prev => [...prev, "❌ Evaluation failed. Please check backend connection."]);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="page" style={{ background: "#0f172a", minHeight: "100vh", color: "#f8fafc", padding: "40px 20px" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
                    <div>
                        <h1 style={{ fontSize: "2.5rem", fontWeight: "800", margin: 0, color: "#f8fafc" }}>
                            Candidate Career Portal
                        </h1>
                        <p style={{ color: "#94a3b8", marginTop: "5px", fontSize: "1.1rem" }}>
                            Evaluate your resume using our AI ATS screener and identify learning paths.
                        </p>
                    </div>
                    <button 
                        onClick={() => window.location.href = "/"}
                        style={{
                            background: "transparent",
                            border: "1px solid #475569",
                            color: "#94a3b8",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "600"
                        }}
                    >
                        Logout
                    </button>
                </div>

                <div style={{ display: "flex", gap: "30px", flexDirection: "column" }}>
                    
                    {/* Upload widget */}
                    <div className="glass-card" style={{ display: "flex", flexWrap: "wrap", gap: "25px", padding: "30px", alignItems: "center" }}>
                        <div style={{ flex: 1, minWidth: "280px" }}>
                            <h2 style={{ fontSize: "1.4rem", color: "#f1f5f9", marginBottom: "10px" }}>Upload Resume</h2>
                            <p style={{ color: "#cbd5e1", fontSize: "0.95rem" }}>
                                Select the target position you are interested in and upload your PDF resume.
                            </p>
                        </div>

                        <div style={{ display: "flex", gap: "15px", flex: 2, flexWrap: "wrap", width: "100%" }}>
                            <select 
                                value={selectedJobId}
                                onChange={(e) => setSelectedJobId(e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: "12px",
                                    borderRadius: "8px",
                                    border: "1px solid #334155",
                                    background: "#1e293b",
                                    color: "#f8fafc",
                                    minWidth: "220px",
                                    outline: "none"
                                }}
                            >
                                <option value="">-- Software Engineer (Default Required Skills) --</option>
                                {jobs.map(job => (
                                    <option key={job._id} value={job._id}>
                                        {job.title}
                                    </option>
                                ))}
                            </select>

                            <input 
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => setFile(e.target.files[0])}
                                style={{
                                    flex: 1,
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "1px solid #334155",
                                    background: "#1e293b",
                                    color: "#f8fafc",
                                    minWidth: "220px"
                                }}
                            />

                            <button 
                                className="btn"
                                onClick={handleUpload}
                                disabled={isProcessing}
                                style={{
                                    padding: "12px 25px",
                                    fontSize: "1rem",
                                    fontWeight: "600",
                                    background: isProcessing ? "#475569" : "#6366f1",
                                    cursor: isProcessing ? "not-allowed" : "pointer"
                                }}
                            >
                                {isProcessing ? "Analyzing..." : "Upload & Analyze"}
                            </button>
                        </div>
                    </div>

                    {isProcessing && (
                        <div className="glass-card" style={{ padding: "30px", background: "#090d16" }}>
                            <h3 style={{ fontSize: "1.1rem", color: "#34d399", marginBottom: "15px" }}>Evaluation Console Logs</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontFamily: "monospace", color: "#60a5fa" }}>
                                {statusLogs.map((log, index) => (
                                    <div key={index}>{log}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    {result && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                            
                            {/* KPI Metrics Cards */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                                <div className="glass-card" style={{ textAlign: "center", padding: "25px" }}>
                                    <div style={{ color: "#94a3b8", fontSize: "0.9rem", fontWeight: "600" }}>Resume Score</div>
                                    <h1 style={{ fontSize: "3rem", fontWeight: "800", color: "#34d399", margin: "10px 0 0 0" }}>
                                        {result.score}%
                                    </h1>
                                </div>

                                <div className="glass-card" style={{ textAlign: "center", padding: "25px" }}>
                                    <div style={{ color: "#94a3b8", fontSize: "0.9rem", fontWeight: "600" }}>Skill Match %</div>
                                    <h1 style={{ fontSize: "3rem", fontWeight: "800", color: "#6366f1", margin: "10px 0 0 0" }}>
                                        {result.skill_match}%
                                    </h1>
                                </div>

                                <div className="glass-card" style={{ textAlign: "center", padding: "25px" }}>
                                    <div style={{ color: "#94a3b8", fontSize: "0.9rem", fontWeight: "600" }}>Projects Count</div>
                                    <h1 style={{ fontSize: "3rem", fontWeight: "800", color: "#cbd5e1", margin: "10px 0 0 0" }}>
                                        {(result.projects || []).length}
                                    </h1>
                                </div>

                                <div className="glass-card" style={{ textAlign: "center", padding: "25px" }}>
                                    <div style={{ color: "#94a3b8", fontSize: "0.9rem", fontWeight: "600" }}>Certificates Count</div>
                                    <h1 style={{ fontSize: "3rem", fontWeight: "800", color: "#c084fc", margin: "10px 0 0 0" }}>
                                        {(result.certificates || []).length}
                                    </h1>
                                </div>

                                <div className="glass-card" style={{ textAlign: "center", padding: "25px", border: result.status === "Shortlisted" ? "1px solid rgba(52, 211, 153, 0.3)" : "1px solid rgba(248, 113, 113, 0.3)" }}>
                                    <div style={{ color: "#94a3b8", fontSize: "0.9rem", fontWeight: "600" }}>Status</div>
                                    <h1 style={{ fontSize: "2.2rem", fontWeight: "800", color: result.status === "Shortlisted" ? "#34d399" : "#f87171", margin: "18px 0 0 0" }}>
                                        {result.status}
                                    </h1>
                                </div>
                            </div>

                            {/* Details layout */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))", gap: "25px" }}>
                                <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                    <div>
                                        <AIFeedbackSection feedback={result.feedback} />
                                    </div>

                                    <div>
                                        <h2 style={{ fontSize: "1.4rem", color: "#f1f5f9", marginBottom: "10px" }}>Extracted Profile</h2>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.9rem", color: "#94a3b8" }}>
                                            <div><strong>Name:</strong> <span style={{ color: "#f8fafc" }}>{result.name}</span></div>
                                            <div><strong>Email:</strong> <span style={{ color: "#f8fafc" }}>{result.email}</span></div>
                                            <div><strong>Experience:</strong> <span style={{ color: "#f8fafc" }}>{result.experience_years} Years</span></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                                    <div>
                                        <h2 style={{ fontSize: "1.4rem", color: "#f1f5f9", marginBottom: "15px" }}>Skill Analysis (Matched vs Missing)</h2>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                                            <div>
                                                <h4 style={{ margin: "0 0 8px 0", color: "#34d399" }}>Matched Skills</h4>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                                    {(result.matched_skills || []).map((skill, i) => (
                                                        <span key={i} style={{ background: "rgba(52, 211, 153, 0.1)", color: "#34d399", padding: "4px 8px", borderRadius: "6px", fontSize: "0.8rem" }}>
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 style={{ margin: "0 0 8px 0", color: "#f87171" }}>Missing Skills</h4>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                                    {(result.missing_skills || []).length === 0 ? (
                                                        <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>None, you matched all requirements!</span>
                                                    ) : (
                                                        (result.missing_skills || []).map((skill, i) => (
                                                            <span key={i} style={{ background: "rgba(248, 113, 113, 0.1)", color: "#f87171", padding: "4px 8px", borderRadius: "6px", fontSize: "0.8rem" }}>
                                                                {skill}
                                                            </span>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h2 style={{ fontSize: "1.4rem", color: "#f1f5f9", marginBottom: "15px" }}>AI Learning Path Recommendations</h2>
                                        <ul style={{ margin: 0, paddingLeft: "20px", color: "#a5b4fc", fontSize: "0.95rem" }}>
                                            {(result.recommendations || []).map((rec, i) => (
                                                <li key={i} style={{ margin: "8px 0" }}>{rec}</li>
                                            ))}
                                        </ul>
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