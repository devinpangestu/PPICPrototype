import React from "react";
import { withRouter } from "react-router-dom";
import { Modal } from "antd";
import { useTranslation } from "react-i18next";
import ScheduleForm from "../ScheduleForm";

const ModalCreate = ({ visible, onCancel, onSuccess }) => {
  const [t] = useTranslation();

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      style={{ minWidth: "50%" }}
      title={`${t("add")} ${t("schedule")}`}
    >
      <ScheduleForm onCancel={onCancel} onSuccess={onSuccess} />
    </Modal>
  );
};

export default withRouter(ModalCreate);
