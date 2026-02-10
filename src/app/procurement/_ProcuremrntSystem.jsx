import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Eye,
  Calendar,
  DollarSign,
  Package,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
  Trash2,
  Edit,
  ArrowLeft,
  Download,
  Clock,
  Truck,
  Filter,
  MoreVertical,
  Building,
  Phone,
  Mail,
  MapPin,
  FileBarChart,
  PlusCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUserRoleLevel } from '@/utils/roles';

const ProcurementSystem = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list', 'details', 'form'
  const [selectedProcurement, setSelectedProcurement] = useState(null);
  const [procurements, setProcurements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  // Mock data
  useEffect(() => {
    const mockProcurements = [
      {
        id: 1,
        procurementNo: 'PO-2025-001',
        requisitionNo: 'REQ-2025-001',
        vendor: {
          id: 1,
          name: 'ABC Supplies',
          email: 'contact@abcsupplies.com',
          contact: '+91-9876543210',
          address: '123 Business Street, Mumbai, Maharashtra 400001',
          gstNumber: '27ABCDE1234F1Z5'
        },
        site: 'Main Office',
        status: 'Pending',
        totalAmount: 33000,
        createdAt: '2025-01-15T10:30:00Z',
        expectedDelivery: '2025-01-25',
        actualDelivery: null,
        notes: 'Urgent requirement for office setup',
        items: [
          { id: 1, name: 'Office Chair', partNumber: 'OFC-001', quantity: 10, rate: 2500, amount: 25000 },
          { id: 2, name: 'Desk Lamp', partNumber: 'DL-001', quantity: 10, rate: 800, amount: 8000 }
        ],
        createdBy: 'John Doe',
        approvedBy: null,
        approvedAt: null
      },
      {
        id: 2,
        procurementNo: 'PO-2025-002',
        requisitionNo: 'REQ-2025-002',
        vendor: {
          id: 2,
          name: 'XYZ Electronics',
          email: 'info@xyzelec.com',
          contact: '+91-9876543211',
          address: '456 Tech Park, Bangalore, Karnataka 560001',
          gstNumber: '29XYZAB5678G1H9'
        },
        site: 'Branch Office',
        status: 'Approved',
        totalAmount: 3000,
        createdAt: '2025-01-16T14:20:00Z',
        expectedDelivery: '2025-01-28',
        actualDelivery: null,
        notes: 'Regular stationery order',
        items: [
          { id: 3, name: 'Printer Paper', partNumber: 'PP-001', quantity: 100, rate: 30, amount: 3000 }
        ],
        createdBy: 'Jane Smith',
        approvedBy: 'Admin User',
        approvedAt: '2025-01-16T15:30:00Z'
      },
      {
        id: 3,
        procurementNo: 'PO-2025-003',
        requisitionNo: 'REQ-2025-003',
        vendor: {
          id: 1,
          name: 'ABC Supplies',
          email: 'contact@abcsupplies.com',
          contact: '+91-9876543210',
          address: '123 Business Street, Mumbai, Maharashtra 400001',
          gstNumber: '27ABCDE1234F1Z5'
        },
        site: 'Main Office',
        status: 'Delivered',
        totalAmount: 15000,
        createdAt: '2025-01-10T09:15:00Z',
        expectedDelivery: '2025-01-20',
        actualDelivery: '2025-01-19',
        notes: 'Delivered ahead of schedule',
        items: [
          { id: 4, name: 'Whiteboard', partNumber: 'WB-001', quantity: 5, rate: 3000, amount: 15000 }
        ],
        createdBy: 'Mike Johnson',
        approvedBy: 'Admin User',
        approvedAt: '2025-01-10T10:00:00Z'
      }
    ];

    setProcurements(mockProcurements);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-blue-100 text-blue-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock className="h-4 w-4" />;
      case 'Approved': return <CheckCircle className="h-4 w-4" />;
      case 'Delivered': return <Truck className="h-4 w-4" />;
      case 'Cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredProcurements = procurements.filter(procurement => {
    const matchesSearch = procurement.procurementNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      procurement.requisitionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      procurement.vendor.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || procurement.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (procurement) => {
    setSelectedProcurement(procurement);
    setCurrentView('details');
  };

  const handleStatusUpdate = (procurementId, newStatus) => {
    setProcurements(prev => prev.map(p =>
      p.id === procurementId
        ? { ...p, status: newStatus, approvedAt: newStatus === 'Approved' ? new Date().toISOString() : p.approvedAt }
        : p
    ));

    if (selectedProcurement && selectedProcurement.id === procurementId) {
      setSelectedProcurement(prev => ({
        ...prev,
        status: newStatus,
        approvedAt: newStatus === 'Approved' ? new Date().toISOString() : prev.approvedAt
      }));
    }
  };

  // Procurement List Component
  const ProcurementList = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Procurement Orders</h1>
        {[2, 3].includes(useUserRoleLevel().roleId) && (
          <Button onClick={() => setCurrentView('form')}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Procurement
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by PO number, requisition, or vendor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Procurement List */}
      <div className="grid gap-4">
        {filteredProcurements.map((procurement) => (
          <Card key={procurement.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{procurement.procurementNo}</h3>
                    <Badge className={getStatusColor(procurement.status)}>
                      {getStatusIcon(procurement.status)}
                      <span className="ml-1">{procurement.status}</span>
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Requisition</p>
                      <p className="font-medium">{procurement.requisitionNo}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Vendor</p>
                      <p className="font-medium">{procurement.vendor.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Site</p>
                      <p className="font-medium">{procurement.site}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Amount</p>
                      <p className="font-medium text-lg">₹{procurement.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Expected: {new Date(procurement.expectedDelivery).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>Created by: {procurement.createdBy}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      <span>{procurement.items.length} items</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(procurement)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {procurement.status === 'Pending' && (
                        <DropdownMenuItem onClick={() => handleStatusUpdate(procurement.id, 'Approved')}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </DropdownMenuItem>
                      )}
                      {procurement.status === 'Approved' && (
                        <DropdownMenuItem onClick={() => handleStatusUpdate(procurement.id, 'Delivered')}>
                          <Truck className="h-4 w-4 mr-2" />
                          Mark as Delivered
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProcurements.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No procurement orders found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Procurement Details Component
  const ProcurementDetails = ({ procurement }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentView('list')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
          <h1 className="text-3xl font-bold">{procurement.procurementNo}</h1>
          <Badge className={getStatusColor(procurement.status)}>
            {getStatusIcon(procurement.status)}
            <span className="ml-1">{procurement.status}</span>
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {procurement.status === 'Pending' && (
                <DropdownMenuItem onClick={() => handleStatusUpdate(procurement.id, 'Approved')}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </DropdownMenuItem>
              )}
              {procurement.status === 'Approved' && (
                <DropdownMenuItem onClick={() => handleStatusUpdate(procurement.id, 'Delivered')}>
                  <Truck className="h-4 w-4 mr-2" />
                  Mark as Delivered
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Cancel Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Procurement No.</Label>
                  <p className="text-lg font-semibold">{procurement.procurementNo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Requisition No.</Label>
                  <p className="text-lg font-semibold">{procurement.requisitionNo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Site</Label>
                  <p>{procurement.site}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Total Amount</Label>
                  <p className="text-2xl font-bold text-green-600">₹{procurement.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Created Date</Label>
                  <p>{new Date(procurement.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Expected Delivery</Label>
                  <p>{new Date(procurement.expectedDelivery).toLocaleDateString()}</p>
                </div>
                {procurement.actualDelivery && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Actual Delivery</Label>
                    <p>{new Date(procurement.actualDelivery).toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-gray-600">Created By</Label>
                  <p>{procurement.createdBy}</p>
                </div>
                {procurement.approvedBy && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Approved By</Label>
                    <p>{procurement.approvedBy}</p>
                  </div>
                )}
              </div>

              {procurement.notes && (
                <div className="mt-4">
                  <Label className="text-sm font-medium text-gray-600">Notes</Label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-md">{procurement.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Items ({procurement.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center font-medium bg-gray-50 p-4 border-b">
                    <div className="flex-1">Item Name</div>
                    <div className="w-32">Part Number</div>
                    <div className="w-20">Quantity</div>
                    <div className="w-24">Rate</div>
                    <div className="w-24">Amount</div>
                  </div>
                  {procurement.items.map((item) => (
                    <div key={item.id} className="flex items-center p-4 border-b last:border-b-0">
                      <div className="flex-1 font-medium">{item.name}</div>
                      <div className="w-32 text-gray-600">{item.partNumber}</div>
                      <div className="w-20">{item.quantity}</div>
                      <div className="w-24">₹{item.rate.toLocaleString()}</div>
                      <div className="w-24 font-semibold">₹{item.amount.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <div className="text-right">
                  <p className="text-xl font-bold">
                    Total: ₹{procurement.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Vendor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Vendor Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-lg">{procurement.vendor.name}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{procurement.vendor.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{procurement.vendor.contact}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <span>{procurement.vendor.address}</span>
                </div>
                {procurement.vendor.gstNumber && (
                  <div>
                    <p className="text-sm text-gray-600">GST Number</p>
                    <p className="font-mono text-sm">{procurement.vendor.gstNumber}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Status Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Created</p>
                    <p className="text-sm text-gray-600">
                      {new Date(procurement.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {procurement.approvedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Approved</p>
                      <p className="text-sm text-gray-600">
                        {new Date(procurement.approvedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {procurement.actualDelivery && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Truck className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Delivered</p>
                      <p className="text-sm text-gray-600">
                        {new Date(procurement.actualDelivery).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  // Procurement Form Component (simplified version)
  const ProcurementForm = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentView('list')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
          <h1 className="text-3xl font-bold">Create New Procurement</h1>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-600 py-8">
            Procurement form component would go here.
            <br />
            This would be your existing ProcurementForm component.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  // Main render based on current view
  const renderView = () => {
    switch (currentView) {
      case 'details':
        return <ProcurementDetails procurement={selectedProcurement} />;
      case 'form':
        return <ProcurementForm />;
      default:
        return <ProcurementList />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {renderView()}
    </div>
  );
};

export default ProcurementSystem;