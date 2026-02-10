import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/loader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import api from "@/services/api/api-service"
import { MapPin } from "lucide-react"
import { useEffect, useState } from "react"
import { useParams } from "react-router"
import SiteInformationTab from "./tabs/SiteInformationTab"
import MachineryTab from "./tabs/MachineryTab"
import InventoryTab from "./tabs/InventoryTab"
import UsersTab from "./tabs/UsersTab"
import InventoryMovementTab from "./tabs/InventoryMovementTab"
import VirtualSiteSummaryCards from "./tabs/VirtualSiteSummaryCards"
import VirtualSiteProcurementSummary from "./tabs/VirtualSiteProcurementSummary";

export default function SiteDetailPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState()
  const params = useParams()

  useEffect(() => {
    fetchSiteDetails(params.id)
  }, [params])

  const fetchSiteDetails = async (sid) => {
    try {
      setLoading(true)
      const res = await api.get(`/sites/${sid}`)
      setData(res.data)
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  // Check if this is a virtual site
  const isVirtualSite = data?.type === "virtual";

  return (
    <div className="container mx-auto py-2 min-h-screen flex flex-col">
      {loading ? (
        <Spinner />
      ) : (
        <div className="container py-4 px-4">
          {/* Site Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-lg font-bold tracking-tight">{data.name}</h1>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{data.address}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {isVirtualSite && (
                <Badge variant="secondary" className="capitalize">
                  Virtual Site
                </Badge>
              )}
              <Badge variant={data.status === "active" ? "success" : "destructive"} className="capitalize">
                {data.status}
              </Badge>
            </div>
          </div>

          {/* Virtual Site Summary Cards - Only show for virtual sites */}
          {/* {isVirtualSite && (
            <VirtualSiteSummaryCards siteId={data.id} />
          )} */}

          {/* Tabs */}
          <Tabs defaultValue="site-info" className="w-full">
            <TabsList className="grid w-full sm:grid-cols-4 grid-cols-2 gap-2 mb-10">
              <TabsTrigger value="site-info">Site Information</TabsTrigger>
              <TabsTrigger value="machinery">Machinery</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="inventory-movement">Inventory Movement</TabsTrigger>
              {/* {isVirtualSite && <TabsTrigger value="procurement-summary">Procurement Summary</TabsTrigger>} */}
              {/* <TabsTrigger value="users">Users</TabsTrigger> */}
            </TabsList>

            <TabsContent value="site-info" className="mt-6">
              <SiteInformationTab data={data} />
            </TabsContent>

            <TabsContent value="machinery" className="mt-6">
              <MachineryTab machinery={data.Machinery} />
            </TabsContent>

            <TabsContent value="inventory" className="mt-6">
              <InventoryTab siteId={data.id} />
            </TabsContent>

            <TabsContent value="inventory-movement" className="mt-6">
              <InventoryMovementTab siteId={data.id} />
            </TabsContent>

            {isVirtualSite && (
              <TabsContent value="procurement-summary" className="mt-6">
                <VirtualSiteProcurementSummary />
              </TabsContent>
            )}

            <TabsContent value="users" className="mt-6">
              <UsersTab siteId={data.id} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
