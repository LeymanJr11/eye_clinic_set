import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useApiRequest } from "@/hooks/useApiRequest";
import { Link } from "react-router-dom";
import { Eye, Plus, Edit, Trash2, Wifi, WifiOff } from "lucide-react";
import { format } from "date-fns";
import { validateName, validatePhone, validatePassword, validateDateOfBirth, validateGender } from "@/utils/validation";

export const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { request, isLoading } = useApiRequest();

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    phone: "",
    gender: "",
    date_of_birth: "",
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    password: "",
    phone: "",
    gender: "",
    date_of_birth: "",
  });

  const columns = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "date_of_birth",
      header: "Date of Birth",
      cell: ({ row }) => {
        const date = row.getValue("date_of_birth");
        return date ? format(new Date(date), "MMM d, yyyy") : "-";
      },
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => {
        const gender = row.getValue("gender");
        return gender ? (
          <Badge variant="outline" className="capitalize">
            {gender}
          </Badge>
        ) : "-";
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const patient = row.original;
        return (
          <div className="flex gap-2">
            {/* <Link to={`/admin/patients/${patient.id}`}>
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4 mr-1" /> View
              </Button>
            </Link> */}
            <Button size="sm" onClick={() => handleEditClick(patient)}>
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(patient)}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    try {
      const data = await request({
        method: 'GET',
        url: '/patients'
      });
      
      setPatients(data.data || []);
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    }
  };

  const filterPatients = () => {
    let filtered = [...patients];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredPatients(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateClick = () => {
    setFormData({
      name: "",
      password: "",
      phone: "",
      gender: "",
      date_of_birth: "",
    });
    setIsCreateDialogOpen(true);
  };

  const handleEditClick = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      name: patient.name,
      password: "",
      phone: patient.phone,
      gender: patient.gender,
      date_of_birth: patient.date_of_birth,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (patient) => {
    setSelectedPatient(patient);
    setIsDeleteDialogOpen(true);
  };

  const validateForm = () => {
    const errors = {
      name: validateName(formData.name),
      password: validatePassword(formData.password),
      phone: validatePhone(formData.phone),
      gender: validateGender(formData.gender),
      date_of_birth: validateDateOfBirth(formData.date_of_birth),
    };

    setFormErrors(errors);
    return !Object.values(errors).some(error => error !== "");
  };

  const handleCreatePatient = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the form errors before submitting",
        variant: "destructive",
      });
      return;
    }

    try {
      await request(
        {
          method: 'POST',
          url: '/patients',
          data: formData
        },
        {
          successMessage: 'Patient created successfully',
          onSuccess: () => {
            setIsCreateDialogOpen(false);
            fetchPatients();
          }
        }
      );
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    }
  };

  const handleUpdatePatient = async () => {
    if (!selectedPatient) return;
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the form errors before submitting",
        variant: "destructive",
      });
      return;
    }

    try {
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      
      await request(
        {
          method: 'PUT',
          url: `/patients/${selectedPatient.id}`,
          data: updateData
        },
        {
          successMessage: 'Patient updated successfully',
          onSuccess: () => {
            setIsEditDialogOpen(false);
            fetchPatients();
          }
        }
      );
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    }
  };

  const handleDeletePatient = async () => {
    if (!selectedPatient) return;
    
    try {
      await request(
        {
          method: 'DELETE',
          url: `/patients/${selectedPatient.id}`
        },
        {
          successMessage: 'Patient deleted successfully',
          onSuccess: () => {
            setIsDeleteDialogOpen(false);
            fetchPatients();
          }
        }
      );
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Patients</h2>
        <div className="flex items-center gap-4">
          <Button onClick={handleCreateClick}>
            <Plus className="h-4 w-4 mr-1" />
            Add Patient
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search patients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <DataTable 
        columns={columns} 
        data={filteredPatients} 
        isLoading={isLoading}
        noResultsMessage="No patients found"
      />

      {/* Create Patient Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && (
                <p className="text-sm text-red-500">{formErrors.name}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className={formErrors.password ? "border-red-500" : ""}
              />
              {formErrors.password && (
                <p className="text-sm text-red-500">{formErrors.password}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={formErrors.phone ? "border-red-500" : ""}
                placeholder="10 digits"
              />
              {formErrors.phone && (
                <p className="text-sm text-red-500">{formErrors.phone}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="gender">Gender</Label>
              <Select 
                value={formData.gender} 
                onValueChange={(value) => handleInputChange({ target: { name: 'gender', value } })}
              >
                <SelectTrigger className={formErrors.gender ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.gender && (
                <p className="text-sm text-red-500">{formErrors.gender}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                className={formErrors.date_of_birth ? "border-red-500" : ""}
              />
              {formErrors.date_of_birth && (
                <p className="text-sm text-red-500">{formErrors.date_of_birth}</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePatient} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Patient"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Patient Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && (
                <p className="text-sm text-red-500">{formErrors.name}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="password">New Password (leave blank to keep current)</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter new password or leave blank"
                value={formData.password}
                onChange={handleInputChange}
                className={formErrors.password ? "border-red-500" : ""}
              />
              {formErrors.password && (
                <p className="text-sm text-red-500">{formErrors.password}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={formErrors.phone ? "border-red-500" : ""}
              />
              {formErrors.phone && (
                <p className="text-sm text-red-500">{formErrors.phone}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="gender">Gender</Label>
              <Select 
                value={formData.gender} 
                onValueChange={(value) => handleInputChange({ target: { name: 'gender', value } })}
              >
                <SelectTrigger className={formErrors.gender ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.gender && (
                <p className="text-sm text-red-500">{formErrors.gender}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                className={formErrors.date_of_birth ? "border-red-500" : ""}
              />
              {formErrors.date_of_birth && (
                <p className="text-sm text-red-500">{formErrors.date_of_birth}</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePatient} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Patient"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Patient Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Patient</DialogTitle>
          </DialogHeader>
          
          <p>Are you sure you want to delete this patient?</p>
          <p className="text-sm text-muted-foreground mt-2">
            This action cannot be undone. All associated appointments, medical records, and payments will be affected.
          </p>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeletePatient}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Patient"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 