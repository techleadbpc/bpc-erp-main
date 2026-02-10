import { Link } from "react-router"
import { useTransfer } from "../contexts/TransferContext"
import StatusBadge from "./StatusBadge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

export default function RequestList({ filter = null }) {
  const { transferRequests, sites, machines, currentUser } = useTransfer()

  // Filter requests based on the filter prop
  const filteredRequests = transferRequests.filter((req) => {
    if (!filter) return true

    switch (filter) {
      case "my-requests":
        return req.requestingSiteId === currentUser.siteId
      case "pending-approval":
        if (currentUser.role === "Project Manager") {
          // PM sees requests from their site or source site requests assigned to them
          return (
            (req.status === "Pending PM Approval" && req.requestingSiteId === currentUser.siteId) ||
            (req.status === "Awaiting Source PM" && req.sourceSiteId === currentUser.siteId)
          )
        } else if (currentUser.role === "Mechanical Head") {
          // Mechanical head sees requests pending their approval
          return req.status === "Pending Mechanical Approval"
        }
        return false
      default:
        return true
    }
  })

  // Sort by most recent first
  const sortedRequests = [...filteredRequests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  if (sortedRequests.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-6 text-muted-foreground">No transfer requests found.</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Requesting Site</TableHead>
              <TableHead>Machine Type</TableHead>
              <TableHead>Source Site</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRequests.map((request) => {
              const requestingSite = sites.find((s) => s.id === request.requestingSiteId)
              const sourceSite = sites.find((s) => s.id === request.sourceSiteId)
              const machine = machines.find((m) => m.id === request.machineId)

              return (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.id.slice(-4)}</TableCell>
                  <TableCell>{requestingSite?.name || "N/A"}</TableCell>
                  <TableCell>{request.machineType || machine?.type || "N/A"}</TableCell>
                  <TableCell>{sourceSite?.name || "Not Assigned"}</TableCell>
                  <TableCell>
                    <StatusBadge status={request.status} />
                  </TableCell>
                  <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Link to={`/request/${request.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

