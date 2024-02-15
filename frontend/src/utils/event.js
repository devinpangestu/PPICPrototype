export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

export const openInNewTab = (url) => {
  // window.open(url, "_blank").focus();

  const newWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (newWindow) newWindow.opener = null;
};

export const Sleep = (durationMs, cbFn) => {
  if (!durationMs || !cbFn) return;
  new Promise((resolve) => setTimeout(resolve, durationMs)).then(() => {
    cbFn();
  });
};

// export const commonSearchTimeout = (timeout, setTimeoutFn, loadDataFn) => {
//   if (timeout) {
//     clearTimeout(timeout);
//   }
//   setTimeoutFn(
//     setTimeout(() => {
//       loadDataFn();
//     }, 300),
//   );

//   return () => clearTimeout(timeout);
// };
