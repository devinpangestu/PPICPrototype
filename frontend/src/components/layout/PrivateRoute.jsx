import React from "react";
import { Route, Redirect } from "react-router-dom";
import utils from "utils";

export const PrivateRoute = ({ component: Component, neededPermission, ...rest }) => (
  <Route
    {...rest}
    render={(props) => {
      const userInfo = utils.getUserInfo();
      console.log(neededPermission);
      if (!userInfo || !userInfo.permissions || !Array.isArray(userInfo.permissions)) {
        // not logged in so redirect to login page with the return url
        return <Redirect to={{ pathname: "/login", state: { from: props.location } }} />;
      }

      // check if this user have the needed permissions
      if (
        neededPermission &&
        !neededPermission.every((val) => userInfo.permissions.includes(val))
      ) {
        // not authorized, redirect to home
        let pathName;
        if (userInfo.role.id === 2) {
          pathName = "/ppic/dashboard";
        } else if (userInfo.role.id === 3) {
          pathName = "/procurement/dashboard";
        } else if (userInfo.role.id === 4) {
          pathName = "/supplier/dashboard";
        }
        

        return <Redirect to={{ pathname: pathName }} />;
      }

      // authorized so return component
      return <Component {...props} />;
    }}
  />
);
