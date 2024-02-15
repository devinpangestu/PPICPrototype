import React from "react";
import { withRouter } from "react-router-dom";
import { Row, Col, Card } from "antd";
import { useTranslation } from "react-i18next";
import utils from "utils";
import constant from "constant";
import moment from "moment";

const TrnCardLogistic = (props) => {
  const userInfo = utils.getUserInfo();
  const [t] = useTranslation();
  const {
    offer,
    actionEl,
    statusEl,
    setSelected,
    // ...otherProps
  } = props;

  if (offer) {
    return (
      <Card key={offer.logistic_offer_id} className="trn-card">
        <div>Offer ID: {offer.logistic_offer_id}</div>
        <div>Status: {utils.snakeToTitleCase(offer.status)}</div>
        <div>Transportir: {offer.transportir.name}</div>
        {statusEl || actionEl ? (
          <div key="action">
            <Row>
              <Col
                xs={12}
                sm={6}
                md={6}
                lg={6}
                xl={6}
                className="align-self-center text-muted mb-2 mb-sm-0"
              >
                {statusEl}
              </Col>
              <Col xs={12} sm={6} md={6} lg={6} xl={6} className="text-sm-right">
                {actionEl}
              </Col>
            </Row>
          </div>
        ) : null}
      </Card>
    );
  }
};

export default withRouter(TrnCardLogistic);
