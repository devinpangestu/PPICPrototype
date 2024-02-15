import React from "react";
import { withRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Modal } from "antd";
import ContractNumberForm from "../ContractNumberForm";

const ModalContractNumber = (props) => {
  const [t] = useTranslation();
  const { visible, onCancel, onOk, data } = props;

  if (!data) return null;
  const { isEdit, cOffer } = data;

  if (!isEdit && !cOffer) {
    return null;
  }

  return (
    <Modal
      title={`${t("Input")} ${t("Nomor Kontrak")}`}
      open={visible}
      footer={null}
      centered
      style={{ minWidth: "50%" }}
      className="modal-compact"
      onCancel={onCancel}
    >
      <ContractNumberForm onCancel={onCancel} onOk={onOk} cOffer={cOffer} />
    </Modal>
  );
};

export default withRouter(ModalContractNumber);
