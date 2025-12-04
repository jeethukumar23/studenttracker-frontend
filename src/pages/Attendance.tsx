import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/axios";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";

export default function Attendance() {
  const { user } = useAuth();

  const [records, setRecords] = useState<any[]>([]);
  const [percentage, setPercentage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    api
      .get(`/attendance/user/${user.id}`)
      .then((res) => {
        const data = res.data;

        // Your backend returns: { records: [...], percentage: 100 }
        const list = Array.isArray(data.records) ? data.records : [];

        setRecords(list);
        setPercentage(data.percentage ?? 0);
      })
      .catch((err) => console.error("Error fetching attendance", err))
      .finally(() => setLoading(false));
  }, [user]);

  const getStatusBadge = (status: string) => {
    const variant =
      status === "present"
        ? "default"
        : status === "absent"
        ? "destructive"
        : "secondary";

    return (
      <Badge variant={variant}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading)
    return (
      <Layout>
        <p className="text-center py-10">Loading attendance...</p>
      </Layout>
    );

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Attendance</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Overall Attendance</span>

              {percentage !== null ? (
                <span
                  className={`text-3xl ${
                    percentage >= 75 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {Math.round(percentage)}%
                </span>
              ) : (
                <span className="text-muted-foreground text-lg">
                  No Data
                </span>
              )}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
          </CardHeader>

          <CardContent>
            {records.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No attendance found
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {records.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{r.date}</TableCell>
                      <TableCell>{getStatusBadge(r.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
