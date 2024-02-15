import React from "react";
import { withRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Modal } from "antd";
import CommodityForm from "./CommodityForm";

const ModalCommodityEdit = (props) => {
  const [t] = useTranslation();
  const { visible, onCancel, ...otherProps } = props;
  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      style={{ minWidth: "50%" }}
      title={`${t("edit")} ${t("commodity")}`}
    >
      <CommodityForm isEdit={true} onCancel={onCancel} {...otherProps} />
    </Modal>
  );
};

export default withRouter(ModalCommodityEdit);
