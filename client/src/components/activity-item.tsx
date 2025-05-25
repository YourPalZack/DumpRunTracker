import { Activity } from "@shared/schema";
import { 
  CheckCircle, Bell, Truck, User, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface ActivityItemProps {
  activity: Activity;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  
  const handleApprove = async () => {
    if (!activity.relatedEntityId || activity.type !== "request_received") return;
    
    try {
      setIsPending(true);
      await apiRequest(
        "PATCH",
        `/api/dump-runs/${activity.relatedEntityId}/participants/${activity.relatedEntityId}`,
        { status: "approved" }
      );
      
      // Mark activity as read
      await apiRequest("PATCH", `/api/activities/${activity.id}/read`, { isRead: true });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dump-runs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-dump-runs"] });
      
      toast({
        title: "Participant approved",
        description: "The participant has been approved to join your dump run",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve participant",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };
  
  const handleDecline = async () => {
    if (!activity.relatedEntityId || activity.type !== "request_received") return;
    
    try {
      setIsPending(true);
      await apiRequest(
        "PATCH",
        `/api/dump-runs/${activity.relatedEntityId}/participants/${activity.relatedEntityId}`,
        { status: "rejected" }
      );
      
      // Mark activity as read
      await apiRequest("PATCH", `/api/activities/${activity.id}/read`, { isRead: true });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dump-runs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-dump-runs"] });
      
      toast({
        title: "Participant declined",
        description: "The participant request has been declined",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decline participant",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };
  
  const getActivityIcon = () => {
    switch (activity.type) {
      case 'request_approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'request_rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'request_received':
        return <User className="h-5 w-5 text-orange-500" />;
      case 'dump_run_updated':
        return <Truck className="h-5 w-5 text-primary" />;
      default:
        return <Bell className="h-5 w-5 text-neutral-500" />;
    }
  };
  
  return (
    <li className={`p-4 hover:bg-neutral-50 transition duration-200 ${activity.isRead ? 'opacity-70' : ''}`}>
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          {getActivityIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-neutral-900">
            {activity.content}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {activity.createdAt ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true }) : 'Unknown time'}
          </p>
          
          {activity.type === "request_received" && !activity.isRead && (
            <div className="mt-2 flex space-x-2">
              <Button 
                size="sm"
                className="text-xs bg-green-500 hover:bg-green-600 h-7"
                onClick={handleApprove}
                disabled={isPending}
              >
                Approve
              </Button>
              <Button 
                size="sm"
                className="text-xs bg-red-500 hover:bg-red-600 h-7"
                onClick={handleDecline}
                disabled={isPending}
              >
                Decline
              </Button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
