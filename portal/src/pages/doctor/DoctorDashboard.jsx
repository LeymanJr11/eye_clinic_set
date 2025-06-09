// DoctorDashboard.jsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  UserCog,
  Calendar,
  Users,
  FileText,
  Eye,
  Clock,
  RefreshCw,
  Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useApiRequest } from "@/hooks/useApiRequest";
import { format } from "date-fns";

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { request } = useApiRequest();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    totalMedicalRecords: 0,
    averageRating: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch appointments
      const appointmentsResponse = await request({
        method: "GET",
        url: "/appointments/doctor/me",
      });

      // Fetch medical records
      const medicalRecordsResponse = await request({
        method: "GET",
        url: "/medical-records/doctor/me",
      });

      // Fetch feedbacks
      const feedbacksResponse = await request({
        method: "GET",
        url: "/feedback/doctor/me",
      });

      const appointments = appointmentsResponse.data;
      const today = new Date().toISOString().split('T')[0];

      // Calculate stats
      const stats = {
        totalPatients: new Set(appointments.map(apt => apt.patient_id)).size,
        totalAppointments: appointments.length,
        todayAppointments: appointments.filter(apt => apt.appointment_date === today).length,
        completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
        pendingAppointments: appointments.filter(apt => apt.status === 'scheduled').length,
        totalMedicalRecords: medicalRecordsResponse.data.length,
        averageRating: feedbacksResponse.data.length > 0 
          ? (feedbacksResponse.data.reduce((acc, curr) => acc + curr.rating, 0) / feedbacksResponse.data.length).toFixed(1)
          : 0
      };

      setStats(stats);
      setRecentAppointments(appointments.slice(0, 5)); // Get 5 most recent appointments
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    } finally {
      setIsLoading(false);
    }
  };

  // Data for stat cards
  const statCards = [
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      icon: Calendar,
      description: "Scheduled for today",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Pending Appointments",
      value: stats.pendingAppointments,
      icon: Clock,
      description: "Awaiting consultation",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      title: "Total Patients",
      value: stats.totalPatients,
      icon: Users,
      description: "Registered patients",
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Average Rating",
      value: `${stats.averageRating}/5`,
      icon: Star,
      description: "Patient satisfaction",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    }
  ];

  // Data for navigation cards
  const navCards = [
    {
      title: "Appointments",
      description: "Manage your appointments",
      icon: Calendar,
      link: "/doctor/appointments",
      color: "bg-blue-500/10",
      iconColor: "text-blue-500"
    },
    {
      title: "Medical Records",
      description: "Manage patient records",
      icon: FileText,
      link: "/doctor/medical-records",
      color: "bg-purple-500/10",
      iconColor: "text-purple-500"
    },
    {
      title: "Time Slots",
      description: "View your schedule",
      icon: Clock,
      link: "/doctor/time-slots",
      color: "bg-green-500/10",
      iconColor: "text-green-500"
    },
    {
      title: "Feedback",
      description: "View patient feedback",
      icon: Star,
      link: "/doctor/feedback",
      color: "bg-amber-500/10",
      iconColor: "text-amber-500"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Doctor Dashboard</h2>
        <Button onClick={fetchDashboardData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Welcome Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <UserCog className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Welcome, Dr. {user?.name}</CardTitle>
              <CardDescription>
                Here's an overview of your practice
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Appointments</CardTitle>
          <CardDescription>Your upcoming appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAppointments.length > 0 ? (
              recentAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {appointment.patient?.name || 'Unknown Patient'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(appointment.appointment_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {appointment.status}
                    </span>
                    <Link to={`/doctor/appointments/${appointment.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">
                No recent appointments
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Link to="/doctor/appointments" className="w-full">
            <Button variant="outline" className="w-full">
              View All Appointments
            </Button>
          </Link>
        </CardFooter>
      </Card>

      {/* Quick Access */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {navCards.map((card) => (
          <Card key={card.title} className="overflow-hidden">
            <CardHeader className={`${card.color}`}>
              <div className="flex items-center gap-2">
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                <CardTitle>{card.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{card.description}</p>
            </CardContent>
            <CardFooter>
              <Link to={card.link} className="w-full">
                <Button className="w-full">Manage {card.title}</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
