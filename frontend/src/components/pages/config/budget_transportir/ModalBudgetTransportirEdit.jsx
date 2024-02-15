import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BudgetTransportirForm from "./BudgetTransportirForm";
import { Modal } from "antd";
import handler from "handler";

const ModalBudgetTransportirEdit = ({ visible, onCancel, setPageLoading, id, ...otherProps }) => {
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
      title={`${t("edit")} ${t("budgetTransportir")}`}
    >
      <BudgetTransportirForm
        id={id}
        isEdit={true}
        onCancel={onCancel}
        // budgetTransportirs={budgetTransportirs}
        handoverLocations={handoverLocations}
        warehouses={warehouses}
        {...otherProps}
      />
    </Modal>
  );
};

export default withRouter(ModalBudgetTransportirEdit);
