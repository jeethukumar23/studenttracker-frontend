import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api } from "@/axios";
import { useAuth } from "@/contexts/AuthContext";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type Subject = {
  id?: number;
  name: string;
  teacherId?: number;
};

type Teacher = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function Subjects() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [newName, setNewName] = useState("");
  const [newTeacherId, setNewTeacherId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubjects();
    loadTeachers();
  }, []);

  const loadSubjects = async () => {
    try {
      const res = await api.get("/subjects");
      setSubjects(res.data || []);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to load subjects",
        variant: "destructive",
      });
    }
  };

  const loadTeachers = async () => {
    try {
      const res = await api.get("/teachers");
      setTeachers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createSubject = async () => {
    if (!newName.trim()) {
      toast({
        title: "Validation",
        description: "Subject name is required",
        variant: "destructive",
      });
      return;
    }

    let teacherIdToUse = newTeacherId;

    // Teacher creates → auto-assign to themselves
    if (user?.role === "teacher") {
      teacherIdToUse = user.id;
    }

    try {
      const payload = {
        name: newName.trim(),
        teacherId: teacherIdToUse || 0,
      };

      const res = await api.post("/subjects", payload);
      setSubjects((prev) => [res.data, ...prev]);
      setNewName("");
      setNewTeacherId(null);

      toast({ title: "Success", description: "Subject created successfully!" });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to create subject",
        variant: "destructive",
      });
    }
  };

  const deleteSubject = async (id?: number) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this subject?")) return;

    try {
      await api.delete(`/subjects/${id}`);
      setSubjects((prev) => prev.filter((s) => s.id !== id));

      toast({ title: "Deleted", description: "Subject removed" });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to delete subject",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <p className="text-center py-10">Loading Subjects...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Subjects</h1>

        {/* ========================== */}
        {/*   CREATE SUBJECT SECTION   */}
        {/* ========================== */}
        {(user?.role === "admin" || user?.role === "teacher") && (
          <Card>
            <CardHeader>
              <CardTitle>Create Subject</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <Input
                placeholder="Subject name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />

              {/* Admin only → choose teacher */}
              {user?.role === "admin" && (
                <select
                  className="w-full p-2 border rounded"
                  value={newTeacherId ?? ""}
                  onChange={(e) => setNewTeacherId(Number(e.target.value))}
                >
                  <option value="">Select Teacher</option>
                  {teachers
                    .filter((t) => t.role === "teacher")
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.email})
                      </option>
                    ))}
                </select>
              )}

              <Button className="w-full" onClick={createSubject}>
                Add Subject
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ========================== */}
        {/*       SUBJECTS LIST       */}
        {/* ========================== */}

        <h2 className="text-2xl font-semibold mt-4">All Subjects</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.length === 0 ? (
            <p className="text-muted-foreground">No subjects found.</p>
          ) : (
            subjects.map((s) => (
              <Card key={s.id}>
                <CardHeader>
                  <CardTitle>{s.name}</CardTitle>
                </CardHeader>

                <CardContent>
                  <p>Teacher ID: {s.teacherId || "Not assigned"}</p>

                  {/* Delete button hidden for students */}
                  {(user?.role === "admin" || user?.role === "teacher") && (
                    <Button
                      className="mt-3"
                      variant="destructive"
                      onClick={() => deleteSubject(s.id)}
                    >
                      Delete
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
