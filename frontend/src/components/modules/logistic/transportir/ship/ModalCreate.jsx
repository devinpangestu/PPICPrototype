import React from "react";
import { withRouter } from "react-router-dom";
import { Modal } from "antd";
import { useTranslation } from "react-i18next";
import ShipForm from "./ShipForm";

const ModalCreate = ({ visible, onCancel, onSuccess, transportirId, shipName }) => {
  const [t] = useTranslation();
  console.log(transportirId);
  transportirId = Number(transportirId);

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      style={{ minWidth: "50%" }}
      title={`${t("add")} ${t("ship")}`}
    >
      <ShipForm
        onCancel={onCancel}
        onSuccess={onSuccess}
        transportirId={transportirId}
        shipName={shipName}
      />
    </Modal>
  );
};

export default withRouter(ModalCreate);
