import React from "react";
import { withRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import UserForm from "./UserForm";
import { Modal } from "antd";

const ModalUserEdit = (props) => {
  const [t] = useTranslation();
  const { visible, onCancel, userId, onSuccess } = props;

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      style={{ minWidth: "50%" }}
      title={`${t("edit")} ${t("employee")}`}
    >
      <UserForm isEdit={true} userId={userId} onCancel={onCancel} onSuccess={onSuccess} />
    </Modal>
  );
};

export default withRouter(ModalUserEdit);
