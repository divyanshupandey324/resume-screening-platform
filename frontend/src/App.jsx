import './styles/main.css'
import React, { lazy, Suspense } from 'react';
import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import LoadingSpinner from "./components/LoadingSpinner";

// Lazy-loaded page components for bundle size reduction and code-splitting
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const CandidateDashboard = lazy(() => import("./pages/CandidateDashboard"));
const RecruiterDashboard = lazy(() => import("./pages/RecruiterDashboard"));
const AnalyticsDashboard = lazy(() => import("./pages/AnalyticsDashboard"));
const Rankings = lazy(() => import("./pages/Rankings"));
const SkillGap = lazy(() => import("./pages/SkillGap"));
const ResumeScreening = lazy(() => import("./pages/ResumeScreening"));
const CandidateDatabase = lazy(() => import("./pages/CandidateDatabase"));
const JobPosts = lazy(() => import("./pages/JobPosts"));
const MCQLeaderboard = lazy(() => import("./pages/MCQLeaderboard"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));

function App(){

    return(

        <BrowserRouter>

            <Suspense fallback={<LoadingSpinner />}>

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
                        path="/forgot-password"
                        element={<ForgotPassword />}
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
                        path="/resume-screening"
                        element={<ResumeScreening />}
                    />

                    <Route
                        path="/candidate-db"
                        element={<CandidateDatabase />}
                    />

                    <Route
                        path="/job-posts"
                        element={<JobPosts />}
                    />



                    <Route
                        path="/mcq-leaderboard"
                        element={<MCQLeaderboard />}
                    />

                </Routes>

            </Suspense>

        </BrowserRouter>

    )

}

export default App