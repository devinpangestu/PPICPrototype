import React from "react";
import { NavLink } from "react-router-dom";

export const CustomNavLink = (props) => {
  let to = "";
  if (props.to) {
    to = props.to;
  }
  if (props.route === to) {
    return <NavLink>{props.children}</NavLink>;
  }
  return <NavLink to={to}>{props.children}</NavLink>;
};
