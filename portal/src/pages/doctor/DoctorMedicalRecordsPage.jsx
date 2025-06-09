import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useApiRequest } from "@/hooks/useApiRequest";
import { format } from "date-fns";
import { ArrowLeft, FileText, Plus, Eye, Edit, Trash2 } from "lucide-react";

export const DoctorMedicalRecordsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { request } = useApiRequest();
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState({
    patient_id: "",
    diagnosis: "",
    prescription: "",
    notes: "",
    file: null
  });

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const fetchMedicalRecords = async () => {
    setIsLoading(true);
    try {
      const response = await request({
        method: "GET",
        url: "/medical-records/doctor/me",
      });
      setMedicalRecords(response.data);
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (selectedRecord) {
        await request({
          method: "PUT",
          url: `/medical-records/${selectedRecord.id}`,
          data: formDataToSend,
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
          data: formDataToSend,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast({
          title: "Success",
          description: "Medical record created successfully",
        });
      }
      setIsDialogOpen(false);
      fetchMedicalRecords();
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    }
  };

  const handleDelete = async () => {
    try {
      await request({
        method: "DELETE",
        url: `/medical-records/${selectedRecord.id}`,
      });
      toast({
        title: "Success",
        description: "Medical record deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      fetchMedicalRecords();
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    }
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setFormData({
      patient_id: record.patient_id,
      diagnosis: record.diagnosis,
      prescription: record.prescription,
      notes: record.notes,
      file: null
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedRecord(null);
    setFormData({
      patient_id: "",
      diagnosis: "",
      prescription: "",
      notes: "",
      file: null
    });
    setIsDialogOpen(true);
  };

  // Medical Records Table Columns
  const medicalRecordColumns = [
    {
      accessorKey: "patient.name",
      header: "Patient",
    },
    {
      accessorKey: "diagnosis",
      header: "Diagnosis",
    },
    {
      accessorKey: "prescription",
      header: "Prescription",
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("created_at");
        return format(new Date(date), "MMM d, yyyy");
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleEdit(record)}>
              <Eye className="h-4 w-4 mr-1" /> View
            </Button>
            <Button size="sm" onClick={() => handleEdit(record)}>
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={() => {
                setSelectedRecord(record);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/doctor")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Medical Record
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Medical Records</CardTitle>
              <CardDescription>Manage patient medical records</CardDescription>
            </div>
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

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedRecord ? "Edit Medical Record" : "New Medical Record"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patient_id">Patient ID</Label>
              <Input
                id="patient_id"
                value={formData.patient_id}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, patient_id: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Textarea
                id="diagnosis"
                value={formData.diagnosis}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, diagnosis: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prescription">Prescription</Label>
              <Textarea
                id="prescription"
                value={formData.prescription}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, prescription: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">Attachment</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, file: e.target.files[0] }))
                }
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedRecord ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
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
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 