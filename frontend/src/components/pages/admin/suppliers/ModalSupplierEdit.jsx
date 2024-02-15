import React from "react";
import { withRouter } from "react-router-dom";
import { Modal } from "antd";
import { useTranslation } from "react-i18next";
import SupplierForm from "./SupplierForm";

const ModalSupplierEdit = (props) => {
  const [t] = useTranslation();
  const { commodities, visible, onCancel, supplierId, onSuccess } = props;

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      style={{ minWidth: "50%" }}
      title={`${t("edit")} ${t("supplier")}`}
    >
      <SupplierForm
        isEdit={true}
        supplierId={supplierId}
        onCancel={onCancel}
        onSuccess={onSuccess}
        commodities={commodities}
      />
    </Modal>
  );
};

export default withRouter(ModalSupplierEdit);
