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
import { ArrowLeft, Calendar, Clock, User, Mail, Phone, MapPin, FileText, CreditCard, Eye } from "lucide-react";
import { format } from "date-fns";

export const AppointmentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isAddRecordDialogOpen, setIsAddRecordDialogOpen] = useState(false);
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const { toast } = useToast();
  const { request } = useApiRequest();

  // Form states
  const [updateForm, setUpdateForm] = useState({
    status: "",
    notes: "",
  });

  const [recordForm, setRecordForm] = useState({
    diagnosis: "",
    prescription: "",
    notes: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "",
    notes: "",
  });

  const appointmentStatuses = [
    "scheduled",
    "confirmed",
    "completed",
    "cancelled",
    "no-show",
  ];

  const paymentMethods = [
    "cash",
    "credit_card",
    "debit_card",
    "insurance",
    "bank_transfer",
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
        url: `/appointments/${id}/medical-records`,
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
        url: `/appointments/${id}/payments`,
      });
      setPayments(data.data || []);
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    }
  };

  const handleUpdateAppointment = async () => {
    try {
      await request(
        {
          method: "PUT",
          url: `/appointments/${id}`,
          data: updateForm,
        },
        {
          successMessage: "Appointment updated successfully",
          onSuccess: () => {
            setIsUpdateDialogOpen(false);
            fetchAppointmentDetails();
          },
        }
      );
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    }
  };

  const handleAddMedicalRecord = async () => {
    try {
      await request(
        {
          method: "POST",
          url: `/appointments/${id}/medical-records`,
          data: recordForm,
        },
        {
          successMessage: "Medical record added successfully",
          onSuccess: () => {
            setIsAddRecordDialogOpen(false);
            fetchMedicalRecords();
          },
        }
      );
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    }
  };

  const handleAddPayment = async () => {
    try {
      await request(
        {
          method: "POST",
          url: `/appointments/${id}/payments`,
          data: paymentForm,
        },
        {
          successMessage: "Payment added successfully",
          onSuccess: () => {
            setIsAddPaymentDialogOpen(false);
            fetchPayments();
          },
        }
      );
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    }
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
            <CardDescription>Details about this appointment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Date:</span>
              <span>{format(new Date(appointment.date), "MMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Time:</span>
              <span>{appointment.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Type:</span>
              <span className="capitalize">{appointment.type}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <span className="capitalize">{appointment.status}</span>
            </div>
            {appointment.notes && (
              <div className="mt-4">
                <span className="font-medium">Notes:</span>
                <p className="mt-1 text-sm text-muted-foreground">
                  {appointment.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>Details about the patient</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-medium">Name:</span>
              <span>{appointment.patient.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="font-medium">Email:</span>
              <span>{appointment.patient.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span className="font-medium">Phone:</span>
              <span>{appointment.patient.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">Address:</span>
              <span>{appointment.patient.address}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Medical Records</CardTitle>
              <CardDescription>Patient's medical history and records</CardDescription>
            </div>
            <Button onClick={() => setIsAddRecordDialogOpen(true)}>
              <FileText className="h-4 w-4 mr-2" />
              Add Record
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {medicalRecords.map((record) => (
              <div
                key={record.id}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Diagnosis</p>
                    <p className="text-sm text-muted-foreground">
                      {record.diagnosis}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(record.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
                {record.prescription && (
                  <div>
                    <p className="font-medium">Prescription</p>
                    <p className="text-sm text-muted-foreground">
                      {record.prescription}
                    </p>
                  </div>
                )}
                {record.notes && (
                  <div>
                    <p className="font-medium">Notes</p>
                    <p className="text-sm text-muted-foreground">
                      {record.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
            {medicalRecords.length === 0 && (
              <p className="text-center text-muted-foreground">
                No medical records found
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Payments</CardTitle>
              <CardDescription>Payment history for this appointment</CardDescription>
            </div>
            <Button onClick={() => setIsAddPaymentDialogOpen(true)}>
              <CreditCard className="h-4 w-4 mr-2" />
              Add Payment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Amount</p>
                    <p className="text-sm text-muted-foreground">
                      ${payment.amount}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Method</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {payment.method}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(payment.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
                {payment.notes && (
                  <div>
                    <p className="font-medium">Notes</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
            {payments.length === 0 && (
              <p className="text-center text-muted-foreground">
                No payments found
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Update Appointment Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Appointment</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={updateForm.status}
                onValueChange={(value) =>
                  setUpdateForm((prev) => ({ ...prev, status: value }))
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

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                name="notes"
                value={updateForm.notes}
                onChange={(e) =>
                  setUpdateForm((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                placeholder="Add any additional notes"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpdateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateAppointment}>Update Appointment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Medical Record Dialog */}
      <Dialog open={isAddRecordDialogOpen} onOpenChange={setIsAddRecordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Medical Record</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Input
                id="diagnosis"
                name="diagnosis"
                value={recordForm.diagnosis}
                onChange={(e) =>
                  setRecordForm((prev) => ({
                    ...prev,
                    diagnosis: e.target.value,
                  }))
                }
                placeholder="Enter diagnosis"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="prescription">Prescription</Label>
              <Input
                id="prescription"
                name="prescription"
                value={recordForm.prescription}
                onChange={(e) =>
                  setRecordForm((prev) => ({
                    ...prev,
                    prescription: e.target.value,
                  }))
                }
                placeholder="Enter prescription"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                name="notes"
                value={recordForm.notes}
                onChange={(e) =>
                  setRecordForm((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                placeholder="Add any additional notes"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddRecordDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddMedicalRecord}>Add Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Payment Dialog */}
      <Dialog open={isAddPaymentDialogOpen} onOpenChange={setIsAddPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
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
              <Label htmlFor="method">Payment Method</Label>
              <Select
                value={paymentForm.method}
                onValueChange={(value) =>
                  setPaymentForm((prev) => ({ ...prev, method: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method.split("_").map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(" ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                name="notes"
                value={paymentForm.notes}
                onChange={(e) =>
                  setPaymentForm((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                placeholder="Add any additional notes"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddPaymentDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddPayment}>Add Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 