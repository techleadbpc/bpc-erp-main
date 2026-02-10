
import {
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle,
} from "lucide-react";

export const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case "active":
        case "operational":
        case "completed":
        case "approved":
            return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100";
        case "maintenance":
        case "pending":
        case "in transit":
            return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100";
        case "inactive":
        case "overdue":
        case "rejected":
            return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
        default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
};

export const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
        case "active":
        case "operational":
        case "completed":
        case "approved":
            return <CheckCircle className="w-4 h-4 text-emerald-500" />;
        case "maintenance":
        case "pending":
        case "in transit":
            return <Clock className="w-4 h-4 text-amber-500" />;
        case "inactive":
        case "overdue":
        case "rejected":
            return <XCircle className="w-4 h-4 text-red-500" />;
        default:
            return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
};

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};
