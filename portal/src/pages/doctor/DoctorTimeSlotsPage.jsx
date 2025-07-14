import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useApiRequest } from "@/hooks/useApiRequest";
import { format } from "date-fns";
import { ArrowLeft, Clock } from "lucide-react";

export const DoctorTimeSlotsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { request } = useApiRequest();
  const [timeSlots, setTimeSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const fetchTimeSlots = async () => {
    setIsLoading(true);
    try {
      const response = await request({
        method: "GET",
        url: "/time-slots/doctor/me",
      });
      setTimeSlots(response.data);
    } catch (error) {
      // Error is already handled by the useApiRequest hook
    } finally {
      setIsLoading(false);
    }
  };

  // Time Slots Table Columns
  const timeSlotColumns = [
    {
      accessorKey: "day_of_week",
      header: "Day",
      cell: ({ row }) => {
        const day = row.getValue("day_of_week");
        return day.charAt(0).toUpperCase() + day.slice(1);
      },
    },
    {
      accessorKey: "start_time",
      header: "Start Time",
      cell: ({ row }) => {
        const time = row.getValue("start_time");
        return format(new Date(`2000-01-01T${time}`), "h:mm a");
      },
    },
    {
      accessorKey: "end_time",
      header: "End Time",
      cell: ({ row }) => {
        const time = row.getValue("end_time");
        return format(new Date(`2000-01-01T${time}`), "h:mm a");
      },
    },

  ];

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
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>My Schedule</CardTitle>
              <CardDescription>View your available time slots</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={timeSlotColumns}
            data={timeSlots}
            isLoading={isLoading}
            noResultsMessage="No time slots found"
          />
        </CardContent>
      </Card>
    </div>
  );
}; 