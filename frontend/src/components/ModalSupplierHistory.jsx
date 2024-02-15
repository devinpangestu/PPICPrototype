import React, { useState, useEffect } from "react";
import { Row, Col, Button, Modal, Card, Typography } from "antd";
import { api } from "api";
import { SupplierTrnTable, SyncOverlay } from "components";
import { useTranslation } from "react-i18next";
import utils from "utils";

const { Title } = Typography;

function ModalSupplierHistory(props) {
  const [t] = useTranslation();

  const { visible, onCancel, supplierId } = props;

  const [supplierHistory, setSupplierHistory] = useState(null);
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    if (!visible || !supplierId) {
      return;
    }

    const loadSupplierHistory = () => {
      if (!supplierId) {
        utils.swal.Error();
      }

      setPageLoading(true);

      api.suppliers
        .history(supplierId)
        .then(function (response) {
          const rsBody = response.data.rs_body;
          setSupplierHistory(rsBody);
        })
        .catch(function (error) {
          utils.swal.Error({ msg: utils.getErrMsg(error) });
        })
        .finally(function () {
          setPageLoading(false);
        });
    };

    loadSupplierHistory();
  }, [visible, supplierId]);

  return (
    <Modal
      title={`${t("history")} ${t("supplier")}${
        supplierHistory && supplierHistory.name ? ` - ${supplierHistory.name}` : ""
      }`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      style={{ minWidth: "50%" }}
    >
      <SyncOverlay loading={pageLoading} />
      <Row gutter={16}>
        <Col xs={24} sm={12} md={12} lg={12} xl={12}>
          <Card
            className="card-stats"
            title={<Title level={4}>{t("avgPrice")}</Title>}
            size="small"
          >
            <Title level={2} className="mb-0">
              {supplierHistory && supplierHistory.price_avg
                ? utils.thousandSeparator(supplierHistory.price_avg)
                : 0}
            </Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={12} xl={12}>
          <Card
            className="card-stats"
            title={<Title level={4}>{t("transactions")}</Title>}
            size="small"
          >
            <Title level={2} className="mb-0">
              {supplierHistory && supplierHistory.total_trn
                ? utils.thousandSeparator(supplierHistory.total_trn)
                : 0}
            </Title>
          </Card>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={8} md={8} lg={8} xl={8}>
          <Card className="card-stats" title={<Title level={4}>OTIF</Title>} size="small">
            <Title level={2} className="mb-0">
              {supplierHistory && supplierHistory.otif_percentage
                ? utils.thousandSeparator(supplierHistory.otif_percentage)
                : 0}
              %
            </Title>
          </Card>
        </Col>
        <Col xs={24} sm={8} md={8} lg={8} xl={8}>
          <Card className="card-stats" title={<Title level={4}>OTIF</Title>} size="small">
            <Title level={2} className="mb-0">
              {supplierHistory && supplierHistory.count_otif
                ? utils.thousandSeparator(supplierHistory.count_otif)
                : 0}
            </Title>
          </Card>
        </Col>
        <Col xs={24} sm={8} md={8} lg={8} xl={8}>
          <Card className="card-stats" title={<Title level={4}>N-OTIF</Title>} size="small">
            <Title level={2} className="mb-0">
              {supplierHistory && supplierHistory.count_not_otif
                ? utils.thousandSeparator(supplierHistory.count_not_otif)
                : 0}
            </Title>
          </Card>
        </Col>
      </Row>
      {supplierHistory ? (
        <SupplierTrnTable
          title={t("recentTransactions")}
          supplierId={supplierHistory.supplier_id}
          transactions={supplierHistory.recent_transactions}
        />
      ) : null}
      <Row className="mt-4">
        <Col xs={24} sm={24} md={24} lg={24} xl={24} className="text-right mb-0">
          <Button type="secondary" onClick={onCancel}>
            {t("close")}
          </Button>
        </Col>
      </Row>
    </Modal>
  );
}

export default ModalSupplierHistory;
