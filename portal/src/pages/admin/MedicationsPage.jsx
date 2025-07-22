import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";
import { useApiRequest } from "@/hooks/useApiRequest";
import { Edit, Trash2, Plus } from "lucide-react";

export const MedicationsPage = () => {
  const [medications, setMedications] = useState([]);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { request, isLoading } = useApiRequest();

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState({
    name: "",
    description: "",
  });

  const columns = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const medication = row.original;
        return (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleEditClick(medication)}>
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(medication)}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    fetchMedications();
  }, []);

  useEffect(() => {
    filterMedications();
  }, [searchTerm, medications]);

  const fetchMedications = async () => {
    try {
      const data = await request({
        method: "GET",
        url: "/medications",
      });
      setMedications(data.data || []);
    } catch (error) {}
  };

  const filterMedications = () => {
    let filtered = [...medications];
    if (searchTerm) {
      filtered = filtered.filter((med) =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredMedications(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateClick = () => {
    setFormData({ name: "", description: "" });
    setFormErrors({ name: "", description: "" });
    setIsCreateDialogOpen(true);
  };

  const handleEditClick = (medication) => {
    setSelectedMedication(medication);
    setFormData({ name: medication.name, description: medication.description || "" });
    setFormErrors({ name: "", description: "" });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (medication) => {
    setSelectedMedication(medication);
    setIsDeleteDialogOpen(true);
  };

  const validateForm = () => {
    const errors = {
      name: formData.name.trim() ? "" : "Name is required",
      description: "",
    };
    setFormErrors(errors);
    return !Object.values(errors).some((error) => error !== "");
  };

  const handleCreateMedication = async () => {
    if (!validateForm()) {
      toast({ title: "Validation Error", description: "Please fix the form errors before submitting", variant: "destructive" });
      return;
    }
    try {
      await request(
        {
          method: "POST",
          url: "/medications",
          data: formData,
        },
        {
          successMessage: "Medication created successfully",
          onSuccess: () => {
            setIsCreateDialogOpen(false);
            fetchMedications();
          },
        }
      );
    } catch (error) {}
  };

  const handleUpdateMedication = async () => {
    if (!selectedMedication) return;
    if (!validateForm()) {
      toast({ title: "Validation Error", description: "Please fix the form errors before submitting", variant: "destructive" });
      return;
    }
    try {
      await request(
        {
          method: "PUT",
          url: `/medications/${selectedMedication.id}`,
          data: formData,
        },
        {
          successMessage: "Medication updated successfully",
          onSuccess: () => {
            setIsEditDialogOpen(false);
            fetchMedications();
          },
        }
      );
    } catch (error) {}
  };

  const handleDeleteMedication = async () => {
    if (!selectedMedication) return;
    try {
      await request(
        {
          method: "DELETE",
          url: `/medications/${selectedMedication.id}`,
        },
        {
          successMessage: "Medication deleted successfully",
          onSuccess: () => {
            setIsDeleteDialogOpen(false);
            fetchMedications();
          },
        }
      );
    } catch (error) {}
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Medications</h2>
        <Button onClick={handleCreateClick}>
          <Plus className="h-4 w-4 mr-1" /> Add Medication
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search medications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <DataTable columns={columns} data={filteredMedications} isLoading={isLoading} noResultsMessage="No medications found" />
      {/* Create Medication Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className={"lg:max-w-screen-lg overflow-y-scroll max-h-screen"}>
          <DialogHeader>
            <DialogTitle>Add New Medication</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className={formErrors.name ? "border-red-500" : ""} />
              {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" value={formData.description} onChange={handleInputChange} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateMedication} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Medication"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Edit Medication Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className={"lg:max-w-screen-lg overflow-y-scroll max-h-screen"}>
          <DialogHeader>
            <DialogTitle>Edit Medication</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className={formErrors.name ? "border-red-500" : ""} />
              {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" value={formData.description} onChange={handleInputChange} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateMedication} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Medication"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Medication Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className={"lg:max-w-screen-lg overflow-y-scroll max-h-screen"}>
          <DialogHeader>
            <DialogTitle>Delete Medication</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this medication?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteMedication} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete Medication"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 