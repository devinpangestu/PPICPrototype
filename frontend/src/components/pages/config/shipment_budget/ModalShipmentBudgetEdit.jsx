import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ShipmentBudgetForm from "./ShipmentBudgetForm";
import { Modal } from "antd";
import handler from "handler";

const ModalShipmentBudgetEdit = ({ visible, onCancel, setPageLoading, id, ...otherProps }) => {
  const [t] = useTranslation();

  // const [ShipmentBudgets, setShipmentBudgets] = useState([]);
  const [handoverLocations, setHandoverLocations] = useState([]);
  const [destinationLocations, setDestinationLocations] = useState([]);

  useEffect(() => {
    if (visible) {
      handler.getDestinationLocations(setPageLoading, setDestinationLocations);
      handler.getHandoverLocations(setPageLoading, setHandoverLocations);
      // handler.getShipmentBudget(setPageLoading, setShipmentBudgets);
    }
  }, [visible]);

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      title={`${t("edit")} ${t("shipmentBudget")}`}
    >
      <ShipmentBudgetForm
        id={id}
        isEdit={true}
        onCancel={onCancel}
        // ShipmentBudgets={ShipmentBudgets}
        handoverLocations={handoverLocations}
        destinationLocations={destinationLocations}
        {...otherProps}
      />
    </Modal>
  );
};

export default withRouter(ModalShipmentBudgetEdit);
