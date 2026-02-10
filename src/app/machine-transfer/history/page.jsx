import { TransferHistory } from "@/components/machine-transfer/transfer-history";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Link } from "react-router";
import { useUserRoleLevel } from "@/utils/roles";
export default function TransferHistoryPage() {
  const role = useUserRoleLevel();
  return (
    <div className="space-y-6">
      {/* <div className="flex justify-between">
        <div className="flex flex-row">
          <h1 className="text-3xl font-bold tracking-tight">
            Transfer Records
          </h1>
          <p className="text-muted-foreground mt-2">
            View list of all machine transfers
          </p>
        </div>
        {role.role == "site" && (
          <div>
            <Link to={`/machine-transfer/new`}>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Transfer
              </Button>
            </Link>
          </div>
        )}
      </div> */}
      <TransferHistory />
    </div>
  );
}
