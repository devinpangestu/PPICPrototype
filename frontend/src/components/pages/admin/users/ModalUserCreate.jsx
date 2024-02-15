import React from "react";
import { withRouter } from "react-router-dom";
import UserForm from "./UserForm";
import { useTranslation } from "react-i18next";
import { Modal } from "antd";

const ModalUserCreate = (props) => {
  const [t] = useTranslation();
  const { visible, onCancel, onSuccess } = props;

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      style={{ minWidth: "50%" }}
      title={`${t("add")} ${t("employee")}`}
    >
      <UserForm onCancel={onCancel} onSuccess={onSuccess} />
    </Modal>
  );
};

export default withRouter(ModalUserCreate);
