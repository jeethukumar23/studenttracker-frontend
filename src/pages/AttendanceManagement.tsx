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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { useToast } from "@/hooks/use-toast";

export default function AttendanceManagement() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [attendanceData, setAttendanceData] = useState<Record<number, string>>({});

  // Load students
  useEffect(() => {
    api
      .get("/students")
      .then((res) => {
        const data = res.data || [];
        setStudents(data);

        const defaults: Record<number, string> = {};
        data.forEach((s: any) => {
          defaults[s.id] = "present"; // <-- FIXED
        });

        setAttendanceData(defaults);
      })
      .catch((err) => console.error("Error fetching students:", err));
  }, []);

  const handleSubmit = async () => {
    const records = students.map((s) => ({
      studentId: s.id, // <-- FIXED
      date: selectedDate,
      status: attendanceData[s.id], // <-- FIXED
      teacherId: user?.id,
    }));

    try {
      await api.post("/attendance", { records });

      toast({
        title: "Success",
        description: "Attendance posted successfully",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to save attendance",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Attendance Management</h1>

        <Card>
          <CardHeader>
            <CardTitle>Mark Attendance</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">

            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              {students.map((s) => (
                <div
                  key={s.id} // <-- FIXED
                  className="flex items-center justify-between p-4 border rounded-md"
                >
                  <span className="font-medium">{s.name}</span>

                  <Select
                    value={attendanceData[s.id]} // <-- FIXED
                    onValueChange={(value) =>
                      setAttendanceData({
                        ...attendanceData,
                        [s.id]: value, // <-- FIXED
                      })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <Button className="w-full" onClick={handleSubmit}>
              Post Attendance
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
