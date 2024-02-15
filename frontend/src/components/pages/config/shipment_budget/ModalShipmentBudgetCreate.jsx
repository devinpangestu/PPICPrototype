import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { Modal } from "antd";
import { useTranslation } from "react-i18next";
import ShipmentBudgetForm from "./ShipmentBudgetForm";
import handler from "handler";

const ModalShipmentBudgetCreate = ({ visible, onCancel, setPageLoading, ...otherProps }) => {
  const [t] = useTranslation();

  // const [ShipmentBudgets, setShipmentBudgets] = useState([]);
  const [handoverLocations, setHandoverLocations] = useState([]);
  const [destinationLocations, setDestinationLocations] = useState([]);

  useEffect(() => {
    if (visible) {
      handler.getHandoverLocations(setPageLoading, setHandoverLocations);
      handler.getDestinationLocations(setPageLoading, setDestinationLocations);
      // handler.getShipmentBudget(setPageLoading, setShipmentBudgets);
    }
  }, [visible]);

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      title={`${t("add")} ${t("shipmentBudget")}`}
    >
      <ShipmentBudgetForm
        // ShipmentBudgets={ShipmentBudgets}
        onCancel={onCancel}
        handoverLocations={handoverLocations}
        destinationLocations={destinationLocations}
        {...otherProps}
      />
    </Modal>
  );
};

export default withRouter(ModalShipmentBudgetCreate);
