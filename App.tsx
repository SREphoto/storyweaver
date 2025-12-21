import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StoryProvider } from './contexts/StoryContext';
import LoginPage from './components/pages/LoginPage';
import RegisterPage from './components/pages/RegisterPage';
import DashboardPage from './components/pages/DashboardPage';
import StoryEditor from './StoryEditor';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
    console.log("App component rendering");
    return (
        <AuthProvider>
            <Router basename="/storyweaver">
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/" element={
                        <PrivateRoute>
                            <StoryProvider>
                                <DashboardPage />
                            </StoryProvider>
                        </PrivateRoute>
                    } />
                    <Route path="/editor/:id" element={
                        <PrivateRoute>
                            <StoryProvider>
                                <StoryEditor />
                            </StoryProvider>
                        </PrivateRoute>
                    } />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
