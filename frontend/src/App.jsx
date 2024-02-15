import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { routes } from "routes";
import { PrivateRoute } from "@/components/layout";
// import ChatPopover from "components/layout/ChatPopover";
import { CustomRedirect } from "components";
import utils from "utils";
import { api } from "api";
import CacheBuster from "CacheBuster";
const App = () => {
  let chatEl = null;
  const userInfo = utils.getUserInfo();
  console.log("userInfo");
  console.log(userInfo);
  useEffect(() => {
   
  }, []);
  console.log(document.body.style);
  // useEffect(() => {
  //   window.addEventListener("storage", (e) => {
  //     if (e.key === "access_token") {
  //       window.location.reload();
  //       return;
  //     }
  //   });

  //   if (window.OneSignal && window.location.pathname !== "/login") {
  //     window.OneSignal = window.OneSignal || [];
  //     window.OneSignal.push(function () {
  //       window.OneSignal.init({
  //         appId: "b1ee5999-2dad-4e30-954c-f2b060605368",
  //       });
  //     });

  //     window.OneSignal.on("subscriptionChange", function (isSubscribed) {
  //       console.log("is subscribed", isSubscribed);
  //       window.OneSignal.push(function () {
  //         window.OneSignal.getUserId(function (playerId) {
  //           if (isSubscribed === true && playerId) {
  //             console.log("player id", playerId);
  //             api.users.registerOneSignalPlayerID(playerId).catch(function (error) {
  //               console.log("error registering onesignal, err: ", utils.getErrMsg(error));
  //             });
  //           }
  //         });
  //       });
  //     });
  //   }
  // }, []);

  return (
    <CacheBuster>
      <Router>
        <Switch>
          {routes.map((route) => {
            // Check if maintenance mode is active

            if (route.maintenance && userInfo && userInfo.employee_id !== "superuser") {
              // Redirect to maintenance page or show a message
              return <CustomRedirect key={route.path} path={route.path} to="/maintenance" />;
            }
            if (route.deprecated && userInfo && userInfo.employee_id !== "superuser") {
              // Redirect to maintenance page or show a message
              return <CustomRedirect key={route.path} path={route.path} to="/deprecated" />;
            }

            // Check if route has redirectTo property
            if (route.redirectTo) {
              return <CustomRedirect key={route.path} path={route.path} to={route.redirectTo} />;
            }

            // Check if route is public
            if (route.public) {
              return <Route exact key={route.path} path={route.path} component={route.component} />;
            }

            // It's a private route
            return (
              <PrivateRoute
                exact
                key={route.path}
                path={route.path}
                component={route.component}
                neededPermission={route.permissions} // list of Needed Permissions
              />
            );
          })}
        </Switch>
      </Router>
      {chatEl}
    </CacheBuster>
  );
};

export default App;
