import React, { useState, useEffect } from "react";

import Login from "components/pages/Login";
import ChangePassword from "components/pages/ChangePassword";
import Home from "components/pages/Home";

//ppic
import PPICView from "components/pages/ppic/PPICView";
//supplier
import SupplierView from "components/pages/supplier/SupplierView";
//purchasing
import PurchasingView from "components/pages/purchasing/PurchasingView";
//transaction
import TransactionHistoryView from "components/pages/transactions/TransactionHistoryView";

// config
import PermissionsEdit from "components/pages/admin/permissions/PermissionsEdit";

// commodity

// admin
import UserView from "components/pages/admin/users/UserView";

import NotFoundPage from "NotFoundPage";
import SuppliersDataView from "components/pages/ppic/suppliers/SuppliersDataView";
import utils from "utils";

function NoMatch() {
  const userInfo = utils.getUserInfo();
  const [timeLeft, setTimeLeft] = useState(3);

  useEffect(() => {
    if (timeLeft === 0) {
      if (userInfo.role.id === 2) {
        return window.location.replace("/ppic/dashboard");
      } else if (userInfo.role.id === 3) {
        return window.location.replace("/procurement/dashboard");
      } else if (userInfo.role.id === 4) {
        return window.location.replace("/supplier/dashboard");
      }
    }

    if (!timeLeft) return;

    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <NotFoundPage />
    </>
  );
}

const ppicPermission = ["ppic@view", "ppic@create", "ppic@edit", "ppic@delete"];
const supplierPermission = ["supplier@view", "supplier@create", "supplier@edit", "supplier@delete"];
const purchasingPermission = [
  "purchasing@view",
  "purchasing@create",
  "purchasing@edit",
  "purchasing@delete",
];

const adminUserPermission = ["user@view", "user@create", "user@edit", "user@delete"];
const adminSupplierPermission = [
  "supplier@view",
  // "supplier@create",
  // "supplier@edit",
  // "supplier@delete",
];

const adminRoutes = [
  // users
  {
    path: "/admin/users",
    component: UserView,
    // permissions: adminUserPermission,
  },
  {
    path: "/admin/users/create",
    redirectTo: "/admin/users",
  },
  {
    path: "/admin/users/:id/edit",
    redirectTo: "/admin/users",
  },

  // permissions
  {
    path: "/admin/permissions",
    component: PermissionsEdit,
    // permissions: ["role@view", "role@create", "role@edit", "role@delete"],
  },
];

const ppicRoutes = [
  {
    path: "/ppic/dashboard",
    component: PPICView,
    permissions: ppicPermission,
  },
  {
    path: "/ppic/suppliers-data",
    component: SuppliersDataView,
    permissions: ppicPermission,
  },
  {
    path: "/admin/users",
    component: UserView,
    permissions: ppicPermission,
  },
  {
    path: "/admin/users/create",
    redirectTo: "/admin/users",
    permissions: ppicPermission,
  },
  {
    path: "/admin/users/:id/edit",
    redirectTo: "/admin/users",
    permissions: ppicPermission,
  },

  {
    path: "/history",
    component: TransactionHistoryView,
    permissions: ppicPermission,
  },
];

const supplierRoutes = [
  {
    path: "/supplier/dashboard",
    component: SupplierView,
    permissions: supplierPermission,
  },
];

const purchasingRoutes = [
  {
    path: "/procurement/dashboard",
    component: PurchasingView,
    permissions: purchasingPermission,
  },
];

// const configRoutes = [
//   {
//     path: "/config/commodity-fee",
//     component: CommodityFeeConfigPage,
//     permissions: ["config@fee"],
//   },
//   {
//     path: "/config",
//     component: ConfigGeneral,
//     permissions: ["config@view"],
//   },
//   {
//     path: "/config/changelog",
//     component: ConfigChangelog,
//     permissions: ["config@changelog"],
//   },

//   // warehouse
//   {
//     path: "/config/warehouse",
//     component: WarehouseView,
//     permissions: ["config@warehouse"],
//   },

//   // commodity
//   {
//     path: "/config/commodity",
//     component: CommodityView,
//     permissions: ["config@commodity"],
//   },

//   // handover location
//   {
//     path: "/config/handover-location",
//     component: HandoverLocationView,
//     permissions: ["config@handover_location"],
//   },

//   // budget transportir
//   {
//     path: "/config/budget-transportir",
//     component: BudgetTransportirView,
//     permissions: ["config@budget_transportir"],
//   },

//   // shipment budget
//   {
//     path: "/config/shipment-budget",
//     component: ShipmentBudgetView,
//     permissions: ["config@budget_transportir"],
//   },
// ];

// const commodityRoutes = [
//   // suppliers
//   {
//     path: "/suppliers",
//     component: SupplierView,
//     permissions: adminSupplierPermission,
//   },
//   // old supplier path, redirect to new path
//   {
//     path: "/admin/suppliers",
//     redirectTo: "/suppliers",
//   },
//   {
//     path: "/admin/suppliers/create",
//     redirectTo: "/suppliers",
//   },
//   {
//     path: "/admin/suppliers/:id/edit",
//     redirectTo: "/suppliers",
//   },

//   // offers old
//   {
//     path: "/offers_20231013",
//     component: OfferView_20231013,
//     // deprecated: true,
//     permissions: ["offer@view"],
//   },
//   {
//     path: "/offers_20231013/create",
//     component: OfferCreate_20231013,
//     // deprecated: true,
//     permissions: ["offer@create"],
//   },
//   {
//     path: "/offers_20231013/:id/edit",
//     component: OfferEdit_20231013,
//     // deprecated: true,
//     permissions: ["offer@view", "offer@create"],
//   },

//   // offers
//   {
//     path: "/offers",
//     component: OfferView,
//     permissions: ["offer@view"],
//   },
//   {
//     path: "/offers/create",
//     component: OfferCreate,
//     permissions: ["offer@create"],
//   },
//   {
//     path: "/offers/:id/edit",
//     component: OfferEdit,
//     permissions: ["offer@view", "offer@create"],
//   },

//   // history
//   {
//     path: "/history",
//     component: TransactionView,
//     permissions: ["transaction@view"],
//   },

//   {
//     path: "/history/suppliers/:id",
//     component: SupplierTrnHistory,
//     permissions: ["supplier@view", "transaction@view"],
//   },
// ];

// const adminTransportirPermission = [
// "logistic_transportir@view",
// "logistic_transportir@create",
// "logistic_transportir@edit",
// "logistic_transportir@delete",
// ];

// const adminShipPermission = [
// "logistic_transportir_ship@view",
// "logistic_transportir_ship@create",
// "logistic_transportir_ship@edit",
// "logistic_transportir_ship@delete",
// ];

// const logisticRoutes = [
//   {
//     path: "/logistic/dashboard",
//     component: TransportirHome,
//     maintenance: true,
//     permissions: ["logistic@dashboard"],
//   },
//   {
//     path: "/logistic/dashboard_20231013",
//     component: TransportirHome_20231013,
//     deprecated: true,
//     permissions: ["logistic@dashboard"],
//   },

// transportirs
// {
//   path: "/logistic/transportir",
//   component: TransportirView,
//   permissions: adminTransportirPermission,
// },
// {
//   path: "/logistic/transportir/:id/ship",
//   component: TransportirShipView,
//   permissions: adminShipPermission,
// },

// offers
// {
//   path: "/logistic/offers",
//   component: LogisticOfferView,
//   permissions: ["logistic_offer@view"],
// },
// {
//   path: "/logistic/offers_20231013/create",
//   component: LogisticOfferCreate_20231013,
//   permissions: ["logistic_offer@view"],
// },
// {
//   path: "/logistic/offers/create",
//   component: LogisticOfferCreate,
//   permissions: ["logistic_offer@view"],
// },
// {
//   path: "/logistic/history",
//   component: LogisticTransactionView,
//   permissions: ["logistic_transaction@view"],
// },
//   {
//     path: "/logistic/transportir/:transportir_id/ship/:ship_id/history",
//     component: TransportirTrnHistory,
//     permissions: ["logistic_offer@view"],
//   },
// ];

export const routes = [
  {
    path: "/login",
    component: Login,
    public: true,
  },

  // below is authorized
  {
    path: "/change-password",
    component: ChangePassword,
  },
  // { path: "/maintenance", component: MaintenancePage, public: true },
  // { path: "/deprecated", component: DeprecatedPage, public: true },
  // { path: "/restricted", component: RestrictedPage, public: true },
  ...supplierRoutes,
  ...purchasingRoutes,
  ...ppicRoutes,
  ...adminRoutes,
  {
    path: "/",
    redirectTo: "/login",
    exact: true,
  },
  {
    path: "*",
    component: NoMatch,
  },
];
