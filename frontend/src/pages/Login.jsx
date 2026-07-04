import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    // Forgot Password Flow States
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotOtp, setForgotOtp] = useState("");
    const [forgotNewPassword, setForgotNewPassword] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [forgotMessage, setForgotMessage] = useState("");
    const [forgotLoading, setForgotLoading] = useState(false);

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
                
                // Save session parameters
                localStorage.setItem("username", username);
                localStorage.setItem("role", role);
                
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

    const handleSendOTP = async () => {
        if (!forgotEmail) {
            setForgotMessage("Please enter your registered email address.");
            return;
        }
        setForgotLoading(true);
        setForgotMessage("");
        try {
            const response = await API.post("/forgot-password/send-otp", { email: forgotEmail });
            if (response.data.success) {
                setOtpSent(true);
                setForgotMessage("✓ OTP has been sent to your email!");
            } else {
                setForgotMessage(response.data.message || "Failed to send OTP.");
            }
        } catch (error) {
            console.error(error);
            setForgotMessage("Error requesting OTP.");
        } finally {
            setForgotLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!forgotOtp || !forgotNewPassword) {
            setForgotMessage("Please enter the OTP and your new password.");
            return;
        }
        setForgotLoading(true);
        setForgotMessage("");
        try {
            const response = await API.post("/forgot-password/reset", {
                email: forgotEmail,
                otp: forgotOtp,
                new_password: forgotNewPassword
            });
            if (response.data.success) {
                setForgotMessage("✓ Password updated successfully! Please login.");
                setTimeout(() => {
                    setShowForgotPassword(false);
                    setOtpSent(false);
                    setForgotEmail("");
                    setForgotOtp("");
                    setForgotNewPassword("");
                    setForgotMessage("");
                }, 3000);
            } else {
                setForgotMessage(response.data.message || "Failed to reset password.");
            }
        } catch (error) {
            console.error(error);
            setForgotMessage("Error resetting password.");
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <div className="page" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "radial-gradient(circle at center, #1e293b, #0f172a)" }}>
            <div className="glass-card" style={{ maxWidth: "400px", width: "100%", padding: "40px" }}>
                
                {showForgotPassword ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <h2 style={{ color: "#f8fafc", textAlign: "center", marginBottom: "10px", fontWeight: "700" }}>
                            Reset Password
                        </h2>
                        <p style={{ color: "#94a3b8", fontSize: "0.85rem", textAlign: "center", marginBottom: "10px" }}>
                            {!otpSent 
                                ? "Enter your registered email address to receive a verification OTP." 
                                : "Enter the OTP sent to your email and your new password."}
                        </p>

                        {!otpSent ? (
                            <>
                                <input
                                    type="email"
                                    placeholder="Registered Email"
                                    value={forgotEmail}
                                    onChange={(e)=> setForgotEmail(e.target.value)}
                                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#1e293b", color: "#f8fafc" }}
                                    required
                                />
                                <button
                                    className="btn"
                                    onClick={handleSendOTP}
                                    disabled={forgotLoading}
                                    style={{ width: "100%", padding: "12px", fontSize: "1rem", fontWeight: "600", marginTop: "10px" }}
                                >
                                    {forgotLoading ? "Sending OTP..." : "Send Verification OTP"}
                                </button>
                            </>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    placeholder="Enter 6-Digit OTP"
                                    value={forgotOtp}
                                    onChange={(e)=> setForgotOtp(e.target.value)}
                                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#1e293b", color: "#f8fafc", textAlign: "center", letterSpacing: "2px" }}
                                    required
                                />
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    value={forgotNewPassword}
                                    onChange={(e)=> setForgotNewPassword(e.target.value)}
                                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#1e293b", color: "#f8fafc" }}
                                    required
                                />
                                <button
                                    className="btn"
                                    onClick={handleResetPassword}
                                    disabled={forgotLoading}
                                    style={{ width: "100%", padding: "12px", fontSize: "1rem", fontWeight: "600", marginTop: "10px" }}
                                >
                                    {forgotLoading ? "Resetting Password..." : "Update Password"}
                                </button>
                            </>
                        )}

                        <div style={{ textAlign: "center", marginTop: "10px" }}>
                            <span 
                                onClick={() => { setShowForgotPassword(false); setForgotMessage(""); setOtpSent(false); }} 
                                style={{ color: "#6366f1", fontSize: "0.9rem", fontWeight: "600", cursor: "pointer", textDecoration: "underline" }}
                            >
                                Back to Login
                            </span>
                        </div>

                        {forgotMessage && (
                            <p style={{ color: forgotMessage.includes("successfully") || forgotMessage.includes("sent") ? "#34d399" : "#f87171", textAlign: "center", fontSize: "0.9rem", marginTop: "10px" }}>
                                {forgotMessage}
                            </p>
                        )}
                    </div>
                ) : (
                    <>
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

                            <div style={{ textAlign: "right", marginTop: "-10px" }}>
                                <span 
                                    onClick={() => { setShowForgotPassword(true); setForgotMessage(""); setOtpSent(false); }} 
                                    style={{ color: "#a5b4fc", fontSize: "0.85rem", cursor: "pointer", textDecoration: "underline" }}
                                >
                                    Forgot Password?
                                </span>
                            </div>

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
                    </>
                )}
            </div>
        </div>
    );
}