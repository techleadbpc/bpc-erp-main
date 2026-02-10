import { DashboardPage } from "@/app/dashboard/page";
import ForbiddenPage from "@/app/error/403/page";
import NotFoundPage from "@/app/error/404/page";
import AddInventoryItems from "@/app/inventory/add-items/page";
import MaterialDetails from "@/app/inventory/material-details/page";
import InventoryList from "@/app/inventory/page";
import AppLayout from "@/app/layout/page";
import { LogbookPage } from "@/app/logbook/page";
import AddMachineCategory from "@/app/machine-category/add-machine-category/add-machine-category";
import MachineCategoryPage from "@/app/machine-category/machine-category-table/page";
import TransferHistoryPage from "@/app/machine-transfer/history/page";
import NewTransferPage from "@/app/machine-transfer/new/page";
import AddMachine from "@/app/machine/add-machine/page";
import MachineryDetailPage from "@/app/machine/machine-details-page/machine-details-page";
import MachineEditPage from "@/app/machine/machine-edit/page";
import MachineTable from "@/app/machine/machine-table/page";
import MaintenanceLogPage from "@/app/maintenance-log/MaintenanceLogPage";
import MaterialIssueDetails from "@/app/material-issue/MaterialIssueDetails";
import MaterialIssueList from "@/app/material-issue/MaterialIssueList.";
import MaterialIssueForm from "@/app/material-issue/MatrialIssueForm";
import ItemForm from "@/app/items-and-units/ItemForm";
import ItemGroupForm from "@/app/items-and-units/ItemGroupForm";
import ItemGroupList from "@/app/items-and-units/ItemGroupList";
import ItemList from "@/app/items-and-units/ItemList";
import MaterialRequisitionForm from "@/app/material-requisition/pages/MaterialRequisitionForm";
import MaterialRequisitionList from "@/app/material-requisition/pages/MaterialRequisitionList";
import MaterialRequisitionView from "@/app/material-requisition/pages/MaterialRequisitionView";
import UnitForm from "@/app/items-and-units/UnitForm";
import UnitList from "@/app/items-and-units/UnitList";
import Notification from "@/app/notifications/page";
import ProcurementDetails from "@/app/procurement/ProcurementDetails";
import ProcurementForm from "@/app/procurement/ProcurementForm";
import ProcurementList from "@/app/procurement/ProcurmentList";
import ProfilePage from "@/app/profile/page";
import ManageSite from "@/app/sites/manage-site/page";
import SiteDetailPage from "@/app/sites/site-detail-page/site-detail-page";
import ManageUsers from "@/app/users/manage-users/manage-users";
import VendorTable from "@/app/vendor/vendor-page";
import VirtualSitePage from "@/app/virtual-site/page";
import QuotationComparisonPage from "@/app/quotation-comparison/page";
import QuotationComparisonList from "@/app/quotation-comparison/list";
import { LogbookDetails } from "@/components/logbook/logbook-details";
import { LogbookForm } from "@/components/logbook/logbook-form";
import TransferDetailPage from "@/components/machine-transfer/page";
import { fetchItemGroups } from "@/features/item-groups/item-groups-slice";
import { fetchItems } from "@/features/items/items-slice";
import { fetchMachineCategories } from "@/features/machine-category/machine-category-slice";
import { fetchMachines } from "@/features/machine/machine-slice";
import { fetchPrimaryCategories } from "@/features/primary-category/primary-category-slice";
import { fetchSites } from "@/features/sites/sites-slice";
import { fetchUnits } from "@/features/units/units-slice";
import ProtectedRoute from "@/router/protected-route";
import { ROLES } from "@/utils/roles";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, Routes, useNavigate } from "react-router";
import MaintenanceLogFormPage from "@/app/maintenance-log/MaintenanceLogFormPage";
import MaintenanceLogDetailsPage from "@/app/maintenance-log/MaintenanceLogDetailsPage";
import IncomingDispatchesPage from "@/app/inventory/incoming-dispatches/page";
// import StockLogsPage from "@/app/inventory/stock-logs/page";

