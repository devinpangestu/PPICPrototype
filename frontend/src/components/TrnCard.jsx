import React from "react";
import { withRouter } from "react-router-dom";
import { Row, Col, Card, Form, Button, Divider } from "antd";
import { useTranslation } from "react-i18next";
import utils from "utils";
import constant from "constant";
import moment from "moment";

const TrnCard = (props) => {
  const userInfo = utils.getUserInfo();
  const [t] = useTranslation();
  const {
    transaction,
    offer,
    actionEl,
    statusEl,
    logActionEl,
    logStatusEl,
    setSelected,
    setModalSupplierHistoryShow,
    setModalPriceDataShow,
    priceKPBFinal,
    ppn,
    // ...otherProps
  } = props;

  let offerData = null;
  if (transaction) {
    offerData = transaction.offer;
  } else if (offer) {
    offerData = offer;
  }

  const renderTimestampInfo = () => {
    let returnEl = [
      <Col key="1" xs={24}>
        {`${t("created")}: ${moment(offerData.created_at).format(
          constant.FORMAT_DISPLAY_DATETIME,
        )}`}
      </Col>,
    ];

    if (transaction) {
      if (transaction.delivered_datetime) {
        returnEl.push(
          <Col key="2" xs={24}>
            {`${t("deliveredDatetime")}: ${moment(transaction.delivered_datetime).format(
              constant.FORMAT_DISPLAY_DATETIME,
            )}`}
          </Col>,
        );
      }
    } else if (offer) {
      if (offerData.updated_at) {
        returnEl.push(
          <Col key="2" xs={24}>
            {`${t("updated")}: ${moment(offerData.updated_at).format(
              constant.FORMAT_DISPLAY_DATETIME,
            )}`}
          </Col>,
        );
      }
    }

    return <Row className="mb-2">{returnEl}</Row>;
  };

  if (offerData) {
    let topMgmtNotes = (
      <Row>
        <Col>
          <div>{t("notes")}</div>
        </Col>
        <Col className="keyval-val display-linebreak">-</Col>
      </Row>
    );
    if (offerData.top_mgmt_bid_notes || offerData.top_mgmt_notes) {
      topMgmtNotes = [];
      if (offerData.top_mgmt_bid_notes) {
        topMgmtNotes.push(
          <Row>
            <Col>
              <div>{t("notes")}(Bid)</div>
            </Col>
            <Col className="keyval-val display-linebreak">{offerData.top_mgmt_bid_notes}</Col>
          </Row>,
        );
      }
      if (offerData.top_mgmt_notes) {
        topMgmtNotes.push(
          <Row>
            <Col>
              <div>{t("notes")}</div>
            </Col>
            <Col className="keyval-val display-linebreak">{offerData.top_mgmt_notes}</Col>
          </Row>,
        );
      }
    }

    let priceDtl = `(Exclude ${utils.thousandSeparator(offerData.price_exclude)}x${1 + ppn / 100})`;
    if (offerData.price_freight_darat) {
      priceDtl += ` + Freight Darat ${utils.thousandSeparator(offerData.price_freight_darat)}`;
    }
    if (offerData.price_freight_kapal) {
      priceDtl += ` + Freight Kapal ${utils.thousandSeparator(offerData.price_freight_kapal)}`;
    }
    if (offerData.price_insurance) {
      priceDtl += ` + Insurance ${utils.thousandSeparator(offerData.price_insurance)}`;
    }
    if (offerData.price_susut) {
      priceDtl += ` + Susut ${utils.thousandSeparator(offerData.price_susut)}`;
    }
    if (offerData.price_cof) {
      priceDtl += ` + COF ${utils.thousandSeparator(offerData.price_cof)}`;
    }
    // if (offer.price_freight || offer.price_insurance || offer.price_susut || offer.price_cof) {
    //   priceDtl = `( ${priceDtl} )`;
    // }
    let qualityDtl = "";
    if (offerData.quality_ffa)
      qualityDtl += `FFA: ${utils.thousandSeparator(offerData.quality_ffa.toFixed(2))}%`;
    if (offerData.quality_mi)
      qualityDtl += ` | M+I: ${utils.thousandSeparator(offerData.quality_mi.toFixed(2))}%`;
    if (offerData.quality_dobi)
      qualityDtl += ` | DOBI: ${utils.thousandSeparator(offerData.quality_dobi.toFixed(2))}%`;

    let contractBtn = null;
    if (offerData.files && offerData.files.length > 0) {
      const fileContract = offerData.files.find((el) => el.type === constant.FILE_TYPE_CONTRACT);

      if (fileContract) {
        contractBtn = (
          <Button
            size="small"
            className="mb-2"
            onClick={() => {
              utils.openInNewTab(fileContract.url);
            }}
          >
            {t("contract")}
          </Button>
        );
      }
    }

    let cargoReadinessBtn = null;
    if (offerData.files && offerData.files.length > 0) {
      const fileCargoReadiness = offerData.files.find(
        (el) => el.type === constant.FILE_TYPE_CARGO_READINESS,
      );

      if (fileCargoReadiness) {
        cargoReadinessBtn = (
          <Button
            size="small"
            className="mb-2"
            onClick={() => {
              utils.openInNewTab(fileCargoReadiness.url);
            }}
          >
            {t("cargoReadiness")}
          </Button>
        );
      }
    }

    return (
      <Card
        key={offerData.id}
        className="trn-card"
        size="small"
        // loading={loading}
      >
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <table className="keyval">
              <tr>
                <td>{t("Offer Date")}</td>
                <td>: </td>
                <td>
                  <strong>{moment(offerData.datetime).format(constant.FORMAT_DISPLAY_DATE)}</strong>
                </td>
              </tr>
              <tr>
                <td>{t("commodity")}</td>
                <td>: </td>
                <td>
                  <strong>{offerData.cmdty.name}</strong>
                </td>
              </tr>
              <tr>
                <td>{t("contractNumber")}</td>
                <td>: </td>
                <td>
                  <strong>{offerData.contract_number ? offerData.contract_number : "-"}</strong>
                </td>
              </tr>
              {offerData.po_number && (
                <tr>
                  <td>{t("Nomor PO")}</td>
                  <td>: </td>
                  <td>
                    <strong>{offerData.po_number}</strong>
                  </td>
                </tr>
              )}
              <tr>
                <td>{t("offerId")}</td>
                <td>: </td>
                <td>
                  <strong>{offerData.id}</strong>
                </td>
              </tr>

              <tr>
                <td>{t("supplier")}</td>
                <td>: </td>
                <td>
                  <strong>{offerData.spplr.name}</strong>
                </td>
              </tr>
              <tr>
                <td>{t("warehouse")}</td>
                <td>: </td>
                <td>
                  <strong>{constant.getWarehouseDesc(offerData.whs.name)}</strong>
                </td>
              </tr>
              <tr>
                <td>{t("Price Exclude")}</td>
                <td>: </td>
                <td>
                  <strong>{utils.thousandSeparator(offerData.price_exclude)}</strong>
                </td>
              </tr>
              <tr>
                <td>{t("priceAllIn")}</td>
                <td>: </td>
                <td>
                  <strong>{utils.thousandSeparator(offerData.price.toFixed(2))}</strong>
                  {userInfo.role.id !== constant.ROLE_TOP_MGMT && ` ${priceDtl}`}
                </td>
              </tr>
              {offerData.kpb_exclude && offerData.kpb_include && (
                <tr>
                  <td>{t("KPB Equivalent")}</td>
                  <td>: </td>
                  <td>
                    Exclude: <strong>{utils.thousandSeparator(offerData.kpb_exclude)}</strong>{" "}
                    Include: <strong>{utils.thousandSeparator(offerData.kpb_include)}</strong>
                  </td>
                </tr>
              )}
              {offerData.top_mgmt_bid_price && (
                <tr>
                  <td>{t("Bid")}</td>
                  <td>: </td>
                  <td>
                    <strong>{utils.thousandSeparator(offerData.top_mgmt_bid_price)}</strong>
                  </td>
                </tr>
              )}
              <tr>
                <td>{t("quantity")}</td>
                <td>: </td>
                <td>
                  <strong>{utils.thousandSeparator(offerData.quantity)}</strong>
                </td>
              </tr>
              <tr>
                <td>{t("quality")}</td>
                <td>: </td>
                <td>
                  <strong>{qualityDtl}</strong>
                </td>
              </tr>
              <tr>
                <td>{t("termsOfHandover")}</td>
                <td>: </td>
                <td>
                  {offerData.terms_of_handover ? (
                    <>
                      <strong>
                        {constant.getTermsOfHandoverDesc(offerData.terms_of_handover)}
                      </strong>{" "}
                      {offerData.hOver_Loc ? (
                        <>{`${offerData.hOver_Loc.name}${
                          offerData.handover_location ? " " + offerData.handover_location : ""
                        }`}</>
                      ) : (
                        <>{offerData.handover_location ? offerData.handover_location : ""}</>
                      )}
                    </>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
              <tr>
                <td>{t("handoverDate")}</td>
                <td>: </td>
                <td>
                  <strong>{`${moment(offerData.handover_date_from).format(
                    constant.FORMAT_DISPLAY_DATE,
                  )} - ${moment(offerData.handover_date_to).format(
                    constant.FORMAT_DISPLAY_DATE,
                  )}`}</strong>
                </td>
              </tr>
              <tr>
                <td>{t("eta")}</td>
                <td>: </td>
                <td>
                  <strong>{`${moment(offerData.eta_from).format(
                    constant.FORMAT_DISPLAY_DATE,
                  )} - ${moment(offerData.eta_to).format(constant.FORMAT_DISPLAY_DATE)}`}</strong>
                </td>
              </tr>
              {(userInfo.role.id === constant.ROLE_ADMIN ||
                userInfo.role.id === constant.ROLE_SUPER_ADMIN) && (
                <tr>
                  <td>{t("termsOfLoading")}</td>
                  <td>: </td>
                  <td>
                    <strong>
                      {offerData.terms_of_loading
                        ? constant.getTermsOfLoadingDesc(offerData.terms_of_loading)
                        : "-"}
                    </strong>
                  </td>
                </tr>
              )}
              <tr>
                <td>{t("termsOfPayment")}</td>
                <td>: </td>
                <td>
                  <strong>{offerData.terms_of_payment ? offerData.terms_of_payment : "-"}</strong>
                </td>
              </tr>
            </table>
          </Col>
          <Col xs={24} lg={12}>
            <Form.Item className="mb-0">
              <Button
                size="small"
                className="mr-2 mb-2"
                onClick={() => {
                  if (transaction) {
                    setSelected(transaction);
                  } else if (offer) {
                    setSelected(offer);
                  }
                  setModalSupplierHistoryShow(true);
                }}
              >
                {t("supplierHistory")}
              </Button>
              <Button
                size="small"
                className="mr-2 mb-2"
                onClick={() => {
                  if (transaction) {
                    setSelected(transaction);
                  } else if (offer) {
                    setSelected(offer);
                  }
                  setModalPriceDataShow(true);
                }}
              >
                {t("priceData")}
              </Button>
              {offerData.report_url && (
                <Button
                  size="small"
                  className="mr-2 mb-2"
                  onClick={() => {
                    utils.openInNewTab(offerData.report_url);
                  }}
                >
                  {t("report")}
                </Button>
              )}
              {offerData.report_url_internal && (
                <Button
                  size="small"
                  className="mb-2"
                  onClick={() => {
                    utils.openInNewTab(offerData.report_url_internal);
                  }}
                >
                  {t("internalReport")}
                </Button>
              )}
              {contractBtn}
              {cargoReadinessBtn}
            </Form.Item>

            <Form.Item className="mb-0">{renderTimestampInfo()}</Form.Item>
            {offerData.dealer.employee_id && (
              <Card size="small" className={"activity-log dealer"}>
                <table className="keyval">
                  <tr>
                    <td>{t("dealer")}</td>
                    <td>: </td>
                    <td>{offerData.dealer.name}</td>
                  </tr>
                  <tr>
                    <td>{t("recommendation")}</td>
                    <td>: </td>
                    <td>
                      {offerData.dealer_is_recommended ? (
                        <span className="recommended-text yes">{t("yes")}</span>
                      ) : (
                        <span className="recommended-text no">{t("no")}</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>{t("notes")}</td>
                    <td>: </td>
                    <td className="display-linebreak">
                      {offerData.dealer_notes ? offerData.dealer_notes : "-"}
                    </td>
                  </tr>
                </table>
              </Card>
            )}

            {offerData.risk_mgmt.employee_id && (
              <Card size="small" className={"activity-log analyst"}>
                <table className="keyval">
                  <tr>
                    <td>{t("analyst")}</td>
                    <td>: </td>
                    <td>{offerData.risk_mgmt.name}</td>
                  </tr>
                  <tr>
                    <td>{t("recommendation")}</td>
                    <td>: </td>
                    <td>
                      {offerData.risk_mgmt_is_recommended ? (
                        <span className="recommended-text yes">{t("yes")}</span>
                      ) : (
                        <span className="recommended-text no">{t("no")}</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>{t("priceRecommendation")}</td>
                    <td>: </td>
                    <td>
                      {utils.renderNullable(utils.thousandSeparator(offerData.risk_mgmt_price_rec))}
                    </td>
                  </tr>
                  <tr>
                    <td>{t("notes")}</td>
                    <td>: </td>
                    <td className="display-linebreak">
                      {offerData.risk_mgmt_notes ? offerData.risk_mgmt_notes : "-"}
                    </td>
                  </tr>
                </table>
              </Card>
            )}

            {offerData.top_mgmt.employee_id && (
              <Card size="small" className={"activity-log topmgmt"}>
                <table className="keyval">
                  <tr>
                    <td>{t("Top Management")}</td>
                    <td>: </td>
                    <td>{offerData.top_mgmt.name}</td>
                  </tr>
                  <tr>
                    <td>{t("notes")}</td>
                    <td>: </td>
                    <td className="display-linebreak">
                      {offerData.top_mgmt_notes ? offerData.top_mgmt_notes : "-"}
                    </td>
                  </tr>
                </table>
              </Card>
            )}
          </Col>
        </Row>
        <Divider className="mt-1 mb-4" />
        <Row>
          <Col xs={24} lg={12}>
            <Form.Item className="mb-0">{statusEl && statusEl}</Form.Item>
          </Col>
          <Col xs={24} lg={12} className="text-right">
            {actionEl && actionEl}
          </Col>
        </Row>
        {(logStatusEl || logActionEl) && (
          <>
            <Divider className="mt-4 mb-4" />
            <Row>
              <Col xs={24} lg={12}>
                <Form.Item className="mb-0">{logStatusEl && logStatusEl}</Form.Item>
              </Col>
              <Col xs={24} lg={12} className="text-right">
                {logActionEl && logActionEl}
              </Col>
            </Row>
          </>
        )}
      </Card>
    );
  }
};

export default withRouter(TrnCard);
