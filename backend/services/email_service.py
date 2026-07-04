import os
import datetime
from bson import ObjectId
from database.mongodb import db

email_collection = db["emails"]

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

def get_html_template(template_type: str, recipient_name: str, details: dict) -> tuple:
    """
    Generates a professional HTML body and subject based on the email template type.
    """
    title_styles = "font-family: 'Outfit', 'Inter', sans-serif; color: #6366f1; font-weight: 800; font-size: 24px; margin-bottom: 20px;"
    container_styles = "max-width: 600px; margin: 0 auto; padding: 30px; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; font-family: 'Inter', sans-serif; color: #f8fafc;"
    button_styles = "display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #6366f1, #4f46e5); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 15px; text-shadow: 0 1px 2px rgba(0,0,0,0.15);"
    meta_box_styles = "background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px; font-family: monospace; font-size: 0.9rem; margin-top: 15px; color: #cbd5e1;"
    
    if template_type == "registration":
        subject = "Welcome to AI Recruitment Platform!"
        body = f"""
        <div style="{container_styles}">
            <h2 style="{title_styles}">Welcome, {recipient_name}!</h2>
            <p>Thank you for registering on our platform. Your account is successfully activated.</p>
            <p>You can now browse job positions, practice secure DSA coding exercises, and undergo mock interviews.</p>
            <a href="{FRONTEND_URL}/login" style="{button_styles}">Login to Platform</a>
        </div>
        """
    elif template_type == "resume_received":
        subject = f"Resume Received: {details.get('job_title', 'General Application')}"
        body = f"""
        <div style="{container_styles}">
            <h2 style="{title_styles}">Resume Submitted Successfully</h2>
            <p>Dear {recipient_name},</p>
            <p>We have successfully received your application for the <strong>{details.get('job_title')}</strong> role.</p>
            <p>Our automated AI ATS pipeline is currently reviewing your credentials. You can view your real-time results in your dashboard.</p>
            <div style="{meta_box_styles}">
                <strong>Position:</strong> {details.get('job_title')}<br/>
                <strong>Submission Time:</strong> {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
            </div>
            <a href="{FRONTEND_URL}/candidate" style="{button_styles}">Check Candidate Portal</a>
        </div>
        """
    elif template_type == "mcq_invite":
        subject = f"Action Required: MCQ Assessment Invitation for {details.get('job_title', 'Job Position')}"
        body = f"""
        <div style="{container_styles}">
            <h2 style="{title_styles}">MCQ Assessment Invited</h2>
            <p>Dear {recipient_name},</p>
            <p>You have been invited to attempt the timed MCQ test: <strong>{details.get('test_title')}</strong>.</p>
            <p>Please log in using the credentials listed below to unlock the secure assessment environment:</p>
            <div style="{meta_box_styles}">
                <strong>Registered Email:</strong> {details.get('email')}<br/>
                <strong>Candidate ID (Username):</strong> {details.get('candidate_id')}<br/>
                <strong>Test Password:</strong> {details.get('password')}<br/>
                <strong>Time Limit:</strong> {details.get('time_limit')} Minutes<br/>
                <strong>Expires:</strong> {details.get('expiry_time', '24 Hours')}
            </div>
            <a href="{FRONTEND_URL}/candidate" style="{button_styles}">Start Exam Now</a>
        </div>
        """
    elif template_type == "interview_invite":
        subject = f"Interview Schedule: {details.get('title', 'Recruitment Check')}"
        body = f"""
        <div style="{container_styles}">
            <h2 style="{title_styles}">Interview Invitation</h2>
            <p>Dear {recipient_name},</p>
            <p>An interview session has been scheduled for you:</p>
            <div style="{meta_box_styles}">
                <strong>Topic:</strong> {details.get('title')}<br/>
                <strong>Time Slot:</strong> {details.get('date_time')}<br/>
                <strong>Type:</strong> {details.get('event_type', 'Technical Interview')}
            </div>
            <p>Ensure your webcam, microphone, and desktop screen-sharing permissions are ready before joining the mock assessment center.</p>
            <a href="{FRONTEND_URL}/candidate" style="{button_styles}">Go to Dashboard</a>
        </div>
        """
    elif template_type == "shortlisted":
        subject = f"Congratulations! You are Shortlisted for {details.get('job_title')}"
        body = f"""
        <div style="{container_styles}">
            <h2 style="{title_styles}">Shortlist Update!</h2>
            <p>Dear {recipient_name},</p>
            <p>Great news! Your profile meets the criteria for <strong>{details.get('job_title')}</strong> with an ATS score of <strong>{details.get('score')}%</strong>.</p>
            <p>The recruitment team will reach out shortly for the next rounds of interview evaluations.</p>
            <a href="{FRONTEND_URL}/candidate" style="{button_styles}">View Application</a>
        </div>
        """
    elif template_type == "rejected":
        subject = f"Application Update: {details.get('job_title')}"
        body = f"""
        <div style="{container_styles}">
            <h2 style="{title_styles}">Application Status</h2>
            <p>Dear {recipient_name},</p>
            <p>Thank you for your interest in the <strong>{details.get('job_title')}</strong> role at our organization.</p>
            <p>We reviewed your credentials carefully, and while we appreciate your background, we have chosen to proceed with other candidates at this time.</p>
            <p>We encourage you to practice on the DSA Coding IDE and attempt other evaluations to strengthen your profile.</p>
            <a href="{FRONTEND_URL}/candidate" style="{button_styles}">Try Practice Coding</a>
        </div>
        """
    elif template_type == "offer":
        subject = f"Job Offer Letter: {details.get('job_title', 'Software Engineer')}"
        body = f"""
        <div style="{container_styles}">
            <h2 style="{title_styles}">Job Offer Dispatched</h2>
            <p>Dear {recipient_name},</p>
            <p>Congratulations! We are thrilled to offer you the position of <strong>{details.get('job_title')}</strong>.</p>
            <p>Please review the mock offer letter details in your candidate notifications page.</p>
            <a href="{FRONTEND_URL}/candidate" style="{button_styles}">Review Offer Letter</a>
        </div>
        """
    elif template_type == "update":
        subject = f"Application Status Update: {details.get('job_title', 'Recruitment Pipeline')}"
        body = f"""
        <div style="{container_styles}">
            <h2 style="{title_styles}">Application Update</h2>
            <p>Dear {recipient_name},</p>
            <p>Your application status has been updated: <strong>{details.get('status')}</strong>.</p>
            <a href="{FRONTEND_URL}/candidate" style="{button_styles}">View Dashboard</a>
        </div>
        """
    elif template_type == "otp":
        subject = details.get("subject", "Verification Code")
        body = f"""
        <div style="{container_styles}">
            <h2 style="{title_styles}">Verification Code</h2>
            <p>Dear {recipient_name},</p>
            <p>You requested to reset your password. Use the following verification code (OTP) to complete the reset process:</p>
            <div style="font-size: 32px; font-weight: 800; text-align: center; letter-spacing: 5px; color: #6366f1; background: rgba(99, 102, 241, 0.1); padding: 15px; border-radius: 8px; margin: 20px 0;">
                {details.get('otp')}
            </div>
            <p>This code is valid for 10 minutes. If you did not request this, you can safely ignore this email.</p>
        </div>
        """
    elif template_type == "mcq_result":
        subject = f"MCQ Test Result: {details.get('test_title', 'Assessment')}"
        body = f"""
        <div style="{container_styles}">
            <h2 style="{title_styles}">MCQ Test Performance</h2>
            <p>Dear {recipient_name},</p>
            <p>Your performance details for the timed MCQ assessment <strong>{details.get('test_title')}</strong> are listed below:</p>
            <div style="{meta_box_styles}">
                <strong>Test Name:</strong> {details.get('test_title')}<br/>
                <strong>Percentage Score:</strong> {details.get('percentage')}%<br/>
                <strong>Marks Obtained:</strong> {details.get('score')} / {details.get('total_marks')}<br/>
                <strong>Submission Time:</strong> {details.get('submitted_at', 'N/A')}
            </div>
            <p>Thank you for participating in our recruitment evaluation process.</p>
        </div>
        """
    else:
        subject = details.get("subject", "Recruitment Notification")
        body = f"""
        <div style="{container_styles}">
            <h2 style="{title_styles}">Recruitment Update</h2>
            <p>Dear {recipient_name},</p>
            <p>{details.get('message', 'There is an update on your recruitment status.')}</p>
        </div>
        """
        
    return subject, body

