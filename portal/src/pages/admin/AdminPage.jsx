import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import { useApiRequest } from "@/hooks/useApiRequest";
import { Plus, Edit, Trash2 } from "lucide-react";
import { validateName, validateWalletAddress } from "@/utils/validation";
import { useToast } from "@/hooks/use-toast";


export const AdminsPage = () => {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { request, isLoading } = useApiRequest();
  const { toast } = useToast();

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    wallet_address: "",
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    wallet_address: "",
  });

  const columns = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "wallet_address",
      header: "Wallet Address",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const admin = row.original;
        return (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleEditClick(admin)}>
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(admin)}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    filterAdmins();
  }, [searchTerm, admins]);

  const fetchAdmins = async () => {
    try {
      const data = await request({
        method: 'GET',
        url: '/admins'
      });
      
      setAdmins(data.data || []);
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    }
  };

  const filterAdmins = () => {
    let filtered = [...admins];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(admin => 
        admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.wallet_address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredAdmins(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateClick = () => {
    setFormData({
      name: "",
      wallet_address: "",
    });
    setIsCreateDialogOpen(true);
  };

  const handleEditClick = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      wallet_address: admin.wallet_address,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (admin) => {
    setSelectedAdmin(admin);
    setIsDeleteDialogOpen(true);
  };

  const validateForm = () => {
    const errors = {
      name: validateName(formData.name),
      wallet_address: validateWalletAddress(formData.wallet_address),
    };

    setFormErrors(errors);
    return !Object.values(errors).some(error => error !== "");
  };

  const handleCreateAdmin = async () => {
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
          url: '/admins',
          data: formData
        },
        {
          successMessage: 'Admin created successfully',
          onSuccess: () => {
            setIsCreateDialogOpen(false);
            fetchAdmins();
          }
        }
      );
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    }
  };

  const handleUpdateAdmin = async () => {
    if (!selectedAdmin) return;
    
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
          method: 'PUT',
          url: `/admins/${selectedAdmin.id}`,
          data: formData
        },
        {
          successMessage: 'Admin updated successfully',
          onSuccess: () => {
            setIsEditDialogOpen(false);
            fetchAdmins();
          }
        }
      );
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    }
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;
    
    try {
      await request(
        {
          method: 'DELETE',
          url: `/admins/${selectedAdmin.id}`
        },
        {
          successMessage: 'Admin deleted successfully',
          onSuccess: () => {
            setIsDeleteDialogOpen(false);
            fetchAdmins();
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
        <h2 className="text-3xl font-bold tracking-tight">Admins</h2>
        <div className="flex items-center gap-4">
          <Button onClick={handleCreateClick}>
            <Plus className="h-4 w-4 mr-1" />
            Add Admin
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search admins..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <DataTable 
        columns={columns} 
        data={filteredAdmins} 
        isLoading={isLoading}
        noResultsMessage="No admins found"
      />

      {/* Create Admin Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
  <DialogContent className={"lg:max-w-screen-lg overflow-y-scroll max-h-screen"}>
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
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
              <Label htmlFor="wallet_address">Wallet Address</Label>
              <Input
                id="wallet_address"
                name="wallet_address"
                value={formData.wallet_address}
                onChange={handleInputChange}
                className={formErrors.wallet_address ? "border-red-500" : ""}
                placeholder="0x..."
              />
              {formErrors.wallet_address && (
                <p className="text-sm text-red-500">{formErrors.wallet_address}</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAdmin} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
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
              <Label htmlFor="wallet_address">Wallet Address</Label>
              <Input
                id="wallet_address"
                name="wallet_address"
                value={formData.wallet_address}
                onChange={handleInputChange}
                className={formErrors.wallet_address ? "border-red-500" : ""}
                placeholder="0x..."
              />
              {formErrors.wallet_address && (
                <p className="text-sm text-red-500">{formErrors.wallet_address}</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAdmin} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Admin Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Admin</DialogTitle>
          </DialogHeader>
          
          <p>Are you sure you want to delete this admin?</p>
          <p className="text-sm text-muted-foreground mt-2">
            This action cannot be undone. The admin will lose access to the system.
          </p>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAdmin}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};