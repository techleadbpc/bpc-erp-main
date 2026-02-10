import { useTransfer, STATUS } from "../contexts/TransferContext"
import RequestList from "../components/RequestList"
import { Card, CardContent } from "@/components/ui/card"
import { CheckSquare } from "lucide-react"

export default function ApprovalPage() {
  const { transferRequests, currentUser } = useTransfer()

  // Filter requests that need approval from the current user
  const pendingRequests = transferRequests.filter((req) => {
    if (currentUser.role === "Project Manager") {
      return (
        (req.status === STATUS.PENDING_PM && req.requestingSiteId === currentUser.siteId) ||
        (req.status === STATUS.AWAITING_SOURCE_PM && req.sourceSiteId === currentUser.siteId)
      )
    } else if (currentUser.role === "Mechanical Head") {
      return req.status === STATUS.PENDING_MECHANICAL
    }
    return false
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <CheckSquare className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Pending Approvals</h1>
      </div>

      {pendingRequests.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6 text-muted-foreground">
              No requests pending your approval at this time.
            </div>
          </CardContent>
        </Card>
      ) : (
        <RequestList filter="pending-approval" />
      )}
    </div>
  )
}

