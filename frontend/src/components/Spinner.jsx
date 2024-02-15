import React from "react";
import ClipLoader from "react-spinners/ClipLoader";
import SyncLoader from "react-spinners/SyncLoader";
import { css } from "@emotion/core";

const cssCenter = css`
  margin: 1rem 0;
`;
export const Spinner = (props) => {
  return (
    <div className="text-center">
      <ClipLoader
        {...props}
        // color={color}
        css={cssCenter}
        // size={150}
      />
    </div>
  );
};

// Can be a string as well. Need to ensure each key-value pair ends with ;
const cssOverlay = css`
  width: 10rem;
  height: 10rem;
`;
export const SpinnerOverlay = (props) => {
  let el = null;
  if (props && props.loading) {
    el = (
      <div className="loading-overlay">
        <div className="spinner-wrapper">
          <ClipLoader
            // color={color}
            css={cssOverlay}
            color="#00703c"
            // size={150}
          />
        </div>
      </div>
    );
  }
  return el;
};

export const SyncOverlay = (props) => {
  let el = null;
  if (props && props.loading) {
    el = (
      <div className="loading-overlay">
        <div className="spinner-wrapper">
          <SyncLoader
            // color={color}
            css={cssOverlay}
            color="#00703c"
            // size={150}
          />
        </div>
      </div>
    );
  }
  return el;
};
