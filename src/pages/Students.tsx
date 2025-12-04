import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api } from "@/axios";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export default function Students() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/students")
      .then((res) => setStudents(res.data || []))
      .catch((err) => console.error("Error loading students:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <p className="text-center py-10">Loading students...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Students</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {students.length === 0 ? (
          <p className="text-muted-foreground">No students available.</p>
        ) : (
          students.map((s) => (
            <Card key={s.id}>
              <CardHeader>
                <CardTitle>{s.name}</CardTitle>
              </CardHeader>

              <CardContent>
                <div>Email: {s.email}</div>
                <div>Roll: {s.roll ?? "N/A"}</div>
                <div>Department: {s.department ?? "N/A"}</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </Layout>
  );
}
