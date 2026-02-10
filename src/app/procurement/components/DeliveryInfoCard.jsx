import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "lucide-react";

const DeliveryInfoCard = ({ formData, setFormData }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Delivery & Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expectedDelivery">Expected Delivery Date</Label>
            <Input
              id="expectedDelivery"
              type="date"
              value={formData.expectedDelivery}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  expectedDelivery: e.target.value,
                }))
              }
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Additional notes or requirements"
              rows={3}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryInfoCard;
