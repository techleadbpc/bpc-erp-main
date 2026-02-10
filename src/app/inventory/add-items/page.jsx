import { Button } from "@/components/ui/button"
import InventoryItemForm from "./inventory-item-add-form"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router"

export default function AddInventoryItems() {
    const nav = useNavigate();
    return (
        <div className="container mx-auto">
            <div className="max-w-4xl mx-autos">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold gap-2 flex">
                        <span>
                            <Button variant="ghost" size="sm" onClick={() => nav("/inventory")}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </span>
                        Inventory Management</h1>
                    <p className="text-muted-foreground mt-2">Add and manage inventory items across different sites</p>
                </div>

                <InventoryItemForm />
            </div>
        </div>
    )
}
