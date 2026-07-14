import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function ForgotPassword() {
    const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter OTP, 3: New Password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email) {
            setMessage("Please enter your registered email address.");
            return;
        }
        setIsLoading(true);
        setMessage("");
        try {
            const res = await API.post("/auth/forgot-password/send-otp", { email });
            if (res.data.success) {
                setMessage("Verification code sent to your email.");
                setStep(2);
            } else {
                setMessage(res.data.message || "Failed to send verification code.");
            }
        } catch (err) {
            console.error(err);
            setMessage("Error sending verification code.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp) {
            setMessage("Please enter the verification code.");
            return;
        }
        setIsLoading(true);
        setMessage("");
        try {
            const res = await API.post("/auth/forgot-password/verify-otp", { email, otp });
            if (res.data.success) {
                setMessage("OTP verified successfully. Create your new password.");
                setStep(3);
            } else {
                setMessage(res.data.message || "Invalid or expired verification code.");
            }
        } catch (err) {
            console.error(err);
            setMessage("Error verifying verification code.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) {
            setMessage("Please fill in both password fields.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }
        setIsLoading(true);
        setMessage("");
        try {
            const res = await API.post("/auth/forgot-password/reset", {
                email,
                otp,
                new_password: newPassword
            });
            if (res.data.success) {
                setMessage("Password updated successfully! Redirecting to login...");
                setTimeout(() => navigate("/login"), 2000);
            } else {
                setMessage(res.data.message || "Failed to update password.");
            }
        } catch (err) {
            console.error(err);
            setMessage("Error updating password.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "radial-gradient(circle at center, #1e293b, #0f172a)" }}>
            <div className="glass-card" style={{ maxWidth: "400px", width: "100%", padding: "40px" }}>
                <h2 style={{ color: "#f8fafc", textAlign: "center", marginBottom: "20px", fontWeight: "700" }}>
                    Reset Password
                </h2>

                {step === 1 && (
                    <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <p style={{ color: "#94a3b8", fontSize: "0.9rem", textAlign: "center", margin: "0 0 10px 0", lineHeight: "1.4" }}>
                            Enter your registered email address below, and we will send you a 6-digit OTP code to verify your identity.
                        </p>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#1e293b", color: "#f8fafc" }}
                            required
                        />
                        <button
                            type="submit"
                            className="btn"
                            disabled={isLoading}
                            style={{ width: "100%", padding: "12px", fontSize: "1rem", fontWeight: "600" }}
                        >
                            {isLoading ? "Sending OTP..." : "Send Verification Code"}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <p style={{ color: "#94a3b8", fontSize: "0.9rem", textAlign: "center", margin: "0 0 10px 0", lineHeight: "1.4" }}>
                            Verification code sent to <strong>{email}</strong>. Enter the 6-digit OTP below.
                        </p>
                        <input
                            type="text"
                            placeholder="6-Digit OTP Code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#1e293b", color: "#f8fafc", letterSpacing: "2px", textAlign: "center", fontWeight: "bold" }}
                            required
                        />
                        <button
                            type="submit"
                            className="btn"
                            disabled={isLoading}
                            style={{ width: "100%", padding: "12px", fontSize: "1rem", fontWeight: "600" }}
                        >
                            {isLoading ? "Verifying..." : "Verify Code"}
                        </button>
                        <span 
                            onClick={() => setStep(1)} 
                            style={{ color: "#94a3b8", textAlign: "center", fontSize: "0.85rem", cursor: "pointer", textDecoration: "underline" }}
                        >
                            Go Back
                        </span>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <p style={{ color: "#94a3b8", fontSize: "0.9rem", textAlign: "center", margin: "0 0 10px 0", lineHeight: "1.4" }}>
                            Set your new account password below.
                        </p>
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#1e293b", color: "#f8fafc" }}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#1e293b", color: "#f8fafc" }}
                            required
                        />
                        <button
                            type="submit"
                            className="btn"
                            disabled={isLoading}
                            style={{ width: "100%", padding: "12px", fontSize: "1rem", fontWeight: "600" }}
                        >
                            {isLoading ? "Updating Password..." : "Update Password"}
                        </button>
                    </form>
                )}

                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <span onClick={() => navigate("/login")} style={{ color: "#6366f1", fontSize: "0.9rem", fontWeight: "600", cursor: "pointer", textDecoration: "underline" }}>
                        Back to Login
                    </span>
                </div>

                {message && (
                    <p style={{ 
                        color: message.includes("successfully") || message.includes("sent") ? "#34d399" : "#f87171", 
                        textAlign: "center", 
                        marginTop: "20px", 
                        fontSize: "0.95rem" 
                    }}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}
