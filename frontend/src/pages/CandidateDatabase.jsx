import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import API from "../services/api";
import AIFeedbackSection from "../components/AIFeedbackSection";

export default function CandidateDatabase() {
    const [candidates, setCandidates] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        try {
            const response = await API.get("/candidate/all");
            setCandidates(response.data);
        } catch (error) {
            console.error("Error fetching candidates:", error);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this candidate?")) return;

        try {
            await API.delete(`/candidate/delete/${id}`);
            if (selectedCandidate && selectedCandidate._id === id) {
                setSelectedCandidate(null);
            }
            fetchCandidates();
        } catch (error) {
            console.error("Error deleting candidate:", error);
        }
    };

    const filteredCandidates = candidates.filter(candidate => {
        const query = searchQuery.toLowerCase();
        const nameMatch = (candidate.name || "").toLowerCase().includes(query);
        const emailMatch = (candidate.email || "").toLowerCase().includes(query);
        const skillMatch = (candidate.skills || []).some(skill => skill.toLowerCase().includes(query));
        const statusMatch = (candidate.status || "").toLowerCase().includes(query);
        const jobMatch = (candidate.target_job_title || "").toLowerCase().includes(query);
        return nameMatch || emailMatch || skillMatch || statusMatch || jobMatch;
    });

    return (
        <div className="dashboard" style={{ background: "#0f172a", minHeight: "100vh", color: "#f8fafc" }}>
            <Sidebar />
            
            <div className="content" style={{ padding: "40px", flex: 1, overflowY: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                    <div>
                        <h1 style={{ fontSize: "2.2rem", fontWeight: "800", margin: 0, color: "#f8fafc" }}>
                            Candidate Database
                        </h1>
                        <p style={{ color: "#94a3b8", marginTop: "5px" }}>
                            Browse, search, and review all AI-screened candidate applications.
                        </p>
                    </div>
                    
                    <input 
                        type="text"
                        placeholder="Search by name, skill, job title, status..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            padding: "12px 20px",
                            borderRadius: "10px",
                            border: "1px solid #334155",
                            background: "#1e293b",
                            color: "#f8fafc",
                            width: "350px",
                            outline: "none"
                        }}
                    />
                </div>

                <div style={{ display: "flex", gap: "30px", alignItems: "flex-start" }}>
                    <div style={{ flex: selectedCandidate ? 1 : 2, display: "flex", flexDirection: "column", gap: "15px" }}>
                        {filteredCandidates.length === 0 ? (
                            <div className="glass-card" style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                                No candidates found in database.
                            </div>
                        ) : (
                            filteredCandidates.map(candidate => (
                                <div 
                                    key={candidate._id}
                                    className="glass-card"
                                    onClick={() => setSelectedCandidate(candidate)}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        cursor: "pointer",
                                        border: selectedCandidate && selectedCandidate._id === candidate._id ? "1px solid #6366f1" : "1px solid rgba(255,255,255,0.05)",
                                        background: selectedCandidate && selectedCandidate._id === candidate._id ? "rgba(99, 102, 241, 0.1)" : "rgba(255,255,255,0.04)",
                                        padding: "20px",
                                        borderRadius: "12px",
                                        transition: "all 0.2s ease"
                                    }}
                                >
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "600", color: "#f1f5f9" }}>{candidate.name}</h3>
                                        <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "4px" }}>{candidate.email} • Exp: {candidate.experience_years} yrs</p>
                                        <p style={{ color: "#6366f1", fontSize: "0.85rem", marginTop: "6px", fontWeight: "500" }}>
                                            Role: {candidate.target_job_title || "General Application"}
                                        </p>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                        <div style={{ textAlign: "right" }}>
                                            <span style={{ 
                                                background: candidate.score >= 50 ? "rgba(52, 211, 153, 0.15)" : "rgba(248, 113, 113, 0.15)",
                                                color: candidate.score >= 50 ? "#34d399" : "#f87171",
                                                padding: "6px 12px",
                                                borderRadius: "20px",
                                                fontSize: "0.8rem",
                                                fontWeight: "600"
                                            }}>
                                                Score: {candidate.score}%
                                            </span>
                                            <div style={{ color: "#94a3b8", fontSize: "0.75rem", marginTop: "6px" }}>
                                                Skill Match: {candidate.skill_match || 0}%
                                            </div>
                                        </div>

                                        <button 
                                            onClick={(e) => handleDelete(candidate._id, e)}
                                            style={{
                                                background: "rgba(248, 113, 113, 0.1)",
                                                border: "none",
                                                color: "#f87171",
                                                padding: "8px 12px",
                                                borderRadius: "8px",
                                                cursor: "pointer",
                                                fontSize: "0.85rem"
                                            }}
                                            onMouseEnter={(e) => e.target.style.background = "rgba(248, 113, 113, 0.2)"}
                                            onMouseLeave={(e) => e.target.style.background = "rgba(248, 113, 113, 0.1)"}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {selectedCandidate && (
                        <div className="glass-card" style={{ flex: 1, padding: "30px", background: "#1e293b", position: "sticky", top: "40px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                <h2 style={{ margin: 0, color: "#f1f5f9" }}>Profile Details</h2>
                                <button 
                                    onClick={() => setSelectedCandidate(null)}
                                    style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.2rem" }}
                                >
                                    ✕
                                </button>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <div>
                                    <h3 style={{ margin: "0 0 5px 0", fontSize: "1.3rem", color: "#f8fafc" }}>{selectedCandidate.name}</h3>
                                    <p style={{ color: "#94a3b8", margin: 0 }}>{selectedCandidate.email}</p>
                                    {selectedCandidate.phone && <p style={{ color: "#cbd5e1", margin: "4px 0 0 0", fontSize: "0.85rem" }}>📞 {selectedCandidate.phone}</p>}
                                    <p style={{ color: "#cbd5e1", fontSize: "0.9rem", marginTop: "10px" }}>
                                        Target Role: <strong>{selectedCandidate.target_job_title || "General Application"}</strong>
                                    </p>
                                </div>

                                <div style={{ display: "flex", gap: "10px" }}>
                                    <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
                                        <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>ATS Score</div>
                                        <div style={{ color: selectedCandidate.score >= 50 ? "#34d399" : "#f87171", fontSize: "1.2rem", fontWeight: "bold", marginTop: "4px" }}>
                                            {selectedCandidate.score}%
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
                                        <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>Skill Match</div>
                                        <div style={{ color: "#6366f1", fontSize: "1.2rem", fontWeight: "bold", marginTop: "4px" }}>
                                            {selectedCandidate.skill_match || 0}%
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ margin: "0 0 8px 0", color: "#f1f5f9" }}>Education Scores</h4>
                                    <div style={{ fontSize: "0.9rem", color: "#cbd5e1", display: "flex", flexDirection: "column", gap: "5px" }}>
                                        <div>10th Class: {selectedCandidate.tenth_percentage || 0}%</div>
                                        <div>12th Class: {selectedCandidate.twelfth_percentage || 0}%</div>
                                        <div>Graduation CGPA: {selectedCandidate.graduation_cgpa || 0} / 10</div>
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ margin: "0 0 8px 0", color: "#f1f5f9" }}>Skills</h4>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                        {(selectedCandidate.skills || []).map((skill, index) => (
                                            <span 
                                                key={index}
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

                                {(selectedCandidate.projects && selectedCandidate.projects.length > 0) && (
                                    <div>
                                        <h4 style={{ margin: "0 0 8px 0", color: "#f1f5f9" }}>Projects</h4>
                                        <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "0.9rem", color: "#cbd5e1" }}>
                                            {selectedCandidate.projects.map((p, idx) => (
                                                <li key={idx}>{p}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {(selectedCandidate.certificates && selectedCandidate.certificates.length > 0) && (
                                    <div>
                                        <h4 style={{ margin: "0 0 8px 0", color: "#f1f5f9" }}>Certifications</h4>
                                        <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "0.9rem", color: "#cbd5e1" }}>
                                            {selectedCandidate.certificates.map((c, idx) => (
                                                <li key={idx}>{c}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div style={{ background: "rgba(255,255,255,0.02)", padding: "15px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                    <label style={{ display: "block", fontSize: "0.85rem", color: "#94a3b8", fontWeight: "600", marginBottom: "8px" }}>Pipeline Status</label>
                                    <select
                                        value={selectedCandidate.status || "Shortlisted"}
                                        onChange={async (e) => {
                                            const newStatus = e.target.value;
                                            try {
                                                await API.post("/candidate/update-status", {
                                                    candidate_id: selectedCandidate._id,
                                                    status: newStatus
                                                });
                                                setSelectedCandidate({ ...selectedCandidate, status: newStatus });
                                                fetchCandidates();
                                            } catch (err) {
                                                console.error(err);
                                                alert("Failed to update status.");
                                            }
                                        }}
                                        style={{
                                            width: "100%",
                                            padding: "8px 12px",
                                            borderRadius: "6px",
                                            background: "#0f172a",
                                            color: "white",
                                            border: "1px solid #334155"
                                        }}
                                    >
                                        <option value="Applied">Applied</option>
                                        <option value="Shortlisted">Shortlisted</option>
                                        <option value="Rejected">Rejected</option>
                                        <option value="Joined">Joined</option>
                                    </select>
                                    {selectedCandidate.status === "Shortlisted" && (
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await API.post("/notifications/send-email", {
                                                        recipient_email: selectedCandidate.email,
                                                        recipient_name: selectedCandidate.name,
                                                        subject: `Application Shortlisted: ${selectedCandidate.target_job_title || "Job Position"}`,
                                                        template_type: "shortlisted",
                                                        job_title: selectedCandidate.target_job_title || "General Application"
                                                    });
                                                    alert("✓ Shortlist email sent successfully!");
                                                } catch (err) {
                                                    console.error(err);
                                                    alert("Failed to send shortlist email.");
                                                }
                                            }}
                                            className="btn"
                                            style={{
                                                marginTop: "12px",
                                                width: "100%",
                                                background: "rgba(99, 102, 241, 0.15)",
                                                border: "1px solid #6366f1",
                                                color: "#a5b4fc",
                                                padding: "8px 12px",
                                                borderRadius: "6px",
                                                fontSize: "0.85rem",
                                                fontWeight: "600",
                                                cursor: "pointer",
                                                transition: "all 0.2s"
                                            }}
                                            onMouseEnter={(e) => e.target.style.background = "rgba(99, 102, 241, 0.3)"}
                                            onMouseLeave={(e) => e.target.style.background = "rgba(99, 102, 241, 0.15)"}
                                        >
                                            📧 Send Shortlist Email
                                        </button>
                                    )}
                                </div>

                                <div>
                                    <AIFeedbackSection feedback={selectedCandidate.feedback || "No feedback generated."} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
