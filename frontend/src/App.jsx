import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UploadDocument from "./pages/UploadDocument";
import VerifyDocument from "./pages/VerifyDocument";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                        <Routes>
                            {/* Public routes */}
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/verify" element={<VerifyDocument />} />

                            {/* Protected routes */}
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/upload"
                                element={
                                    <ProtectedRoute>
                                        <UploadDocument />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Catch-all */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </main>

                    {/* Footer */}
                    <footer className="border-t border-slate-800 py-6 mt-auto">
                        <div className="container-wide text-center">
                            <p className="text-slate-500 text-sm">
                                © {new Date().getFullYear()} TitleGuard. Built for Kenya's property market.
                                <span className="mx-2">·</span>
                                <span className="text-accent-400">Powered by Polygon Blockchain</span>
                            </p>
                        </div>
                    </footer>
                </div>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
