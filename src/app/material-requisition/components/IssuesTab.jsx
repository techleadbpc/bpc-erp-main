import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, Eye, Package, XCircle, List } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

const IssuesTab = ({
  requisition,
  navigate,
  userRoleLevel,
  handleIssueApproval,
  handleIssueRejection,
  approvingIssue,
  getIssueStatusBadge,
  getUnitName
}) => {
  const [selectedIssueItems, setSelectedIssueItems] = useState(null);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Material Issues ({requisition.materialIssues?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requisition.materialIssues && requisition.materialIssues.length > 0 ? (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold">Issue Number</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">From / To Site</TableHead>
                  <TableHead className="font-semibold">Items</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requisition.materialIssues.map((issue) => (
                  <TableRow key={issue.id} className="hover:bg-gray-50/50">
                    <TableCell className="font-medium">
                      {issue.issueNumber}
                    </TableCell>
                    <TableCell>
                      {new Date(issue.issueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{issue.issueType}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="text-gray-600">From: {issue.fromSite?.name || "N/A"}</div>
                        <div className="text-gray-600">To: {issue.toSite?.name || "N/A"}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 h-8"
                        onClick={() => setSelectedIssueItems(issue)}
                      >
                        <List className="h-3 w-3 mr-1" />
                        {issue.items?.length || 0} Items
                      </Button>
                    </TableCell>
                    <TableCell>{getIssueStatusBadge(issue?.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {issue?.status.toLowerCase() === "pending" &&
                          userRoleLevel.role === "admin" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleIssueApproval(issue.id)}
                                disabled={approvingIssue}
                                title="Approve"
                                className="h-8 w-8 p-0 border-green-500 text-green-600 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleIssueRejection(issue.id)}
                                disabled={approvingIssue}
                                title="Reject"
                                className="h-8 w-8 p-0 border-red-500 text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        <Button
                          size="sm"
                          variant="outline"
                          title="View Details"
                          className="h-8 w-8 p-0"
                          onClick={() => navigate(`/issues/${issue.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No material issues found</p>
            <p className="text-sm text-gray-400">
              Material issues will appear here once created
            </p>
          </div>
        )}

        {/* Items Dialog */}
        <Dialog open={!!selectedIssueItems} onOpenChange={(open) => !open && setSelectedIssueItems(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Items for {selectedIssueItems?.issueNumber}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <div className="rounded-md border max-h-[60vh] overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-white">
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Issue To</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedIssueItems?.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.Item?.name || "N/A"}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {item.quantity}
                        </TableCell>
                        <TableCell>
                          {getUnitName(item.Item?.unitId)}
                        </TableCell>
                        <TableCell>{item.issueTo || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default IssuesTab;
