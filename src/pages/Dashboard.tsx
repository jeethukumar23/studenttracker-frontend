import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api } from "@/axios";
import { useAuth } from "@/contexts/AuthContext";

/* UI */
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import {
  Users,
  User,
  BookOpen,
  GraduationCap,
  CheckCircle,
} from "lucide-react";

/* Charts */
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function Dashboard() {
  const { user } = useAuth();

  /* STUDENT DATA */
  const [attendancePct, setAttendancePct] = useState<number | null>(null);
  const [gradeAvg, setGradeAvg] = useState<number | null>(null);

  const [attendanceGraphData, setAttendanceGraphData] = useState<any[]>([]);
  const [gradeGraphData, setGradeGraphData] = useState<any[]>([]);

  /* SUBJECTS MAP */
  const [subjectsMap, setSubjectsMap] = useState<Record<number, any>>({});

  /* ADMIN/TEACHER DATA */
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [totalTeachers, setTotalTeachers] = useState<number>(0);
  const [totalSubjects, setTotalSubjects] = useState<number>(0);

  const [loading, setLoading] = useState(true);

  /* --------------------------- INITIAL LOAD --------------------------- */
  useEffect(() => {
    if (!user?.id) return;

    // Load subjects so grade graph can use subject names
    loadSubjects();

    if (user.role === "student") {
      loadAttendance();
      loadGrades();
    }

    if (user.role === "teacher") {
      loadTeacherStats();
    }

    if (user.role === "admin") {
      loadAdminStats();
    }

    setLoading(false);
  }, [user]);

  /* --------------------------- LOAD SUBJECTS --------------------------- */
  const loadSubjects = async () => {
    try {
      const res = await api.get("/subjects");
      const map: Record<number, any> = {};
      (res.data || []).forEach((s: any) => {
        map[s.id] = s;
      });
      setSubjectsMap(map);
    } catch (err) {
      console.error("Failed loading subjects", err);
    }
  };

  /* --------------------------- STUDENT ATTENDANCE --------------------------- */
  const loadAttendance = async () => {
    try {
      const res = await api.get(`/attendance/user/${user.id}`);
      const data = res.data;

      setAttendancePct(data.percentage ?? 0);

      const graph = (data.records || []).map((r: any) => ({
        date: r.date,
        value: r.status === "present" ? 1 : r.status === "late" ? 0.5 : 0,
      }));

      setAttendanceGraphData(graph);
    } catch (err) {
      console.error("Attendance Load Error", err);
      setAttendancePct(null);
    }
  };

  /* --------------------------- STUDENT GRADES --------------------------- */
  const loadGrades = async () => {
    try {
      const res = await api.get(`/grades/user/${user.id}`);
      const list = res.data || [];

      if (!list.length) {
        setGradeAvg(null);
        setGradeGraphData([]);
        return;
      }

      // Average (score is already 0–10)
      let sum = 0;
      list.forEach((g: any) => (sum += Number(g.score) || 0));
      setGradeAvg(Number((sum / list.length).toFixed(2)));

      // Graph: subject vs score
      const graph = list.map((g: any) => ({
        subject: subjectsMap[g.subjectId]?.name ?? `Sub ${g.subjectId}`,
        value: Number(g.score) || 0,
      }));

      setGradeGraphData(graph);
    } catch (err) {
      console.error("Grade Load Error", err);
      setGradeAvg(null);
      setGradeGraphData([]);
    }
  };

  /* --------------------------- TEACHER STATS --------------------------- */
  const loadTeacherStats = async () => {
    try {
      const res = await api.get("/students");
      setTotalStudents((res.data || []).length);
    } catch {
      setTotalStudents(0);
    }
  };

  /* --------------------------- ADMIN STATS --------------------------- */
  const loadAdminStats = async () => {
    try {
      const s = await api.get("/students");
      const t = await api.get("/teachers");
      const sub = await api.get("/subjects");

      setTotalStudents((s.data || []).length);
      setTotalTeachers((t.data || []).length);
      setTotalSubjects((sub.data || []).length);
    } catch {
      setTotalStudents(0);
      setTotalTeachers(0);
      setTotalSubjects(0);
    }
  };

  if (loading) {
    return (
      <Layout>
        <p className="text-center py-10">Loading dashboard...</p>
      </Layout>
    );
  }

  /* =====================================================================
       STUDENT DASHBOARD
     ===================================================================== */
  if (user.role === "student") {
    return (
      <Layout>
        <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow hover:shadow-lg transition">
            <CardHeader className="flex justify-between">
              <CardTitle>Attendance</CardTitle>
              <CheckCircle className="text-green-600 w-8 h-8" />
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold">
                {attendancePct !== null ? `${Math.round(attendancePct)}%` : "No Data"}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow hover:shadow-lg transition">
            <CardHeader className="flex justify-between">
              <CardTitle>Overall Grade</CardTitle>
              <GraduationCap className="text-blue-600 w-8 h-8" />
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold">
                {gradeAvg !== null ? `${gradeAvg}/10` : "No Grades Yet"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Graph */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceGraphData.length === 0 ? (
              <p>No attendance data</p>
            ) : (
              <LineChart width={350} height={200} data={attendanceGraphData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis
                  domain={[0, 1]}
                  ticks={[0, 0.5, 1]}
                  tickFormatter={(v) =>
                    v === 1 ? "Present" : v === 0.5 ? "Late" : "Absent"
                  }
                />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#ff7a00" strokeWidth={2} />
              </LineChart>
            )}
          </CardContent>
        </Card>

        {/* Grade Graph */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Grade Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {gradeGraphData.length === 0 ? (
              <p>No grade data</p>
            ) : (
              <LineChart width={350} height={200} data={gradeGraphData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#0066ff" strokeWidth={2} />
              </LineChart>
            )}
          </CardContent>
        </Card>
      </Layout>
    );
  }

  /* =====================================================================
       TEACHER DASHBOARD
     ===================================================================== */
  if (user.role === "teacher") {
    return (
      <Layout>
        <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>

        <Card className="shadow">
          <CardHeader className="flex justify-between">
            <CardTitle>Total Students</CardTitle>
            <Users className="w-8 h-8 text-purple-600" />
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold">{totalStudents}</p>
          </CardContent>
        </Card>

        <p className="text-muted-foreground mt-4">
          Use sidebar to manage attendance & grades.
        </p>
      </Layout>
    );
  }

  /* =====================================================================
       ADMIN DASHBOARD
     ===================================================================== */
  if (user.role === "admin") {
    return (
      <Layout>
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="shadow">
            <CardHeader className="flex justify-between">
              <CardTitle>Total Students</CardTitle>
              <User className="w-8 h-8 text-teal-600" />
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold">{totalStudents}</p>
            </CardContent>
          </Card>

          <Card className="shadow">
            <CardHeader className="flex justify-between">
              <CardTitle>Total Teachers</CardTitle>
              <Users className="w-8 h-8 text-orange-600" />
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold">{totalTeachers}</p>
            </CardContent>
          </Card>

          <Card className="shadow">
            <CardHeader className="flex justify-between">
              <CardTitle>Total Subjects</CardTitle>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold">{totalSubjects}</p>
            </CardContent>
          </Card>
        </div>

        <p className="text-muted-foreground mt-4">
          Manage everything through the sidebar.
        </p>
      </Layout>
    );
  }

  return null;
}
