import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api } from "@/axios";
import { useAuth } from "@/contexts/AuthContext";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Grade = { id: number; studentId: number; subjectId: number; score: number; teacherId?: number };
type Subject = { id: number; name: string };

function scoreToLetter(score: number) {
  if (score >= 9) return "O"; // 10 -> O, 9 -> A? user wanted 10 O, 9 A, 8 B...
  if (score >= 8) return "A";
  if (score >= 7) return "B";
  if (score >= 5) return "C";
  return "F";
}

export default function Grades() {
  const { user } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Record<number, Subject>>({});
  const [loading, setLoading] = useState(true);
  const [average, setAverage] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    Promise.all([api.get(`/grades/user/${user.id}`), api.get("/subjects")])
      .then(([gRes, sRes]) => {
        const gData = gRes.data || [];
        setGrades(gData);

        const subs: Subject[] = sRes.data || [];
        const map: Record<number, Subject> = {};
        subs.forEach((s: any) => (map[s.id] = s));
        setSubjects(map);

        if (gData.length > 0) {
          const sum = gData.reduce((acc: number, g: any) => acc + (Number(g.score) || 0), 0);
          setAverage(Number((sum / gData.length).toFixed(2)));
        } else {
          setAverage(null);
        }
      })
      .catch((err) => {
        console.error("Error fetching grades or subjects", err);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <p className="text-center py-10">Loading your grades...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Grades</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Overall Grade</span>
              <span className="text-2xl font-bold">{average !== null ? `${average} / 10` : "No Data"}</span>
            </CardTitle>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {grades.length === 0 ? (
            <p className="text-muted-foreground text-center w-full py-8">No grades found.</p>
          ) : (
            grades.map((g) => (
              <Card key={g.id}>
                <CardHeader>
                  <CardTitle>{subjects[g.subjectId]?.name ?? `Subject #${g.subjectId}`}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">
                    Score: <span className="font-bold text-blue-600">{g.score}</span> / 10
                  </p>
                  <p className="mt-2">Grade: <strong>{scoreToLetter(Number(g.score))}</strong></p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
