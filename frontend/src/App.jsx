import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./AuthContext";
import AppLayout from "./components/AppLayout";
import Coach from "./pages/Coach";
import History from "./pages/History";
import Home from "./pages/Home";
import LogWorkout from "./pages/LogWorkout";
import Login from "./pages/Login";
import Progress from "./pages/Progress";
import Register from "./pages/Register";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="center">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/log" element={<LogWorkout />} />
        <Route path="/history" element={<History />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/coach" element={<Coach />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}