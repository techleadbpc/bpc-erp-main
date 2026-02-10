"use client";

import { useState } from "react";
import { Link } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search } from "lucide-react";

// Mock data for demonstration - replace with your API calls
const mockTransfers = [
  {
    id: "TR-001",
    machineName: "Excavator XL2000",
    fromSite: "Site A",
    toSite: "Site B",
    transferDate: "2023-10-15",
    status: "Pending",
    type: "site_transfer",
  },
  {
    id: "TR-002",
    machineName: "Bulldozer B500",
    fromSite: "Site C",
    toSite: "Site A",
    transferDate: "2023-10-12",
    status: "Approved",
    type: "site_transfer",
  },
  {
    id: "TR-003",
    machineName: "Crane CR300",
    fromSite: "Site B",
    toSite: "Site D",
    transferDate: "2023-10-10",
    status: "Dispatched",
    type: "site_transfer",
  },
  {
    id: "TR-004",
    machineName: "Loader L100",
    fromSite: "Site A",
    toSite: "Site C",
    transferDate: "2023-10-05",
    status: "Received",
    type: "site_transfer",
  },
  {
    id: "TR-005",
    machineName: "Excavator XL1000",
    fromSite: "Site D",
    toSite: "Site B",
    transferDate: "2023-10-01",
    status: "Pending",
    type: "site_transfer",
  },
  {
    id: "TR-006",
    machineName: "Forklift F200",
    fromSite: "Site A",
    toSite: "N/A",
    transferDate: "2023-10-18",
    status: "Pending",
    type: "sell",
    buyerName: "ABC Construction",
  },
  {
    id: "TR-007",
    machineName: "Compactor C100",
    fromSite: "Site C",
    toSite: "N/A",
    transferDate: "2023-10-16",
    status: "Approved",
    type: "scrap",
    scrapVendor: "XYZ Recycling",
  },
];

// Mock data for filters - replace with your data
const sites = ["All Sites", "Site A", "Site B", "Site C", "Site D"];
const machines = [
  "All Machines",
  "Excavator XL2000",
  "Bulldozer B500",
  "Crane CR300",
  "Loader L100",
  "Excavator XL1000",
];
const statuses = [
  "All Statuses",
  "Pending",
  "Approved",
  "Dispatched",
  "Received",
  "Sold",
  "Scrapped",
];
const transferTypes = ["All Types", "Site Transfer", "Sell", "Scrap"];

export function TransferList({ baseUrl = "/machine-transfer" }) {
  const [transfers, setTransfers] = useState(mockTransfers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [siteFilter, setSiteFilter] = useState("All Sites");
  const [machineFilter, setMachineFilter] = useState("All Machines");
  const [typeFilter, setTypeFilter] = useState("All Types");

  // Filter function
  const filteredTransfers = transfers.filter((transfer) => {
    const matchesSearch =
      transfer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.machineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.fromSite.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transfer.toSite &&
        transfer.toSite.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "All Statuses" || transfer.status === statusFilter;
    const matchesSite =
      siteFilter === "All Sites" ||
      transfer.fromSite === siteFilter ||
      (transfer.toSite && transfer.toSite === siteFilter);
    const matchesMachine =
      machineFilter === "All Machines" ||
      transfer.machineName === machineFilter;

    let matchesType = true;
    if (typeFilter !== "All Types") {
      if (typeFilter === "Site Transfer" && transfer.type !== "site_transfer")
        matchesType = false;
      if (typeFilter === "Sell" && transfer.type !== "sell")
        matchesType = false;
      if (typeFilter === "Scrap" && transfer.type !== "scrap")
        matchesType = false;
    }

    return (
      matchesSearch &&
      matchesStatus &&
      matchesSite &&
      matchesMachine &&
      matchesType
    );
  });

  // Status badge color function
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "Approved":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "Dispatched":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "Received":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Sold":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100";
      case "Scrapped":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search transfers..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Link to={`${baseUrl}/new`}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Transfer
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Select value={siteFilter} onValueChange={setSiteFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by site" />
            </SelectTrigger>
            <SelectContent>
              {sites.map((site) => (
                <SelectItem key={site} value={site}>
                  {site}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Select value={machineFilter} onValueChange={setMachineFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by machine" />
            </SelectTrigger>
            <SelectContent>
              {machines.map((machine) => (
                <SelectItem key={machine} value={machine}>
                  {machine}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {transferTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transfer ID</TableHead>
              <TableHead>Machine Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>From → To</TableHead>
              <TableHead>Transfer Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransfers.length > 0 ? (
              filteredTransfers.map((transfer) => (
                <TableRow key={transfer.id}>
                  <TableCell className="font-medium">{transfer.id}</TableCell>
                  <TableCell>{transfer.machineName}</TableCell>
                  <TableCell>
                    {transfer.type === "site_transfer"
                      ? "Site Transfer"
                      : transfer.type === "sell"
                      ? "Sell"
                      : "Scrap"}
                  </TableCell>
                  <TableCell>
                    {transfer.fromSite} →{" "}
                    {transfer.type === "site_transfer"
                      ? transfer.toSite
                      : transfer.type === "sell"
                      ? transfer.buyerName || "Buyer"
                      : transfer.scrapVendor || "Scrap"}
                  </TableCell>
                  <TableCell>{transfer.transferDate}</TableCell>
                  <TableCell>
                    <Badge
                      className={getStatusColor(transfer.status)}
                      variant="outline"
                    >
                      {transfer.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No transfers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
