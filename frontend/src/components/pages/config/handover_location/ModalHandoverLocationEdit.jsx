import React from "react";
import { withRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import HandoverLocationForm from "./HandoverLocationForm";
import { Modal } from "antd";

const ModalHandoverLocationEdit = (props) => {
  const [t] = useTranslation();
  const { visible, onCancel, ...otherProps } = props;

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      style={{ minWidth: "50%" }}
      title={`${t("edit")} ${t("handoverLocation")}`}
    >
      <HandoverLocationForm isEdit={true} onCancel={onCancel} {...otherProps} />
    </Modal>
  );
};

export default withRouter(ModalHandoverLocationEdit);
