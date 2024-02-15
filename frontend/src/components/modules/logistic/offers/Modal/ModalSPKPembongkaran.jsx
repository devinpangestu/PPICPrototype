import React from "react";
import { withRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Modal } from "antd";
import SPKBongkarForm from "../SPKBongkarForm";

const ModalSPKPembongkaran = (props) => {
  const [t] = useTranslation();
  const { visible, onCancel, onOk, data } = props;

  if (!data) return null;
  const { isEdit, cOffer, lOffer } = data;

  if (!isEdit && (!cOffer || !lOffer)) {
    return null;
  }

  return (
    <Modal
      title={`${t("Buat")} ${t("SPK Pembongkaran")}`}
      open={visible}
      footer={null}
      centered
      style={{ minWidth: "50%" }}
      className="modal-compact"
      onCancel={onCancel}
    >
      <SPKBongkarForm onCancel={onCancel} onOk={onOk} cOffer={cOffer} lOffer={lOffer} />
    </Modal>
  );
};

export default withRouter(ModalSPKPembongkaran);