function AppRouter() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    dispatch(fetchSites());
    // dispatch(fetchCategories());
    dispatch(fetchMachineCategories());
    // dispatch(fetchMachines());
    dispatch(fetchPrimaryCategories());
    dispatch(fetchItems());
    dispatch(fetchItemGroups());
    dispatch(fetchUnits());
  }, [dispatch]);

  return (
    <Routes>
      {/* Routes WITH AppLayout */}
      <Route
        element={<AppLayout />} // Wrap these routes in layout
      >
        <Route path="/" element={<DashboardPage />} />

        {/* Site Management */}
        <Route
          path="/manage-sites"
          element={
            <ProtectedRoute
              element={<ManageSite />}
              allowedRoleIds={[
                ROLES.ADMIN.id,
                ROLES.MECHANICAL_HEAD.id,
                ROLES.MECHANICAL_MANAGER.id,
              ]}
            />
          }
        />
        <Route
          path="/sites/:id"
          element={
            <ProtectedRoute
              element={<SiteDetailPage />}
              allowedRoleIds={[
                ROLES.ADMIN.id,
                ROLES.MECHANICAL_HEAD.id,
                ROLES.MECHANICAL_MANAGER.id,
              ]}
            />
          }
        />
        {/* Site Management End*/}

        {/* Virtual Site */}
        <Route
          path="/virtual-site"
          element={
            <ProtectedRoute
              element={<VirtualSitePage />}
              allowedRoleIds={[ROLES.ADMIN.id, ROLES.MECHANICAL_HEAD.id,
              ROLES.MECHANICAL_MANAGER.id,]}
            />
          }
        />

        {/* Category Management*/}

        <Route
          path="/machine-category/add"
          element={
            <ProtectedRoute
              element={<AddMachineCategory />}
              allowedRoleIds={[
                ROLES.ADMIN.id,
                ROLES.MECHANICAL_HEAD.id,
                ROLES.MECHANICAL_MANAGER.id,
              ]}
            />
          }
        />
        <Route
          path="/machine-category/update"
          element={
            <ProtectedRoute
              element={<AddMachineCategory />}
              allowedRoleIds={[
                ROLES.ADMIN.id,
                ROLES.MECHANICAL_HEAD.id,
                ROLES.MECHANICAL_MANAGER.id,
              ]}
            />
          }
        />
        <Route path="/machine-category" element={<MachineCategoryPage />} />
        {/* Category Management End*/}

        {/* Machines Management */}
        <Route
          path="/machine/add"
          element={
            <ProtectedRoute
              element={<AddMachine />}
              allowedRoleIds={[
                ROLES.ADMIN.id,
                ROLES.MECHANICAL_HEAD.id,
                ROLES.MECHANICAL_MANAGER.id,
              ]}
            />
          }
        />
        <Route path="/machine" element={<MachineTable />} />
        <Route path="/machine/:id" element={<MachineryDetailPage />} />
        <Route path="/machine/edit/:id" element={<MachineEditPage />} />
        <Route path="/machine/:id/logs" element={<MaintenanceLogPage />} />
        <Route path="/machine/:id/logs/new" element={<MaintenanceLogFormPage />} />
        <Route path="/machine/:machineId/logs/:id" element={<MaintenanceLogDetailsPage />} />
        {/* Machines Management End*/}

        {/* Logbook */}
        <Route path="/logbook" element={<LogbookPage />} />
        <Route path="/logbook/:id" element={<LogbookDetails />} />
        <Route
          path="/add-logbook"
          element={
            <ProtectedRoute
              element={<LogbookForm />}
              allowedRoleIds={[
                ROLES.MECHANICAL_STORE_MANAGER.id,
                ROLES.MECHANICAL_INCHARGE.id,
                ROLES.PROJECT_MANAGER.id,
              ]}
            />
          }
        />
        {/* Logbook End*/}

        {/* Machine Transfer */}
        <Route
          path="/machine-transfer/new"
          element={
            <ProtectedRoute
              element={<NewTransferPage />}
              allowedRoleIds={[
                ROLES.MECHANICAL_STORE_MANAGER.id,
                ROLES.MECHANICAL_INCHARGE.id,
                ROLES.PROJECT_MANAGER.id,
              ]}
            />
          }
        />
        <Route path="/machine-transfer/:id" element={<TransferDetailPage />} />

        <Route path="/machine-transfer" element={<TransferHistoryPage />} />
        {/* Machine Transfer End */}
        <Route path="/item-groups" element={<ItemGroupList />} />
        <Route path="/item-groups/new" element={<ItemGroupForm />} />
        <Route path="/item-groups/edit/:id" element={<ItemGroupForm />} />
        <Route path="/items" element={<ItemList />} />
        <Route path="/items/new" element={<ItemForm />} />
        <Route path="/items/edit/:id" element={<ItemForm />} />
        <Route path="/units" element={<UnitList />} />
        <Route path="/units/new" element={<UnitForm />} />
        <Route path="/units/edit/:id" element={<UnitForm />} />
        {/* Spare Parts ans Items End*/}

        {/* Material Requisition */}
        <Route path="/requisitions" element={<MaterialRequisitionList />} />
        <Route path="/requisitions/new" element={<MaterialRequisitionForm />} />
        <Route path="/requisitions/:id" element={<MaterialRequisitionView />} />
        {/* Material Requisition End*/}

        {/* Inventory */}
        <Route path="/inventory" element={<InventoryList />} />
        <Route path="/inventory/add" element={<AddInventoryItems />} />
        <Route path="/inventory/:id" element={<MaterialDetails />} />
        <Route path="/inventory-incoming" element={<IncomingDispatchesPage />} />
        {/* <Route path="/inventory/stock-logs" element={<StockLogsPage />} /> */}
        {/* Inventory End*/}

        {/* Material Issue */}
        <Route path="/issues" element={<MaterialIssueList />} />
        <Route path="/issues/:id" element={<MaterialIssueDetails />} />
        <Route path="/issues/new" element={<MaterialIssueForm />} />
        {/* Material Issue End*/}

        {/* Procurements */}
        <Route path="/procurements" element={<ProcurementList />} />
        <Route path="/procurements/:id" element={<ProcurementDetails />} />
        <Route path="/procure/:requisitionId" element={<ProcurementForm />} />
        <Route path="/quotation-comparison" element={<QuotationComparisonList />} />
        <Route
          path="/quotation-comparison/:id"
          element={
            <ProtectedRoute
              element={<QuotationComparisonPage />}
              allowedRoleIds={[
                ROLES.ADMIN.id,
                ROLES.MECHANICAL_HEAD.id,
                ROLES.MECHANICAL_MANAGER.id,
                ROLES.MECHANICAL_STORE_MANAGER.id,
                ROLES.PROJECT_MANAGER.id,
              ]}
            />
          }
        />

        {/* Invoices */}
        {/* <Route path="/invoice/:procurementId" element={<InvoiceForm />} />
        <Route path="/payments" element={<PaymentList />} />
        <Route path="/payment/:id" element={<PaymentSlipForm />} />
        <Route path="/payment/invoice/:id" element={<PaymentSlipForm />} /> */}

        {/* Notifications & Account*/}
        <Route path="/notifications" element={<Notification />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Users Management */}
        <Route
          path="/manage-users"
          element={
            <ProtectedRoute
              element={<ManageUsers />}
              allowedRoleIds={[
                ROLES.ADMIN.id,
                ROLES.MECHANICAL_HEAD.id,
                ROLES.MECHANICAL_MANAGER.id,
              ]}
            />
          }
        />
        <Route
          path="/vendors"
          element={
            <ProtectedRoute
              element={<VendorTable />}
              allowedRoleIds={[
                ROLES.ADMIN.id,
                ROLES.MECHANICAL_HEAD.id,
                ROLES.MECHANICAL_MANAGER.id,
              ]}
            />
          }
        />
      </Route>

      {/* Routes WITHOUT Layout */}
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRouter;
