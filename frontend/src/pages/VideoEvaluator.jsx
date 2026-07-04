import { useState } from "react";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

export default function VideoEvaluator() {
    const [file, setFile] = useState(null);
    const [candidateName, setCandidateName] = useState("");
    const [jobTitle, setJobTitle] = useState("Software Engineer");
    const [result, setResult] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            alert("Please select a file first.");
            return;
        }

        setIsProcessing(true);
        setResult(null);

        const fd = new FormData();
        fd.append("file", file);
        fd.append("candidate_name", candidateName || "Candidate");
        fd.append("job_title", jobTitle || "Software Engineer");

        try {
            const res = await API.post("/interview/evaluate-video", fd, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            setResult(res.data);
            
            // Log recruiter activity
            await API.post("/recruiter/recent-activity/add", {
                type: "video_evaluate",
                description: `Evaluated interview submission for '${candidateName || "Candidate"}'`
            });
        } catch (err) {
            console.error("Evaluation failed", err);
            alert("Failed to analyze interview resource.");
        } finally {
            setIsProcessing(false);
        }
    };

    const getDownloadUrl = () => {
        if (!result) return "#";
        const cName = candidateName || "Candidate";
        const jTitle = jobTitle || "Software Engineer";
        const host = API.defaults.baseURL || "http://localhost:8000";
        
        return `${host}/interview/download-report?candidate_name=${encodeURIComponent(cName)}&job_title=${encodeURIComponent(jTitle)}&confidence=${result.confidence}&voice=${result.voice}&grammar=${result.grammar}&fluency=${result.fluency}&eye_contact=${result.eye_contact}&smile=${result.smile}&body_language=${result.body_language}&final_interview_score=${result.final_interview_score}&coding_assessment=${encodeURIComponent(result.coding_assessment)}&general_feedback=${encodeURIComponent(result.general_feedback)}`;
    };

    return (
        <div className="dashboard" style={{ background: "#0f172a", minHeight: "100vh", color: "#f8fafc" }}>
            <Sidebar />

            <div className="content" style={{ padding: "40px", flex: 1, overflowY: "auto" }}>
                <div style={{ marginBottom: "30px" }}>
                    <h1 style={{ fontSize: "2.2rem", fontWeight: "800", margin: 0 }}>
                        AI Interview Evaluator
                    </h1>
                    <p style={{ color: "#94a3b8", marginTop: "5px" }}>
                        Upload video files (MP4, MOV, AVI, MKV, WebM) or reports (PDF, DOCX, PPT) to assess candidate communication, confidence, eye contact, and body language.
                    </p>
                </div>

                <div style={{ display: "flex", gap: "30px", alignItems: "flex-start" }}>
                    
                    {/* Upload Panel */}
                    <div className="glass-card" style={{ flex: 1, padding: "30px", background: "rgba(255,255,255,0.02)" }}>
                        <h2 style={{ fontSize: "1.3rem", color: "#cbd5e1", marginBottom: "20px", marginTop: 0 }}>Evaluate Interview Resource</h2>
                        <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label style={{ fontSize: "0.9rem", color: "#94a3b8", fontWeight: "600" }}>Candidate Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter Candidate Name"
                                    value={candidateName}
                                    onChange={e => setCandidateName(e.target.value)}
                                    style={{ width: "100%", background: "#1e293b", color: "white", border: "1px solid #334155" }}
                                    required
                                />
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label style={{ fontSize: "0.9rem", color: "#94a3b8", fontWeight: "600" }}>Target Job Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter Job Title"
                                    value={jobTitle}
                                    onChange={e => setJobTitle(e.target.value)}
                                    style={{ width: "100%", background: "#1e293b", color: "white", border: "1px solid #334155" }}
                                    required
                                />
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label style={{ fontSize: "0.9rem", color: "#94a3b8", fontWeight: "600" }}>Interview File (Video or Document)</label>
                                <input
                                    type="file"
                                    accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,.mp4,.mov,.avi,.mkv,.webm,.pdf,.docx,.ppt,.pptx"
                                    onChange={e => setFile(e.target.files[0])}
                                    style={{ width: "100%", padding: "10px", background: "#1e293b", color: "white", borderRadius: "8px", border: "1px solid #334155" }}
                                    required
                                />
                                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Supported: MP4, MOV, AVI, MKV, WebM, PDF, DOCX, PPT</span>
                            </div>

                            <button className="btn" type="submit" disabled={isProcessing} style={{ width: "100%" }}>
                                {isProcessing ? "Analyzing Interview Data..." : "Run AI Evaluator"}
                            </button>

                        </form>
                    </div>

                    {/* Result Analysis Panel */}
                    <div className="glass-card" style={{ flex: 1.5, padding: "30px", background: "rgba(99, 102, 241, 0.02)", border: "1px solid rgba(99, 102, 241, 0.15)" }}>
                        <h2 style={{ fontSize: "1.3rem", color: "#cbd5e1", marginBottom: "25px", marginTop: 0 }}>Interview Analysis Report</h2>
                        
                        {result ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" }}>
                                    
                                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                                        <div>
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                                                <span>Confidence Gauge</span>
                                                <span style={{ color: "#34d399", fontWeight: "bold" }}>{result.confidence}%</span>
                                            </div>
                                            <div style={{ height: "6px", background: "#1e293b", borderRadius: "3px", marginTop: "4px" }}>
                                                <div style={{ width: `${result.confidence}%`, background: "#34d399", height: "100%" }} />
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                                                <span>Fluency & Grammar</span>
                                                <span style={{ color: "#34d399", fontWeight: "bold" }}>{result.grammar}%</span>
                                            </div>
                                            <div style={{ height: "6px", background: "#1e293b", borderRadius: "3px", marginTop: "4px" }}>
                                                <div style={{ width: `${result.grammar}%`, background: "#34d399", height: "100%" }} />
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                                                <span>Communication Clarity</span>
                                                <span style={{ color: "#60a5fa", fontWeight: "bold" }}>{result.voice}%</span>
                                            </div>
                                            <div style={{ height: "6px", background: "#1e293b", borderRadius: "3px", marginTop: "4px" }}>
                                                <div style={{ width: `${result.voice}%`, background: "#60a5fa", height: "100%" }} />
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                                                <span>Eye Contact Focus</span>
                                                <span style={{ color: "#c084fc", fontWeight: "bold" }}>{result.eye_contact}%</span>
                                            </div>
                                            <div style={{ height: "6px", background: "#1e293b", borderRadius: "3px", marginTop: "4px" }}>
                                                <div style={{ width: `${result.eye_contact}%`, background: "#c084fc", height: "100%" }} />
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                                                <span>Body Language & Posture</span>
                                                <span style={{ color: "#fb7185", fontWeight: "bold" }}>{result.body_language}%</span>
                                            </div>
                                            <div style={{ height: "6px", background: "#1e293b", borderRadius: "3px", marginTop: "4px" }}>
                                                <div style={{ width: `${result.body_language}%`, background: "#fb7185", height: "100%" }} />
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                                        <div style={{ background: "rgba(255,255,255,0.02)", padding: "15px", borderRadius: "10px", textAlign: "center", border: "1px solid rgba(255,255,255,0.05)" }}>
                                            <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Overall Interview Score</span>
                                            <h1 style={{ fontSize: "2.5rem", color: "#34d399", margin: "5px 0 0 0" }}>{result.final_interview_score}%</h1>
                                        </div>
                                        <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "10px", fontSize: "0.85rem" }}>
                                            <strong>Speech Speed:</strong> {result.speaking_speed} wpm (Optimal)<br />
                                            <strong>Primary Emotion:</strong> {result.emotion}
                                        </div>
                                    </div>

                                </div>

                                <div style={{ background: "rgba(255,255,255,0.01)", padding: "15px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", fontSize: "0.9rem" }}>
                                    <div style={{ marginBottom: "8px" }}><strong>Logic & Articulation:</strong> {result.coding_assessment}</div>
                                    <div><strong>General Feedback:</strong> {result.general_feedback}</div>
                                </div>

                                <a 
                                    href={getDownloadUrl()} 
                                    download={`${candidateName.replace(/\s+/g, '_')}_interview_report.pdf`}
                                    className="btn" 
                                    style={{ textAlign: "center", textDecoration: "none", background: "linear-gradient(135deg, #10b981, #059669)", width: "100%" }}
                                >
                                    📥 Download Professional PDF Report
                                </a>

                            </div>
                        ) : (
                            <div style={{ color: "#94a3b8", textAlign: "center", paddingTop: "60px" }}>
                                {isProcessing ? "AI is running speech analytics and gaze tracking on file..." : "No analysis run. Enter candidate parameters, upload file and execute."}
                            </div>
                        )}

                    </div>

                </div>
            </div>
        </div>
    );
}