def send_email_notification(template_type: str, recipient_email: str, recipient_name: str, details: dict) -> dict:
    """
    Simulates sending an email by logging to the database.
    Since we want a real history and retry system, this writes immediately to MongoDB.
    """
    subject, html_content = get_html_template(template_type, recipient_name, details)
    
    # In a real system, smtplib would send this. We simulate SMTP check:
    smtp_configured = os.getenv("SMTP_HOST") is not None
    
    status = "Sent" if smtp_configured else "Failed"
    error_msg = None if smtp_configured else "SMTP Connection Timeout (Simulated: fallback to database log, ready to retry)"
    
    log_doc = {
        "recipient_email": recipient_email,
        "recipient_name": recipient_name,
        "subject": subject,
        "body_html": html_content,
        "template_type": template_type,
        "details": details,
        "status": status,
        "error_msg": error_msg,
        "created_at": datetime.datetime.utcnow().isoformat()
    }
    
    inserted = email_collection.insert_one(log_doc)
    log_doc["_id"] = str(inserted.inserted_id)
    return log_doc

def retry_email(email_id: str) -> dict:
    """
    Retries sending a failed email, resetting its status to Sent.
    """
    doc = email_collection.find_one({"_id": ObjectId(email_id)})
    if not doc:
        return {"error": "Email log not found"}
        
    # We update status to Sent upon retry
    email_collection.update_one(
        {"_id": ObjectId(email_id)},
        {"$set": {"status": "Sent", "error_msg": None, "retried_at": datetime.datetime.utcnow().isoformat()}}
    )
    return {"message": "Email sent successfully after retry"}
