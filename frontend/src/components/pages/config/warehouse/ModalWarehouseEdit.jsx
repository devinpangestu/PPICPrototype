import React, { useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Modal } from "antd";
import WarehouseForm from "./WarehouseForm";
import handler from "handler";

const ModalWarehouseEdit = (props) => {
  const [t] = useTranslation();
  const { setPageLoading, visible, onCancel, ...otherProps } = props;

  const [commodities, setCommodities] = useState([]);
  useEffect(() => {
    if (visible) {
      handler.getCommodities(setPageLoading, setCommodities);
    }
  }, [visible]);

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      style={{ minWidth: "50%" }}
      title={`${t("edit")} ${t("warehouse")}`}
    >
      <WarehouseForm isEdit={true} onCancel={onCancel} {...otherProps} commodities={commodities} />
    </Modal>
  );
};

export default withRouter(ModalWarehouseEdit);
