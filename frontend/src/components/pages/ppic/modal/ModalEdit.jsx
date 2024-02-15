import React from "react";
import { withRouter } from "react-router-dom";
import { Modal } from "antd";
import { useTranslation } from "react-i18next";
import ScheduleForm from "../ScheduleForm";

const ModalEdit = ({ visible, onCancel, id, onSuccess }) => {
  const [t] = useTranslation();

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      style={{ minWidth: "50%" }}
      title={`${t("edit")} ${t("schedule")}`}
    >
      <ScheduleForm isEdit={true} id={id} onCancel={onCancel} onSuccess={onSuccess} />
    </Modal>
  );
};

export default withRouter(ModalEdit);
