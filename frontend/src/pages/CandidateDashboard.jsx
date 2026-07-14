import { useEffect, useState, useRef } from "react";
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

const DSA_TOPICS = [
    "Arrays", "Strings", "Linked Lists", "Stacks", "Queues",
    "Trees", "Binary Trees", "BST", "Graphs", "DFS",
    "BFS", "Heap", "Trie", "HashMap", "Sorting",
    "Searching", "Greedy", "Dynamic Programming", "Backtracking", "Recursion",
    "Math", "Bit Manipulation", "Sliding Window", "Two Pointer", "Union Find",
    "Segment Tree", "Binary Search", "Matrix", "Priority Queue"
];

export default function CandidateDashboard() {
    const [activeTab, setActiveTab] = useState("ats");
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
    const username = localStorage.getItem("username") || "candidate_user";

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    // Live notifications bell states
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const res = await API.get("/candidate/notifications", { params: { username } });
            // Filter notifications where recipient matches email prefix or username prefix
            const myNotifs = res.data.filter(n => 
                n.recipient_email.toLowerCase() === username.toLowerCase() || 
                n.recipient_email.toLowerCase().includes(username.toLowerCase())
            );
            setNotifications(myNotifs);
            setUnreadCount(myNotifs.filter(n => !n.read).length);
        } catch (e) {
            console.error("Failed to load notifications:", e);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll notifications every 15 seconds, but only when the document is visible to save resources
        const interval = setInterval(() => {
            if (document.visibilityState === "visible") {
                fetchNotifications();
            }
        }, 15000);
        return () => clearInterval(interval);
    }, [username]);

    useEffect(() => {
        const handleGlobalClick = (e) => {
            if (!e.target.closest('#notification-bell-btn')) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("click", handleGlobalClick);
        document.addEventListener("touchstart", handleGlobalClick);
        return () => {
            document.removeEventListener("click", handleGlobalClick);
            document.removeEventListener("touchstart", handleGlobalClick);
        };
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await API.post(`/candidate/notifications/read/${id}`);
            fetchNotifications();
        } catch (e) {
            console.error(e);
        }
    };

    // 1. Resume ATS Score State
    const [file, setFile] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState("Software Engineer");
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [statusLogs, setStatusLogs] = useState([]);

    // 2. Candidate Chatbot State
    const [chatQuery, setChatQuery] = useState("");
    const [chatLogs, setChatLogs] = useState([
        { sender: "bot", text: "Welcome to your AI Career Coach! Ask me about: 'Improve Resume', 'Recommend Jobs', 'Interview Tips', 'Skill Gap', or 'Learning Resources'" }
    ]);
    const [botLoading, setBotLoading] = useState(false);

    // 3. Browse Jobs State
    const [browseJobs, setBrowseJobs] = useState([]);
    const [jobSearch, setJobSearch] = useState({
        role: "",
        skills: "",
        experience: "",
        location: "",
        company: "",
        jobType: ""
    });
    const [selectedApplyJob, setSelectedApplyJob] = useState(null);
    const [applyForm, setApplyForm] = useState({
        name: "",
        email: "",
        skills: "",
        experience_years: 1,
        education: "",
        projects: "",
        phone: "",
        file: null
    });
    const [applyMsg, setApplyMsg] = useState("");

    const fetchBrowseJobs = async () => {
        try {
            const res = await API.get("/job/all");
            setBrowseJobs(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchBrowseJobs();
    }, []);

    const handleApplyJob = async (e) => {
        e.preventDefault();
        if (!applyForm.name || !applyForm.email || !applyForm.skills || !applyForm.phone || !applyForm.file) {
            setApplyMsg("Please complete all required fields including Contact Number and Resume PDF.");
            return;
        }
        try {
            const formData = new FormData();
            formData.append("job_id", selectedApplyJob._id);
            formData.append("username", username);
            formData.append("name", applyForm.name);
            formData.append("email", applyForm.email);
            formData.append("skills", applyForm.skills);
            formData.append("experience_years", applyForm.experience_years);
            formData.append("projects", applyForm.projects || "");
            formData.append("phone", applyForm.phone);
            formData.append("file", applyForm.file);

            const response = await API.post("/candidate/apply", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            setApplyMsg("✓ Application successfully submitted!");
            setTimeout(() => {
                setSelectedApplyJob(null);
                setApplyForm({ name: "", email: "", skills: "", experience_years: 1, education: "", projects: "", phone: "", file: null });
                setApplyMsg("");
            }, 2000);
        } catch (error) {
            console.error(error);
            const errMsg = error.response?.data?.detail || error.message || "Error submitting application.";
            setApplyMsg(`❌ ${errMsg}`);
        }
    };

    // Filter Jobs
    const filteredJobs = browseJobs.filter(job => {
        const matchRole = !jobSearch.role || job.title.toLowerCase().includes(jobSearch.role.toLowerCase());
        const matchLocation = !jobSearch.location || (job.location && job.location.toLowerCase().includes(jobSearch.location.toLowerCase()));
        const matchCompany = !jobSearch.company || (job.company && job.company.toLowerCase().includes(jobSearch.company.toLowerCase()));
        const matchExp = !jobSearch.experience || (job.minimum_experience !== undefined && job.minimum_experience <= parseFloat(jobSearch.experience));
        const matchJobType = !jobSearch.jobType || (job.job_type && job.job_type.toLowerCase() === jobSearch.jobType.toLowerCase());
        
        let matchSkills = true;
        if (jobSearch.skills) {
            const searchS = jobSearch.skills.toLowerCase().split(",").map(s => s.trim());
            matchSkills = searchS.every(s => job.required_skills.some(rs => rs.toLowerCase().includes(s)));
        }
        return matchRole && matchLocation && matchCompany && matchExp && matchJobType && matchSkills;
    });

    // 4. Timed MCQ Assessment State
    const [mcqCreds, setMcqCreds] = useState({ email: "", password: "" });
    const [mcqActiveTest, setMcqActiveTest] = useState(null);
    const [mcqAnswers, setMcqAnswers] = useState({});
    const [mcqTimeLeft, setMcqTimeLeft] = useState(0);
    const [mcqTimerInterval, setMcqTimerInterval] = useState(null);
    const [mcqGradeResult, setMcqGradeResult] = useState(null);
    const [mcqLoginError, setMcqLoginError] = useState("");

    const handleValidateMCQ = async (e) => {
        e.preventDefault();
        setMcqLoginError("");
        try {
            const res = await API.post("/mcq/validate", mcqCreds);
            if (res.data.success) {
                setMcqActiveTest(res.data);
                setMcqAnswers({});
                setMcqTimeLeft(res.data.time_limit * 60);
                setMcqGradeResult(null);
            } else {
                setMcqLoginError(res.data.message || "Invalid credentials");
            }
        } catch (err) {
            console.error(err);
            setMcqLoginError("Failed to authenticate MCQ.");
        }
    };

    // MCQ timer countdown
    useEffect(() => {
        if (mcqActiveTest && mcqTimeLeft > 0) {
            const timer = setTimeout(() => {
                setMcqTimeLeft(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (mcqActiveTest && mcqTimeLeft === 0) {
            handleAutoSubmitMCQ();
        }
    }, [mcqActiveTest, mcqTimeLeft]);

    const handleAutoSubmitMCQ = () => {
        alert("Time limit reached! Submitting answers automatically.");
        handleSubmitMCQ();
    };

    const handleSubmitMCQ = async () => {
        if (!mcqActiveTest) return;
        try {
            const payload = {
                test_title: mcqActiveTest.title,
                candidate_name: username,
                candidate_email: mcqCreds.email,
                password: mcqCreds.password,
                answers: mcqAnswers
            };
            const res = await API.post("/mcq/submit", payload);
            setMcqGradeResult(res.data);
            setMcqActiveTest(null);
        } catch (err) {
            console.error(err);
            alert("Failed to submit exam.");
        }
    };

    // 5. 18-Category DSA Coding IDE State
    const [dsaCategory, setDsaCategory] = useState("Arrays");
    const [dsaDifficulty, setDsaDifficulty] = useState("Easy");
    const [dsaQuestions, setDsaQuestions] = useState([]);
    const [selectedDsaQuest, setSelectedDsaQuest] = useState(null);
    
    const [ideLang, setIdeLang] = useState("python");
    const [ideCode, setIdeCode] = useState("");
    const [ideRunning, setIdeRunning] = useState(false);
    const [ideResult, setIdeResult] = useState(null);

    // Coding stats & histories
    const [dsaStats, setDsaStats] = useState({ solved_count: 0, solved_problems: [], attempted_count: 0, accuracy: 100.0, bookmarks: [], history: [] });

    const fetchDsaQuestions = async () => {
        try {
            const res = await API.get("/candidate/coding-questions", {
                params: { category: dsaCategory, difficulty: dsaDifficulty }
            });
            setDsaQuestions(res.data);
            if (res.data.length > 0) {
                handleSelectDsaQuestion(res.data[0]);
            } else {
                setSelectedDsaQuest(null);
                setIdeCode("");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchDsaStats = async () => {
        try {
            const res = await API.get(`/candidate/coding-stats/${username}`);
            setDsaStats(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleToggleBookmark = async () => {
        if (!selectedDsaQuest) return;
        try {
            await API.post("/candidate/coding-bookmarks/toggle", {
                username: username,
                problem_title: selectedDsaQuest.title
            });
            fetchDsaStats();
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchDsaQuestions();
    }, [dsaCategory, dsaDifficulty]);

    useEffect(() => {
        fetchDsaStats();
    }, [username]);

    const getDefaultComment = (lang) => {
        const l = (lang || "").toLowerCase();
        if (l === "python" || l === "bash" || l === "ruby") {
            return "# Write code here";
        } else if (l === "sql") {
            return "-- Write code here";
        } else if (l === "html" || l === "xml") {
            return "<!-- Write code here -->";
        } else {
            return "// Write code here";
        }
    };

    const fetchLastSubmission = async (questTitle, lang, templatesFallback = {}) => {
        try {
            const res = await API.get("/candidate/last-submission", {
                params: { username, problem_title: questTitle, language: lang }
            });
            if (res.data.exists) {
                setIdeCode(res.data.code);
            } else {
                setIdeCode(templatesFallback[lang] || templatesFallback["python"] || getDefaultComment(lang));
            }
        } catch (e) {
            console.error("Failed to fetch last submission:", e);
            setIdeCode(templatesFallback[lang] || templatesFallback["python"] || getDefaultComment(lang));
        }
    };

    const handleSelectDsaQuestion = (q) => {
        setSelectedDsaQuest(q);
        fetchLastSubmission(q.title, ideLang, q.templates || {});
    };

    useEffect(() => {
        if (selectedDsaQuest) {
            fetchLastSubmission(selectedDsaQuest.title, ideLang, selectedDsaQuest.templates || {});
        }
    }, [ideLang, selectedDsaQuest?.title]);

    const handleRunDsaCode = async (isSubmit = false) => {
        if (!selectedDsaQuest) return;
        setIdeRunning(true);
        setIdeResult(null);
        try {
            const res = await API.post("/candidate/execute-code", {
                language: ideLang,
                code: ideCode,
                problem_title: selectedDsaQuest.title,
                username: username,
                is_submission: isSubmit
            });
            setIdeResult(res.data);
            fetchDsaStats();
        } catch (e) {
            console.error(e);
        } finally {
            setIdeRunning(false);
        }
    };

    // 6. Practice Interview & Video Security Stream refs
    const [generatingQuestions, setGeneratingQuestions] = useState(false);
    const [practiceQuestions, setPracticeQuestions] = useState([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answerText, setAnswerText] = useState("");
    const [evaluatingAnswer, setEvaluatingAnswer] = useState(false);
    const [answerResult, setAnswerResult] = useState(null);
    const [interviewActive, setInterviewActive] = useState(false);
    const webcamRef = useRef(null);
    const screenShareRef = useRef(null);
    const [webcamStream, setWebcamStream] = useState(null);
    const [screenStream, setScreenStream] = useState(null);

    const handleStartInterview = async () => {
        setGeneratingQuestions(true);
        setInterviewActive(true);
        try {
            const streamCam = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setWebcamStream(streamCam);
            if (webcamRef.current) webcamRef.current.srcObject = streamCam;
        } catch (e) { console.warn("Cam streams blocked."); }

        try {
            const streamScreen = await navigator.mediaDevices.getDisplayMedia({ video: true });
            setScreenStream(streamScreen);
            if (screenShareRef.current) screenShareRef.current.srcObject = streamScreen;
        } catch (e) { console.warn("Display sharing blocked."); }

        try {
            const res = await API.post("/candidate/practice-interview", {
                job_title: "Software Engineer",
                resume_text: "Python Developer with machine learning expertise."
            });
            setPracticeQuestions(res.data);
        } catch (e) { console.error(e); }
        finally { setGeneratingQuestions(false); }
    };

    const handleStopInterview = () => {
        if (webcamStream) webcamStream.getTracks().forEach(t => t.stop());
        if (screenStream) screenStream.getTracks().forEach(t => t.stop());
        setWebcamStream(null);
        setScreenStream(null);
        setInterviewActive(false);
        setPracticeQuestions([]);
    };

    const handleEvaluateAnswer = async () => {
        if (!answerText.trim()) return;
        setEvaluatingAnswer(true);
        const curQ = practiceQuestions[currentQIndex];
        try {
            const res = await API.post("/candidate/evaluate-practice", {
                question: curQ.question,
                question_type: curQ.type,
                answer: answerText
            });
            setAnswerResult(res.data);
        } catch (e) { console.error(e); }
        finally { setEvaluatingAnswer(false); }
    };

    // 7. Resume ATS Upload State
    const handleUploadATS = async () => {
        if (!file) {
            alert("Select PDF Resume first.");
            return;
        }
        setIsProcessing(true);
        setStatusLogs([]);
        setResult(null);
        
        const logs = [
            "📂 Parsing file structure...",
            "📝 Reading layout blocks...",
            "🤖 Classifying human vs generative AI copy...",
            "📊 Verifying metrics...",
            "✓ Completed ATS analysis!"
        ];

        for (let i = 0; i < logs.length - 1; i++) {
            setStatusLogs(prev => [...prev, logs[i]]);
            await new Promise(r => setTimeout(r, 400));
        }

        const fd = new FormData();
        fd.append("file", file);
        fd.append("username", username);
        if (selectedJobId) fd.append("job_id", selectedJobId);

        try {
            const res = await API.post("/resume/upload", fd, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setStatusLogs(prev => [...prev, logs[logs.length - 1]]);
            setResult(res.data);
        } catch (e) {
            console.error(e);
            setStatusLogs(prev => [...prev, "❌ Screening error occurred."]);
        } finally {
            setIsProcessing(false);
        }
    };

    // Chatbot query handler
    const handleChatbotQuery = async () => {
        if (!chatQuery.trim()) return;
        const currentQuery = chatQuery;
        setChatLogs(prev => [...prev, { sender: "user", text: currentQuery }]);
        setChatQuery("");
        setBotLoading(true);
        try {
            const payload = {
                query: currentQuery,
                history: chatLogs.map(log => ({ sender: log.sender, text: log.text })),
                skills: result ? result.skills : [],
                resume_text: result ? result.resume_text : ""
            };
            const res = await API.post("/candidate/chatbot", payload);
            setChatLogs(prev => [...prev, { sender: "bot", text: res.data.response }]);
        } catch (e) {
            setChatLogs(prev => [...prev, { sender: "bot", text: "Offline." }]);
        } finally {
            setBotLoading(false);
        }
    };

    return (
        <div className="dashboard" style={{ background: "#0f172a", minHeight: "100vh", color: "#f8fafc", display: "flex", flexDirection: "column" }}>
            
            {/* Real-time Header with Notification Bell */}
            <header style={{ height: "70px", background: "#0b0f19", borderBottom: "1px solid #1e293b", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 40px", position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "1.5rem" }}>🚀</span>
                    <strong style={{ fontSize: "1.2rem", fontWeight: "800", color: "#6366f1" }}>AI Candidate Hub</strong>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>
                    
                    {/* Live Notifications Bell Dropdown */}
                    <div style={{ position: "relative" }}>
                        <button 
                            id="notification-bell-btn"
                            onClick={() => setShowNotifications(!showNotifications)}
                            style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "1.3rem", cursor: "pointer", position: "relative" }}
                        >
                            🔔
                            {unreadCount > 0 && (
                                <span style={{ position: "absolute", top: "-5px", right: "-5px", background: "#fb7185", color: "#0f172a", fontSize: "0.7rem", fontWeight: "bold", width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div style={{ position: "absolute", right: 0, top: "40px", background: "#1e293b", border: "1px solid #334155", borderRadius: "10px", width: "350px", maxHeight: "400px", overflowY: "auto", boxShadow: "0 10px 25px rgba(0,0,0,0.5)", zIndex: 1000, padding: "15px" }}>
                                <h4 style={{ margin: "0 0 15px 0", borderBottom: "1px solid #334155", paddingBottom: "10px", color: "#cbd5e1" }}>Invites & status updates</h4>
                                {notifications.length === 0 ? (
                                    <p style={{ fontSize: "0.8rem", color: "#64748b", textAlign: "center", margin: "20px 0" }}>No alerts dispatched.</p>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n._id} onClick={() => handleMarkAsRead(n._id)} style={{ padding: "10px", borderRadius: "6px", background: n.read ? "transparent" : "rgba(99, 102, 241, 0.08)", borderBottom: "1px solid rgba(255,255,255,0.03)", cursor: "pointer", marginBottom: "8px" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <strong style={{ fontSize: "0.85rem", color: n.read ? "#94a3b8" : "#a5b4fc" }}>{n.title}</strong>
                                                {!n.read && <span style={{ width: "6px", height: "6px", background: "#fb7185", borderRadius: "50%" }} />}
                                            </div>
                                            <p style={{ margin: "5px 0 0 0", fontSize: "0.75rem", color: "#cbd5e1", lineHeight: "1.3" }}>{n.message}</p>
                                            <span style={{ fontSize: "0.65rem", color: "#64748b" }}>{new Date(n.created_at).toLocaleTimeString()}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    <span style={{ fontSize: "0.9rem", color: "#cbd5e1" }}>Welcome, <strong>{username}</strong></span>
                    <button onClick={() => { localStorage.clear(); window.location.href="/login"; }} style={{ background: "rgba(248, 113, 113, 0.1)", border: "1px solid #f87171", color: "#fb7185", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem" }}>Logout</button>
                </div>
            </header>

            <div style={{ display: "flex", flex: 1 }}>
                
                {/* Custom Left Nav Bar for Dashboard Tabs */}
                <div style={{ width: "260px", background: "#0b0f19", borderRight: "1px solid #1e293b", padding: "20px" }}>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                        {[
                            { id: "ats", label: "📤 ATS Evaluator" },
                            { id: "jobs", label: "💼 Browse Jobs" },
                            { id: "ide", label: "💻 Coding IDE" },
                            { id: "mcq", label: "📝 Timed MCQ Exam" },
                            { id: "practice", label: "🎥 Mock Interview" },
                            { id: "coach", label: "💬 Career Coach Bot" }
                        ].map(t => (
                            <li key={t.id}>
                                <button 
                                    onClick={() => setActiveTab(t.id)} 
                                    style={{
                                        width: "100%",
                                        textAlign: "left",
                                        background: activeTab === t.id ? "rgba(99, 102, 241, 0.15)" : "transparent",
                                        border: "none",
                                        color: activeTab === t.id ? "#6366f1" : "#94a3b8",
                                        padding: "10px 15px",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontWeight: "600",
                                        fontSize: "0.9rem",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    {t.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="content" style={{ padding: "40px", flex: 1, overflowY: "auto" }}>
                    
                    {/* BROWSE JOBS SECTION */}
                    {activeTab === "jobs" && (
                        <div>
                            <div style={{ marginBottom: "25px" }}>
                                <h2 style={{ fontSize: "1.8rem", fontWeight: "800", margin: 0 }}>Browse Corporate Job Openings</h2>
                                <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Search real job roles, inspect credentials, and apply directly to save your profile in the candidate database.</p>
                            </div>

                            {/* Filters Bar */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px", background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "30px" }}>
                                <input type="text" placeholder="Filter by Role..." value={jobSearch.role} onChange={e => setJobSearch({ ...jobSearch, role: e.target.value })} style={{ width: "100%", background: "#1e293b", color: "white", border: "1px solid #334155" }} />
                                <input type="text" placeholder="Skills (e.g. python, sql)..." value={jobSearch.skills} onChange={e => setJobSearch({ ...jobSearch, skills: e.target.value })} style={{ width: "100%", background: "#1e293b", color: "white", border: "1px solid #334155" }} />
                                <input type="number" placeholder="Max Experience..." value={jobSearch.experience} onChange={e => setJobSearch({ ...jobSearch, experience: e.target.value })} style={{ width: "100%", background: "#1e293b", color: "white", border: "1px solid #334155" }} />
                                <input type="text" placeholder="Location..." value={jobSearch.location} onChange={e => setJobSearch({ ...jobSearch, location: e.target.value })} style={{ width: "100%", background: "#1e293b", color: "white", border: "1px solid #334155" }} />
                                <input type="text" placeholder="Company..." value={jobSearch.company} onChange={e => setJobSearch({ ...jobSearch, company: e.target.value })} style={{ width: "100%", background: "#1e293b", color: "white", border: "1px solid #334155" }} />
                                <select value={jobSearch.jobType} onChange={e => setJobSearch({ ...jobSearch, jobType: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#1e293b", color: "white", border: "1px solid #334155" }}>
                                    <option value="">All Job Types</option>
                                    <option value="Full-Time">Full-Time</option>
                                    <option value="Part-Time">Part-Time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Internship">Internship</option>
                                </select>
                            </div>

                            {/* Job list grid */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
                                {filteredJobs.length === 0 ? (
                                    <div style={{ gridColumn: "1/-1", color: "#64748b", textAlign: "center", padding: "40px" }}>No openings found matching filters.</div>
                                ) : (
                                    filteredJobs.map(job => (
                                        <div key={job._id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", padding: "20px", borderRadius: "12px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                            <div>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <h3 style={{ margin: 0, color: "#f8fafc" }}>{job.title}</h3>
                                                    <span style={{ fontSize: "0.75rem", background: "rgba(99,102,241,0.12)", color: "#a5b4fc", padding: "4px 8px", borderRadius: "12px" }}>
                                                        Score Limit: {job.min_ats_score || job.ats_threshold}%
                                                    </span>
                                                </div>
                                                <div style={{ display: "flex", gap: "12px", fontSize: "0.75rem", color: "#94a3b8", margin: "5px 0" }}>
                                                    <span>🏢 {job.company || "Corporate Tech"}</span>
                                                    <span>📍 {job.location || "Remote"}</span>
                                                    <span>💼 {job.job_type || "Full-Time"}</span>
                                                    <span>💰 {job.salary || "Competetive"}</span>
                                                </div>
                                                <p style={{ fontSize: "0.85rem", color: "#cbd5e1", lineHeight: "1.4", margin: "10px 0" }}>{job.description}</p>
                                                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "15px" }}>
                                                    {job.required_skills.map((s, idx) => (
                                                        <span key={idx} style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8", padding: "2px 6px", borderRadius: "4px", fontSize: "0.7rem" }}>{s}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <button onClick={() => setSelectedApplyJob(job)} className="btn" style={{ width: "100%", padding: "10px" }}>Apply For Position</button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Custom Modal for applying */}
                            {selectedApplyJob && (
                                <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1001 }}>
                                    <div className="glass-card" style={{ width: "450px", padding: "30px", background: "#1e293b", border: "1px solid #334155" }}>
                                        <h3 style={{ margin: "0 0 5px 0", color: "#cbd5e1" }}>Apply for {selectedApplyJob.title}</h3>
                                        <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>🏢 {selectedApplyJob.company || "Corporate Tech"}</span>
                                        <form onSubmit={handleApplyJob} style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
                                            <input type="text" placeholder="Full Name *" value={applyForm.name} onChange={e => setApplyForm({ ...applyForm, name: e.target.value })} style={{ width: "100%", background: "#0f172a", color: "white", border: "1px solid #334155" }} required />
                                            <input type="email" placeholder="Email *" value={applyForm.email} onChange={e => setApplyForm({ ...applyForm, email: e.target.value })} style={{ width: "100%", background: "#0f172a", color: "white", border: "1px solid #334155" }} required />
                                            <input type="text" placeholder="Contact Number *" value={applyForm.phone} onChange={e => setApplyForm({ ...applyForm, phone: e.target.value })} style={{ width: "100%", background: "#0f172a", color: "white", border: "1px solid #334155" }} required />
                                            <input type="text" placeholder="Your Skills * (comma separated)" value={applyForm.skills} onChange={e => setApplyForm({ ...applyForm, skills: e.target.value })} style={{ width: "100%", background: "#0f172a", color: "white", border: "1px solid #334155" }} required />
                                            <input type="number" placeholder="Experience (Years) *" value={applyForm.experience_years} onChange={e => setApplyForm({ ...applyForm, experience_years: e.target.value })} style={{ width: "100%", background: "#0f172a", color: "white", border: "1px solid #334155" }} required />
                                            <input type="text" placeholder="Relevant Projects (comma separated)" value={applyForm.projects} onChange={e => setApplyForm({ ...applyForm, projects: e.target.value })} style={{ width: "100%", background: "#0f172a", color: "white", border: "1px solid #334155" }} />
                                            
                                            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                                <label style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: "600" }}>Upload Resume (PDF) *</label>
                                                <input type="file" accept="application/pdf" onChange={e => setApplyForm({ ...applyForm, file: e.target.files[0] })} style={{ width: "100%", background: "#0f172a", color: "white", border: "1px solid #334155" }} required />
                                            </div>
                                            
                                            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                                                <button type="submit" className="btn" style={{ flex: 1 }}>Submit Application</button>
                                                <button type="button" onClick={() => setSelectedApplyJob(null)} className="btn" style={{ background: "transparent", border: "1px solid #fb7185", color: "#fb7185" }}>Cancel</button>
                                            </div>
                                            {applyMsg && <p style={{ color: applyMsg.includes("successfully") ? "#34d399" : "#f87171", fontSize: "0.85rem", textAlign: "center", margin: 0 }}>{applyMsg}</p>}
                                        </form>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}

                    {/* TIMED MCQ EXAM SECTION */}
                    {activeTab === "mcq" && (
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            
                            {!mcqActiveTest && !mcqGradeResult && (
                                <div className="glass-card" style={{ width: "420px", padding: "30px", background: "rgba(255,255,255,0.02)" }}>
                                    <h2 style={{ fontSize: "1.3rem", color: "#cbd5e1", marginBottom: "10px", marginTop: 0 }}>MCQ Assessment Registry</h2>
                                    <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "20px" }}>Enter the test credentials dispatched to your registered email to unlock the timed exam portal.</p>
                                    <form onSubmit={handleValidateMCQ} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                                        <input type="email" placeholder="Registered Email" value={mcqCreds.email} onChange={e => setMcqCreds({ ...mcqCreds, email: e.target.value })} style={{ width: "100%", background: "#1e293b", color: "white", border: "1px solid #334155" }} required />
                                        <input type="password" placeholder="Test Password" value={mcqCreds.password} onChange={e => setMcqCreds({ ...mcqCreds, password: e.target.value })} style={{ width: "100%", background: "#1e293b", color: "white", border: "1px solid #334155" }} required />
                                        <button className="btn" type="submit" style={{ width: "100%" }}>Verify & Enter Assessment</button>
                                        {mcqLoginError && <p style={{ color: "#f87171", fontSize: "0.8rem", textAlign: "center", margin: 0 }}>{mcqLoginError}</p>}
                                    </form>
                                </div>
                            )}

                            {mcqActiveTest && (
                                <div className="glass-card" style={{ width: "700px", padding: "30px" }}>
                                    
                                    {/* MCQ Header with top timer */}
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #334155", paddingBottom: "15px", marginBottom: "25px" }}>
                                        <div>
                                            <h3 style={{ margin: 0, color: "#f8fafc" }}>{mcqActiveTest.title}</h3>
                                            <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Questions: {mcqActiveTest.questions.length}</span>
                                        </div>
                                        <div style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", padding: "8px 15px", borderRadius: "20px", fontWeight: "bold", fontSize: "0.9rem" }}>
                                            ⏱ Time Left: {Math.floor(mcqTimeLeft / 60)}:{(mcqTimeLeft % 60).toString().padStart(2, "0")}
                                        </div>
                                    </div>

                                    {/* Questions loop */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                                        {mcqActiveTest.questions.map((q, idx) => (
                                            <div key={idx} style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", padding: "20px", borderRadius: "10px" }}>
                                                <h4 style={{ margin: "0 0 12px 0", color: "#e2e8f0" }}>Q{idx + 1}. {q.question}</h4>
                                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                                    {q.options.map((opt, oIdx) => (
                                                        <label key={oIdx} style={{ display: "flex", gap: "10px", alignItems: "center", padding: "8px 12px", background: mcqAnswers[q.question] === opt ? "rgba(99,102,241,0.1)" : "transparent", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)", cursor: "pointer" }}>
                                                            <input 
                                                                type="radio" 
                                                                name={`q-${idx}`} 
                                                                value={opt} 
                                                                checked={mcqAnswers[q.question] === opt} 
                                                                onChange={() => setMcqAnswers({ ...mcqAnswers, [q.question]: opt })} 
                                                            />
                                                            <span style={{ color: "#cbd5e1" }}>{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}

                                        <button onClick={handleSubmitMCQ} className="btn" style={{ width: "100%", padding: "14px", marginTop: "10px" }}>Submit MCQ Exam</button>
                                    </div>

                                </div>
                            )}

                            {mcqGradeResult && (
                                <div className="glass-card" style={{ width: "450px", padding: "30px", textAlign: "center", border: "1px solid rgba(52,211,153,0.3)" }}>
                                    <span style={{ fontSize: "3rem" }}>🎉</span>
                                    <h3 style={{ color: "#cbd5e1", margin: "15px 0 5px 0" }}>Exam Grade Calculated</h3>
                                    <h1 style={{ fontSize: "3.5rem", color: "#34d399", margin: "10px 0" }}>{mcqGradeResult.percentage}%</h1>
                                    <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Score: {mcqGradeResult.score} out of {mcqGradeResult.total_marks} Marks</p>
                                    <p style={{ color: "#64748b", fontSize: "0.75rem", margin: "10px 0 20px 0" }}>Grading results have been logged and sent to the recruiter.</p>
                                    <button onClick={() => setMcqGradeResult(null)} className="btn" style={{ width: "100%" }}>Dismiss</button>
                                </div>
                            )}

                        </div>
                    )}

                    {/* DSA CODING PRACTICE IDE TAB */}
                    {activeTab === "ide" && (
                        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.5fr", gap: "30px" }}>
                            
                            {/* Left panel: stats & questions list */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                                
                                {/* Solved counts statistics */}
                                <div className="glass-card" style={{ padding: "20px", background: "rgba(99, 102, 241, 0.03)", border: "1px solid rgba(99, 102, 241, 0.1)" }}>
                                    <h3 style={{ margin: "0 0 15px 0", color: "#cbd5e1", fontSize: "1.1rem" }}>Coding Profile Metrics</h3>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", textAlign: "center" }}>
                                        <div style={{ background: "rgba(52, 211, 153, 0.08)", border: "1px solid rgba(52, 211, 153, 0.15)", padding: "10px", borderRadius: "8px" }}>
                                            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#34d399" }}>{dsaStats.solved_count || 0}</div>
                                            <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "4px" }}>Solved</div>
                                        </div>
                                        <div style={{ background: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.15)", padding: "10px", borderRadius: "8px" }}>
                                            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#818cf8" }}>{dsaStats.attempted_count || 0}</div>
                                            <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "4px" }}>Attempted</div>
                                        </div>
                                        <div style={{ background: "rgba(251, 191, 36, 0.08)", border: "1px solid rgba(251, 191, 36, 0.15)", padding: "10px", borderRadius: "8px" }}>
                                            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#fbbf24" }}>{dsaStats.accuracy !== undefined ? dsaStats.accuracy : 100}%</div>
                                            <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "4px" }}>Accuracy</div>
                                        </div>
                                    </div>
                                    
                                    {/* Difficulty breakdown */}
                                    <div style={{ marginTop: "15px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "15px" }}>
                                        <div style={{ background: "rgba(16, 185, 129, 0.04)", border: "1px solid rgba(16, 185, 129, 0.08)", padding: "6px", borderRadius: "6px" }}>
                                            <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#10b981" }}>{dsaStats.easy_solved || 0}</div>
                                            <div style={{ fontSize: "0.7rem", color: "#10b981", fontWeight: "600" }}>Easy</div>
                                        </div>
                                        <div style={{ background: "rgba(245, 158, 11, 0.04)", border: "1px solid rgba(245, 158, 11, 0.08)", padding: "6px", borderRadius: "6px" }}>
                                            <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#f59e0b" }}>{dsaStats.medium_solved || 0}</div>
                                            <div style={{ fontSize: "0.7rem", color: "#f59e0b", fontWeight: "600" }}>Medium</div>
                                        </div>
                                        <div style={{ background: "rgba(239, 68, 68, 0.04)", border: "1px solid rgba(239, 68, 68, 0.08)", padding: "6px", borderRadius: "6px" }}>
                                            <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#ef4444" }}>{dsaStats.hard_solved || 0}</div>
                                            <div style={{ fontSize: "0.7rem", color: "#ef4444", fontWeight: "600" }}>Hard</div>
                                        </div>
                                    </div>

                                    {dsaStats.bookmarks && dsaStats.bookmarks.length > 0 && (
                                        <div style={{ marginTop: "15px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                                            <span style={{ fontSize: "0.8rem", color: "#cbd5e1", fontWeight: "bold" }}>⭐ Bookmarked Challenges ({dsaStats.bookmarks.length}):</span>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                                                {dsaStats.bookmarks.map((bm, idx) => (
                                                    <span key={idx} onClick={() => {
                                                        const matched = dsaQuestions.find(q => q.title === bm);
                                                        if (matched) handleSelectDsaQuestion(matched);
                                                    }} style={{ background: "rgba(251, 191, 36, 0.12)", color: "#fbbf24", padding: "3px 8px", borderRadius: "4px", fontSize: "0.7rem", cursor: "pointer" }}>{bm}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Category & difficulty filters */}
                                <div className="glass-card" style={{ padding: "20px" }}>
                                    <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                                        <select value={dsaCategory} onChange={e => setDsaCategory(e.target.value)} style={{ flex: 1.2, padding: "8px", borderRadius: "6px", background: "#1e293b", color: "white", border: "1px solid #334155", fontSize: "0.8rem" }}>
                                            {DSA_TOPICS.map(topic => (
                                                <option key={topic} value={topic}>{topic}</option>
                                            ))}
                                        </select>

                                        <select value={dsaDifficulty} onChange={e => setDsaDifficulty(e.target.value)} style={{ flex: 0.8, padding: "8px", borderRadius: "6px", background: "#1e293b", color: "white", border: "1px solid #334155", fontSize: "0.8rem" }}>
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                    </div>

                                    {/* Questions list */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "300px", overflowY: "auto" }}>
                                        {dsaQuestions.length === 0 ? (
                                            <div style={{ color: "#64748b", textAlign: "center", padding: "20px", fontSize: "0.8rem" }}>No questions in database.</div>
                                        ) : (
                                            dsaQuestions.map(q => (
                                                <div 
                                                    key={q._id} 
                                                    onClick={() => handleSelectDsaQuestion(q)}
                                                    style={{
                                                        padding: "12px",
                                                        borderRadius: "8px",
                                                        background: selectedDsaQuest?.title === q.title ? "rgba(99, 102, 241, 0.1)" : "rgba(255,255,255,0.01)",
                                                        border: selectedDsaQuest?.title === q.title ? "1px solid #6366f1" : "1px solid rgba(255,255,255,0.04)",
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <strong style={{ fontSize: "0.85rem", color: "#f8fafc" }}>{q.title}</strong>
                                                        {dsaStats.solved_problems.includes(q.title) && (
                                                            <span style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: "bold" }}>✓ Solved</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Submission history logs */}
                                <div className="glass-card" style={{ padding: "20px", maxHeight: "300px", overflowY: "auto" }}>
                                    <h3 style={{ margin: "0 0 12px 0", color: "#cbd5e1", fontSize: "0.95rem" }}>My Attempt History</h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                        {dsaStats.history.length === 0 ? (
                                            <div style={{ color: "#64748b", fontSize: "0.8rem", textAlign: "center", padding: "10px" }}>No attempts recorded.</div>
                                        ) : (
                                            dsaStats.history.map((sub, idx) => (
                                                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.01)", padding: "10px", borderRadius: "6px", fontSize: "0.75rem", border: "1px solid rgba(255,255,255,0.03)" }}>
                                                    <div>
                                                        <strong>{sub.problem_title}</strong>
                                                        <div style={{ color: "#64748b" }}>{sub.language} • {new Date(sub.timestamp).toLocaleDateString()}</div>
                                                    </div>
                                                    <span style={{ 
                                                        color: sub.status === "Accepted" ? "#34d399" : "#f87171",
                                                        fontWeight: "bold"
                                                    }}>{sub.status}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                            </div>

                            {/* Right panel: text editor & results */}
                            {selectedDsaQuest ? (
                                <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                                    <div>
                                        <h3 style={{ margin: 0, color: "#cbd5e1" }}>{selectedDsaQuest.title}</h3>
                                        <p style={{ color: "#cbd5e1", fontSize: "0.85rem", marginTop: "5px", lineHeight: "1.4" }}>{selectedDsaQuest.description}</p>
                                    </div>

                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                            <select value={ideLang} onChange={e => setIdeLang(e.target.value)} style={{ padding: "6px 12px", borderRadius: "6px", background: "#1e293b", color: "white", border: "1px solid #334155", fontSize: "0.8rem" }}>
                                                <option value="python">Python</option>
                                                <option value="javascript">JavaScript</option>
                                                <option value="java">Java</option>
                                                <option value="cpp">C++</option>
                                                <option value="c">C</option>
                                            </select>
                                            <button 
                                                onClick={handleToggleBookmark}
                                                style={{ 
                                                    background: "none", 
                                                    border: "1px solid #334155", 
                                                    borderRadius: "6px", 
                                                    padding: "6px 12px", 
                                                    cursor: "pointer", 
                                                    color: dsaStats.bookmarks?.includes(selectedDsaQuest.title) ? "#fbbf24" : "#94a3b8", 
                                                    fontSize: "0.8rem",
                                                    fontWeight: "bold",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "5px"
                                                }}
                                            >
                                                {dsaStats.bookmarks?.includes(selectedDsaQuest.title) ? "★ Bookmarked" : "☆ Bookmark"}
                                            </button>
                                        </div>
                                        <div style={{ display: "flex", gap: "10px" }}>
                                            <button type="button" onClick={() => handleRunDsaCode(true)} disabled={ideRunning} className="btn" style={{ padding: "8px 16px", background: "linear-gradient(135deg, #10b981, #059669)", border: "none", color: "white" }}>
                                                {ideRunning ? "Submitting..." : "Submit Solution"}
                                            </button>
                                        </div>
                                    </div>

                                    <textarea
                                        value={ideCode}
                                        onChange={e => setIdeCode(e.target.value)}
                                        style={{ width: "100%", height: "260px", background: "#090d16", color: "#34d399", fontFamily: "monospace", padding: "15px", borderRadius: "10px", border: "1px solid #1e293b", fontSize: "0.9rem" }}
                                    />

                                    {ideResult && (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "15px", background: "rgba(255, 255, 255, 0.02)", padding: "20px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <strong style={{ fontSize: "0.9rem", color: "#e2e8f0" }}>Execution Results</strong>
                                                <span style={{ 
                                                    padding: "4px 10px", 
                                                    borderRadius: "4px", 
                                                    fontSize: "0.75rem", 
                                                    fontWeight: "bold",
                                                    background: ideResult.compile_success ? (ideResult.score === 100 ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)") : "rgba(239, 68, 68, 0.2)",
                                                    color: ideResult.compile_success ? (ideResult.score === 100 ? "#10b981" : "#f59e0b") : "#ef4444",
                                                    border: ideResult.compile_success ? (ideResult.score === 100 ? "1px solid #10b981" : "1px solid #f59e0b") : "1px solid #ef4444"
                                                }}>
                                                    {!ideResult.compile_success ? "Compile Error" : (ideResult.score === 100 ? "Accepted (Pass)" : "Wrong Answer")}
                                                </span>
                                            </div>

                                            {ideResult.error_message && (
                                                <div style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", padding: "12px", borderRadius: "6px", fontFamily: "monospace", fontSize: "0.8rem", color: "#f87171", overflowX: "auto", whiteSpace: "pre-wrap" }}>
                                                    <strong>Traceback / Error:</strong>
                                                    <pre style={{ margin: "5px 0 0 0", fontFamily: "inherit" }}>{ideResult.error_message}</pre>
                                                </div>
                                            )}

                                            {ideResult.compile_success && (
                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", background: "rgba(255,255,255,0.01)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.03)" }}>
                                                    <div>
                                                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Runtime</span>
                                                        <div style={{ color: "#f8fafc", fontWeight: "bold", fontSize: "1rem", marginTop: "2px" }}>
                                                            {ideResult.runtime_ms || 24} ms
                                                            <span style={{ fontSize: "0.7rem", color: "#10b981", marginLeft: "6px", fontWeight: "normal" }}>
                                                                (Beats {ideResult.beats_percentage || 85.0}%)
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Memory Usage</span>
                                                        <div style={{ color: "#f8fafc", fontWeight: "bold", fontSize: "1rem", marginTop: "2px" }}>
                                                            {ideResult.memory_mb || 15.4} MB
                                                        </div>
                                                    </div>
                                                    <div style={{ gridColumn: "span 2" }}>
                                                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Complexity Analysis</span>
                                                        <div style={{ color: "#a5b4fc", fontSize: "0.8rem", marginTop: "2px" }}>
                                                            Time: <strong>{ideResult.time_complexity}</strong> | Space: <strong>{ideResult.memory_usage}</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#94a3b8" }}>
                                                    <span>Test Cases Passed: {ideResult.score}%</span>
                                                    <span>{ideResult.test_cases?.filter(t => t.passed).length || 0} / {ideResult.test_cases?.length || 0}</span>
                                                </div>
                                                <div style={{ height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px" }}>
                                                    <div style={{ width: `${ideResult.score}%`, background: ideResult.score === 100 ? "#10b981" : "#f59e0b", height: "100%", borderRadius: "3px", transition: "width 0.3s ease" }} />
                                                </div>
                                            </div>

                                            {ideResult.test_cases && ideResult.test_cases.length > 0 && (
                                                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "180px", overflowY: "auto", paddingRight: "5px" }}>
                                                    {ideResult.test_cases.map((tc, idx) => (
                                                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: tc.passed ? "rgba(16, 185, 129, 0.03)" : "rgba(239, 68, 68, 0.03)", border: tc.passed ? "1px solid rgba(16, 185, 129, 0.1)" : "1px solid rgba(239, 68, 68, 0.1)", padding: "10px", borderRadius: "6px" }}>
                                                            <div style={{ display: "flex", flexDirection: "column" }}>
                                                                <span style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#cbd5e1" }}>{tc.case_name || `Test Case ${idx + 1}`}</span>
                                                                <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Input: {tc.input}</span>
                                                            </div>
                                                            <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: tc.passed ? "#10b981" : "#ef4444" }}>
                                                                {tc.passed ? "✓ Passed" : "✗ Failed"}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {ideResult.feedback && (
                                                <p style={{ fontSize: "0.8rem", color: "#94a3b8", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "10px", margin: 0 }}>
                                                    💡 {ideResult.feedback}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                </div>
                            ) : (
                                <div style={{ color: "#64748b", textAlign: "center", padding: "60px" }}>Select a coding challenge.</div>
                            )}

                        </div>
                    )}

                    {/* MOCK INTERVIEW SECURITY STREAM */}
                    {activeTab === "practice" && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "30px" }}>
                            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                                <h2 style={{ fontSize: "1.4rem", marginBottom: "10px", marginTop: 0 }}>Secure Video Assessment</h2>
                                <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Run interactive video evaluation. Demands camera and screen sharing context for interview profiling.</p>
                                <div style={{ display: "flex", gap: "10px" }}>
                                    {!interviewActive ? (
                                        <button className="btn" onClick={handleStartInterview} style={{ width: "100%" }}>Start Assessment Session</button>
                                    ) : (
                                        <button className="btn" onClick={handleStopInterview} style={{ width: "100%", background: "#f87171" }}>Terminate Assessment</button>
                                    )}
                                </div>

                                {interviewActive && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                        <div>
                                            <video ref={webcamRef} autoPlay playsInline muted style={{ width: "100%", height: "150px", background: "#000", borderRadius: "8px" }} />
                                        </div>
                                        <div>
                                            <video ref={screenShareRef} autoPlay playsInline muted style={{ width: "100%", height: "150px", background: "#000", borderRadius: "8px" }} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="glass-card" style={{ display: "flex", flexDirection: "column" }}>
                                <h2 style={{ fontSize: "1.4rem", marginBottom: "15px", marginTop: 0 }}>Practice Interview simulator</h2>
                                {generatingQuestions && <div style={{ color: "#6366f1" }}>Compiling custom interview questions...</div>}
                                
                                {practiceQuestions.length > 0 && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                                        <div style={{ background: "rgba(255,255,255,0.02)", padding: "15px", borderRadius: "10px" }}>
                                            <span style={{ fontSize: "0.75rem", background: "rgba(99,102,241,0.2)", color: "#a5b4fc", padding: "2px 8px", borderRadius: "4px" }}>Q{currentQIndex + 1} of {practiceQuestions.length} ({practiceQuestions[currentQIndex].type})</span>
                                            <h3 style={{ margin: "10px 0 0 0", color: "#cbd5e1" }}>{practiceQuestions[currentQIndex].question}</h3>
                                        </div>

                                        <textarea
                                            placeholder="Write your answer..."
                                            value={answerText}
                                            onChange={e => setAnswerText(e.target.value)}
                                            style={{ width: "100%", height: "130px", padding: "15px", borderRadius: "10px", background: "#1e293b", color: "white", border: "1px solid #334155", fontFamily: "inherit" }}
                                        />

                                        <div style={{ display: "flex", gap: "10px" }}>
                                            <button className="btn" onClick={handleEvaluateAnswer} disabled={evaluatingAnswer} style={{ flex: 1 }}>
                                                {evaluatingAnswer ? "Evaluating..." : "Submit Answer"}
                                            </button>
                                            {currentQIndex + 1 < practiceQuestions.length && (
                                                <button className="btn" onClick={() => { setCurrentQIndex(prev => prev + 1); setAnswerText(""); setAnswerResult(null); }} style={{ background: "transparent", border: "1px solid #6366f1", color: "#6366f1" }}>Next Question</button>
                                            )}
                                        </div>

                                        {answerResult && (
                                            <div style={{ background: "rgba(255,255,255,0.02)", padding: "15px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                                <strong>Evaluation Score: <span style={{ color: "#34d399" }}>{answerResult.score}%</span></strong>
                                                <p style={{ margin: "5px 0 0 0", fontSize: "0.8rem", color: "#cbd5e1" }}>{answerResult.feedback}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ATS RESUME UPLOAD SECTION */}
                    {activeTab === "ats" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                            <div className="glass-card" style={{ display: "flex", flexWrap: "wrap", gap: "25px", padding: "30px", alignItems: "center", background: "rgba(255,255,255,0.02)" }}>
                                <div style={{ flex: 1, minWidth: "280px" }}>
                                    <h2 style={{ fontSize: "1.4rem", color: "#f1f5f9", marginBottom: "10px", marginTop: 0 }}>Analyze Resume PDF</h2>
                                    <p style={{ color: "#cbd5e1", fontSize: "0.95rem" }}>Select the job profile you want to screen your CV against and upload your file.</p>
                                </div>

                                <div style={{ display: "flex", gap: "15px", flex: 2, flexWrap: "wrap", width: "100%" }}>
                                    <select 
                                        value={selectedJobId}
                                        onChange={(e) => setSelectedJobId(e.target.value)}
                                        style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#1e293b", color: "#f8fafc", minWidth: "220px", outline: "none" }}
                                        required
                                    >
                                        <option value="">-- Choose Job Role * --</option>
                                        {JOB_ROLES.map(role => (
                                            <option key={role} value={role}>
                                                {role}
                                            </option>
                                        ))}
                                    </select>

                                    <input 
                                        type="file"
                                        accept="application/pdf"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#1e293b", color: "#f8fafc", minWidth: "220px" }}
                                    />

                                    <button 
                                        className="btn"
                                        onClick={handleUploadATS}
                                        disabled={isProcessing}
                                        style={{ padding: "12px 25px", fontSize: "1rem", fontWeight: "600", background: isProcessing ? "#475569" : "#6366f1", cursor: isProcessing ? "not-allowed" : "pointer" }}
                                    >
                                        {isProcessing ? "Screening..." : "Evaluate Resume"}
                                    </button>
                                </div>
                            </div>

                            {isProcessing && (
                                <div className="glass-card" style={{ padding: "30px", background: "#090d16" }}>
                                    <h3 style={{ fontSize: "1.1rem", color: "#34d399", marginBottom: "15px" }}>Screener Console Logs</h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontFamily: "monospace", color: "#60a5fa" }}>
                                        {statusLogs.map((log, index) => (
                                            <div key={index}>{log}</div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {result && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                                        <div className="glass-card" style={{ textAlign: "center", padding: "25px", background: "rgba(255,255,255,0.02)" }}>
                                            <div style={{ color: "#94a3b8", fontSize: "0.9rem", fontWeight: "600" }}>ATS Match Score</div>
                                            <h1 style={{ fontSize: "3rem", fontWeight: "800", color: "#34d399", margin: "10px 0 0 0" }}>{result.score}%</h1>
                                        </div>

                                        <div className="glass-card" style={{ textAlign: "center", padding: "25px", background: "rgba(255,255,255,0.02)" }}>
                                            <div style={{ color: "#94a3b8", fontSize: "0.9rem", fontWeight: "600" }}>Skill Match %</div>
                                            <h1 style={{ fontSize: "3rem", fontWeight: "800", color: "#6366f1", margin: "10px 0 0 0" }}>{result.skill_match}%</h1>
                                        </div>

                                        <div className="glass-card" style={{ textAlign: "center", padding: "25px", background: "rgba(255,255,255,0.02)" }}>
                                            <div style={{ color: "#94a3b8", fontSize: "0.9rem", fontWeight: "600" }}>Experience Years</div>
                                            <h1 style={{ fontSize: "3rem", fontWeight: "800", color: "#cbd5e1", margin: "10px 0 0 0" }}>{result.experience_years} Yrs</h1>
                                        </div>

                                        <div className="glass-card" style={{ textAlign: "center", padding: "25px", border: result.status === "Shortlisted" ? "1px solid rgba(52, 211, 153, 0.3)" : "1px solid rgba(248, 113, 113, 0.3)" }}>
                                            <div style={{ color: "#94a3b8", fontSize: "0.9rem", fontWeight: "600" }}>Screening Status</div>
                                            <h1 style={{ fontSize: "2.1rem", fontWeight: "800", color: result.status === "Shortlisted" ? "#34d399" : "#f87171", margin: "18px 0 0 0" }}>{result.status}</h1>
                                        </div>
                                    </div>

                                    {/* AI generated classifier widget */}
                                    {result.ats_breakdown && (
                                        <div style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <span style={{ fontSize: "0.9rem", color: "#94a3b8", fontWeight: "600" }}>AI Resume Classifier</span>
                                                <span style={{ 
                                                    color: result.ats_breakdown.ai_result.includes("AI") ? "#f87171" : "#34d399",
                                                    fontWeight: "bold",
                                                    fontSize: "0.85rem"
                                                }}>
                                                    {result.ats_breakdown.ai_result} ({result.ats_breakdown.ai_probability}% AI Probability)
                                                </span>
                                            </div>
                                            <p style={{ margin: "10px 0 0 0", fontSize: "0.8rem", color: "#cbd5e1", lineHeight: "1.4" }}>
                                                {result.ats_breakdown.ai_explanation}
                                            </p>
                                        </div>
                                    )}

                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "25px" }}>
                                        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "20px", background: "rgba(255,255,255,0.02)" }}>
                                            <h3 style={{ margin: "0 0 5px 0", color: "#cbd5e1" }}>Feedback & Score breakdown</h3>
                                            <p style={{ fontSize: "0.85rem", color: "#cbd5e1", lineHeight: "1.4" }}>{result.feedback}</p>
                                            
                                            {result.ats_breakdown && (
                                                <div style={{ background: "rgba(0,0,0,0.15)", padding: "15px", borderRadius: "8px", fontSize: "0.8rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "2px" }}>
                                                        <span>Skills (25%):</span>
                                                        <strong>{result.ats_breakdown.skills_score} / 25</strong>
                                                    </div>
                                                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "2px" }}>
                                                        <span>Experience (15%):</span>
                                                        <strong>{result.ats_breakdown.experience_score} / 15</strong>
                                                    </div>
                                                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "2px" }}>
                                                        <span>Education (10%):</span>
                                                        <strong>{result.ats_breakdown.education_score} / 10</strong>
                                                    </div>
                                                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "2px" }}>
                                                        <span>Projects (10%):</span>
                                                        <strong>{result.ats_breakdown.projects_score} / 10</strong>
                                                    </div>
                                                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "2px" }}>
                                                        <span>Certificates (5%):</span>
                                                        <strong>{result.ats_breakdown.certifications_score} / 5</strong>
                                                    </div>
                                                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "2px" }}>
                                                        <span>Structure (5%):</span>
                                                        <strong>{result.ats_breakdown.resume_structure_score} / 5</strong>
                                                    </div>
                                                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "2px" }}>
                                                        <span>Keywords (10%):</span>
                                                        <strong>{result.ats_breakdown.keyword_score} / 10</strong>
                                                    </div>
                                                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "2px" }}>
                                                        <span>Grammar (10%):</span>
                                                        <strong>{result.ats_breakdown.grammar_score} / 10</strong>
                                                    </div>
                                                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "2px" }}>
                                                        <span>Formatting (5%):</span>
                                                        <strong>{result.ats_breakdown.formatting_score} / 5</strong>
                                                    </div>
                                                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "2px" }}>
                                                        <span>Completeness (5%):</span>
                                                        <strong>{result.ats_breakdown.completeness_score} / 5</strong>
                                                    </div>
                                                </div>
                                            )}

                                            {result.ats_breakdown && result.ats_breakdown.deductions && result.ats_breakdown.deductions.length > 0 && (
                                                <div style={{ background: "rgba(239, 68, 68, 0.04)", border: "1px solid rgba(239, 68, 68, 0.15)", padding: "12px", borderRadius: "8px", marginTop: "10px" }}>
                                                    <strong style={{ color: "#f87171", fontSize: "0.8rem", display: "block", marginBottom: "6px" }}>Score Deductions & Reasons</strong>
                                                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                                        {result.ats_breakdown.deductions.map((d, idx) => (
                                                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#cbd5e1" }}>
                                                                <span>🚨 <strong>{d.metric}</strong>: {d.reason}</span>
                                                                <span style={{ color: "#f87171", fontWeight: "700" }}>-{d.points} pts</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "25px", background: "rgba(255,255,255,0.02)" }}>
                                            <div>
                                                <h2 style={{ fontSize: "1.4rem", color: "#f1f5f9", marginBottom: "15px" }}>Extracted Skills Matrix</h2>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                                    {(result.skills || []).map((skill, i) => (
                                                        <span key={i} style={{ background: "rgba(99, 102, 241, 0.15)", color: "#a5b4fc", padding: "4px 8px", borderRadius: "6px", fontSize: "0.8rem" }}>{skill}</span>
                                                    ))}
                                                </div>
                                            </div>

                                            {result.ats_breakdown && (
                                                <div style={{ background: "rgba(255,255,255,0.01)", padding: "15px", borderRadius: "8px", fontSize: "0.8rem", border: "1px solid rgba(255,255,255,0.03)" }}>
                                                    <strong>Screener Recommendations:</strong>
                                                    <p style={{ margin: "5px 0 0 0", color: "#cbd5e1" }}>{result.ats_breakdown.resume_suggestions} • {result.ats_breakdown.grammar_suggestions}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* AI CAREER COACH CHAT TAB */}
                    {activeTab === "coach" && (
                        <div className="glass-card" style={{ display: "flex", flexDirection: "column", height: "550px", background: "rgba(255,255,255,0.02)" }}>
                            <h2 style={{ fontSize: "1.4rem", marginBottom: "15px", marginTop: 0 }}>AI Career Coach Chat</h2>
                            <div style={{ flex: 1, background: "#090d16", padding: "20px", borderRadius: "12px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "15px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                {chatLogs.map((log, idx) => (
                                    <div key={idx} style={{ alignSelf: log.sender === "bot" ? "flex-start" : "flex-end", background: log.sender === "bot" ? "#1e293b" : "#6366f1", color: "white", padding: "12px 18px", borderRadius: "15px", maxWidth: "80%", fontSize: "0.9rem", lineHeight: "1.4" }}>
                                        {log.text}
                                    </div>
                                ))}
                                {botLoading && (
                                    <div style={{ alignSelf: "flex-start", background: "#1e293b", padding: "10px 15px", borderRadius: "15px", color: "#94a3b8", fontSize: "0.85rem" }}>
                                        Consulting mentor...
                                    </div>
                                )}
                            </div>

                            <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                                <input type="text" placeholder="Ask custom advice..." value={chatQuery} onChange={e => setChatQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleChatbotQuery()} style={{ flex: 1, background: "#1e293b", color: "white", border: "1px solid #334155" }} />
                                <button className="btn" onClick={handleChatbotQuery}>Send</button>
                            </div>
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
}