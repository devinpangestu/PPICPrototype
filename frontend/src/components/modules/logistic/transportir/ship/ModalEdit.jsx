import React from "react";
import { withRouter } from "react-router-dom";
import { Modal } from "antd";
import { useTranslation } from "react-i18next";
import ShipForm from "./ShipForm";

const ModalEdit = ({ visible, onCancel, onSuccess, transportirId, id }) => {
  const [t] = useTranslation();

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      style={{ minWidth: "50%" }}
      title={`${t("edit")} ${t("ship")}`}
    >
      <ShipForm
        isEdit={true}
        transportirId={transportirId}
        id={id}
        onCancel={onCancel}
        onSuccess={onSuccess}
      />
    </Modal>
  );
};

export default withRouter(ModalEdit);
