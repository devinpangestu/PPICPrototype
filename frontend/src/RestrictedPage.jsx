// RestrictedPage.js
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import think from "./assets/images/think.png";
import utils from "utils";
const RestrictedPage = () => {
  const history = useHistory();
  const [countdown, setCountdown] = useState(5);
  const userInfo = utils.getUserInfo();
  let redirectTo = "/history";
  if (utils.redirectRole(userInfo.role.id, 1)) {
    redirectTo = "/ppic/dashboard";
  }
  if (utils.redirectRole(userInfo.role.id, 2)) {
    redirectTo = "/ppic/dashboard";
  }
  if (utils.redirectRole(userInfo.role.id, 3)) {
    redirectTo = "/supplier/dashboard";
  }
  if (utils.redirectRole(userInfo.role.id, 4)) {
    redirectTo = "/procurement/dashboard";
  }

  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      // Redirect to a different route or URL after 5 seconds
      history.push(redirectTo); // Replace with your desired route or URL
    }, 5000);
    const countdownInterval = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000);
    // Clear the timer when the component is unmounted
    return () => {
      clearTimeout(redirectTimer);
      clearInterval(countdownInterval);
    };
  }, [history]);
  return (
    <html>
      <head>
        <meta http-equiv="Content-type" content="text/html;charset=UTF-8" />
        <title>Restricted Page</title>
        <style type="text/css">
          {`
            body { text-align: center; padding: 150px; background-color:#fff;}
            h1 { font-size: 40px; }
            body { font: 20px Helvetica, sans-serif; color: #333; }
            #article { display: block; text-align: left; width: 650px; margin: 0 auto; }
            a { color: #dc8100; text-decoration: none; }
            a:hover { color: #333; text-decoration: none; }
            #countdown {
              font-size: 24px;
              margin-top: 20px;
              color: #dc8100;
            }
            #imageContainer {
              display: flex;
              justify-content: center;
              align-items: center;
              margin-bottom: 20px;
            }
            #maintenanceImage {
              max-width: 100%;
              max-height: 200px; /* Adjust the maximum height as needed */
            }
          `}
        </style>
      </head>
      <body>
        <div id="article">
          <div id="imageContainer">
            <img id="maintenanceImage" src={think} alt="think" />
          </div>
          <h1>You don't have permissions to access this content</h1>
          <div>
            <p>Contact the administrator to request access.</p>
            <p id="countdown">Redirecting to home page in {countdown} seconds...</p>
          </div>
        </div>
      </body>
    </html>
  );
};

export default RestrictedPage;
