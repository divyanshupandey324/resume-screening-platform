import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!username || !password) {
            setMessage("Please enter both username and password");
            return;
        }

        try {
            const response = await API.post(
                "/login",
                {
                    username,
                    password
                }
            );

            if (response.data.message === "Login Success") {
                setMessage("Login Success");
                const role = response.data.role || "candidate";
                
                // Redirect immediately based on returned role
                if (role.toLowerCase() === "recruiter") {
                    navigate("/recruiter");
                } else {
                    navigate("/candidate");
                }
            } else {
                setMessage(response.data.message);
            }
        }
        catch(error){
            console.log(error);
            setMessage("Login Failed");
        }
    };

    return (
        <div className="page" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "radial-gradient(circle at center, #1e293b, #0f172a)" }}>
            <div className="glass-card" style={{ maxWidth: "400px", width: "100%", padding: "40px" }}>
                <h2 style={{ color: "#f8fafc", textAlign: "center", marginBottom: "30px", fontWeight: "700" }}>
                    Login
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

                    <button
                        className="btn"
                        onClick={handleLogin}
                        style={{ width: "100%", padding: "12px", fontSize: "1rem", fontWeight: "600", marginTop: "10px" }}
                    >
                        Sign In
                    </button>
                </div>

                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Don't have an account? </span>
                    <span onClick={() => navigate("/register")} style={{ color: "#6366f1", fontSize: "0.9rem", fontWeight: "600", cursor: "pointer", textDecoration: "underline" }}>
                        Register
                    </span>
                </div>

                {message && (
                    <p style={{ color: message === "Login Success" ? "#34d399" : "#f87171", textAlign: "center", marginTop: "20px", fontSize: "0.95rem" }}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}