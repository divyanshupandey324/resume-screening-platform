import { useEffect, useState } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";

export default function SkillGap() {
    const [candidates, setCandidates] = useState([]);
    const [jobs, setJobs] = useState([]);
    
    const [selectedCandidateId, setSelectedCandidateId] = useState("");
    const [selectedJobId, setSelectedJobId] = useState("");
    
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Fetch candidates and jobs
        Promise.all([
            API.get("/candidate/all"),
            API.get("/job/all")
        ])
        .then(([candidatesRes, jobsRes]) => {
            setCandidates(candidatesRes.data);
            setJobs(jobsRes.data);
            
            if (candidatesRes.data.length > 0) {
                setSelectedCandidateId(candidatesRes.data[0]._id);
            }
            if (jobsRes.data.length > 0) {
                setSelectedJobId(jobsRes.data[0]._id);
            }
        })
        .catch(err => {
            console.error("Error loading screening parameters:", err);
        });
    }, []);

    const selectedCandidate = candidates.find(c => c._id === selectedCandidateId);
    const selectedJob = jobs.find(j => j._id === selectedJobId);

    const analyze = async () => {
        if (!selectedCandidate) {
            alert("Please select a candidate first");
            return;
        }

        setIsLoading(true);
        setResult(null);

        // If no job is selected, use a fallback target skills array
        const candidateSkills = selectedCandidate.skills || [];
        const requiredSkills = selectedJob 
            ? (selectedJob.required_skills || []) 
            : ["python", "sql", "machine learning", "fastapi", "docker", "aws"];

        try {
            const response = await API.post("/job/skill-gap", {
                candidate_skills: candidateSkills,
                required_skills: requiredSkills
            });

            setResult(response.data);
        } catch (error) {
            console.error("Error during skill gap analysis:", error);
            alert("Failed to analyze skill gap.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="dashboard" style={{ background: "#0f172a", minHeight: "100vh", color: "#f8fafc" }}>
            <Sidebar />

            <div className="content" style={{ padding: "40px", flex: 1, overflowY: "auto" }}>
                <h1 style={{ fontSize: "2.2rem", fontWeight: "800", marginBottom: "10px" }}>
                    Skill Gap Analysis
                </h1>
                <p style={{ color: "#94a3b8", marginBottom: "30px" }}>
                    Compare candidate's extracted skills against job opening requirements.
                </p>

                <div style={{ display: "flex", gap: "30px", alignItems: "flex-start" }}>
                    {/* Parameters selector */}
                    <div className="glass-card" style={{ flex: 1, padding: "30px", background: "rgba(255,255,255,0.02)" }}>
                        <h2 style={{ fontSize: "1.3rem", color: "#f1f5f9", marginBottom: "20px" }}>Select Parameters</h2>

                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {/* Candidate Dropdown */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label style={{ fontSize: "0.9rem", color: "#94a3b8", fontWeight: "600" }}>Select Candidate</label>
                                <select 
                                    value={selectedCandidateId}
                                    onChange={(e) => {
                                        setSelectedCandidateId(e.target.value);
                                        setResult(null);
                                    }}
                                    style={{
                                        padding: "12px",
                                        borderRadius: "8px",
                                        border: "1px solid #334155",
                                        background: "#1e293b",
                                        color: "#f8fafc",
                                        outline: "none"
                                    }}
                                >
                                    <option value="" disabled>-- Select Candidate --</option>
                                    {candidates.map(candidate => (
                                        <option key={candidate._id} value={candidate._id}>
                                            {candidate.name} (Score: {candidate.score}%)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Job Dropdown */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label style={{ fontSize: "0.9rem", color: "#94a3b8", fontWeight: "600" }}>Target Job Requirement</label>
                                <select 
                                    value={selectedJobId}
                                    onChange={(e) => {
                                        setSelectedJobId(e.target.value);
                                        setResult(null);
                                    }}
                                    style={{
                                        padding: "12px",
                                        borderRadius: "8px",
                                        border: "1px solid #334155",
                                        background: "#1e293b",
                                        color: "#f8fafc",
                                        outline: "none"
                                    }}
                                >
                                    <option value="" disabled>-- Select Job Opening --</option>
                                    {jobs.map(job => (
                                        <option key={job._id} value={job._id}>
                                            {job.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedCandidate && (
                                <div style={{ background: "rgba(255,255,255,0.03)", padding: "15px", borderRadius: "8px", fontSize: "0.85rem" }}>
                                    <div style={{ color: "#94a3b8", marginBottom: "6px", fontWeight: "600" }}>Candidate Extracted Skills:</div>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                                        {(selectedCandidate.skills || []).length === 0 ? (
                                            <span style={{ color: "#cbd5e1" }}>No skills extracted</span>
                                        ) : (
                                            (selectedCandidate.skills || []).map((s, idx) => (
                                                <span key={idx} style={{ background: "rgba(99, 102, 241, 0.15)", color: "#a5b4fc", padding: "2px 6px", borderRadius: "4px" }}>
                                                    {s}
                                                </span>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedJob && (
                                <div style={{ background: "rgba(255,255,255,0.03)", padding: "15px", borderRadius: "8px", fontSize: "0.85rem" }}>
                                    <div style={{ color: "#94a3b8", marginBottom: "6px", fontWeight: "600" }}>Job Required Skills:</div>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                                        {(selectedJob.required_skills || []).map((s, idx) => (
                                            <span key={idx} style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "2px 6px", borderRadius: "4px" }}>
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                className="btn"
                                onClick={analyze}
                                disabled={isLoading || !selectedCandidate}
                                style={{
                                    padding: "14px",
                                    fontSize: "1rem",
                                    fontWeight: "600",
                                    background: (isLoading || !selectedCandidate) ? "#475569" : "#6366f1",
                                    cursor: (isLoading || !selectedCandidate) ? "not-allowed" : "pointer"
                                }}
                            >
                                {isLoading ? "Analyzing..." : "Compare Skill Gap"}
                            </button>
                        </div>
                    </div>

                    {/* Results panel */}
                    <div style={{ flex: 1.5 }}>
                        {result ? (
                            <div className="glass-card" style={{ padding: "30px", background: "rgba(99, 102, 241, 0.02)", border: "1px solid rgba(99, 102, 241, 0.1)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
                                    <h2 style={{ fontSize: "1.4rem", color: "#f1f5f9", margin: 0 }}>Comparison Report</h2>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Match Percentage</div>
                                        <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#6366f1" }}>{result.match_percentage}%</div>
                                    </div>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                                    <div>
                                        <h3 style={{ fontSize: "1.05rem", color: "#34d399", marginBottom: "10px" }}>Matched Skills</h3>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                            {result.matched_skills.length === 0 ? (
                                                <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>None of the candidate skills matched requirements.</span>
                                            ) : (
                                                result.matched_skills.map((skill, index) => (
                                                    <span 
                                                        key={index}
                                                        style={{
                                                            background: "rgba(52, 211, 153, 0.15)",
                                                            color: "#34d399",
                                                            padding: "4px 8px",
                                                            borderRadius: "6px",
                                                            fontSize: "0.8rem",
                                                            fontWeight: "500"
                                                        }}
                                                    >
                                                        {skill}
                                                    </span>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 style={{ fontSize: "1.05rem", color: "#f87171", marginBottom: "10px" }}>Missing Skills</h3>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                            {result.missing_skills.length === 0 ? (
                                                <span style={{ color: "#34d399", fontSize: "0.85rem" }}>Candidate has all required skills!</span>
                                            ) : (
                                                result.missing_skills.map((skill, index) => (
                                                    <span 
                                                        key={index}
                                                        style={{
                                                            background: "rgba(248, 113, 113, 0.15)",
                                                            color: "#f87171",
                                                            padding: "4px 8px",
                                                            borderRadius: "6px",
                                                            fontSize: "0.8rem",
                                                            fontWeight: "500"
                                                        }}
                                                    >
                                                        {skill}
                                                    </span>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 style={{ fontSize: "1.05rem", color: "#a5b4fc", marginBottom: "10px" }}>Recommended Upskilling Action</h3>
                                        <ul style={{ margin: 0, paddingLeft: "20px", color: "#cbd5e1", fontSize: "0.95rem" }}>
                                            {result.recommendations.length === 0 ? (
                                                <li style={{ listStyleType: "none", color: "#94a3b8" }}>No suggestions required.</li>
                                            ) : (
                                                result.recommendations.map((item, index) => (
                                                    <li key={index} style={{ margin: "6px 0" }}>{item}</li>
                                                ))
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="glass-card" style={{ padding: "50px", textAlign: "center", color: "#94a3b8" }}>
                                Select a candidate and a target job configuration, then run "Compare Skill Gap" to view matches and recommendations.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}