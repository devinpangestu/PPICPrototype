import React from "react";
import { withRouter } from "react-router-dom";
import { Modal } from "antd";
import { useTranslation } from "react-i18next";
import HandoverLocationForm from "./HandoverLocationForm";

const ModalHandoverLocationCreate = (props) => {
  const [t] = useTranslation();
  const { visible, onCancel, ...otherProps } = props;

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      style={{ minWidth: "50%" }}
      title={`${t("add")} ${t("handoverLocation")}`}
    >
      <HandoverLocationForm onCancel={onCancel} {...otherProps} />
    </Modal>
  );
};

export default withRouter(ModalHandoverLocationCreate);
