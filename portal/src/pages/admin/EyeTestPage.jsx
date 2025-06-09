import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useApiRequest } from "@/hooks/useApiRequest";
import { Link } from "react-router-dom";
import { Eye, Plus, Search, Calendar, Pencil, Trash2 } from "lucide-react";
import { format, startOfDay, endOfDay, subDays } from "date-fns";

export const EyeTestPage = () => {
  const [eyeTests, setEyeTests] = useState([]);
  const [filteredEyeTests, setFilteredEyeTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [selectedPatient, setSelectedPatient] = useState("all");
  const [patients, setPatients] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { request, isLoading } = useApiRequest();

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEyeTest, setSelectedEyeTest] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    patient_id: "",
    test_type: "",
    result: "",
  });

  const eyeTestTypes = [
    "color_blindness",
    "visual_acuity",
    "contrast_sensitivity"
  ];

  const dateFilterOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last7days", label: "Last 7 Days" },
    { value: "custom", label: "Custom Range" },
  ];

  const columns = [
    {
      accessorKey: "patient.name",
      header: "Patient",
    },
    {
      accessorKey: "test_type",
      header: "Test Type",
      cell: ({ row }) => {
        const type = row.getValue("test_type");
        return (
          <Badge variant="outline" className="capitalize">
            {type.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "result",
      header: "Result",
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
        const eyeTest = row.original;
        return (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleViewTest(eyeTest)}
            >
              <Eye className="h-4 w-4 mr-1" /> View
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleEditTest(eyeTest)}
            >
              <Pencil className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => handleDeleteClick(eyeTest)}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    fetchEyeTests();
    fetchPatients();
  }, [dateFilter, customDateRange, selectedPatient]);

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

  const fetchEyeTests = async () => {
    try {
      let url = "/eye-tests";
      const params = new URLSearchParams();

      if (dateFilter !== "all") {
        const today = new Date();
        let startDate, endDate;

        switch (dateFilter) {
          case "today":
            startDate = startOfDay(today);
            endDate = endOfDay(today);
            break;
          case "yesterday":
            startDate = startOfDay(subDays(today, 1));
            endDate = endOfDay(subDays(today, 1));
            break;
          case "last7days":
            startDate = startOfDay(subDays(today, 7));
            endDate = endOfDay(today);
            break;
          case "custom":
            if (customDateRange.startDate && customDateRange.endDate) {
              startDate = new Date(customDateRange.startDate);
              endDate = new Date(customDateRange.endDate);
            }
            break;
        }

        if (startDate && endDate) {
          params.append("startDate", startDate.toISOString());
          params.append("endDate", endDate.toISOString());
        }
      }

      if (selectedPatient !== "all") {
        params.append("patient_id", selectedPatient);
      }

      const queryString = params.toString();
      const finalUrl = queryString ? `${url}?${queryString}` : url;

      const data = await request({
        method: "GET",
        url: finalUrl,
      });
      setEyeTests(data.data || []);
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    }
  };

  const filterEyeTests = () => {
    let filtered = [...eyeTests];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        test =>
          test.patient.name.toLowerCase().includes(searchLower) ||
          test.test_type.toLowerCase().includes(searchLower) ||
          test.result.toLowerCase().includes(searchLower)
      );
    }

    setFilteredEyeTests(filtered);
  };

  useEffect(() => {
    filterEyeTests();
  }, [searchTerm, eyeTests]);

  const handleCreateTest = async () => {
    setIsSubmitting(true);
    try {
      await request({
        method: "POST",
        url: "/eye-tests",
        data: {
          ...formData,
          patient_id: parseInt(formData.patient_id),
        },
      });
      
      toast({
        title: "Success",
        description: "Eye test created successfully",
      });
      
      setIsCreateDialogOpen(false);
      setFormData({
        patient_id: "",
        test_type: "",
        result: "",
      });
      fetchEyeTests();
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTest = async () => {
    setIsSubmitting(true);
    try {
      await request({
        method: "PUT",
        url: `/eye-tests/${selectedEyeTest.id}`,
        data: {
          ...formData,
          patient_id: parseInt(formData.patient_id),
        },
      });
      
      toast({
        title: "Success",
        description: "Eye test updated successfully",
      });
      
      setIsEditDialogOpen(false);
      setFormData({
        patient_id: "",
        test_type: "",
        result: "",
      });
      fetchEyeTests();
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTest = async () => {
    setIsSubmitting(true);
    try {
      await request({
        method: "DELETE",
        url: `/eye-tests/${selectedEyeTest.id}`,
      });
      
      toast({
        title: "Success",
        description: "Eye test deleted successfully",
      });
      
      setIsDeleteDialogOpen(false);
      fetchEyeTests();
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewTest = (test) => {
    setSelectedEyeTest(test);
    setIsViewDialogOpen(true);
  };

  const handleEditTest = (test) => {
    setSelectedEyeTest(test);
    setFormData({
      patient_id: test.patient_id.toString(),
      test_type: test.test_type,
      result: test.result,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (test) => {
    setSelectedEyeTest(test);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Eye Tests</h1>
          <p className="text-muted-foreground">
            Manage and track eye tests for patients
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Test
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search and Filter</CardTitle>
          <CardDescription>Find specific eye tests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient name or test type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select
              value={selectedPatient}
              onValueChange={setSelectedPatient}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by patient" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patients</SelectItem>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id.toString()}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid gap-4 md:grid-cols-2">
              <Select
                value={dateFilter}
                onValueChange={setDateFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  {dateFilterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {dateFilter === "custom" && (
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={customDateRange.startDate}
                    onChange={(e) =>
                      setCustomDateRange((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                  />
                  <Input
                    type="date"
                    value={customDateRange.endDate}
                    onChange={(e) =>
                      setCustomDateRange((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={filteredEyeTests}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Create Test Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Eye Test</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="patient_id">Patient</Label>
              <Select
                value={formData.patient_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({
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
              <Label htmlFor="test_type">Test Type</Label>
              <Select
                value={formData.test_type}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, test_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select test type" />
                </SelectTrigger>
                <SelectContent>
                  {eyeTestTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.split("_").map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(" ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="result">Result</Label>
              <Input
                id="result"
                value={formData.result}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    result: e.target.value,
                  }))
                }
                placeholder="Enter test result"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTest}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : (
                "Create Test"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Test Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Eye Test</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="patient_id">Patient</Label>
              <Select
                value={formData.patient_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({
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
              <Label htmlFor="test_type">Test Type</Label>
              <Select
                value={formData.test_type}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, test_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select test type" />
                </SelectTrigger>
                <SelectContent>
                  {eyeTestTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.split("_").map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(" ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="result">Result</Label>
              <Input
                id="result"
                value={formData.result}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    result: e.target.value,
                  }))
                }
                placeholder="Enter test result"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateTest}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Updating...
                </>
              ) : (
                "Update Test"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Eye Test</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this eye test? This action cannot be undone.</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteTest}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Test"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Test Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eye Test Details</DialogTitle>
          </DialogHeader>

          {selectedEyeTest && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Patient</Label>
                <p className="text-sm">{selectedEyeTest.patient.name}</p>
              </div>

              <div className="grid gap-2">
                <Label>Test Type</Label>
                <Badge variant="outline" className="capitalize">
                  {selectedEyeTest.test_type.replace("_", " ")}
                </Badge>
              </div>

              <div className="grid gap-2">
                <Label>Result</Label>
                <p className="text-sm">{selectedEyeTest.result}</p>
              </div>

              <div className="grid gap-2">
                <Label>Date</Label>
                <p className="text-sm">
                  {format(new Date(selectedEyeTest.createdAt), "MMM d, yyyy")}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 