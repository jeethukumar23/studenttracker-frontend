import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api } from "@/axios";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export default function Teachers() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/teachers")
      .then((res) => setTeachers(res.data || []))
      .catch((err) => console.error("Error loading teachers:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <p className="text-center py-10">Loading teachers...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Teachers</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teachers.length === 0 ? (
          <p className="text-muted-foreground">No teachers available.</p>
        ) : (
          teachers.map((t) => (
            <Card key={t.id}>
              <CardHeader>
                <CardTitle>{t.name}</CardTitle>
              </CardHeader>

              <CardContent>
                <div>Email: {t.email}</div>
                <div>Subject: {t.subject ?? "N/A"}</div>
                <div>Department: {t.department ?? "N/A"}</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </Layout>
  );
}
