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
import { ArrowLeft, User, Mail, Phone, Calendar, Clock, FileText, CreditCard, Plus, Edit, Trash2, Eye,Star } from "lucide-react";
import { format } from "date-fns";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";

export const ViewAppointmentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMedicalRecordDialogOpen, setIsMedicalRecordDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState({ type: '', id: null });
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const { toast } = useToast();
  const { request } = useApiRequest();

  // Medical Record form state
  const [medicalRecordForm, setMedicalRecordForm] = useState({
    record_type: "",
    description: "",
    file: null,
  });

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    payment_type: "initial_consultation",
    status: "pending",
    note: "",
  });

  const paymentTypes = [
    "initial_consultation",
    "followup",
    "test",
    "prescription",
    "other"
  ];

  const paymentStatuses = [
    "pending",
    "paid",
    "failed"
  ];

  const recordTypes = [
    "diagnosis",
    "prescription",
    "test_result",
    "external_upload",
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Payments Table Columns
  const paymentColumns = [
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("createdAt");
        return format(new Date(date), "MMM d, yyyy");
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = row.getValue("amount");
        if (amount === null || amount === undefined) return "$0.00";
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return `$${isNaN(numAmount) ? "0.00" : numAmount.toFixed(2)}`;
      },
    },
    {
      accessorKey: "payment_type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("payment_type");
        return (
          <Badge variant="outline" className="capitalize">
            {type.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status");
        const statusColors = {
          pending: "bg-yellow-100 text-yellow-800",
          completed: "bg-green-100 text-green-800",
          failed: "bg-red-100 text-red-800",
          refunded: "bg-blue-100 text-blue-800",
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
        const payment = row.original;
        return (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleEditPayment(payment)}>
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDeletePayment(payment.id)}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    fetchAppointmentDetails();
    fetchMedicalRecords();
    fetchPayments();
  }, [id]);

  const fetchAppointmentDetails = async () => {
    try {
      const data = await request({
        method: "GET",
        url: `/appointments/${id}`,
      });
      setAppointment(data.data);
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

  const fetchPayments = async () => {
    try {
      const data = await request({
        method: "GET",
        url: `/payments/appointment/${id}`,
      });
      setPayments(data.data || []);
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    }
  };

  const handleMedicalRecordSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("appointment_id", parseInt(id));
      formData.append("patient_id", parseInt(appointment.patient_id));
      formData.append("doctor_id", parseInt(appointment.doctor_id));
      formData.append("record_type", medicalRecordForm.record_type);
      formData.append("description", medicalRecordForm.description || "");
      
      if (medicalRecordForm.file) {
        formData.append("file", medicalRecordForm.file);
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
      fetchMedicalRecords();
      setIsMedicalRecordDialogOpen(false);
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

  const handlePaymentSubmit = async () => {
    setIsSubmitting(true);
    try {
      const paymentData = {
        appointment_id: parseInt(id),
        amount: parseFloat(paymentForm.amount),
        payment_type: paymentForm.payment_type,
        status: paymentForm.status,
        note: paymentForm.note || "Initial payment",
      };

      if (selectedPayment) {
        await request({
          method: "PUT",
          url: `/payments/${selectedPayment.id}`,
          data: paymentData,
        });
        toast({
          title: "Success",
          description: "Payment updated successfully",
        });
      } else {
        await request({
          method: "POST",
          url: "/payments",
          data: paymentData,
        });
        toast({
          title: "Success",
          description: "Payment created successfully",
        });
      }
      fetchPayments();
      setIsPaymentDialogOpen(false);
    } catch (error) {
      console.error("Error saving payment:", error);
      toast({
        title: "Error",
        description: "Failed to save payment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMedicalRecord = async (recordId) => {
    setDeleteItem({ type: 'medicalRecord', id: recordId });
    setIsDeleteDialogOpen(true);
  };

  const handleDeletePayment = async (paymentId) => {
    setDeleteItem({ type: 'payment', id: paymentId });
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      switch (deleteItem.type) {
        case 'medicalRecord':
          await request({
            method: "DELETE",
            url: `/medical-records/${deleteItem.id}`,
          });
          toast({
            title: "Success",
            description: "Medical record deleted successfully",
          });
          fetchMedicalRecords();
          break;
        case 'payment':
          await request({
            method: "DELETE",
            url: `/payments/${deleteItem.id}`,
          });
          toast({
            title: "Success",
            description: "Payment deleted successfully",
          });
          fetchPayments();
          break;
      }
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteItem({ type: '', id: null });
    }
  };

  const handleEditMedicalRecord = (record) => {
    setSelectedMedicalRecord(record);
    setMedicalRecordForm({
      record_type: record.record_type,
      description: record.description,
      file: null,
    });
    setIsMedicalRecordDialogOpen(true);
  };

  const handleEditPayment = (payment) => {
    setSelectedPayment(payment);
    setPaymentForm({
      amount: payment.amount.toString(),
      payment_type: payment.payment_type,
      status: payment.status,
      note: payment.note,
    });
    setIsPaymentDialogOpen(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!appointment) {
    return <div>Appointment not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/admin/appointments")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Appointments
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appointment Information</CardTitle>
            <CardDescription>Details of the appointment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(appointment.appointment_date), "MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{appointment.time_slot?.start_time} - {appointment.time_slot?.end_time}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <Badge className={`capitalize ${
                appointment.status === "completed" ? "bg-green-100 text-green-800" :
                appointment.status === "cancelled" ? "bg-red-100 text-red-800" :
                "bg-blue-100 text-blue-800"
              }`}>
                {appointment.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>Details of the patient</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{appointment.patient?.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>{appointment.patient?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{appointment.patient?.phone}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointment Management</CardTitle>
          <CardDescription>Manage medical records and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="medical-records">
            <TabsList>
              <TabsTrigger value="medical-records">Medical Records</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="medical-records" className="space-y-4">
              <div className="flex justify-end">
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
              <DataTable
                columns={medicalRecordColumns}
                data={medicalRecords}
                isLoading={isLoading}
                noResultsMessage="No medical records found"
              />
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => {
                  setSelectedPayment(null);
                  setPaymentForm({
                    amount: "",
                    payment_type: "initial_consultation",
                    status: "pending",
                    note: "",
                  });
                  setIsPaymentDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment
                </Button>
              </div>
              <DataTable
                columns={paymentColumns}
                data={payments}
                isLoading={isLoading}
                noResultsMessage="No payments found"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

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

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedPayment ? "Edit Payment" : "Add Payment"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={paymentForm.amount}
                onChange={(e) =>
                  setPaymentForm((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
                placeholder="Enter amount"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="payment_type">Payment Type</Label>
              <Select
                value={paymentForm.payment_type}
                onValueChange={(value) =>
                  setPaymentForm((prev) => ({
                    ...prev,
                    payment_type: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  {paymentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={paymentForm.status}
                onValueChange={(value) =>
                  setPaymentForm((prev) => ({
                    ...prev,
                    status: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="note">Note</Label>
              <Input
                id="note"
                value={paymentForm.note}
                onChange={(e) =>
                  setPaymentForm((prev) => ({
                    ...prev,
                    note: e.target.value,
                  }))
                }
                placeholder="Enter payment note"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsPaymentDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePaymentSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {selectedPayment ? "Updating..." : "Adding..."}
                </>
              ) : (
                selectedPayment ? "Update Payment" : "Add Payment"
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