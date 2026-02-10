import { useTransfer, STATUS } from "../contexts/TransferContext"
import RequestList from "../components/RequestList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClipboardList, CheckCircle, Truck, Clock } from "lucide-react"

export default function Dashboard() {
  const { transferRequests, currentUser } = useTransfer()

  // Calculate statistics
  const stats = {
    total: transferRequests.length,
    approved: transferRequests.filter((r) => r.status === STATUS.APPROVED || r.status === STATUS.IN_TRANSIT).length,
    rejected: transferRequests.filter((r) => r.status === STATUS.REJECTED).length,
    completed: transferRequests.filter((r) => r.status === STATUS.RECEIVED).length,
    pending: transferRequests.filter(
      (r) =>
        r.status === STATUS.PENDING_PM ||
        r.status === STATUS.PENDING_MECHANICAL ||
        r.status === STATUS.AWAITING_SOURCE_PM,
    ).length,
  }

  // Count requests requiring action from current user
  const pendingApproval = transferRequests.filter((req) => {
    if (currentUser.role === "Project Manager") {
      return (
        (req.status === STATUS.PENDING_PM && req.requestingSiteId === currentUser.siteId) ||
        (req.status === STATUS.AWAITING_SOURCE_PM && req.sourceSiteId === currentUser.siteId)
      )
    } else if (currentUser.role === "Mechanical Head") {
      return req.status === STATUS.PENDING_MECHANICAL
    }
    return false
  }).length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All machine transfer requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval or assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Approved and in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Truck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Machines successfully transferred</p>
          </CardContent>
        </Card>
      </div>

      {pendingApproval > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <p className="font-medium">
                You have {pendingApproval} request{pendingApproval !== 1 ? "s" : ""} requiring your attention
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Transfer Requests</h2>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="my-requests">My Site</TabsTrigger>
            <TabsTrigger value="pending-approval">Pending Approval</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="all" className="mt-4">
          <RequestList />
        </TabsContent>
        <TabsContent value="my-requests" className="mt-4">
          <RequestList filter="my-requests" />
        </TabsContent>
        <TabsContent value="pending-approval" className="mt-4">
          <RequestList filter="pending-approval" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

