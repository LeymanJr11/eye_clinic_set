import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useApiRequest } from "@/hooks/useApiRequest";
import { format } from "date-fns";
import { ArrowLeft, Star, Calendar } from "lucide-react";

export const DoctorFeedbackPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { request } = useApiRequest();
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalFeedbacks: 0,
    ratingDistribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    }
  });

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    try {
      const response = await request({
        method: "GET",
        url: "/feedback/doctor/me",
      });
      setFeedbacks(response.data);

      // Calculate statistics
      const totalFeedbacks = response.data.length;
      const averageRating = totalFeedbacks > 0
        ? (response.data.reduce((acc, curr) => acc + curr.rating, 0) / totalFeedbacks).toFixed(1)
        : 0;

      const ratingDistribution = response.data.reduce((acc, curr) => {
        acc[curr.rating] = (acc[curr.rating] || 0) + 1;
        return acc;
      }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

      setStats({
        averageRating,
        totalFeedbacks,
        ratingDistribution
      });
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    } finally {
      setIsLoading(false);
    }
  };

  // Feedback Table Columns
  const feedbackColumns = [
    {
      accessorKey: "patient.name",
      header: "Patient",
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => {
        const rating = row.getValue("rating");
        return (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{rating}/5</span>
          </div>
        );
      },
    },
    {
      accessorKey: "comment",
      header: "Comment",
      cell: ({ row }) => {
        const comment = row.getValue("comment");
        return comment || "No comment provided";
      },
    },
    {
      accessorKey: "appointment.appointment_date",
      header: "Appointment Date",
      cell: ({ row }) => {
        const date = row.original.appointment?.appointment_date;
        return date ? format(new Date(date), "MMM d, yyyy") : "N/A";
      },
    },
    {
      accessorKey: "createdAt",
      header: "Feedback Date",
      cell: ({ row }) => {
        const date = row.getValue("createdAt");
        return format(new Date(date), "MMM d, yyyy");
      },
    },
    {
      id: "appointment",
      header: "Appointment",
      cell: ({ row }) => {
        const appointmentId = row.original.appointment_id;
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/doctor/appointments/${appointmentId}`)}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            View Appointment
          </Button>
        );
      },
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/doctor")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-2xl font-bold">{stats.averageRating}</span>
              <span className="text-muted-foreground">/ 5</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Feedbacks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFeedbacks}</div>
            <p className="text-sm text-muted-foreground">Patient reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.ratingDistribution).reverse().map(([rating, count]) => (
                <div key={rating} className="flex items-center gap-2">
                  <div className="flex items-center gap-1 w-20">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{rating}</span>
                  </div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{
                        width: `${(count / stats.totalFeedbacks) * 100}%`
                      }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm text-muted-foreground">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Patient Feedback</CardTitle>
              <CardDescription>View all patient reviews and ratings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={feedbackColumns}
            data={feedbacks}
            isLoading={isLoading}
            noResultsMessage="No feedback found"
          />
        </CardContent>
      </Card>
    </div>
  );
}; 