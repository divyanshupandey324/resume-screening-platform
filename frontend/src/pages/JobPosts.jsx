import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

export default function JobPosts() {
    const [jobs, setJobs] = useState([]);
    const [newJob, setNewJob] = useState({
        title: "",
        description: "",
        required_skills: "",
        preferred_skills: "",
        minimum_experience: 1,
        location: "",
        salary: "",
        job_type: "Full-Time",
        company: "",
        min_ats_score: 60,
        deadline: ""
    });
    const [msg, setMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await API.get("/job/all");
            setJobs(res.data);
        } catch (e) {
            console.error("Failed to load jobs", e);
        }
    };

    const [selectedJob, setSelectedJob] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [loadingApplicants, setLoadingApplicants] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState(null);

    const handleJobClick = async (job) => {
        setSelectedJob(job);
        setSelectedApplicant(null);
        setLoadingApplicants(true);
        try {
            const res = await API.get(`/job/${job._id}/applicants`);
            setApplicants(res.data);
        } catch (e) {
            console.error("Failed to load applicants", e);
        } finally {
            setLoadingApplicants(false);
        }
    };

    const handleUpdateApplicantStatus = async (candidateId, newStatus) => {
        try {
            const res = await API.post("/candidate/update-status", {
                candidate_id: candidateId,
                status: newStatus
            });
            if (res.data.success) {
                const updated = applicants.map(cand => 
                    cand._id === candidateId ? { ...cand, status: newStatus } : cand
                );
                setApplicants(updated);
                if (selectedApplicant && selectedApplicant._id === candidateId) {
                    setSelectedApplicant({ ...selectedApplicant, status: newStatus });
                }
                await API.post("/recruiter/recent-activity/add", {
                    type: "status_update",
                    description: `Updated candidate status to '${newStatus}'`
                });
            } else {
                alert(res.data.message || "Failed to update status");
            }
        } catch (e) {
            console.error(e);
            alert("Error updating status");
        }
    };

    const handleCreateJob = async (e) => {
        e.preventDefault();
        if (!newJob.title || !newJob.description || !newJob.required_skills) {
            setMsg("Please enter Title, Description, and Required Skills.");
            return;
        }
        setIsSubmitting(true);
        setMsg("");
        
        try {
            const payload = {
                ...newJob,
                required_skills: newJob.required_skills.split(",").map(s => s.trim().toLowerCase()),
                preferred_skills: newJob.preferred_skills ? newJob.preferred_skills.split(",").map(s => s.trim().toLowerCase()) : [],
                minimum_experience: parseFloat(newJob.minimum_experience),
                experience: parseFloat(newJob.minimum_experience),
                min_ats_score: parseFloat(newJob.min_ats_score),
                ats_threshold: parseFloat(newJob.min_ats_score),
                recruiter_id: localStorage.getItem("username") || "recruiter_default"
            };
            
            await API.post("/job/save", payload);
            setMsg("✓ Job posted successfully!");
            setNewJob({
                title: "",
                description: "",
                required_skills: "",
                preferred_skills: "",
                minimum_experience: 1,
                location: "",
                salary: "",
                job_type: "Full-Time",
                company: "",
                min_ats_score: 60,
                deadline: ""
            });
            fetchJobs();
            
            // Add recruiter activity log
            await API.post("/recruiter/recent-activity/add", {
                type: "job_publish",
                description: `Published job posting for '${payload.title}'`
            });
        } catch (error) {
            console.error(error);
            setMsg("❌ Failed to post job.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="dashboard" style={{ background: "#0f172a", minHeight: "100vh", color: "#f8fafc" }}>
            <Sidebar />

            <div className="content" style={{ padding: "40px", flex: 1, overflowY: "auto" }}>
                <div style={{ marginBottom: "30px" }}>
                    <h1 style={{ fontSize: "2.2rem", fontWeight: "800", margin: 0 }}>
                        Job Positions Registry
                    </h1>
                    <p style={{ color: "#94a3b8", marginTop: "5px" }}>
                        Create and manage corporate job listings published directly to the Candidate Portal.
                    </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.5fr", gap: "30px" }}>
                    
                    {/* Job Creation Form */}
                    <div className="glass-card" style={{ padding: "30px", background: "rgba(255,255,255,0.02)" }}>
                        <h2 style={{ fontSize: "1.3rem", color: "#cbd5e1", marginBottom: "20px", marginTop: 0 }}>Post New Job Position</h2>
                        <form onSubmit={handleCreateJob} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                            
                            <input
                                type="text"
                                placeholder="Job Title *"
                                value={newJob.title}
                                onChange={e => setNewJob({ ...newJob, title: e.target.value })}
                                style={{ width: "100%", background: "#1e293b", color: "white", border: "1px solid #334155" }}
                                required
                            />
                            
                            <input
                                type="text"
                                placeholder="Company Name"
                                value={newJob.company}
                                onChange={e => setNewJob({ ...newJob, company: e.target.value })}
                                style={{ width: "100%", background: "#1e293b", color: "white", border: "1px solid #334155" }}
                            />

                            <textarea
                                placeholder="Job Description *"
                                value={newJob.description}
                                onChange={e => setNewJob({ ...newJob, description: e.target.value })}
                                style={{ width: "100%", height: "100px", padding: "12px", borderRadius: "10px", background: "#1e293b", color: "white", border: "1px solid #334155", fontFamily: "inherit" }}
                                required
                            />

                            <input
                                type="text"
                                placeholder="Required Skills * (comma separated, e.g. python, sql)"
                                value={newJob.required_skills}
                                onChange={e => setNewJob({ ...newJob, required_skills: e.target.value })}
                                style={{ width: "100%", background: "#1e293b", color: "white", border: "1px solid #334155" }}
                                required
                            />

                            <input
                                type="text"
                                placeholder="Preferred Skills (comma separated, e.g. docker, aws)"
                                value={newJob.preferred_skills}
                                onChange={e => setNewJob({ ...newJob, preferred_skills: e.target.value })}
                                style={{ width: "100%", background: "#1e293b", color: "white", border: "1px solid #334155" }}
                            />

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                                <div>
                                    <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Min Experience (Yrs)</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={newJob.minimum_experience}
                                        onChange={e => setNewJob({ ...newJob, minimum_experience: e.target.value })}
                                        style={{ width: "100%", background: "#1e293b", color: "white", border: "1px solid #334155" }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Min ATS Threshold (0-100)</label>
                                    <input
                                        type="number"
                                        value={newJob.min_ats_score}
                                        onChange={e => setNewJob({ ...newJob, min_ats_score: e.target.value })}
                                        style={{ width: "100%", background: "#1e293b", color: "white", border: "1px solid #334155" }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                                <input
                                    type="text"
                                    placeholder="Location (e.g. New York, Remote)"
                                    value={newJob.location}
                                    onChange={e => setNewJob({ ...newJob, location: e.target.value })}
                                    style={{ width: "100%", background: "#1e293b", color: "white", border: "1px solid #334155" }}
                                />
                                <input
                                    type="text"
                                    placeholder="Salary (e.g. $120k - $140k)"
                                    value={newJob.salary}
                                    onChange={e => setNewJob({ ...newJob, salary: e.target.value })}
                                    style={{ width: "100%", background: "#1e293b", color: "white", border: "1px solid #334155" }}
                                />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                                <select
                                    value={newJob.job_type}
                                    onChange={e => setNewJob({ ...newJob, job_type: e.target.value })}
                                    style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#1e293b", color: "white", border: "1px solid #334155" }}
                                >
                                    <option value="Full-Time">Full-Time</option>
                                    <option value="Part-Time">Part-Time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Internship">Internship</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Deadline (YYYY-MM-DD)"
                                    value={newJob.deadline}
                                    onChange={e => setNewJob({ ...newJob, deadline: e.target.value })}
                                    style={{ width: "100%", background: "#1e293b", color: "white", border: "1px solid #334155" }}
                                />
                            </div>

                            <button className="btn" type="submit" disabled={isSubmitting} style={{ width: "100%" }}>
                                {isSubmitting ? "Publishing Job..." : "Publish to Candidate Portal"}
                            </button>
                            {msg && (
                                <p style={{ color: msg.includes("successfully") ? "#34d399" : "#f87171", textAlign: "center", fontSize: "0.9rem", marginTop: "10px" }}>
                                    {msg}
                                </p>
                            )}
                        </form>
                    </div>

                    {/* Jobs List */}
                    <div className="glass-card" style={{ padding: "30px", background: "rgba(255,255,255,0.02)" }}>
                        <h2 style={{ fontSize: "1.3rem", color: "#cbd5e1", marginBottom: "20px", marginTop: 0 }}>Existing Job Listings</h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "15px", maxHeight: "550px", overflowY: "auto" }}>
                            {jobs.length === 0 ? (
                                <div style={{ color: "#94a3b8", textAlign: "center", padding: "40px" }}>No active jobs.</div>
                            ) : (
                                jobs.map(j => (
                                    <div 
                                        key={j._id} 
                                        onClick={() => handleJobClick(j)}
                                        style={{ 
                                            background: "rgba(255,255,255,0.02)", 
                                            padding: "20px", 
                                            borderRadius: "12px", 
                                            border: "1px solid rgba(255,255,255,0.05)",
                                            cursor: "pointer",
                                            transition: "all 0.2s"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = "#6366f1";
                                            e.currentTarget.style.background = "rgba(99, 102, 241, 0.04)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                                            e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#cbd5e1" }}>{j.title}</h3>
                                            <span style={{ background: "rgba(99, 102, 241, 0.15)", color: "#a5b4fc", padding: "4px 10px", borderRadius: "20px", fontSize: "0.8rem" }}>
                                                ATS Threshold: {j.ats_threshold || j.min_ats_score}%
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", gap: "15px", fontSize: "0.8rem", color: "#94a3b8", marginTop: "5px" }}>
                                            <span>🏢 {j.company || "Unknown Company"}</span>
                                            <span>📍 {j.location || "Remote"}</span>
                                            <span>💰 {j.salary || "N/A"}</span>
                                        </div>
                                        <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: "10px 0" }}>{j.description}</p>
                                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
                                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                                {j.required_skills.map((s, idx) => (
                                                    <span key={idx} style={{ background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: "6px", fontSize: "0.75rem", color: "#cbd5e1" }}>{s}</span>
                                                ))}
                                            </div>
                                            <span style={{ fontSize: "0.75rem", color: "#6366f1", fontWeight: "bold" }}>
                                                View Applicants →
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {selectedJob && (
                <div style={{
                    position: "fixed",
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(15, 23, 42, 0.95)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000,
                    padding: "40px"
                }}>
                    <div className="glass-card" style={{
                        width: "100%",
                        maxWidth: "1200px",
                        height: "90vh",
                        background: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "16px",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        color: "#f8fafc",
                        position: "relative"
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: "20px 30px",
                            borderBottom: "1px solid #334155",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: "1.4rem", color: "#cbd5e1" }}>
                                    Applicants for: {selectedJob.title}
                                </h2>
                                <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                                    🏢 {selectedJob.company} • 📍 {selectedJob.location} • 💰 {selectedJob.salary}
                                </span>
                            </div>
                            <button 
                                onClick={() => setSelectedJob(null)}
                                style={{
                                    background: "rgba(255,255,255,0.05)",
                                    border: "none",
                                    color: "#cbd5e1",
                                    padding: "8px 16px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "bold"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                            >
                                Close Window
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                            {/* Left Pane: Applicants List */}
                            <div style={{
                                width: "35%",
                                borderRight: "1px solid #334155",
                                display: "flex",
                                flexDirection: "column",
                                overflowY: "auto",
                                padding: "20px",
                                background: "#0f172a"
                            }}>
                                <h3 style={{ margin: "0 0 15px 0", fontSize: "1.1rem", color: "#94a3b8" }}>
                                    Candidate Applications ({applicants.length})
                                </h3>
                                {loadingApplicants ? (
                                    <div style={{ color: "#94a3b8", textAlign: "center", padding: "20px" }}>Loading applicants...</div>
                                ) : applicants.length === 0 ? (
                                    <div style={{ color: "#94a3b8", textAlign: "center", padding: "40px" }}>No applications received yet.</div>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                        {applicants.map(cand => (
                                            <div 
                                                key={cand._id}
                                                onClick={() => setSelectedApplicant(cand)}
                                                style={{
                                                    padding: "15px",
                                                    borderRadius: "10px",
                                                    background: selectedApplicant?._id === cand._id ? "rgba(99, 102, 241, 0.15)" : "#1e293b",
                                                    border: selectedApplicant?._id === cand._id ? "1px solid #6366f1" : "1px solid #334155",
                                                    cursor: "pointer",
                                                    transition: "all 0.2s"
                                                }}
                                            >
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <strong style={{ fontSize: "1rem", color: "#cbd5e1" }}>{cand.name}</strong>
                                                    <span style={{
                                                        background: cand.score >= 80 ? "rgba(16, 185, 129, 0.2)" : (cand.score >= 60 ? "rgba(245, 158, 11, 0.2)" : "rgba(239, 68, 68, 0.2)"),
                                                        color: cand.score >= 80 ? "#10b981" : (cand.score >= 60 ? "#f59e0b" : "#ef4444"),
                                                        padding: "2px 8px",
                                                        borderRadius: "12px",
                                                        fontSize: "0.75rem",
                                                        fontWeight: "bold"
                                                    }}>
                                                        ATS: {cand.score}%
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "5px" }}>
                                                    {cand.email}
                                                </div>
                                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginTop: "8px" }}>
                                                    <span style={{ color: "#a5b4fc" }}>💼 {cand.experience_years} Yrs Exp</span>
                                                    <span style={{ 
                                                        color: cand.status === "Shortlisted" ? "#34d399" : (cand.status === "Rejected" ? "#f87171" : "#cbd5e1"),
                                                        fontWeight: "bold"
                                                    }}>
                                                        {cand.status || "Applied"}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right Pane: Applicant Profile Details */}
                            <div style={{
                                width: "65%",
                                display: "flex",
                                flexDirection: "column",
                                overflowY: "auto",
                                padding: "30px",
                                background: "#111827"
                            }}>
                                {selectedApplicant ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                                        {/* Applicant Summary */}
                                        <div style={{ 
                                            display: "flex", 
                                            justifyContent: "space-between", 
                                            alignItems: "flex-start",
                                            borderBottom: "1px solid #334155",
                                            paddingBottom: "20px"
                                        }}>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: "1.6rem", color: "#f8fafc" }}>{selectedApplicant.name}</h3>
                                                <p style={{ margin: "5px 0 0 0", color: "#94a3b8", fontSize: "0.95rem" }}>
                                                    ✉ {selectedApplicant.email} • 📞 {selectedApplicant.phone || "N/A"}
                                                </p>
                                                <p style={{ margin: "5px 0 0 0", color: "#a5b4fc", fontSize: "0.9rem" }}>
                                                    💼 Total Experience: <strong>{selectedApplicant.experience_years} Years</strong>
                                                </p>
                                            </div>
                                            
                                            {/* Status Action & Score */}
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                    <label style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Set Status:</label>
                                                    <select
                                                        value={selectedApplicant.status || "Applied"}
                                                        onChange={e => handleUpdateApplicantStatus(selectedApplicant._id, e.target.value)}
                                                        style={{ 
                                                            padding: "6px 12px", 
                                                            borderRadius: "6px", 
                                                            background: "#1e293b", 
                                                            color: "white", 
                                                            border: "1px solid #334155" 
                                                        }}
                                                    >
                                                        <option value="Applied">Applied</option>
                                                        <option value="Shortlisted">Shortlisted</option>
                                                        <option value="Rejected">Rejected</option>
                                                    </select>
                                                </div>

                                                
                                                <div style={{ 
                                                    background: "rgba(99, 102, 241, 0.1)", 
                                                    border: "1px solid rgba(99, 102, 241, 0.2)", 
                                                    padding: "10px 20px", 
                                                    borderRadius: "8px", 
                                                    textAlign: "right" 
                                                }}>
                                                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>ATS SCORE</div>
                                                    <strong style={{ fontSize: "1.4rem", color: "#818cf8" }}>{selectedApplicant.score}%</strong>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Grid Details */}
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                                            {/* Skills */}
                                            <div style={{ background: "rgba(255,255,255,0.01)", padding: "20px", borderRadius: "10px", border: "1px solid #334155" }}>
                                                <h4 style={{ margin: "0 0 10px 0", color: "#cbd5e1" }}>Skills</h4>
                                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                                    {selectedApplicant.skills?.map((s, idx) => (
                                                        <span key={idx} style={{ background: "rgba(99, 102, 241, 0.15)", padding: "4px 8px", borderRadius: "6px", fontSize: "0.8rem", color: "#a5b4fc" }}>
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Projects */}
                                            <div style={{ background: "rgba(255,255,255,0.01)", padding: "20px", borderRadius: "10px", border: "1px solid #334155" }}>
                                                <h4 style={{ margin: "0 0 10px 0", color: "#cbd5e1" }}>Projects</h4>
                                                <ul style={{ margin: 0, paddingLeft: "20px", color: "#cbd5e1", fontSize: "0.9rem" }}>
                                                    {selectedApplicant.projects?.map((p, idx) => (
                                                        <li key={idx} style={{ marginBottom: "5px" }}>{p}</li>
                                                    )) || <li>No projects listed.</li>}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Academic Details & Feedback */}
                                        <div style={{ background: "rgba(255,255,255,0.01)", padding: "20px", borderRadius: "10px", border: "1px solid #334155" }}>
                                            <h4 style={{ margin: "0 0 10px 0", color: "#cbd5e1" }}>Academic Details & Screening Feedback</h4>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "15px" }}>
                                                <span>Class X: <strong>{selectedApplicant.tenth_percentage}%</strong></span>
                                                <span>Class XII: <strong>{selectedApplicant.twelfth_percentage}%</strong></span>
                                                <span>Graduation: <strong>{selectedApplicant.graduation_cgpa} CGPA</strong></span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: "0.9rem", color: "#cbd5e1", fontStyle: "italic", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "6px", borderLeft: "4px solid #6366f1" }}>
                                                "{selectedApplicant.feedback}"
                                            </p>
                                        </div>

                                        {/* Resume Content View */}
                                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                            <h4 style={{ margin: 0, color: "#cbd5e1" }}>Extracted Resume Content</h4>
                                            <div style={{ 
                                                background: "#0f172a", 
                                                border: "1px solid #334155", 
                                                borderRadius: "10px", 
                                                padding: "20px", 
                                                maxHeight: "220px", 
                                                overflowY: "auto", 
                                                fontFamily: "monospace", 
                                                fontSize: "0.8rem", 
                                                color: "#94a3b8",
                                                whiteSpace: "pre-wrap"
                                            }}>
                                                {selectedApplicant.resume_text}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        height: "100%",
                                        color: "#94a3b8"
                                    }}>
                                        <span style={{ fontSize: "3rem", marginBottom: "10px" }}>👤</span>
                                        Select a candidate to view their complete information, ATS report, and screen their profile.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
