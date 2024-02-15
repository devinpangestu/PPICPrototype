import React from "react";
import { withRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Modal } from "antd";
import CommodityForm from "./CommodityForm";

const ModalCommodityCreate = (props) => {
  const [t] = useTranslation();
  const { visible, onCancel, ...otherProps } = props;

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      style={{ minWidth: "50%" }}
      title={`${t("add")} ${t("commodity")}`}
    >
      <CommodityForm onCancel={onCancel} {...otherProps} />
    </Modal>
  );
};

export default withRouter(ModalCommodityCreate);
