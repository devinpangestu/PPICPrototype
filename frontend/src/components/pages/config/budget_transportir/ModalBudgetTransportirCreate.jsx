import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { Modal } from "antd";
import { useTranslation } from "react-i18next";
import BudgetTransportirForm from "./BudgetTransportirForm";
import handler from "handler";

const ModalBudgetTransportirCreate = ({ visible, onCancel, setPageLoading, ...otherProps }) => {
  const [t] = useTranslation();

  // const [budgetTransportirs, setBudgetTransportirs] = useState([]);
  const [handoverLocations, setHandoverLocations] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    if (visible) {
      handler.getWarehouses(setPageLoading, setWarehouses);
      handler.getHandoverLocations(setPageLoading, setHandoverLocations);
      // handler.getBudgetTransportir(setPageLoading, setBudgetTransportirs);
    }
    
  }, [visible]);

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      title={`${t("add")} ${t("budgetTransportir")}`}
    >
      <BudgetTransportirForm
        // budgetTransportirs={budgetTransportirs}
        onCancel={onCancel}
        handoverLocations={handoverLocations}
        warehouses={warehouses}
        {...otherProps}
      />
    </Modal>
  );
};

export default withRouter(ModalBudgetTransportirCreate);
