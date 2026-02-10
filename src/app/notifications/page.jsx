import { useState, useEffect } from "react";
import { Bell, BellOff, Check, RefreshCw, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import api from "@/services/api/api-service";
import { Spinner } from "@/components/ui/loader";
import { useNavigate } from "react-router";

// API service functions (reusing your existing logic)
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

function NotificationCard({ notification, onMarkAsRead }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const handleMarkAsRead = async () => {
    onMarkAsRead(notification.id);
  };

  const navigate = useNavigate();

  const openDetails = () => {
    const { eventType, referenceId } = notification;

    const routeMap = {
      LowStock: `/inventory/${referenceId}`,
      DocumentExpiry: `/machine/${referenceId}?tab=documents`,
      MachineTransfer: `/machine-transfer/${referenceId}`,
      MaterialIssue: `/issues/${referenceId}`,
      MaterialRequisition: `/requisitions/${referenceId}`,
      LogbookEntry: `/logbook/${referenceId}`,
    };

    const route = routeMap[eventType];

    if (route) {
      navigate(route);
    } else {
      console.warn("No details available");
    }
  };

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-md ${!notification.read ? "border-l-4 border-l-primary bg-blue-50/30" : ""
        }`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h3
                className="font-semibold cursor-pointer text-blue-600 underline text-lg leading-tight"
                onClick={openDetails}
              >
                {notification.title}
              </h3>
              <div className="flex items-center gap-2 ml-4">
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatDate(notification.createdAt)}
                </span>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {notification.description}
            </p>

            <div className="flex items-center justify-between pt-2">
              <Badge
                variant="outline"
                className={`${notification.eventAction === "Expired"
                  ? "bg-red-50 text-red-600 border-red-200"
                  : "bg-blue-50 text-blue-600 border-blue-200"
                  }`}
              >
                {notification.eventType}
              </Badge>

              {!notification.read && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={handleMarkAsRead}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Mark as read
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

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

  useEffect(() => {
    let filtered = notifications;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (notification) =>
          notification.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          notification.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus === "unread") {
      filtered = filtered.filter((notification) => !notification.read);
    } else if (filterStatus === "read") {
      filtered = filtered.filter((notification) => notification.read);
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchQuery, filterStatus]);

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

  const unreadCount = notifications.filter((note) => !note.read).length;

  return (
    <div className="container mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold">
                Notifications
                <Bell className="inline mx-2 h-6 w-6 text-primary" />
              </h1>
              <p className="text-muted-foreground">
                Stay updated with your latest activities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {unreadCount} unread
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchNotifications}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || loading}
            >
              Mark all read
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All notifications</SelectItem>
              <SelectItem value="unread">Unread only</SelectItem>
              <SelectItem value="read">Read only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator className="mb-8" />

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Spinner />
            {/* <p className="text-muted-foreground">Loading notifications...</p> */}
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600 mb-4">{error}</p>
            <Button variant="outline" onClick={fetchNotifications}>
              Try Again
            </Button>
          </div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <BellOff className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery || filterStatus !== "all"
                ? "No matching notifications"
                : "No notifications yet"}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria"
                : "You're all caught up! Check back later for new notifications"}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
            />
          ))}
        </div>
      )}

      {/* Footer info */}
      {filteredNotifications.length > 0 && (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Showing {filteredNotifications.length} of {notifications.length}{" "}
          notifications
        </div>
      )}
    </div>
  );
}
