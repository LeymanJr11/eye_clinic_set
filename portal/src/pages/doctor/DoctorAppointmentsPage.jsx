import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useApiRequest } from "@/hooks/useApiRequest";
import { Link } from "react-router-dom";
import { Eye, Plus, Edit, Trash2, Calendar, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";

export const DoctorAppointmentsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { request } = useApiRequest();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Date filter state
  const [dateFilter, setDateFilter] = useState({
    type: "all",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Date filter options
  const dateFilterOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
    { value: "custom", label: "Custom Range" }
  ];

  const appointmentStatuses = [
    "scheduled",
    "completed",
    "cancelled",
  ];

  // Appointments Table Columns
  const appointmentColumns = [
    {
      accessorKey: "patient.name",
      header: "Patient",
    },
    {
      accessorKey: "appointment_date",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("appointment_date");
        return format(new Date(date), "MMM d, yyyy");
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
          scheduled: "bg-blue-100 text-blue-800",
          completed: "bg-green-100 text-green-800",
          cancelled: "bg-red-100 text-red-800",
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
            <Link to={`/doctor/appointments/${appointment.id}`}>
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4 mr-1" /> View
              </Button>
            </Link>
            <Button 
              size="sm" 
              onClick={() => {
                setSelectedAppointment(appointment);
                setIsStatusDialogOpen(true);
              }}
            >
              <Edit className="h-4 w-4 mr-1" /> Update Status
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={() => {
                setSelectedAppointment(appointment);
                setIsDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    fetchAppointments();
  }, [dateFilter]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      let params = {};
      
      if (dateFilter.type !== "all") {
        let startDate = dateFilter.startDate;
        let endDate = dateFilter.endDate;

        if (dateFilter.type === "today") {
          startDate = new Date().toISOString().split('T')[0];
          endDate = startDate;
        } else if (dateFilter.type === "month") {
          const today = new Date();
          startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
        } else if (dateFilter.type === "year") {
          const today = new Date();
          startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
          endDate = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
        }

        params = {
          startDate,
          endDate
        };
      }

      const response = await request({
        method: "GET",
        url: "/appointments/doctor/me",
        params
      });
      setAppointments(response.data);
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    try {
      await request({
        method: "PATCH",
        url: `/appointments/${selectedAppointment.id}/status`,
        data: { status }
      });
      toast({
        title: "Success",
        description: "Appointment status updated successfully"
      });
      fetchAppointments();
      setIsStatusDialogOpen(false);
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    }
  };

  const handleDeleteAppointment = async () => {
    try {
      await request({
        method: "DELETE",
        url: `/appointments/${selectedAppointment.id}`
      });
      toast({
        title: "Success",
        description: "Appointment deleted successfully"
      });
      fetchAppointments();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/doctor")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>My Appointments</CardTitle>
              <CardDescription>View and manage your appointments</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Select
              value={dateFilter.type}
              onValueChange={(value) => {
                setDateFilter(prev => ({
                  ...prev,
                  type: value
                }));
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                {dateFilterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {dateFilter.type === "custom" && (
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={dateFilter.startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) =>
                    setDateFilter(prev => ({
                      ...prev,
                      startDate: e.target.value
                    }))
                  }
                />
                <span>to</span>
                <Input
                  type="date"
                  value={dateFilter.endDate}
                  min={dateFilter.startDate}
                  onChange={(e) =>
                    setDateFilter(prev => ({
                      ...prev,
                      endDate: e.target.value
                    }))
                  }
                />
              </div>
            )}
          </div>

          <DataTable
            columns={appointmentColumns}
            data={appointments}
            isLoading={isLoading}
            noResultsMessage="No appointments found"
          />
        </CardContent>
      </Card>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className={"lg:max-w-screen-lg overflow-y-scroll max-h-screen"}>
          <DialogHeader>
            <DialogTitle>Update Appointment Status</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select
              onValueChange={handleUpdateStatus}
              defaultValue={selectedAppointment?.status}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {appointmentStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className={"lg:max-w-screen-lg overflow-y-scroll max-h-screen"}>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this appointment? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAppointment}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 