import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

const MCQ_TOPICS = [
    "Aptitude", "Reasoning", "English", "Java", "Python",
    "C++", "JavaScript", "HTML", "CSS", "React",
    "Node.js", "MongoDB", "SQL", "DBMS", "Operating System",
    "Computer Networks", "OOP", "DSA", "AI", "Machine Learning",
    "Cloud Computing", "Cyber Security"
];

export default function MCQLeaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [tests, setTests] = useState([]);
    const [selectedTestFilter, setSelectedTestFilter] = useState("");
    const [msg, setMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Import MCQ Bank Modal State
    const [showImportModal, setShowImportModal] = useState(false);
    const [bankTopic, setBankTopic] = useState("Java");
    const [bankDifficulty, setBankDifficulty] = useState("Easy");
    const [bankQuestions, setBankQuestions] = useState([]);
    const [selectedBankIds, setSelectedBankIds] = useState([]);

    // MCQ Form State
    const [title, setTitle] = useState("");
    const [timeLimit, setTimeLimit] = useState(30);
    const [password, setPassword] = useState("");
    const [allowedEmails, setAllowedEmails] = useState("");
    const [sendEmail, setSendEmail] = useState(true);
    const [questions, setQuestions] = useState([
        { question: "", options: ["", "", "", ""], correct_answer: "", marks: 10 }
    ]);

    useEffect(() => {
        fetchLeaderboard();
        fetchTests();
    }, [selectedTestFilter]);

    const handleFetchBankQuestions = async () => {
        try {
            const res = await API.get("/mcq/bank", {
                params: { topic: bankTopic, difficulty: bankDifficulty }
            });
            setBankQuestions(res.data);
            setSelectedBankIds([]);
        } catch (e) {
            console.error(e);
        }
    };

    const handleImportSelected = () => {
        const toImport = bankQuestions.filter(q => selectedBankIds.includes(q._id));
        if (toImport.length === 0) return;
        const mapped = toImport.map(q => ({
            question: q.question,
            options: [...q.options],
            correct_answer: q.correct_answer,
            marks: 10
        }));
        if (questions.length === 1 && !questions[0].question) {
            setQuestions(mapped);
        } else {
            setQuestions([...questions, ...mapped]);
        }
        setShowImportModal(false);
        setBankQuestions([]);
        setSelectedBankIds([]);
    };

    const fetchLeaderboard = async () => {
        try {
            const res = await API.get("/mcq/leaderboard", {
                params: selectedTestFilter ? { title: selectedTestFilter } : {}
            });
            setLeaderboard(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchTests = async () => {
        try {
            const res = await API.get("/mcq/all-tests");
            setTests(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddQuestion = () => {
        setQuestions([...questions, { question: "", options: ["", "", "", ""], correct_answer: "", marks: 10 }]);
    };

    const handleQuestionChange = (index, field, value) => {
        const updated = [...questions];
        updated[index][field] = value;
        setQuestions(updated);
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const updated = [...questions];
        updated[qIndex].options[oIndex] = value;
        setQuestions(updated);
    };

    const handlePublishTest = async (e) => {
        e.preventDefault();
        if (!title || !password || !allowedEmails) {
            setMsg("Please enter Title, Password, and Allowed Candidate Emails.");
            return;
        }

        // Validate questions
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question || !q.correct_answer) {
                setMsg(`Please complete all fields for Question #${i + 1}.`);
                return;
            }
            if (q.options.some(opt => !opt)) {
                setMsg(`Please enter all four options for Question #${i + 1}.`);
                return;
            }
        }

        setIsSubmitting(true);
        setMsg("");

        try {
            const payload = {
                title,
                time_limit: parseInt(timeLimit),
                password,
                send_email: sendEmail,
                allowed_emails: allowedEmails.split(",").map(e => e.trim().toLowerCase()),
                questions: questions.map(q => ({
                    ...q,
                    marks: parseFloat(q.marks)
                }))
            };

            await API.post("/mcq/create", payload);
            setMsg("✓ MCQ Test published and emails dispatched!");
            setTitle("");
            setPassword("");
            setAllowedEmails("");
            setTimeLimit(30);
            setQuestions([{ question: "", options: ["", "", "", ""], correct_answer: "", marks: 10 }]);
            fetchTests();
        } catch (err) {
            console.error(err);
            setMsg("❌ Failed to publish MCQ test.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSendMCQEmail = async (cand) => {
        try {
            await API.post("/notifications/send-email", {
                recipient_email: cand.candidate_email,
                recipient_name: cand.candidate_name,
                subject: `MCQ Test Results: ${cand.test_title}`,
                template_type: "mcq_result",
                job_title: cand.test_title,
                details: {
                    test_title: cand.test_title,
                    percentage: cand.percentage,
                    score: cand.score,
                    total_marks: cand.total_marks,
                    submitted_at: cand.submitted_at || new Date().toLocaleString()
                }
            });
            alert(`✓ MCQ results email sent successfully to ${cand.candidate_name}!`);
        } catch (err) {
            console.error(err);
            alert("Failed to send MCQ results email.");
        }
    };

    return (
        <div className="dashboard" style={{ background: "#0f172a", minHeight: "100vh", color: "#f8fafc" }}>
            <Sidebar />

            <div className="content" style={{ padding: "40px", flex: 1, overflowY: "auto" }}>
                <div style={{ marginBottom: "30px" }}>
                    <h1 style={{ fontSize: "2.2rem", fontWeight: "800", margin: 0 }}>
                        MCQ Assessment & Leaderboard
                    </h1>
                    <p style={{ color: "#94a3b8", marginTop: "5px" }}>
                        Create secure MCQ exams, restrict access by candidate emails, and review grades on the leaderboard.
                    </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1.2fr", gap: "30px" }}>
                    
                    {/* Create MCQ Exam Panel */}
                    <div className="glass-card" style={{ padding: "30px", background: "rgba(255,255,255,0.02)" }}>
                        <h2 style={{ fontSize: "1.3rem", color: "#cbd5e1", marginBottom: "20px", marginTop: 0 }}>Create Assessment</h2>
                        <form onSubmit={handlePublishTest} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                            
                            <input
                                type="text"
                                placeholder="Assessment Title (e.g. Java Mid-Level Core)"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                style={{ width: "100%", background: "#1e293b", color: "white", border: "1px solid #334155" }}
                                required
                            />

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                                <div>
                                    <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Time Limit (Minutes)</label>
                                    <input
                                        type="number"
                                        value={timeLimit}
                                        onChange={e => setTimeLimit(e.target.value)}
                                        style={{ width: "100%", background: "#1e293b", color: "white", border: "1px solid #334155" }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Exam Password (to unlock)</label>
                                    <input
                                        type="text"
                                        placeholder="Set exam password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        style={{ width: "100%", background: "#1e293b", color: "white", border: "1px solid #334155" }}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                <label style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: "600" }}>Allowed Candidate Emails</label>
                                <textarea
                                    placeholder="Enter comma separated emails (e.g. cand1@gmail.com, cand2@gmail.com)"
                                    value={allowedEmails}
                                    onChange={e => setAllowedEmails(e.target.value)}
                                    style={{ width: "100%", height: "80px", padding: "12px", borderRadius: "8px", background: "#1e293b", color: "white", border: "1px solid #334155", fontFamily: "inherit" }}
                                    required
                                />
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "5px" }}>
                                <input 
                                    type="checkbox" 
                                    id="sendEmail"
                                    checked={sendEmail} 
                                    onChange={e => setSendEmail(e.target.checked)} 
                                    style={{ cursor: "pointer", width: "auto" }}
                                />
                                <label htmlFor="sendEmail" style={{ fontSize: "0.85rem", color: "#cbd5e1", cursor: "pointer", fontWeight: "600" }}>
                                    📧 Send invitation credentials email to candidates
                                </label>
                            </div>

                            {/* Dynamic Questions Builder */}
                            <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "20px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontWeight: "bold", color: "#cbd5e1" }}>Questions Pool</span>
                                    <div style={{ display: "flex", gap: "10px" }}>
                                        <button type="button" onClick={() => setShowImportModal(true)} style={{ padding: "6px 12px", background: "rgba(52, 211, 153, 0.2)", border: "1px solid #34d399", borderRadius: "6px", color: "#6ee7b7", cursor: "pointer", fontSize: "0.8rem" }}>
                                            📥 Import from MCQ Bank
                                        </button>
                                        <button type="button" onClick={handleAddQuestion} style={{ padding: "6px 12px", background: "rgba(99, 102, 241, 0.2)", border: "1px solid #6366f1", borderRadius: "6px", color: "#a5b4fc", cursor: "pointer", fontSize: "0.8rem" }}>
                                            + Add Question
                                        </button>
                                    </div>
                                </div>

                                <div style={{ maxHeight: "350px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px", paddingRight: "5px" }}>
                                    {questions.map((q, idx) => (
                                        <div key={idx} style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", padding: "15px", borderRadius: "10px" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                                <strong style={{ color: "#a5b4fc" }}>Question #{idx + 1}</strong>
                                                <input
                                                    type="number"
                                                    placeholder="Marks"
                                                    value={q.marks}
                                                    onChange={e => handleQuestionChange(idx, "marks", e.target.value)}
                                                    style={{ width: "80px", padding: "4px", background: "#1e293b", color: "white", border: "1px solid #334155", borderRadius: "4px", fontSize: "0.8rem" }}
                                                />
                                            </div>
                                            
                                            <input
                                                type="text"
                                                placeholder="Enter Question Text"
                                                value={q.question}
                                                onChange={e => handleQuestionChange(idx, "question", e.target.value)}
                                                style={{ width: "100%", background: "#1e293b", color: "white", border: "1px solid #334155", marginBottom: "10px" }}
                                                required
                                            />

                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                                {q.options.map((opt, oIdx) => (
                                                    <input
                                                        key={oIdx}
                                                        type="text"
                                                        placeholder={`Option ${oIdx + 1}`}
                                                        value={opt}
                                                        onChange={e => handleOptionChange(idx, oIdx, e.target.value)}
                                                        style={{ width: "100%", background: "#1e293b", color: "white", border: "1px solid #334155", fontSize: "0.85rem" }}
                                                        required
                                                    />
                                                ))}
                                            </div>

                                            <div style={{ marginTop: "10px" }}>
                                                <label style={{ fontSize: "0.8rem", color: "#94a3b8", marginRight: "10px" }}>Correct Option Value:</label>
                                                <select
                                                    value={q.correct_answer}
                                                    onChange={e => handleQuestionChange(idx, "correct_answer", e.target.value)}
                                                    style={{ padding: "6px", background: "#1e293b", color: "white", border: "1px solid #334155", borderRadius: "6px", fontSize: "0.8rem" }}
                                                    required
                                                >
                                                    <option value="">-- Choose Correct Option --</option>
                                                    {q.options.map((opt, oIdx) => (
                                                        opt && <option key={oIdx} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button className="btn" type="submit" disabled={isSubmitting} style={{ width: "100%", marginTop: "15px" }}>
                                {isSubmitting ? "Publishing Assessment..." : "Publish Test & Send Invites"}
                            </button>
                            {msg && (
                                <p style={{ color: msg.includes("published") ? "#34d399" : "#f87171", textAlign: "center", fontSize: "0.9rem", marginTop: "10px" }}>
                                    {msg}
                                </p>
                            )}
                        </form>
                    </div>

                    {/* Leaderboard Panel */}
                    <div className="glass-card" style={{ padding: "30px", background: "rgba(255,255,255,0.02)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h2 style={{ fontSize: "1.3rem", color: "#cbd5e1", margin: 0 }}>MCQ Leaderboard</h2>
                            <select
                                value={selectedTestFilter}
                                onChange={e => setSelectedTestFilter(e.target.value)}
                                style={{ padding: "8px", borderRadius: "8px", background: "#1e293b", color: "white", border: "1px solid #334155", fontSize: "0.8rem" }}
                            >
                                <option value="">-- Filter by Test --</option>
                                {tests.map(t => (
                                    <option key={t._id} value={t.title}>{t.title}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "550px", overflowY: "auto" }}>
                            {leaderboard.length === 0 ? (
                                <div style={{ color: "#94a3b8", textAlign: "center", padding: "40px" }}>No assessment attempts recorded.</div>
                            ) : (
                                leaderboard.map((cand, rIdx) => (
                                    <div key={cand._id} style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: "15px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                            <span style={{ fontWeight: "bold", fontSize: "1.2rem", color: rIdx === 0 ? "#fbbf24" : rIdx === 1 ? "#cbd5e1" : rIdx === 2 ? "#d97706" : "#475569", width: "25px" }}>#{rIdx + 1}</span>
                                            <div>
                                                <h4 style={{ margin: 0 }}>{cand.candidate_name}</h4>
                                                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{cand.candidate_email}</span>
                                                <div style={{ fontSize: "0.75rem", color: "#6366f1", marginTop: "3px" }}>Test: {cand.test_title}</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "right", alignSelf: "center", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                                            <h4 style={{ margin: 0, color: "#34d399" }}>{cand.percentage}%</h4>
                                            <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Score: {cand.score} / {cand.total_marks}</span>

                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {showImportModal && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(8px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" }}>
                    <div className="glass-card" style={{ width: "100%", maxWidth: "600px", padding: "30px", background: "#1e293b", border: "1px solid #334155", borderRadius: "16px", display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h2 style={{ margin: 0, color: "#f8fafc", fontSize: "1.3rem" }}>Import Questions from Bank</h2>
                            <button type="button" onClick={() => { setShowImportModal(false); setBankQuestions([]); }} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.2rem", outline: "none" }}>✕</button>
                        </div>
                        
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "5px" }}>Topic</label>
                                <select value={bankTopic} onChange={e => setBankTopic(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#0f172a", color: "white", border: "1px solid #334155", outline: "none" }}>
                                    {MCQ_TOPICS.map(topic => (
                                        <option key={topic} value={topic}>{topic}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "5px" }}>Difficulty</label>
                                <select value={bankDifficulty} onChange={e => setBankDifficulty(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#0f172a", color: "white", border: "1px solid #334155", outline: "none" }}>
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                        </div>
                        
                        <button type="button" onClick={handleFetchBankQuestions} className="btn" style={{ padding: "10px" }}>🔍 Search Bank Questions</button>
                        
                        <div style={{ maxHeight: "250px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", background: "#0f172a", padding: "15px", borderRadius: "10px" }}>
                            {bankQuestions.length === 0 ? (
                                <div style={{ color: "#64748b", textAlign: "center", padding: "20px", fontSize: "0.85rem" }}>No matching bank questions. Run search above.</div>
                            ) : (
                                bankQuestions.map(q => {
                                    const isChecked = selectedBankIds.includes(q._id);
                                    return (
                                        <div key={q._id} style={{ display: "flex", gap: "10px", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "10px" }}>
                                            <input 
                                                type="checkbox" 
                                                checked={isChecked} 
                                                onChange={() => {
                                                    if (isChecked) {
                                                        setSelectedBankIds(selectedBankIds.filter(id => id !== q._id));
                                                    } else {
                                                        setSelectedBankIds([...selectedBankIds, q._id]);
                                                    }
                                                }}
                                                style={{ marginTop: "4px", cursor: "pointer" }}
                                            />
                                            <div>
                                                <p style={{ margin: 0, fontSize: "0.85rem", color: "#cbd5e1" }}>{q.question}</p>
                                                <span style={{ fontSize: "0.7rem", color: "#6366f1" }}>Correct Option: {q.correct_answer}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        
                        <div style={{ display: "flex", gap: "15px", justifyContent: "flex-end", marginTop: "10px" }}>
                            <button type="button" onClick={() => { setShowImportModal(false); setBankQuestions([]); }} style={{ padding: "10px 20px", background: "none", border: "1px solid #334155", color: "#94a3b8", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
                            <button type="button" onClick={handleImportSelected} disabled={selectedBankIds.length === 0} className="btn" style={{ padding: "10px 20px" }}>📥 Import Selected ({selectedBankIds.length})</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
