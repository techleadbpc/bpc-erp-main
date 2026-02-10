import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SiteInformationTab({ data }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Site Information</CardTitle>
          <CardDescription>Details about the site</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Site Code
              </p>
              <p className="font-medium">{data.code}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Site ID
              </p>
              <p className="font-medium">#{data.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Created On
              </p>
              <p className="font-medium">
                {new Date(data.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Last Updated
              </p>
              <p className="font-medium">
                {new Date(data.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-lg">Department</CardTitle>
            <CardDescription>Department information</CardDescription>
          </div>
          <Settings className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Department Name
              </p>
              <p className="text-lg font-semibold">{data.Department.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Department ID
              </p>
              <p className="text-lg font-semibold">#{data.Department.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
