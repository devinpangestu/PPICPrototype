import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { PageContainer } from "components/layout";
import { Row, Col, Table, Card } from "antd";
import { api } from "api";
import utils from "utils";
import { SyncOverlay } from "components";

import { useTranslation } from "react-i18next";
import configs from "configs";
import moment from "moment";
import constant from "constant";

const LogisticHome = () => {
  const [t] = useTranslation();
  const [pageLoading, setPageLoading] = useState(false);

  const [data, setData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPageLoading(true);

    api.logistic.offers
      .dashboard()
      .then(function (response) {
        const rsBody = response.data.rs_body;
        setData(rsBody);
      })
      .catch(function (error) {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(function () {
        setPageLoading(false);
      });
  };

  const getTitle = (title, count) => {
    return (
      <>
        {title} <span className="count-badge">{count}</span>
      </>
    );
  };

  const getTable = (offers, additional = [{ field: "", date: moment() }]) => {
    return (
      <table>
        {offers.map((el) => {
          console.log("el t");
          console.log(el);
          return (
            <Card
              className="card-dashboard"
              size="small"
              style={{ fontWeight: "bold", cursor: "pointer" }}
              onClick={() => {
                utils.openInNewTab(
                  `/logistic/offers_20231013/create?commodity_offer=${el.commodity_offer_id}`,
                );
              }}
            >
              <tr>
                <td style={{ color: "#00703c", fontWeight: "bold" }}>{`${el.type.toUpperCase()} - ${
                  el.transportir.name
                } ${
                  el.ship && el.ship.id ? `(KAPAL: ${el.ship.name})` : ""
                }/ ${utils.thousandSeparator(el.quantity)} MT`}</td>
              </tr>
              <table>
                <tr>
                  <td>EST LOADING</td>
                  <td>:</td>
                  <td>{`${moment(el.loading_date_from).format(
                    constant.FORMAT_DISPLAY_DATE_COMPACT,
                  )} - ${moment(el.loading_date_to).format(
                    constant.FORMAT_DISPLAY_DATE_COMPACT,
                  )}`}</td>
                </tr>
                <tr>
                  <td>OFFER DATE</td>
                  <td>:</td>
                  <td>{`${moment(el.commodity_offer.datetime).format(
                    constant.FORMAT_DISPLAY_DATE_COMPACT,
                  )}`}</td>
                </tr>
                {additional &&
                  additional.map((addF) => {
                    return (
                      <>
                        {addF.field !== "" && (
                          <tr>
                            <td>{addF.field}</td>
                            <td>:</td>
                            <td>
                              {moment(el[addF.date]).format(constant.FORMAT_DISPLAY_DATE_COMPACT)}
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
              </table>
            </Card>
          );
        })}
      </table>
    );
  };

  const getDashboardCol = () => {
    if (!data) return [];
    return [
      {
        title: getTitle(t("dealCPO"), data.deal_cpo.count),
        dataIndex: "dealCPO",
        align: "center",
        key: "dealCPO",
        render: (_, row) => {
          if (row.deal_cpo && row.deal_cpo.offers) {
            return (
              <table>
                {row.deal_cpo.offers.map((el) => {
                  return (
                    <Card
                      className="card-dashboard"
                      size="small"
                      style={{ fontWeight: "bold", cursor: "pointer" }}
                      onClick={() => {
                        if (el.terms_of_handover === "franco") {
                          return;
                        }
                        utils.openInNewTab(
                          `/logistic/offers_20231013/create?commodity_offer=${el.unique_id}`,
                        );
                      }}
                    >
                      <tr>
                        <td>{el.supplier.name}</td>
                      </tr>
                      <tr>
                        <td>{`QTY: ${utils.thousandSeparator(el.quantity)} MT`}</td>
                      </tr>
                      <tr>
                        <td>{`HANDOVER: ${moment(el.handover_date_from).format(
                          constant.FORMAT_DISPLAY_DATE_COMPACT,
                        )} - ${moment(el.handover_date_to).format(
                          constant.FORMAT_DISPLAY_DATE_COMPACT,
                        )}`}</td>
                      </tr>
                    </Card>
                  );
                })}
              </table>
            );
          }
          return null;
        },
      },
      {
        title: getTitle(t("transportReady"), data.transport_ready.count),
        dataIndex: "transportReady",
        key: "transportReady",
        align: "center",
        render: (_, row) => {
          if (row.transport_ready && row.transport_ready.offers) {
            return getTable(row.transport_ready.offers);
          }
          return null;
        },
      },
      {
        title: getTitle(t("cargoLoading"), data.cargo_loading.count),
        dataIndex: "cargoLoading",
        key: "cargoLoading",
        align: "center",
        render: (_, row) => {
          if (row.cargo_loading && row.cargo_loading.offers) {
            return getTable(row.cargo_loading.offers, [
              {
                field: "LOADING DATE",
                date: "actual_loading_date",
              },
            ]);
          }
          return null;
        },
      },
      {
        title: getTitle(t("onTheWay"), data.on_the_way.count),
        dataIndex: "onTheWay",
        key: "onTheWay",
        align: "center",
        render: (_, row) => {
          if (row.on_the_way && row.on_the_way.offers) {
            return getTable(row.on_the_way.offers, [
              {
                field: "LOADING DATE",
                date: "actual_loading_date",
              },
              {
                field: "DELIVERY DATE",
                date: "delivery_date",
              },
            ]);
          }
          return null;
        },
      },
      {
        title: getTitle(t("arrivedAndQueue"), data.arrived_and_queue.count),
        dataIndex: "arrivedAndQueue",
        key: "arrivedAndQueue",
        align: "center",
        render: (_, row) => {
          if (row.arrived_and_queue && row.arrived_and_queue.offers) {
            return getTable(row.arrived_and_queue.offers, [
              {
                field: "LOADING DATE",
                date: "actual_loading_date",
              },
              {
                field: "DELIVERY DATE",
                date: "delivery_date",
              },
              {
                field: "DELIVERED DATE",
                date: "delivered_date",
              },
            ]);
          }
          return null;
        },
      },
      {
        title: t("discharged"),
        dataIndex: "discharged",
        key: "discharged",
        align: "center",
        render: (_, row) => {
          if (row.discharged) {
            return (
              <table>
                <Card className="card-dashboard" size="small" style={{ fontWeight: "bold" }}>
                  <tr>
                    <td>TODAY</td>
                    <td>:</td>
                    <td
                      className="count-badge"
                      style={{ textAlign: "center", marginLeft: "5px", marginBottom: "5px" }}
                    >
                      {row.discharged.today}
                    </td>
                  </tr>
                  <tr>
                    <td>ALL TIME</td>
                    <td>:</td>
                    <td className="count-badge" style={{ textAlign: "center", marginLeft: "5px" }}>
                      {row.discharged.all}
                    </td>
                  </tr>
                </Card>
              </table>
            );
          }
          return null;
        },
      },
    ];
  };

  const dashboardCol = getDashboardCol();
  const dashboardSrc = [data];

  // if (data.deal_cpo && data.deal_cpo.offers) {
  //   dashboardSrc.push();
  // }
  // if (data.transport_ready && data.transport_ready.offers) {
  // }
  // if (data.cargo_loading && data.cargo_loading.offers) {
  // }
  // if (data.on_the_way && data.on_the_way.offers) {
  // }
  // if (data.arrived_and_queue && data.arrived_and_queue.offers) {
  // }
  // if (data.discharged) {
  // }

  return (
    <PageContainer title={"Dashboard"}>
      <SyncOverlay loading={pageLoading} />
      <Row>
        <Col xs={24}>
          {data && (
            <Table
              className="tbl-dashboard"
              dataSource={dashboardSrc}
              columns={dashboardCol}
              {...configs.TABLE_SINGLEPAGE}
            />
          )}
          {/* <Card title="Dashboard" /> */}
        </Col>
      </Row>
    </PageContainer>
  );
};

export default withRouter(LogisticHome);
