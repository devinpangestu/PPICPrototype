import React from "react";
import { withRouter } from "react-router-dom";
import { Modal } from "antd";
import { useTranslation } from "react-i18next";
import TransportirForm from "./TransportirForm";

const ModalEdit = ({ visible, onCancel, id, onSuccess }) => {
  const [t] = useTranslation();

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      style={{ minWidth: "50%" }}
      title={`${t("edit")} ${t("transportir")}`}
    >
      <TransportirForm isEdit={true} id={id} onCancel={onCancel} onSuccess={onSuccess} />
    </Modal>
  );
};

export default withRouter(ModalEdit);
