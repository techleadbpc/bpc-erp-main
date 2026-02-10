// components/TransferStatusTimeline.jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, XCircle, Truck, Package } from "lucide-react";
import { formatDate } from "../utils/dateUtils";

export default function TransferStatusTimeline({ transfer }) {
  const timelineItems = [
    {
      status: "requested",
      icon: Clock,
      title: "Requested",
      date: transfer.requestedAt,
      user: transfer.requester?.name,
      completed: true,
    },
    {
      status: "approved",
      icon: CheckCircle,
      title: "Approved",
      date: transfer.approvedAt,
      user: transfer.approver?.name,
      remarks: transfer.approveRemarks,
      completed: transfer.status !== "Pending",
      rejected: transfer.status === "Rejected",
    },
    {
      status: "dispatched",
      icon: Truck,
      title: "Dispatched",
      date: transfer.dispatchedAt,
      user: transfer.dispatcher?.name,
      completed: ["Dispatched", "Received"].includes(transfer.status),
    },
    {
      status: "received",
      icon: Package,
      title: "Received",
      date: transfer.receivedAt,
      user: transfer.receiver?.name,
      remarks: transfer.finalRemarks,
      completed: transfer.status === "Received",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timelineItems.map((item, index) => (
            <TimelineItem key={item.status} item={item} isLast={index === timelineItems.length - 1} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TimelineItem({ item, isLast }) {
  const Icon = item.rejected ? XCircle : item.icon;
  const iconColor = item.completed 
    ? (item.rejected ? "text-red-500" : "text-green-500")
    : "text-gray-400";
  const lineColor = item.completed ? "bg-green-500" : "bg-gray-300";

  return (
    <div className="flex items-start gap-3">
      <div className="relative">
        <div className={`rounded-full p-2 ${item.completed ? 'bg-green-100' : 'bg-gray-100'}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        {!isLast && (
          <div className={`absolute top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-8 ${lineColor}`} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium">{item.title}</h4>
        <p className="text-sm text-gray-600">
          {formatDate(item.date)} {item.user && `by ${item.user}`}
        </p>
        {item.remarks && (
          <p className="text-sm text-gray-500 mt-1 italic">"{item.remarks}"</p>
        )}
      </div>
    </div>
  );
}
