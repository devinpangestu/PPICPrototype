import React, { useState, useEffect } from "react";
import { Row, Col, Button, Modal } from "antd";
import { SupplierTrnTable, SyncOverlay } from "components";
import { useTranslation } from "react-i18next";
import { SpinnerOverlay } from "components";

import { api } from "api";
import utils from "utils";
import { pageSize } from "configs/pagesize";
const ModalSupplierRecentTrn = (props) => {
  const [t] = useTranslation();

  const { visible, supplierId, supplierName, onChange } = props;
  const [supplierHistory, setSupplierHistory] = useState(null);
  const [totalData, setTotalData] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const onTableChange = (pagination, filters, sorter, extra) => {
    setPageNumber(pagination.current);
    console.log("pagination: ", pagination);
    console.log("filters: ", filters);
    console.log("sorter: ", sorter);
    console.log("extra: ", extra);
  };
  const loadSupplierHistory = () => {
    if (!supplierId) {
      utils.swal.Error();
    }

    setPageLoading(true);
    api.suppliers
      .transactions(supplierId, pageSize.transaction, pageNumber)
      .then(function (response) {
        const rsBody = response.data.rs_body;
        setSupplierHistory(rsBody);
        setTotalData(rsBody.total);
        const newArray = rsBody.transactions.map((obj) => ({
          ...obj,
          offer: {
            ...obj.offer,
            price_final: obj.offer.price_final ? Number(obj.offer.price_final.toFixed(2)) : "-",
            quality_mi: obj.offer.quality_mi ? Number(obj.offer.quality_mi.toFixed(2)) : "-",
            quality_ffa: obj.offer.quality_ffa ? Number(obj.offer.quality_ffa.toFixed(2)) : "-",
          },
        }));
        setRecentTransactions(newArray);
      })
      .catch(function (error) {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(function () {
        setPageLoading(false);
      });
  };
  useEffect(() => {
    if (!visible || !supplierId) {
      return;
    }

    loadSupplierHistory();
  }, [visible, supplierId, pageNumber]);

  const onCancel = () => {
    setPageNumber(1);
    props.onCancel();
  };

  return (
    <Modal
      title={`${t("recentTransactions")}${supplierName ? ` - ${supplierName}` : t("supplier")}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      width="40%"
    >
      <SyncOverlay loading={pageLoading} />

      <Row gutter={16}>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <SupplierTrnTable
            totalData={totalData}
            supplierId={supplierId}
            transactions={recentTransactions}
            onChange={onTableChange}
          />
        </Col>
      </Row>

      <Row className="mt-4">
        <Col xs={24} sm={24} md={24} lg={24} xl={24} className="text-right mb-0">
          <Button type="secondary" onClick={onCancel}>
            {t("close")}
          </Button>
        </Col>
      </Row>
    </Modal>
  );
};

export default ModalSupplierRecentTrn;
