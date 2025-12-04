import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

/* PAGES */
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import Attendance from "@/pages/Attendance";
import AttendanceManagement from "@/pages/AttendanceManagement";
import Grades from "@/pages/Grades";
import GradeManagement from "@/pages/GradeManagement";
import Students from "@/pages/Students";
import Teachers from "@/pages/Teachers";
import Subjects from "@/pages/Subjects";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function RoleRoute({
  role,
  children,
}: {
  role: string;
  children: JSX.Element;
}) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;

  return user.role === role ? children : <Navigate to="/dashboard" />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* PROTECTED ROUTES */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* STUDENT ROUTES */}
      <Route
        path="/attendance"
        element={
          <RoleRoute role="student">
            <Attendance />
          </RoleRoute>
        }
      />

      <Route
        path="/grades"
        element={
          <RoleRoute role="student">
            <Grades />
          </RoleRoute>
        }
      />

      {/* TEACHER ROUTES */}
      <Route
        path="/attendance-management"
        element={
          <RoleRoute role="teacher">
            <AttendanceManagement />
          </RoleRoute>
        }
      />

      <Route
        path="/grade-management"
        element={
          <RoleRoute role="teacher">
            <GradeManagement />
          </RoleRoute>
        }
      />

      {/* ADMIN ROUTES */}
      <Route
        path="/students"
        element={
          <RoleRoute role="admin">
            <Students />
          </RoleRoute>
        }
      />

      <Route
        path="/teachers"
        element={
          <RoleRoute role="admin">
            <Teachers />
          </RoleRoute>
        }
      />

      <Route
  path="/subjects"
  element={
    <ProtectedRoute>
      <Subjects />
    </ProtectedRoute>
  }
/>


      {/* DEFAULT REDIRECT */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
