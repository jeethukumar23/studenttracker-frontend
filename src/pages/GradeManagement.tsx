import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api } from "@/axios";
import { useAuth } from "@/contexts/AuthContext";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type Student = { id: number; name: string; email?: string; studentId?: number; }; // adapt if your students endpoint returns studentId vs id
type Subject = { id: number; name: string; teacherId?: number };

export default function GradeManagement() {
  const { toast } = useToast();
  const { user } = useAuth(); // teacher/admin
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | "">("");
  const [scores, setScores] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/students"), api.get("/subjects")])
      .then(([sRes, subRes]) => {
        // NOTE: server's /students endpoint earlier returns StudentResponse items with id,name,email
        const studs = sRes.data || [];
        setStudents(studs);
        const init: Record<number, string> = {};
        (studs || []).forEach((st: any) => {
          // use studentId if provided, otherwise id
          const sid = st.studentId ?? st.id;
          init[sid] = "";
        });
        setScores(init);

        setSubjects(subRes.data || []);
      })
      .catch((err) => {
        console.error("Failed to load students/subjects", err);
        toast({ title: "Error", description: "Failed to load students or subjects", variant: "destructive" });
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScoreChange = (sid: number, value: string) => {
    setScores(prev => ({ ...prev, [sid]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedSubjectId) {
      toast({ title: "Validation", description: "Select a subject", variant: "destructive" });
      return;
    }

    const records = students.map((s) => {
      const sid = s.studentId ?? s.id;
      return {
        studentId: sid,
        subjectId: selectedSubjectId,
        score: Number(scores[sid] ?? 0),
        teacherId: user?.id,
      };
    });

    try {
      await api.post("/grades", { records });
      toast({ title: "Success", description: "Grades saved successfully" });
      // clear inputs
      setSelectedSubjectId("");
      setScores(prev => {
        const cleared: Record<number, string> = {};
        students.forEach(st => {
          const sid = st.studentId ?? st.id;
          cleared[sid] = "";
        });
        return cleared;
      });
    } catch (err) {
      console.error("Failed to save grades", err);
      toast({ title: "Error", description: "Failed to save grades", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <Layout>
        <p className="text-center py-10">Loading...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Grade Management</h1>
        <Card>
          <CardHeader>
            <CardTitle>Post Grades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Subject</label>
              <select
                className="w-full p-2 border rounded"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">Select subject</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3 max-h-[40vh] overflow-auto">
              {students.map((s) => {
                const sid = s.studentId ?? s.id;
                return (
                  <div key={sid} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-sm text-muted-foreground">{s.email ?? ""}</div>
                    </div>

                    <div className="w-28">
                      <Input
                        placeholder="0 - 10"
                        value={scores[sid] ?? ""}
                        onChange={(e) => handleScoreChange(sid, e.target.value)}
                        type="number"
                        min={0}
                        max={10}
                        step={0.1}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <Button className="w-full" onClick={handleSubmit}>Save Grades</Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
