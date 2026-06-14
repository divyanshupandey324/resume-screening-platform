import './styles/main.css'

import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CandidateDashboard from "./pages/CandidateDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import Rankings from "./pages/Rankings";
import SkillGap from "./pages/SkillGap";
import ResumeUpload from "./pages/ResumeUpload";
import CandidateDatabase from "./pages/CandidateDatabase";

function App(){

    return(

        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/candidate"
                    element={<CandidateDashboard />}
                />

                <Route
                    path="/recruiter"
                    element={<RecruiterDashboard />}
                />

                <Route
                    path="/analytics"
                    element={<AnalyticsDashboard />}
                />

                <Route
                    path="/rankings"
                    element={<Rankings />}
                />

                <Route
                    path="/skill-gap"
                    element={<SkillGap />}
                />

                <Route
                    path="/resume-upload"
                    element={<ResumeUpload />}
                />

                <Route
                    path="/candidate-db"
                    element={<CandidateDatabase />}
                />

            </Routes>

        </BrowserRouter>

    )

}

export default App