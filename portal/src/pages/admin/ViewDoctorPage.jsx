import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useApiRequest } from "@/hooks/useApiRequest";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, User, Mail, Phone, MapPin, Eye, Plus, Edit, Trash2, Star } from "lucide-react";
import { format } from "date-fns";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";

export const ViewDoctorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTimeSlotDialogOpen, setIsTimeSlotDialogOpen] = useState(false);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const { toast } = useToast();
  const { request } = useApiRequest();

  // Time slot form state
  const [timeSlotForm, setTimeSlotForm] = useState({
    doctor_id: parseInt(id),
    day_of_week: "",
    start_time: "",
    end_time: "",
  });

  // Appointment form state
  const [appointmentForm, setAppointmentForm] = useState({
    patient_id: "",
    doctor_id: parseInt(id),
    time_slot_id: "",
    appointment_date: "",
    status: "scheduled",
  });

  // Feedback form state
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 5,
    comment: "",
  });

  const [patients, setPatients] = useState([]);

  // Add these state variables after the other state declarations
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState({ type: '', id: null });

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return [
    `${hour}:00:00`,
    `${hour}:15:00`,
    `${hour}:30:00`,
    `${hour}:45:00`
  ];
}).flat();

  const appointmentTypes = [
    "regular",
    "emergency",
    "follow-up",
    "consultation",
  ];

  const appointmentStatuses = [
    "scheduled",
    "completed",
    "cancelled"
  ];

  // Add date filter state
  const [dateFilter, setDateFilter] = useState({
    type: "all",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Update date filter options
  const dateFilterOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
    { value: "custom", label: "Custom Range" }
  ];

  // Time Slots Table Columns
  const timeSlotColumns = [
    {
      accessorKey: "day_of_week",
      header: "Day",
    },
    {
      accessorKey: "start_time",
      header: "Start Time",
    },
    {
      accessorKey: "end_time",
      header: "End Time",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const timeSlot = row.original;
        return (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleEditTimeSlot(timeSlot)}>
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDeleteTimeSlot(timeSlot.id)}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        );
      },
    },
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
            <Link to={`/admin/appointments/${appointment.id}`}>
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4 mr-1" /> View
              </Button>
            </Link>
            <Button size="sm" onClick={() => handleEditAppointment(appointment)}>
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDeleteAppointment(appointment.id)}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        );
      },
    },
  ];

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
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span>{rating}/5</span>
          </div>
        );
      },
    },
    {
      accessorKey: "comment",
      header: "Comment",
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("createdAt");
        return format(new Date(date), "MMM d, yyyy");
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const feedback = row.original;
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" onClick={() => handleDeleteFeedback(feedback.id)}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    fetchDoctorDetails();
    fetchTimeSlots();
    fetchAppointments();
    fetchFeedbacks();
    fetchPatients();
  }, [id, dateFilter]);

  const fetchDoctorDetails = async () => {
    try {
      const data = await request({
        method: "GET",
        url: `/doctors/${id}`,
      });
      setDoctor(data.data);
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      const data = await request({
        method: "GET",
        url: `/time-slots/doctor/${id}`,
      });
      setTimeSlots(data.data || []);
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    }
  };

  const fetchAppointments = async () => {
    try {
      let params = {};
      
      // Only add date parameters if not "all time"
      if (dateFilter.type !== "all") {
        let startDate = dateFilter.startDate;
        let endDate = dateFilter.endDate;

        // Set date range based on filter type
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

      const data = await request({
        method: "GET",
        url: `/appointments/doctor/${id}`,
        params
      });
      setAppointments(data.data || []);
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const data = await request({
        method: "GET",
        url: `/feedback/doctor/${id}`,
      });
      setFeedbacks(data.data || []);
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    }
  };

  const fetchPatients = async () => {
    try {
      const data = await request({
        method: "GET",
        url: "/patients",
      });
      setPatients(data.data || []);
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    }
  };

  const handleTimeSlotSubmit = async () => {
    try {
      const timeSlotData = {
        doctor_id: parseInt(id),
        day_of_week: timeSlotForm.day_of_week,
        start_time: timeSlotForm.start_time,
        end_time: timeSlotForm.end_time,
      };

      if (selectedTimeSlot) {
        // Update existing time slot
        await request({
            method: "PUT",
          url: `/time-slots/${selectedTimeSlot.id}`,
          data: timeSlotData,
        });
        toast({
          title: "Success",
          description: "Time slot updated successfully",
        });
      } else {
        // Create new time slot
        await request({
            method: "POST",
          url: "/time-slots",
          data: timeSlotData,
        });
        toast({
          title: "Success",
          description: "Time slot created successfully",
        });
      }
      fetchTimeSlots();
              setIsTimeSlotDialogOpen(false);
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    }
  };

  const handleAppointmentSubmit = async () => {
    try {
      const appointmentData = {
        patient_id: parseInt(appointmentForm.patient_id),
        doctor_id: parseInt(id),
        time_slot_id: parseInt(appointmentForm.time_slot_id),
        appointment_date: appointmentForm.appointment_date,
        status: selectedAppointment ? appointmentForm.status : "scheduled",
      };

      if (selectedAppointment) {
        // Update existing appointment
        await request({
          method: "PUT",
          url: `/appointments/${selectedAppointment.id}`,
          data: appointmentData,
        });
        toast({
          title: "Success",
          description: "Appointment updated successfully",
        });
      } else {
        // Create new appointment
        await request({
          method: "POST",
          url: "/appointments",
          data: appointmentData,
        });
        toast({
          title: "Success",
          description: "Appointment created successfully",
        });
      }
      fetchAppointments();
      setIsAppointmentDialogOpen(false);
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    }
  };

  const handleDeleteTimeSlot = async (timeSlotId) => {
    setDeleteItem({ type: 'timeSlot', id: timeSlotId });
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteAppointment = async (appointmentId) => {
    setDeleteItem({ type: 'appointment', id: appointmentId });
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteFeedback = async (feedbackId) => {
    setDeleteItem({ type: 'feedback', id: feedbackId });
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      switch (deleteItem.type) {
        case 'timeSlot':
          await request({
          method: "DELETE",
            url: `/time-slots/${deleteItem.id}`,
          });
          toast({
            title: "Success",
            description: "Time slot deleted successfully",
          });
            fetchTimeSlots();
          break;
        case 'appointment':
          await request({
            method: "DELETE",
            url: `/appointments/${deleteItem.id}`,
          });
          toast({
            title: "Success",
            description: "Appointment deleted successfully",
          });
          fetchAppointments();
          break;
        case 'feedback':
          await request({
            method: "DELETE",
            url: `/feedback/${deleteItem.id}`,
          });
          toast({
            title: "Success",
            description: "Feedback deleted successfully",
          });
          fetchFeedbacks();
          break;
      }
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteItem({ type: '', id: null });
    }
  };

  const handleEditTimeSlot = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setTimeSlotForm({
      doctor_id: parseInt(id),
      day_of_week: timeSlot.day_of_week,
      start_time: timeSlot.start_time,
      end_time: timeSlot.end_time,
    });
    setIsTimeSlotDialogOpen(true);
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentForm({
      patient_id: appointment.patient_id.toString(),
      doctor_id: parseInt(id),
      time_slot_id: appointment.time_slot_id.toString(),
      appointment_date: appointment.appointment_date,
      status: appointment.status,
    });
    setIsAppointmentDialogOpen(true);
  };

  // Add date filter component to the appointments tab
  const renderDateFilter = () => (
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
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!doctor) {
    return <div>Doctor not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/admin/doctors")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Doctors
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Doctor Information</CardTitle>
            <CardDescription>Personal and professional details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{doctor.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>{doctor.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{doctor.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{doctor.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Specialization:</span>
              <span className="capitalize">{doctor.specialization}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>Doctor's performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Appointments</p>
                <p className="text-2xl font-bold">{appointments.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Patients</p>
                <p className="text-2xl font-bold">{new Set(appointments.map(apt => apt.patient_id)).size}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold">
                  {feedbacks.length > 0
                    ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1)
                    : 0}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Completed Appointments</p>
                <p className="text-2xl font-bold">
                  {appointments.filter(apt => apt.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Doctor Management</CardTitle>
          <CardDescription>Manage doctor's schedule, appointments, and feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="time-slots">
            <TabsList>
              <TabsTrigger value="time-slots">Time Slots</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="feedbacks">Feedbacks</TabsTrigger>
            </TabsList>
            
            <TabsContent value="time-slots" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => {
                  setSelectedTimeSlot(null);
                  setTimeSlotForm({
                    doctor_id: parseInt(id),
                    day_of_week: "",
                    start_time: "",
                    end_time: "",
                  });
                  setIsTimeSlotDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Time Slot
                            </Button>
                          </div>
              <DataTable
                columns={timeSlotColumns}
                data={timeSlots}
                isLoading={isLoading}
                noResultsMessage="No time slots found"
              />
            </TabsContent>
            
            <TabsContent value="appointments" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  {renderDateFilter()}
                      </div>
                <Button onClick={() => {
                  setSelectedAppointment(null);
                  setAppointmentForm({
                    patient_id: "",
                    doctor_id: parseInt(id),
                    time_slot_id: "",
                    appointment_date: "",
                    status: "scheduled",
                  });
                  setIsAppointmentDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Appointment
                      </Button>
              </div>
              <DataTable
                columns={appointmentColumns}
                data={appointments}
                isLoading={isLoading}
                noResultsMessage="No appointments found"
              />
            </TabsContent>

            <TabsContent value="feedbacks" className="space-y-4">
              <DataTable
                columns={feedbackColumns}
                data={feedbacks}
                isLoading={isLoading}
                noResultsMessage="No feedbacks found"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Time Slot Dialog */}
      <Dialog open={isTimeSlotDialogOpen} onOpenChange={setIsTimeSlotDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedTimeSlot ? "Edit Time Slot" : "Add Time Slot"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="day">Day</Label>
              <Select
                value={timeSlotForm.day_of_week}
                onValueChange={(value) =>
                  setTimeSlotForm((prev) => ({ ...prev, day_of_week: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Select
                value={timeSlotForm.start_time}
                onValueChange={(value) =>
                  setTimeSlotForm((prev) => ({ ...prev, start_time: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="endTime">End Time</Label>
              <Select
                value={timeSlotForm.end_time}
                onValueChange={(value) =>
                  setTimeSlotForm((prev) => ({ ...prev, end_time: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select end time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTimeSlotDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTimeSlotSubmit}>
              {selectedTimeSlot ? "Update Time Slot" : "Add Time Slot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Appointment Dialog */}
      <Dialog open={isAppointmentDialogOpen} onOpenChange={setIsAppointmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAppointment ? "Edit Appointment" : "Add Appointment"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="patient">Patient</Label>
              <Select
                value={appointmentForm.patient_id}
                onValueChange={(value) =>
                  setAppointmentForm((prev) => ({
                    ...prev,
                    patient_id: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="timeSlot">Time Slot</Label>
              <Select
                value={appointmentForm.time_slot_id}
                onValueChange={(value) =>
                  setAppointmentForm((prev) => ({
                    ...prev,
                    time_slot_id: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot.id} value={slot.id.toString()}>
                      {slot.day_of_week} - {slot.start_time} to {slot.end_time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={appointmentForm.appointment_date}
                onChange={(e) =>
                  setAppointmentForm((prev) => ({
                    ...prev,
                    appointment_date: e.target.value,
                  }))
                }
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={appointmentForm.status}
                onValueChange={(value) =>
                  setAppointmentForm((prev) => ({
                    ...prev,
                    status: value,
                  }))
                }
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
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAppointmentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAppointmentSubmit}>
              {selectedAppointment ? "Update Appointment" : "Add Appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this {deleteItem.type}? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 