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
