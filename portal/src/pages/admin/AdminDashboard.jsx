//src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  UserCog,
  Users,
  Calendar,
  FileText,
  Eye,
  CreditCard,
  RefreshCw,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useApiRequest } from "@/hooks/useApiRequest";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

export const AdminDashboard = () => {
  const { toast } = useToast();
  const { request, isLoading } = useApiRequest();
  
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    recentAppointments: [],
    todayAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    totalMedicalRecords: 0,
    totalEyeTests: 0,
    totalPayments: 0,
    pendingPayments: 0,
    completedPayments: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch admin dashboard stats
      const adminStats = await request({
        method: 'GET',
        url: '/admins/dashboard/stats'
      });

      // Fetch appointments stats
      const appointments = await request({
        method: 'GET',
        url: '/appointments'
      });

      // Fetch medical records count
      const medicalRecords = await request({
        method: 'GET',
        url: '/medical-records'
      });

      // Fetch eye tests count
      const eyeTests = await request({
        method: 'GET',
        url: '/eye-tests'
      });

      // Fetch payments stats
      const payments = await request({
        method: 'GET',
        url: '/payments'
      });

      // Calculate appointment stats
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = appointments.data.filter(apt => 
        apt.appointment_date.startsWith(today)
      ).length;

      const pendingAppointments = appointments.data.filter(apt => 
        apt.status === 'scheduled'
      ).length;

      const completedAppointments = appointments.data.filter(apt => 
        apt.status === 'completed'
      ).length;

      // Calculate payment stats
      const pendingPayments = payments.data.filter(payment => 
        payment.status === 'pending'
      ).length;

      const completedPayments = payments.data.filter(payment => 
        payment.status === 'paid'
      ).length;

      setStats({
        ...adminStats.data,
        totalMedicalRecords: medicalRecords.data.length,
        totalEyeTests: eyeTests.data.length,
        totalPayments: payments.data.length,
        
        pendingPayments,
        completedPayments,
        todayAppointments,
        pendingAppointments,
        completedAppointments,
      });
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    }
  };

  // Data for stat cards
  const statCards = [
    {
      title: "Doctors",
      value: stats.totalDoctors,
      icon: UserCog,
      description: "Total registered doctors",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Patients",
      value: stats.totalPatients,
      icon: Users,
      description: "Total registered patients",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Appointments",
      value: stats.totalAppointments,
      icon: Calendar,
      description: `${stats.todayAppointments} today`,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: CreditCard,
      description: "Total revenue",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ];

  // Data for navigation cards
  const navCards = [
    {
      title: "Doctors",
      description: "Manage doctors and their schedules",
      icon: UserCog,
      link: "/admin/doctors",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Patients",
      description: "View and manage patient records",
      icon: Users,
      link: "/admin/patients",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Appointments",
      description: "View and manage appointments",
      icon: Calendar,
      link: "/admin/appointments",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Medical Records",
      description: "Manage patient medical records",
      icon: FileText,
      link: "/admin/medical-records",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Eye Tests",
      description: "Manage eye test records",
      icon: Eye,
      link: "/admin/eye-tests",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Payments",
      description: "Manage payments and invoices",
      icon: CreditCard,
      link: "/admin/payments",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-4">
          <Button onClick={fetchDashboardData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? "Refreshing..." : "Refresh Data"}
          </Button>
        </div>
      </div>

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

      {/* Detailed Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Appointments Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Appointments</CardTitle>
            <CardDescription>Overview of appointment status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Today</span>
                </div>
                <span className="font-medium">{stats.todayAppointments}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Pending</span>
                </div>
                <span className="font-medium">{stats.pendingAppointments}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Completed</span>
                </div>
                <span className="font-medium">{stats.completedAppointments}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
            <CardDescription>Payment status overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Total</span>
                </div>
                <span className="font-medium">{stats.totalPayments}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Pending</span>
                </div>
                <span className="font-medium">{stats.pendingPayments}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Completed</span>
                </div>
                <span className="font-medium">{stats.completedPayments}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Records Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Medical Records</CardTitle>
            <CardDescription>Overview of medical records and tests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Medical Records</span>
                </div>
                <span className="font-medium">{stats.totalMedicalRecords}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Eye Tests</span>
                </div>
                <span className="font-medium">{stats.totalEyeTests}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Appointments</CardTitle>
          <CardDescription>Latest scheduled appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentAppointments.length > 0 ? (
              stats.recentAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {appointment.patient?.name || 'Unknown Patient'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      with Dr. {appointment.doctor?.name || 'Unknown Doctor'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {format(new Date(appointment.appointment_date), 'MMM d, yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(appointment.appointment_date), 'h:mm a')}
                    </p>
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
          <Link to="/admin/appointments" className="w-full">
            <Button variant="outline" className="w-full">
              View All Appointments
            </Button>
          </Link>
        </CardFooter>
      </Card>

      {/* Quick Access */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {navCards.map((card) => (
          <Card key={card.title} className="overflow-hidden">
            <CardHeader className={`${card.bgColor}`}>
              <div className="flex items-center gap-2">
                <card.icon className={`h-5 w-5 ${card.color}`} />
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