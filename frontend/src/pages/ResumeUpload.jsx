import { useEffect, useState } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import AIFeedbackSection from "../components/AIFeedbackSection";

export default function ResumeUpload() {
    const [file, setFile] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState("");
    const [statusLogs, setStatusLogs] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        // Fetch jobs for dropdown selection
        API.get("/job/all")
            .then(res => {
                setJobs(res.data);
                if (res.data.length > 0) {
                    setSelectedJobId(res.data[0]._id);
                }
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

        // Simulated logging for a high fidelity user experience
        const logSteps = [
            "📂 Opening PDF document...",
            "📝 Extracting resume plain text...",
            "🤖 Querying Gemini 2.5 Flash API...",
            "🧠 Parsing candidate profile, credentials, and achievements...",
            "⚡ Running skill gap analysis against target job profile...",
            "📊 Scoring candidate parameters (experience, projects, education)...",
            "💾 Saving candidate profile & metrics to MongoDB...",
            "🚀 Screening Pipeline completed successfully!"
        ];

        for (let i = 0; i < logSteps.length - 1; i++) {
            setStatusLogs(prev => [...prev, logSteps[i]]);
            await new Promise(r => setTimeout(r, 600));
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
                <h1 style={{ fontSize: "2.2rem", fontWeight: "800", marginBottom: "10px" }}>
                    Resume Upload & Screening
                </h1>
                <p style={{ color: "#94a3b8", marginBottom: "30px" }}>
                    Upload candidate PDF resumes to run the automated AI-powered ATS screening pipeline.
                </p>

                <div style={{ display: "flex", gap: "30px", alignItems: "flex-start" }}>
                    <div className="glass-card" style={{ flex: 1, padding: "30px", background: "rgba(255,255,255,0.02)" }}>
                        <h2 style={{ fontSize: "1.3rem", color: "#f1f5f9", marginBottom: "20px" }}>Select Parameters</h2>

                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label style={{ fontSize: "0.9rem", color: "#94a3b8", fontWeight: "600" }}>Target Job Profile</label>
                                <select 
                                    value={selectedJobId} 
                                    onChange={(e) => setSelectedJobId(e.target.value)}
                                    style={{
                                        padding: "12px",
                                        borderRadius: "8px",
                                        border: "1px solid #334155",
                                        background: "#1e293b",
                                        color: "#f8fafc",
                                        outline: "none"
                                    }}
                                >
                                    <option value="">-- General Application (Default Skills) --</option>
                                    {jobs.map(job => (
                                        <option key={job._id} value={job._id}>
                                            {job.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label style={{ fontSize: "0.9rem", color: "#94a3b8", fontWeight: "600" }}>Resume File (PDF)</label>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    style={{
                                        padding: "10px",
                                        borderRadius: "8px",
                                        border: "1px solid #334155",
                                        background: "#1e293b",
                                        color: "#f8fafc"
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
                                    fontWeight: "600",
                                    marginTop: "10px",
                                    background: isProcessing ? "#475569" : "#6366f1",
                                    cursor: isProcessing ? "not-allowed" : "pointer"
                                }}
                            >
                                {isProcessing ? "Processing Resume..." : "Run AI Screener"}
                            </button>
                        </div>

                        {statusLogs.length > 0 && (
                            <div style={{ marginTop: "30px" }}>
                                <h3 style={{ fontSize: "1rem", color: "#e2e8f0", marginBottom: "12px" }}>Pipeline Console Logs</h3>
                                <div style={{
                                    background: "#090d16",
                                    padding: "15px",
                                    borderRadius: "8px",
                                    fontFamily: "monospace",
                                    fontSize: "0.85rem",
                                    color: "#34d399",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "6px",
                                    maxHeight: "200px",
                                    overflowY: "auto"
                                }}>
                                    {statusLogs.map((log, index) => (
                                        <div key={index}>{log}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {result && (
                        <div className="glass-card" style={{ flex: 1.5, padding: "30px", background: "rgba(99, 102, 241, 0.03)", border: "1px solid rgba(99, 102, 241, 0.15)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                <h2 style={{ fontSize: "1.4rem", color: "#f1f5f9", margin: 0 }}>Screening Results</h2>
                                <span style={{
                                    background: result.status === "Shortlisted" ? "rgba(52, 211, 153, 0.15)" : "rgba(248, 113, 113, 0.15)",
                                    color: result.status === "Shortlisted" ? "#34d399" : "#f87171",
                                    padding: "6px 15px",
                                    borderRadius: "20px",
                                    fontSize: "0.85rem",
                                    fontWeight: "700"
                                }}>
                                    {result.status}
                                </span>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <div>
                                    <h3 style={{ margin: "0 0 5px 0", fontSize: "1.3rem", color: "#f8fafc" }}>{result.name}</h3>
                                    <p style={{ color: "#94a3b8", margin: 0 }}>{result.email}</p>
                                    <p style={{ color: "#a5b4fc", fontSize: "0.9rem", marginTop: "5px" }}>Target Role: {result.target_job_title}</p>
                                </div>

                                <div style={{ display: "flex", gap: "15px" }}>
                                    <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", padding: "15px", borderRadius: "10px", textAlign: "center" }}>
                                        <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>ATS Score</div>
                                        <div style={{ fontSize: "1.5rem", fontWeight: "800", color: result.score >= 50 ? "#34d399" : "#f87171", marginTop: "5px" }}>{result.score}%</div>
                                    </div>

                                    <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", padding: "15px", borderRadius: "10px", textAlign: "center" }}>
                                        <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Skill Match</div>
                                        <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#6366f1", marginTop: "5px" }}>{result.skill_match}%</div>
                                    </div>

                                    <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", padding: "15px", borderRadius: "10px", textAlign: "center" }}>
                                        <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Experience</div>
                                        <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#cbd5e1", marginTop: "5px" }}>{result.experience_years} Yrs</div>
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ margin: "0 0 8px 0", color: "#e2e8f0" }}>Extracted Skills</h4>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                        {(result.skills || []).map((skill, idx) => (
                                            <span 
                                                key={idx}
                                                style={{
                                                    background: "rgba(99, 102, 241, 0.15)",
                                                    color: "#a5b4fc",
                                                    padding: "4px 8px",
                                                    borderRadius: "6px",
                                                    fontSize: "0.8rem"
                                                }}
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <AIFeedbackSection feedback={result.feedback} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}