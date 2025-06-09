import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useApiRequest } from "@/hooks/useApiRequest";
import { format } from "date-fns";
import { ArrowLeft, User, Calendar, Clock, Plus, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/ui/data-table";

export const DoctorViewAppointmentPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { request } = useApiRequest();
  const [appointment, setAppointment] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isMedicalRecordDialogOpen, setIsMedicalRecordDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [medicalRecordForm, setMedicalRecordForm] = useState({
    record_type: "",
    description: "",
    file: null,
  });
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const appointmentStatuses = [
    "scheduled",
    "completed",
    "cancelled"
  ];

  const recordTypes = [
    "diagnosis",
    "prescription",
    "test_result",
    "external_upload",
  ];

  // Medical Records Table Columns
  const medicalRecordColumns = [
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("createdAt");
        return format(new Date(date), "MMM d, yyyy");
      },
    },
    {
      accessorKey: "record_type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("record_type");
        return (
          <Badge variant="outline" className="capitalize">
            {type.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "file_url",
      header: "File",
      cell: ({ row }) => {
        const fileUrl = row.getValue("file_url");
        return fileUrl ? (
          <a
            href={`http://localhost:3200/uploads/${fileUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View File
          </a>
        ) : (
          "No file"
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleEditMedicalRecord(record)}>
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDeleteMedicalRecord(record.id)}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    fetchAppointment();
    fetchMedicalRecords();
  }, [id]);

  const fetchAppointment = async () => {
    setIsLoading(true);
    try {
      const response = await request({
        method: "GET",
        url: `/appointments/${id}`,
      });
      setAppointment(response.data);
      setSelectedStatus(response.data.status);
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMedicalRecords = async () => {
    try {
      const data = await request({
        method: "GET",
        url: `/medical-records/appointment/${id}`,
      });
      setMedicalRecords(data.data || []);
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await request({
        method: "PATCH",
        url: `/appointments/${id}/status`,
        data: { status: selectedStatus }
      });
      toast({
        title: "Success",
        description: "Appointment status updated successfully"
      });
      fetchAppointment();
      setIsStatusDialogOpen(false);
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    }
  };

  const handleMedicalRecordSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // Only append file if it exists and is new
      if (medicalRecordForm.file) {
        formData.append("file", medicalRecordForm.file);
      }

      // For updates, only send changed fields
      if (selectedMedicalRecord) {
        if (medicalRecordForm.record_type !== selectedMedicalRecord.record_type) {
          formData.append("record_type", medicalRecordForm.record_type);
        }
        if (medicalRecordForm.description !== selectedMedicalRecord.description) {
          formData.append("description", medicalRecordForm.description);
        }
      } else {
        // For new records, send all required fields
        formData.append("appointment_id", parseInt(id));
        formData.append("patient_id", parseInt(appointment.patient_id));
        formData.append("doctor_id", parseInt(appointment.doctor_id));
        formData.append("record_type", medicalRecordForm.record_type);
        formData.append("description", medicalRecordForm.description || "");
      }

      if (selectedMedicalRecord) {
        await request({
          method: "PUT",
          url: `/medical-records/${selectedMedicalRecord.id}`,
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast({
          title: "Success",
          description: "Medical record updated successfully",
        });
      } else {
        await request({
          method: "POST",
          url: "/medical-records",
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast({
          title: "Success",
          description: "Medical record created successfully",
        });
      }

      // Close dialog before fetching to improve perceived performance
      setIsMedicalRecordDialogOpen(false);
      
      // Fetch records after dialog is closed
      await fetchMedicalRecords();
    } catch (error) {
      console.error("Error saving medical record:", error);
      toast({
        title: "Error",
        description: "Failed to save medical record",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMedicalRecord = async (recordId) => {
    setSelectedMedicalRecord({ id: recordId });
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await request({
        method: "DELETE",
        url: `/medical-records/${selectedMedicalRecord.id}`,
      });
      toast({
        title: "Success",
        description: "Medical record deleted successfully",
      });
      fetchMedicalRecords();
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedMedicalRecord(null);
    }
  };

  const handleEditMedicalRecord = (record) => {
    setSelectedMedicalRecord(record);
    setMedicalRecordForm({
      record_type: record.record_type,
      description: record.description || "",
      file: null,
    });
    setIsMedicalRecordDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Appointment Not Found</h2>
        <Button onClick={() => navigate("/doctor/appointments")}>
          Back to Appointments
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/doctor/appointments")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Appointments
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Patient Information</CardTitle>
                <CardDescription>Patient details for this appointment</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Name</h3>
              <p className="text-muted-foreground">{appointment.patient?.name}</p>
            </div>
            <div>
              <h3 className="font-medium">Email</h3>
              <p className="text-muted-foreground">{appointment.patient?.email}</p>
            </div>
            <div>
              <h3 className="font-medium">Phone</h3>
              <p className="text-muted-foreground">{appointment.patient?.phone}</p>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Appointment Details</CardTitle>
                <CardDescription>Schedule and status information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Date</h3>
              <p className="text-muted-foreground">
                {format(new Date(appointment.appointment_date), "MMMM d, yyyy")}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Time</h3>
              <p className="text-muted-foreground">
                {format(new Date(`2000-01-01T${appointment.time_slot?.start_time}`), "h:mm a")} -{" "}
                {format(new Date(`2000-01-01T${appointment.time_slot?.end_time}`), "h:mm a")}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Status</h3>
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    appointment.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : appointment.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }
                >
                  {appointment.status}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsStatusDialogOpen(true)}
                >
                  Update Status
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Records */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Medical Records</CardTitle>
                <CardDescription>Manage patient medical records for this appointment</CardDescription>
              </div>
              <Button onClick={() => {
                setSelectedMedicalRecord(null);
                setMedicalRecordForm({
                  record_type: "",
                  description: "",
                  file: null,
                });
                setIsMedicalRecordDialogOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Medical Record
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={medicalRecordColumns}
              data={medicalRecords}
              isLoading={isLoading}
              noResultsMessage="No medical records found"
            />
          </CardContent>
        </Card>
      </div>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Appointment Status</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
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
            <Button onClick={handleUpdateStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Medical Record Dialog */}
      <Dialog open={isMedicalRecordDialogOpen} onOpenChange={setIsMedicalRecordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedMedicalRecord ? "Edit Medical Record" : "Add Medical Record"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="record_type">Record Type</Label>
              <Select
                value={medicalRecordForm.record_type}
                onValueChange={(value) =>
                  setMedicalRecordForm((prev) => ({
                    ...prev,
                    record_type: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select record type" />
                </SelectTrigger>
                <SelectContent>
                  {recordTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace("_", " ").charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={medicalRecordForm.description}
                onChange={(e) =>
                  setMedicalRecordForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter description"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="file">File</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) =>
                  setMedicalRecordForm((prev) => ({
                    ...prev,
                    file: e.target.files[0],
                  }))
                }
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsMedicalRecordDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleMedicalRecordSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {selectedMedicalRecord ? "Updating..." : "Adding..."}
                </>
              ) : (
                selectedMedicalRecord ? "Update Medical Record" : "Add Medical Record"
              )}
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
            <p>Are you sure you want to delete this medical record? This action cannot be undone.</p>
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