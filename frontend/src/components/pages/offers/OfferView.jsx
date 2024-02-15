import React, { useState, useEffect } from "react";
import { Link, withRouter } from "react-router-dom";
import { PageContainer } from "components/layout";
import { TableNotFoundNotice, SpinnerOverlay, SyncOverlay } from "components";
import {
  Row,
  Col,
  Form,
  Button,
  Tabs,
  Input,
  DatePicker,
  Tag,
  message,
  Pagination,
  Badge,
  Modal,
} from "antd";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import configs from "configs";
import constant from "constant";
import ModalAssessment from "./ModalAssessment";
import ModalDecide from "./ModalDecide";
import ModalRejectBid from "./ModalRejectBid";
import ModalSupplierHistory from "../../ModalSupplierHistory";
import TrnCard from "../../TrnCard";
import moment from "moment";
import ModalPriceData from "components/ModalPriceData";
import ModalUpload from "components/ModalUpload";
import ModalExport from "components/ModalExport";
import { SearchOutlined } from "@ant-design/icons";
import handler from "handler";

const OfferView = (props) => {
  const statusMapping = [
    constant.STATUS_PENDING_ASSESSMENT,
    constant.STATUS_PENDING_APPROVAL,
    constant.STATUS_PENDING_BID_RESPONSE,
    constant.STATUS_REJECTED,
    constant.STATUS_APPROVED,
  ];
  const userInfo = utils.getUserInfo();
  const [pageLoading, setPageLoading] = useState(false);

  const [t] = useTranslation();
  const [form] = Form.useForm();
  const ppn = utils.getPPN();

  // const pageSize = configs.pageSize.offer;
  const pageSize = 5;

  let defaultFilterStatus = null;
  let defaultActiveTab = "all";
  if (userInfo.role.id === 2) {
    defaultFilterStatus = constant.STATUS_PENDING_BID_RESPONSE;
    defaultActiveTab = defaultFilterStatus;
  } else if (userInfo.role.id === 3) {
    defaultFilterStatus = constant.STATUS_PENDING_ASSESSMENT;
    defaultActiveTab = defaultFilterStatus;
  } else if (userInfo.role.id === 4) {
    defaultFilterStatus = constant.STATUS_PENDING_APPROVAL;
    defaultActiveTab = defaultFilterStatus;
  }

  const [dateRange, setDateRange] = useState([moment(), moment()]);

  const [filterStatus, setFilterStatus] = useState(defaultFilterStatus);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [offerSummaryTotal, setOfferSummaryTotal] = useState(null);
  const [offerSummary, setOfferSummary] = useState({});
  const [offers, setOffers] = useState([]);

  const [selectedOffer, setSelectedOffer] = useState(null);
  const [modalAssessmentShow, setModalAssessmentShow] = useState(false);
  const [decision, setDecision] = useState("");
  const [modalDecideShow, setModalDecideShow] = useState(false);
  const [modalRejectBidShow, setModalRejectBidShow] = useState(false);
  const [modalSupplierHistoryShow, setModalSupplierHistoryShow] = useState(false);
  const [modalPriceDataShow, setModalPriceDataShow] = useState(false);

  const [modalExportShow, setModalExportShow] = useState(false);

  // upload
  const [modalUploadShow, setModalUploadShow] = useState(false);
  const [modalUploadData, setModalUploadData] = useState(null);
  const [modalUploadFile, setModalUploadFile] = useState(null);

  const [search, setSearch] = useState(null);
  const [minDateLoaded, setMinDateLoaded] = useState(false);

  useEffect(() => {
    setPageLoading(true);
    api.offers
      .needActionMinDate()
      .then(function (response) {
        const rsBody = response.data.rs_body;
        setDateRange([moment(rsBody.min_date), moment()]);
      })
      .catch(function (error) {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(function () {
        setPageLoading(false);
        setMinDateLoaded(true);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (minDateLoaded) loadOffers();
  }, [minDateLoaded, filterStatus, pageNumber, dateRange, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadOffers = async () => {
    let errMsg;

    setPageLoading(true);
    const otherParams = {
      from_date: moment(dateRange[0]).format(constant.FORMAT_API_DATE),
      to_date: moment(dateRange[1]).format(constant.FORMAT_API_DATE),
    };
    if (search) otherParams.search = search;

    await api.offers
      .list(filterStatus, pageSize, pageNumber, otherParams)
      .then(function (response) {
        const rsBody = response.data.rs_body;
        setOffers(rsBody.offers);
        setTotalData(rsBody.total);
      })
      .catch(function (error) {
        errMsg = utils.getErrMsg(error);
        console.log("failed get offer list");
      });
    if (errMsg) {
      setPageLoading(false);
      utils.swal.Error({ msg: errMsg });
      return;
    }

    await api.offers
      .summary(otherParams)
      .then(function (response) {
        const rsBody = response.data.rs_body;
        let total = 0;
        for (const key in rsBody) {
          if (Object.hasOwnProperty.call(rsBody, key)) {
            total += rsBody[key];
          }
        }
        setOfferSummaryTotal(total);
        setOfferSummary(rsBody);
      })
      .catch(function (error) {
        errMsg = utils.getErrMsg(error);
        console.log("failed get offer summary");
      });
    if (errMsg) {
      setPageLoading(false);
      utils.swal.Error({ msg: errMsg });
      return;
    }

    setPageLoading(false);
  };

  const handleEdit = (offerId) => {
    Modal.confirm({
      ...constant.MODAL_CONFIRM_DANGER_PROPS,
      content: t("swalConfirmEditOffer", { offerId: offerId }),
      onOk: () => {
        props.history.push(`/offers/${offerId}/edit`);
      },
    });
  };

  const handleUseAsDraft = (offerId) => {
    Modal.confirm({
      ...constant.MODAL_CONFIRM_DEFAULT_PROPS,
      content: t("swalConfirmUseAsDraft", { offerId: offerId }),
      onOk: () => {
        api.offers
          .createFromDraft(offerId)
          .then(function (response) {
            setFilterStatus(constant.STATUS_PENDING_ASSESSMENT);
            setPageNumber(1);
          })
          .catch(function (error) {
            utils.swal.Error({ msg: utils.getErrMsg(error) });
          })
          .finally(function () {
            setPageLoading(false);
          });
      },
    });
  };

  const onSearch = (values) => {
    if (values) {
      if (values.search === "") {
        setSearch(null);
      } else {
        setSearch(values.search);
      }
    }
  };

  const renderTable = () => {
    const renderDealerAction = (offer) => {
      let renderEl = null;
      if (
        utils.havePermission(userInfo.permissions, "offer@create") &&
        (userInfo.role.id === constant.ROLE_SUPER_ADMIN ||
          (offer.dealer.employee_id === userInfo.employee_id &&
            moment(offer.handover_date_from).isAfter(moment().subtract(1, "days"))))
      ) {
        if (!offer.logistic_status) {
          renderEl = (
            <Button
              className={"mr-2"}
              onClick={() => {
                handleEdit(offer.id);
              }}
            >
              {t("edit")}
            </Button>
          );
        }
      }

      if (offer.status === constant.STATUS_PENDING_BID_RESPONSE) {
        renderEl = (
          <>
            {utils.renderWithPermission(
              userInfo.permissions,
              <Button
                type="danger"
                className="mr-2 mb-2 mb-sm-0"
                onClick={() => {
                  setSelectedOffer(offer);
                  setModalRejectBidShow(true);
                }}
              >
                {t("rejectBid")}
              </Button>,
              "offer@reject_bid",
            )}
            {utils.renderWithPermission(
              userInfo.permissions,
              <Button
                type="primary"
                className="mr-2 mb-2 mb-sm-0"
                onClick={() => {
                  setSelectedOffer(offer);
                  Modal.confirm({
                    ...constant.MODAL_CONFIRM_DEFAULT_PROPS,
                    content: t("swalConfirmAcceptBid"),
                    onOk: () => {
                      setPageLoading(true);
                      api.offers
                        .acceptBid(offer.id)
                        .then(function (response) {
                          Modal.success({
                            ...constant.MODAL_SUCCESS_DEFAULT_PROPS,
                          });
                        })
                        .catch(function (error) {
                          utils.swal.Error({ msg: utils.getErrMsg(error) });
                        })
                        .finally(function () {
                          setPageLoading(false);
                          loadOffers();
                        });
                    },
                  });
                }}
              >
                {t("acceptBid")}
              </Button>,
              "offer@accept_bid",
            )}
          </>
        );
      }
      return renderEl;
    };

    const renderRiskMgmtAction = (offer) => {
      let renderEl = [];
      if (!offer.risk_mgmt.employee_id) {
        if (offer.status === constant.STATUS_PENDING_ASSESSMENT) {
          renderEl.push(
            <Button
              className="mr-2 mb-2 mb-sm-0"
              onClick={() => {
                setSelectedOffer(offer);
                setModalAssessmentShow(true);
              }}
            >
              {t("assess")}
            </Button>,
          );
        }
      } else {
        // renderEl = (
        //   <Badge type="primary" className="mr-2">
        //     {t("assessed")}
        //     {/* <strong className="primary">{offer.risk_mgmt.name}</strong> */}
        //   </Badge>
        // );
      }
      return utils.renderWithPermission(userInfo.permissions, renderEl, "offer@assess");
    };

    const renderTopMgmtAction = (offer) => {
      if (offer.top_mgmt.employee_id && offer.top_mgmt.employee_id !== userInfo.employee_id) {
        return null;
      }

      if (offer.status === constant.STATUS_PENDING_APPROVAL) {
        let topMgmtActionEl = (
          <>
            {!offer.top_mgmt_bid_price && (
              <Button
                className="mr-2 mb-2 mb-sm-0"
                onClick={() => {
                  setSelectedOffer(offer);
                  setDecision(constant.BID);
                  setModalDecideShow(true);
                }}
              >
                {t("bid")}
              </Button>
            )}
            <Button
              type="danger"
              className="mr-2 mb-2 mb-sm-0"
              onClick={() => {
                setSelectedOffer(offer);
                setDecision(constant.REJECT);
                setModalDecideShow(true);
              }}
            >
              {t("reject")}
            </Button>
            <Button
              type="primary"
              className={`mb-2 mb-sm-0`}
              onClick={() => {
                setSelectedOffer(offer);
                setDecision(constant.APPROVE);
                setModalDecideShow(true);
              }}
            >
              {t("approve")}
            </Button>
          </>
        );

        return utils.renderWithPermission(userInfo.permissions, topMgmtActionEl, "offer@decide");
      }
    };

    const renderTransportirAction = (offer) => {
      if (offer && offer.status !== constant.STATUS_APPROVED) {
        return null;
      }

      if (!utils.havePermission(userInfo.permissions, "logistic_offer@view")) {
        return null;
      }

      return (
        <Button
          type="primary"
          onClick={() => {
            utils.openInNewTab(`/logistic/offers/create?commodity_offer=${offer.id}`);
          }}
        >
          {t("manageLogistic")}
        </Button>
      );
    };

    const renderSuperUserAction = (offer) => {
      if (userInfo && userInfo.role && !userInfo.role.super_user) {
        return null;
      }
      return (
        <Button
          type="danger"
          className={utils.havePermission(userInfo.permissions, "offer@create") ? "ml-2" : ""}
          onClick={() => {
            Modal.confirm({
              ...constant.MODAL_CONFIRM_DANGER_PROPS,
              content: t("swalConfirmDelete", { id: offer.id }),
              onOk: () => {
                setPageLoading(true);
                api.offers
                  .delete(offer.id)
                  .then(function (response) {
                    loadOffers();
                  })
                  .catch(function (error) {
                    utils.swal.Error({ msg: utils.getErrMsg(error) });
                  })
                  .finally(function () {
                    setPageLoading(false);
                  });
              },
            });
          }}
        >
          {t("delete")}
        </Button>
      );
    };

    const renderAdminAction = (offer) => {
      if (offer && (offer.status !== constant.STATUS_APPROVED || !offer.po_number)) {
        return null;
      }

      let btnUploadContract = null;
      if (offer.files && offer.files.length > 0) {
        const fileContract = offer.files.find((el) => el.type === constant.FILE_TYPE_CONTRACT);
        if (!fileContract) {
          btnUploadContract = (
            <Button
              type="primary"
              onClick={() => {
                setModalUploadShow(true);
                setModalUploadData({
                  type: constant.FILE_TYPE_CONTRACT,
                  type_text: "Contract",
                  unique_id: offer.id,
                });
              }}
            >
              {t("upload")} {t("contract")}
            </Button>
          );
        }
      }

      let btnUploadCargoReadiness = null;
      if (offer.files && offer.files.length > 0) {
        const fileCargoReadiness = offer.files.find(
          (el) => el.type === constant.FILE_TYPE_CARGO_READINESS,
        );
        if (!fileCargoReadiness) {
          btnUploadCargoReadiness = (
            <Button
              type="primary"
              onClick={() => {
                setModalUploadShow(true);
                setModalUploadData({
                  type: constant.FILE_TYPE_CARGO_READINESS,
                  type_text: "Cargo Readiness",
                  unique_id: offer.id,
                });
              }}
            >
              {t("upload")} {t("cargoReadiness")}
            </Button>
          );
        }
      }

      return (
        <>
          {btnUploadContract}
          {btnUploadCargoReadiness}
        </>
      );
    };

    const renderLogStatus = (logStatus) => {
      if (!logStatus) return null;
      let color = "default";
      switch (logStatus) {
        case "pending_approval":
          color = "warning";
          break;
        case "loading":
          color = "darkcyan";
          break;
        case "on_the_way":
          color = "darkcyan";
          break;
        case "arrived":
          color = "darkcyan";
          break;
        case "discharged":
          color = "success";
          break;

        default:
          break;
      }

      return <Tag color={color}>{utils.snakeToTitleCase(logStatus)}</Tag>;
    };

    return (
      <>
        {offers && offers.length > 0 ? (
          <>
            {offers.map((offer, index) => {
              const renderLogStatusEl = () => {
                if (offer.status === constant.STATUS_APPROVED) {
                  if (offer.terms_of_handover === "franco") {
                    return <Tag color={"success"}>{t("discharged")}</Tag>;
                  } else if (offer.fulfillment) {
                    return (
                      <Form.Item className="mb-0">
                        Logistic:&nbsp;
                        {offer.logistic_status === "pending_approval" ? (
                          <>
                            {!offer.fulfillment.is_fulfilled &&
                              renderLogStatus(offer.logistic_status)}
                          </>
                        ) : (
                          <>{renderLogStatus(offer.logistic_status)}</>
                        )}
                        {(offer.logistic_status === "pending_approval" ||
                          !offer.logistic_status) && (
                          <>
                            {offer.fulfillment.is_fulfilled ? (
                              <>
                                <Tag color={"success"}>{t("Fulfilled")}</Tag>
                                {offer.fulfillment.documents_completed ? (
                                  <Tag color={"success"}>{t("Documents Completed")}</Tag>
                                ) : (
                                  <Tag color={"red"}>{t("Documents not Completed")}</Tag>
                                )}
                              </>
                            ) : (
                              <Tag color={"red"}>{t("Not Fulfilled")}</Tag>
                            )}
                          </>
                        )}
                      </Form.Item>
                    );
                  }
                }
              };
              return (
                <TrnCard
                  ppn={ppn}
                  key={`${offer.id}_${index}`}
                  offer={offer}
                  setSelected={setSelectedOffer}
                  setModalSupplierHistoryShow={setModalSupplierHistoryShow}
                  setModalPriceDataShow={setModalPriceDataShow}
                  statusEl={
                    <Form.Item className="mb-0">
                      Offer:&nbsp;
                      {
                        <Tag color={utils.getOfferStatusColor(offer.status)}>
                          {utils.snakeToTitleCase(offer.status)}
                        </Tag>
                      }
                      {offer.status === constant.STATUS_PENDING_APPROVAL &&
                        offer.top_mgmt_bid_price &&
                        offer.dealer_fixed_price && (
                          <Tag color={"error"}>
                            {t("fixedPrice")}: {utils.thousandSeparator(offer.dealer_fixed_price)}
                          </Tag>
                        )}
                    </Form.Item>
                  }
                  actionEl={[
                    renderDealerAction(offer),
                    renderRiskMgmtAction(offer),
                    renderTopMgmtAction(offer),
                    renderAdminAction(offer),
                    renderSuperUserAction(offer),
                  ]}
                  logStatusEl={renderLogStatusEl()}
                  logActionEl={renderTransportirAction(offer)}
                />
              );
            })}
            <Pagination
              className="text-right"
              current={pageNumber}
              total={totalData}
              {...configs.TABLE_PAGINATION}
              pageSize={pageSize}
              onChange={(selectedPage) => {
                if (!selectedPage || selectedPage === 0) {
                  return;
                }
                setPageNumber(selectedPage);
                utils.scrollToTop();
              }}
            />
          </>
        ) : (
          <TableNotFoundNotice />
        )}
      </>
    );
  };

  const onTabChanged = (key) => {
    if (key === "all") {
      setFilterStatus(null);
    } else {
      setFilterStatus(key);
    }
    setPageNumber(1);
  };

  const tabPanes = [
    <Tabs.TabPane
      tab={
        <>
          <span className="mr-1">{t("all")}</span>
          {offerSummaryTotal ? <Badge count={offerSummaryTotal} /> : null}
        </>
      }
      key="all"
    >
      {filterStatus === null && renderTable()}
    </Tabs.TabPane>,
  ];
  for (const status of statusMapping) {
    tabPanes.push(
      <Tabs.TabPane
        tab={
          <>
            <span className="mr-1">{utils.snakeToTitleCase(status)}</span>
            {offerSummary && offerSummary[status] && <Badge count={offerSummary[status]} />}
          </>
        }
        key={status}
      >
        {filterStatus && filterStatus === status && <>{renderTable()}</>}
      </Tabs.TabPane>,
    );
  }

  if (!minDateLoaded) return null;

  return (
    <PageContainer
      title={t("offerData")}
      additionalAction={utils.renderWithPermission(
        userInfo.permissions,
        <Link to="/offers/create">
          <Button size="small">{`${t("add")} ${t("offer")}`}</Button>
        </Link>,
        "offer@create",
      )}
      btnAction={utils.renderWithPermission(
        userInfo.permissions,
        <Button
          size="small"
          onClick={() => {
            setModalExportShow(true);
          }}
          disabled
        >
          {t("exportXLSX")} ???
        </Button>,
        "export@xlsx",
      )}
      breadcrumbs={[
        {
          text: t("offer"),
          link: "/offers",
        },
      ]}
    >
      <SyncOverlay loading={pageLoading} />
      <ModalAssessment
        visible={modalAssessmentShow}
        onCancel={() => setModalAssessmentShow(false)}
        onSuccess={() => {
          setModalAssessmentShow(false);
          loadOffers();
          message.success(`${t("offer")} ${t("assessed")}`);
        }}
        offer={selectedOffer}
      />
      <ModalDecide
        visible={modalDecideShow}
        onCancel={() => setModalDecideShow(false)}
        onSuccess={() => {
          setModalDecideShow(false);
          loadOffers();
          message.success(`${t(decision)} ${t("offer")} ${t("success")}`);
        }}
        offer={selectedOffer}
        decision={decision}
      />
      <ModalRejectBid
        visible={modalRejectBidShow}
        onCancel={() => setModalRejectBidShow(false)}
        onSuccess={() => {
          setModalRejectBidShow(false);
          loadOffers();
          message.success(`${t("rejectBid")} ${t("offer")} ${t("success")}`);
        }}
        offer={selectedOffer}
      />
      <ModalSupplierHistory
        visible={modalSupplierHistoryShow}
        onCancel={() => setModalSupplierHistoryShow(false)}
        supplierId={selectedOffer && selectedOffer.spplr ? selectedOffer.spplr.supplier_id : ""}
        setPageLoading={setPageLoading}
      />
      <ModalPriceData
        visible={modalPriceDataShow}
        onCancel={() => setModalPriceDataShow(false)}
        date={selectedOffer && selectedOffer.datetime ? moment(selectedOffer.datetime) : moment()}
        setPageLoading={setPageLoading}
      />

      <ModalExport
        visible={modalExportShow}
        onCancel={() => setModalExportShow(false)}
        exportType={"offer"}
      />

      <ModalUpload
        visible={modalUploadShow}
        onCancel={() => {
          setModalUploadShow(false);
          setModalUploadData(null);
          setModalUploadFile(null);
        }}
        onOk={() => {
          setModalUploadShow(false);
          loadOffers();
          setModalUploadData(null);
          setModalUploadFile(null);
        }}
        data={modalUploadData}
        existingFile={modalUploadFile}
      />

      <Form className="mb-2 w-100" form={form} onFinish={onSearch}>
        <Row gutter={12}>
          <Col xs={24} lg={9} xl={7}>
            <Form.Item className="mb-2" name="date" wrapperCol={{ flex: "auto" }}>
              <DatePicker.RangePicker
                defaultValue={dateRange}
                value={dateRange}
                style={{ width: "100%" }}
                {...utils.FORM_RANGEPICKER_PROPS}
                onChange={(dates, dateStrings) => {
                  setDateRange(dates);
                }}
                // onCalendarChange={(dates, dateStrings, info) => {
                //   console.log("info");
                //   console.log(info);
                //   if (info && info.range && info.range === "end") {
                //     console.log("update daterange");
                //     console.log(dates);
                //     setDateRange(dates);
                //   }
                // }}
                allowClear={false}
              />
            </Form.Item>
          </Col>
          <Col xs={24} lg={12} xl={14}>
            <Form.Item name="search" className="mb-2">
              <Input
                prefix={<SearchOutlined className="site-form-item-icon" />}
                placeholder={t("searchHere")}
                className="w-100"
              />
            </Form.Item>
          </Col>
          <Col xs={24} lg={3} xl={3}>
            <Button type="primary" htmlType="submit" block>
              {t("search")}
            </Button>
          </Col>
        </Row>
      </Form>

      <Tabs defaultActiveKey={defaultActiveTab} onChange={onTabChanged}>
        {tabPanes}
      </Tabs>
    </PageContainer>
  );
};

export default withRouter(OfferView);
