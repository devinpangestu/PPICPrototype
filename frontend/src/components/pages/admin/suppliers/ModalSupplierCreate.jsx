import React from "react";
import { withRouter } from "react-router-dom";
import { Modal } from "antd";
import { useTranslation } from "react-i18next";
import SupplierForm from "./SupplierForm";

const ModalSupplierCreate = (props) => {
  const [t] = useTranslation();
  const { commodities, visible, onCancel, onSuccess } = props;

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      style={{ minWidth: "50%" }}
      title={`${t("add")} ${t("supplier")}`}
    >
      <SupplierForm onCancel={onCancel} onSuccess={onSuccess} commodities={commodities} />
    </Modal>
  );
};

export default withRouter(ModalSupplierCreate);
