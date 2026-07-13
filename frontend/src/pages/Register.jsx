import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("candidate");
    const [message, setMessage] = useState("");
    const [isRegistered, setIsRegistered] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async () => {
        if (!username || !password) {
            setMessage("Please enter username and password");
            return;
        }

        try {
            const response = await API.post(
                "/register",
                {
                    username,
                    password,
                    role
                }
            );

            if (response.data.message === "User Registered") {
                setIsRegistered(true);
                setMessage("Account Created Successfully");
            } else {
                setMessage(response.data.message);
            }
        }
        catch(error){
            console.log(error);
            setMessage("Registration Failed");
        }
    };

    if (isRegistered) {
        return (
            <div className="page" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "radial-gradient(circle at center, #1e293b, #0f172a)" }}>
                <div className="glass-card" style={{ maxWidth: "450px", width: "100%", textAlign: "center", padding: "40px" }}>
                    <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🎉</div>
                    <h1 style={{ fontSize: "2.2rem", fontWeight: "800", color: "#f8fafc", marginBottom: "15px", marginTop: 0 }}>
                        Success!
                    </h1>
                    <p style={{ color: "#34d399", fontSize: "1.1rem", marginBottom: "30px", lineHeight: "1.5" }}>
                        Your account has been registered successfully as a <strong>{role === "candidate" ? "Candidate 🎓" : "Recruiter 💼"}</strong>.
                    </p>
                    <button
                        className="btn"
                        onClick={() => navigate("/login")}
                        style={{ width: "100%", padding: "14px", fontSize: "1rem", fontWeight: "600", transition: "all 0.2s" }}
                    >
                        Proceed to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "radial-gradient(circle at center, #1e293b, #0f172a)" }}>
            <div className="glass-card" style={{ maxWidth: "400px", width: "100%", padding: "40px" }}>
                <h2 style={{ color: "#f8fafc", textAlign: "center", marginBottom: "30px", fontWeight: "700" }}>
                    Register
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e)=> setUsername(e.target.value)}
                        style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#1e293b", color: "#f8fafc" }}
                    />



                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e)=> setPassword(e.target.value)}
                        style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#1e293b", color: "#f8fafc" }}
                    />

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label style={{ fontSize: "0.9rem", color: "#94a3b8", fontWeight: "600" }}>Register As</label>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button
                                type="button"
                                onClick={() => setRole("candidate")}
                                style={{
                                    flex: 1,
                                    padding: "12px",
                                    borderRadius: "8px",
                                    border: role === "candidate" ? "2px solid #6366f1" : "2px solid #334155",
                                    background: role === "candidate" ? "rgba(99, 102, 241, 0.15)" : "#1e293b",
                                    color: "#f8fafc",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    transition: "all 0.2s"
                                }}
                            >
                                🎓 Candidate
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole("recruiter")}
                                style={{
                                    flex: 1,
                                    padding: "12px",
                                    borderRadius: "8px",
                                    border: role === "recruiter" ? "2px solid #6366f1" : "2px solid #334155",
                                    background: role === "recruiter" ? "rgba(99, 102, 241, 0.15)" : "#1e293b",
                                    color: "#f8fafc",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    transition: "all 0.2s"
                                }}
                            >
                                💼 Recruiter
                            </button>
                        </div>
                    </div>

                    <button
                        className="btn"
                        onClick={handleRegister}
                        style={{ width: "100%", padding: "12px", fontSize: "1rem", fontWeight: "600", marginTop: "10px" }}
                    >
                        Register
                    </button>
                </div>

                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Already have an account? </span>
                    <span onClick={() => navigate("/login")} style={{ color: "#6366f1", fontSize: "0.9rem", fontWeight: "600", cursor: "pointer", textDecoration: "underline" }}>
                        Login
                    </span>
                </div>

                {message && (
                    <p style={{ color: message.includes("Successfully") ? "#34d399" : "#f87171", textAlign: "center", marginTop: "20px", fontSize: "0.95rem" }}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}