import React, { useState, useEffect } from "react";
import { Bell, BellOff, Eye, Check, ArrowLeft, RefreshCw } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import api from "@/services/api/api-service";
import { useNavigate } from "react-router";

// API service functions
const apiService = {
  getNotifications: async () => {
    try {
      const data = await api.get("/notifications/");
      if (data.status) {
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return { success: false, error: "Failed to fetch notifications" };
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const data = await api.post(`/notifications/${notificationId}/read`);

      return { success: data.status, message: data.message };
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return { success: false, message: "Failed to mark notification as read" };
    }
  },

  markAllAsRead: async () => {
    try {
      const data = await api.post("notifications/read-all");

      return { success: data.status, message: data.message };
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return {
        success: false,
        message: "Failed to mark all notifications as read",
      };
    }
  },
};

function NotificationItem({ notification, onMarkAsRead }) {
  { console.log(notification) }
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const navigate = useNavigate();

  const handleMarkAsRead = async () => {
    onMarkAsRead(notification.id);
  };

  const openDetails = () => {
    const { eventType, referenceId } = notification;

    const routeMap = {
      LowStock: `/inventory/${referenceId}`,
      DocumentExpiry: `/machine/${referenceId}?tab=documents`,
      MachineTransfer: `/machine-transfer/${referenceId}`,
      MaterialIssue: `/issues/${referenceId}`,
      MaterialRequisition: `/requisitions/${referenceId}`,
      LogbookEntry: `/logbook/${referenceId}`,
      MachineMaintenanceAlert: `machine/${referenceId}`
    };

    const route = routeMap[eventType];

    if (route) {
      navigate(route);
    } else {
      console.warn("No details available");
    }
  };

  return (
    <div
      className={`flex items-start p-3 rounded-md transition-colors ${!notification.read ? "bg-muted" : "border"
        }`}
    >
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4
            className="text-sm text-blue-600 cursor-pointer underline font-medium"
            onClick={openDetails}
          >
            {notification.title}
          </h4>
          <span className="text-xs">{formatDate(notification.createdAt)}</span>
        </div>
        <p className="text-xs mt-1">{notification.description}</p>
        <div className="flex justify-between items-center mt-2">
          <Badge
            variant="outline"
            className={`text-xs ${notification.eventAction === "Expired"
              ? "bg-red-50 text-red-500 border-red-200"
              : "bg-blue-50 text-blue-500 border-blue-200"
              }`}
          >
            {notification.eventType}
          </Badge>

          {!notification.read && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-xs flex gap-1 items-center text-blue-500 hover:text-blue-600"
              onClick={handleMarkAsRead}
            >
              <Check className="h-3 w-3" /> Mark read
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function AllNotifications({ onBack, onRefresh }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    const result = await apiService.getNotifications();
    if (result.success) {
      setNotifications(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    const result = await apiService.markAsRead(notificationId);
    if (result.success) {
      setNotifications(
        notifications.map((note) =>
          note.id === notificationId ? { ...note, read: true } : note
        )
      );
      toast({
        title: "Success",
        description: "Notification marked as read",
        duration: 3000,
      });
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await apiService.markAllAsRead();
    if (result.success) {
      setNotifications(notifications.map((note) => ({ ...note, read: true })));
      toast({
        title: "Success",
        description: "All notifications marked as read",
        duration: 3000,
      });
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center pb-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-medium">All Notifications</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={fetchNotifications}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={notifications.every((n) => n.read) || loading}
          >
            Mark all read
          </Button>
        </div>
      </div>
      <Separator />

      {loading ? (
        <div className="py-12 flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="py-12 text-center">
          <p className="text-red-500">{error}</p>
          <Button
            variant="outline"
            onClick={fetchNotifications}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <BellOff
            className="p-2 bg-secondary rounded-full mb-4"
            size={64}
            strokeWidth={0.5}
          />
          <p className="text-gray-500">No notifications to display</p>
        </div>
      ) : (
        <ScrollArea className="flex-1 overflow-y-auto pr-2 mt-3">
          <div className="space-y-2">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewAll, setViewAll] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    const result = await apiService.getNotifications();
    if (result.success) {
      setNotifications(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    const result = await apiService.markAsRead(notificationId);
    if (result.success) {
      setNotifications(
        notifications.map((note) =>
          note.id === notificationId ? { ...note, read: true } : note
        )
      );
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await apiService.markAllAsRead();
    if (result.success) {
      setNotifications(notifications.map((note) => ({ ...note, read: true })));
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const unreadCount = notifications.filter((note) => !note.read).length;

  const handleRefresh = () => {
    fetchNotifications();
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild className="mx-4 relative">
          <Button variant="outline" size="icon">
            <Bell className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs rounded-full">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent sideOffset={5} align="end" className="w-80">
          {viewAll ? (
            <div className="h-96">
              <AllNotifications
                onBack={() => setViewAll(false)}
                onRefresh={handleRefresh}
              />
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <Label className="text-base font-medium">Notifications</Label>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Badge
                      variant="outline"
                      className="bg-red-50 text-red-500 border-red-200"
                    >
                      {unreadCount} New
                    </Badge>
                  )}
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={handleMarkAllAsRead}
                    >
                      Mark all read
                    </Button>
                  )}
                </div>
              </div>
              <Separator className="my-3" />

              {loading ? (
                <div className="py-6 text-center text-sm text-gray-500 flex justify-center">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                </div>
              ) : error ? (
                <div className="py-6 text-center text-sm text-red-500">
                  {error}
                </div>
              ) : notifications.length > 0 ? (
                <>
                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {notifications.slice(0, 4).map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                      />
                    ))}
                  </div>
                  <Separator className="my-3" />
                  <div className="flex justify-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex items-center text-muted-foreground"
                      onClick={() => setViewAll(true)}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View all
                    </Button>
                  </div>
                </>
              ) : (
                <div className="my-8 flex flex-col justify-center items-center gap-6 opacity-50">
                  <BellOff
                    className="p-2 bg-secondary rounded-full"
                    size={64}
                    strokeWidth={0.5}
                  />
                  <p className="text-center font-sm text-xs text-slate-500">
                    You're all caught up! Check back later for new notifications
                  </p>
                </div>
              )}
            </>
          )}
        </PopoverContent>
      </Popover>
    </>
  );
}

export default Notification;
