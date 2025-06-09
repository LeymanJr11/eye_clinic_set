import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApiRequest } from "@/hooks/useApiRequest";
import { Link } from "react-router-dom";
import { Eye, Plus, Calendar, Clock, User } from "lucide-react";
import { format } from "date-fns";

export const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { request, isLoading } = useApiRequest();




  const appointmentStatuses = [
    "scheduled",
    "confirmed",
    "completed",
    "cancelled",
    "no-show",
  ];

  const columns = [
    {
      accessorKey: "patient.name",
      header: "Patient",
    },
    {
      accessorKey: "doctor.name",
      header: "Doctor",
    },
    {
      accessorKey: "appointment_date",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("appointment_date");
        if (!date) return "-";
        try {
          return format(new Date(date), "MMM d, yyyy");
        } catch (error) {
          console.error("Error formatting date:", date, error);
          return "-";
        }
      },
    },
     {
      accessorKey: "time_slot.start_time",
      header: "Start Time",
      cell: ({ row }) => {
        const time = row.original.time_slot?.start_time;
        return time ? format(new Date(`2000-01-01T${time}`), "h:mm a") : "-";
      },
    },
    {
      accessorKey: "time_slot.end_time",
      header: "End Time",
      cell: ({ row }) => {
        const time = row.original.time_slot?.end_time;
        return time ? format(new Date(`2000-01-01T${time}`), "h:mm a") : "-";
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status");
        const statusColors = {
          scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
          confirmed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          completed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
          cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
          "no-show": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        };
        return (
          <Badge className={`capitalize ${statusColors[status]}`}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const appointment = row.original;
        return (
          <div className="flex gap-2">
            <Link to={`/admin/appointments/${appointment.id}`}>
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4 mr-1" /> View
              </Button>
            </Link>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [searchTerm, statusFilter,  appointments]);

  const fetchAppointments = async () => {
    try {
      const data = await request({
        method: "GET",
        url: "/appointments",
      });

      setAppointments(data.data || []);
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    }
  };



  const filterAppointments = () => {
    let filtered = [...appointments];

    // Apply status filter
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter(
        (appointment) => appointment.status === statusFilter
      );
    }




    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (appointment) =>
          appointment.patient.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          appointment.doctor.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAppointments(filtered);
  };



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
        <div className="flex items-center gap-4">
        
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Input
          placeholder="Search appointments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {appointmentStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        /> */}

        {/* <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by doctor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Doctors</SelectItem>
            {doctors.map((doctor) => (
              <SelectItem key={doctor.id} value={doctor.id.toString()}>
                {doctor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select> */}
      </div>

      <DataTable
        columns={columns}
        data={filteredAppointments}
        isLoading={isLoading}
        noResultsMessage="No appointments found"
      />

    </div>
  );
}; 