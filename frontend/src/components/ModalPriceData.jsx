import React from "react";
import { Row, Col, Button, Modal } from "antd";

import { useTranslation } from "react-i18next";
import moment from "moment";

function ModalPriceData(props) {
  const [t] = useTranslation();

  const { visible, onCancel, date } = props;
  const finalDate = moment(date) ? moment(date) : moment();

  return (
    <Modal
      title={`${t("priceData")}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      style={{ minWidth: "75%" }}
    >
      <Row className="mb-4">
        <Col xs={24} sm={24} md={24} lg={24} xl={24}></Col>
      </Row>
      <Row>
        <Col xs={24} sm={24} md={24} lg={24} xl={24} className="text-right mb-0">
          <Button type="secondary" className="mr-2" onClick={onCancel}>
            {t("close")}
          </Button>
        </Col>
      </Row>
    </Modal>
  );
}

export default ModalPriceData;
