import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import {
  Row,
  Col,
  Form,
  Button,
  Select,
  InputNumber,
  DatePicker,
  Descriptions,
  Tag,
  message,
  Typography,
  Table,
  Modal,
  Divider,
} from "antd";
import { api } from "api";
import handler from "handler";
import { SpinnerOverlay, SyncOverlay } from "components";
import { useTranslation } from "react-i18next";
import utils from "utils";
import constant from "constant";
import configs from "configs";
import moment from "moment";
import ModalTransportirCreate from "../transportir/ModalCreate";
import ModalShipCreate from "../transportir/ship/ModalCreate";
import ModalConfirm from "./ModalConfirm";
import qs from "query-string";
import { SectionHeading } from "components/Section";
import ModalReject from "./ModalReject";
import ModalApprove from "./ModalApprove";
import ModalAdjust from "./ModalAdjust";
import ModalUpload from "../../../ModalUpload";
import ModalEditFiles from "./ModalEditFiles";
import ModalRecap from "./ModalRecap";
import ModalLoading from "./ModalLoading";
import { PageContainer } from "components/layout";
import ModalDelivery from "./ModalDelivery";
import ModalDelivered from "./ModalDelivered";
import ModalSPKPembongkaran from "./ModalSPKPembongkaran";
import ModalDischarge from "./ModalDischarge";

const { Title } = Typography;

const LogOfferForm = (props) => {
  const typeInsurance = "logistic_insurance";
  const typeTextInsurance = "Insurance";

  const typeContract = "contract";
  const typeTextContract = "Contract";

  const typeCargoReadiness = "cargo_readiness";
  const typeTextCargoReadiness = "Cargo Readiness";

  const userInfo = utils.getUserInfo();

  const [t] = useTranslation();
  const queryString = qs.parse(props.location.search);
  const cOfferId = queryString.commodity_offer ? queryString.commodity_offer : "";
  const ppn = utils.getPPN();

  const [form] = Form.useForm();
  const [formData, setFormData] = useState(null);

  const { isEdit, id } = props;

  const [type, setType] = useState(null);
  const [ship, setShip] = useState(null);
  const [needs, setNeeds] = useState({ sea: 0, land: 0 });
  const [fulfillment, setFulfillment] = useState({
    sea: { qty: 0, approved: false },
    land: { qty: 0, approved: false },
  });

  // const [logOffers, setLogOffers] = useState([]);
  const [logOffersSea, setLogOffersSea] = useState([]);
  const [logOffersLand, setLogOffersLand] = useState([]);
  const [cOffer, setCOffer] = useState(null);

  const [pageLoading, setPageLoading] = useState(false);

  const [transportirs, setTransportirs] = useState([]);
  const [ships, setShips] = useState([]);

  const [modalConfirmShow, setModalConfirmShow] = useState(false);
  const [modalConfirmData, setModalConfirmData] = useState(null);

  // actions
  const [actionLogOfferId, setActionLogOfferId] = useState(null);

  // approve
  const [modalApproveShow, setModalApproveShow] = useState(false);

  // reject
  const [modalRejectShow, setModalRejectShow] = useState(false);

  // adjust
  const [modalAdjustShow, setModalAdjustShow] = useState(false);
  const [modalAdjustData, setModalAdjustData] = useState(null);

  // upload
  const [modalUploadShow, setModalUploadShow] = useState(false);
  const [modalUploadData, setModalUploadData] = useState(null);
  const [modalUploadFile, setModalUploadFile] = useState(null);

  const [modalCreateTransportirShow, setModalCreateTransportirShow] = useState(false);
  const [modalCreateShipShow, setModalCreateShipShow] = useState(false);

  // const [hideActionPopup, setHideActionPopup] = useState(true);

  const [modalEditFilesShow, setModalEditFilesShow] = useState(false);
  const [modalEditFilesButtons, setModalEditFilesButtons] = useState([]);

  // recap
  const [modalRecapShow, setModalRecapShow] = useState(false);
  const [modalRecapData, setModalRecapData] = useState(null);

  const [budget, setBudget] = useState(null);
  const [overBudget, setOverBudget] = useState(false);

  // loading
  const [modalLoadingShow, setModalLoadingShow] = useState(false);

  // delivery
  const [modalDeliveryShow, setModalDeliveryShow] = useState(false);
  const [modalDeliveryData, setModalDeliveryData] = useState({});

  // delivered
  const [modalDeliveredShow, setModalDeliveredShow] = useState(false);

  // discharge
  const [modalDischargeShow, setModalDischargeShow] = useState(false);
  const [modalDischargeMaxQty, setModalDischargeMaxQty] = useState(0);

  // spk pembongkaran
  const [modalSPKBongkarShow, setModalSPKBongkarShow] = useState(false);
  const [modalSPKBongkarData, setModalSPKBongkarData] = useState(null);

  useEffect(() => {
    if (isEdit && !id) {
      utils.swal.Error({
        msg: t("swalDefaultError"),
        cbFn: () => {
          props.history.push("/logistic/offers_20231013");
          return;
        },
      });
      return;
    }
    getCOffer();
    handler.getTransportirs(setPageLoading, setTransportirs);
    if (new Date().getTime()> userInfo.expired_at) {
      localStorage.clear();
      props.history.push("/login");
    }
  }, []);

  useEffect(() => {
    if (cOffer !== null) {
      if (cOffer.status !== constant.STATUS_APPROVED) {
        props.history.push("/logistic/offers");
        return;
      }

      if (cOffer.terms_of_handover === "fob") {
        setNeeds({ sea: cOffer.quantity });
      } else if (cOffer.terms_of_handover === "cif") {
        setNeeds({ land: cOffer.quantity });
      } else {
        // loco
        setNeeds({ sea: cOffer.quantity, land: cOffer.quantity });
      }
      getLogOffers();
      getBudget();
    }
  }, [cOffer]);

  useEffect(() => {
    const cFulfill = {
      sea: { qty: 0, approved: false },
      land: { qty: 0, approved: false },
    };

    if (logOffersSea && logOffersSea.length > 0) {
      for (let i = 0; i < logOffersSea.length; i++) {
        const logOffer = logOffersSea[i];
        if (logOffer.status === constant.STATUS_REJECTED) {
          continue;
        }
        cFulfill[constant.TRANSPORTIR_TYPE_SEA_20231013].qty += Number(logOffer.quantity);
        cFulfill[constant.TRANSPORTIR_TYPE_SEA_20231013].approved =
          logOffer.status === constant.STATUS_APPROVED;
      }
    }
    if (logOffersLand && logOffersLand.length > 0) {
      for (let i = 0; i < logOffersLand.length; i++) {
        const logOffer = logOffersLand[i];
        if (logOffer.status === constant.STATUS_REJECTED) {
          continue;
        }
        cFulfill[constant.TRANSPORTIR_TYPE_LAND_20231013].qty += Number(logOffer.quantity);
        cFulfill[constant.TRANSPORTIR_TYPE_LAND_20231013].approved =
          logOffer.status === constant.STATUS_APPROVED;
      }
    }
    setFulfillment(cFulfill);
  }, [logOffersSea, logOffersLand]);

  useEffect(() => {
    console.log("ships");
    console.log(ships);
  }, [ships]);

  if (cOfferId === "") {
    props.history.push("/logistic/offers");
    return;
  }

  const getBudget = () => {
    if (!cOffer) return;
    api.master.budget_transportir
      .getByParams(cOffer.hOver_Loc.id, cOffer.whs.id, cOffer.terms_of_handover)
      .then(function (response) {
        const resBudget = response.data.rs_body;
        console.log("budget");
        console.log(budget);
        setBudget(resBudget.budget);
      });
  };
  const getLogOffers = () => {
    setPageLoading(true);
    api.logistic.offers
      .list("", 1000, 1, cOffer.unique_id)
      .then(function (response) {
        const res = response.data.rs_body;
        const logOffers = res.offers;
        // setLogOffers(logOffers);
        setLogOffersSea(
          logOffers.filter((el) => el.type === constant.TRANSPORTIR_TYPE_SEA_20231013),
        );
        setLogOffersLand(
          logOffers.filter((el) => el.type === constant.TRANSPORTIR_TYPE_LAND_20231013),
        );
        if (isEdit) {
          const currLogOffer = logOffers.find((el) => el.id === id);

          let selectedTransportir = null;
          for (let i = 0; i < transportirs.length; i++) {
            const t = transportirs[i];
            if (t.value === currLogOffer.transportir.id) {
              selectedTransportir = t;
              break;
            }
          }
          if (selectedTransportir !== null) {
            utils.swal.Error({
              msg: t("swalDefaultError"),
              cbFn: () => {
                props.history.push("/logistic/offers");
                return;
              },
            });
            return;
          }

          const setField = {
            transportir: currLogOffer.transportir_id,
            ship: currLogOffer.ship_id,
            quantity: Number(currLogOffer.quantity),
            price: Number(currLogOffer.price),
            loading_date: [
              moment(currLogOffer.loading_date_from),
              moment(currLogOffer.loading_date_to),
            ],
            eta_warehouse: [
              moment(currLogOffer.eta_warehouse_from),
              moment(currLogOffer.eta_warehouse_to),
            ],
          };
          form.setFieldsValue(setField);
        }
      })
      .catch(function (error) {
        utils.swal.Error({
          msg: utils.getErrMsg(error),
          cbFn: () => {
            props.history.push("/logistic/offers");
            return;
          },
        });
      })
      .finally(function () {
        setPageLoading(false);
      });
  };

  const getCOffer = () => {
    setPageLoading(true);
    api.offers
      .get(cOfferId)
      .then(function (response) {
        const offer = response.data.rs_body;
        setCOffer(offer);
      })
      .catch(function (error) {
        utils.swal.Error({
          msg: utils.getErrMsg(error),
          cbFn: () => {
            props.history.push("/logistic/offers");
            return;
          },
        });
      })
      .finally(function () {
        setPageLoading(false);
      });
  };

  const resetForm = () => {
    form.resetFields();
  };

  const handleOnConfirm = () => {
    setPageLoading(true);
    const d = formData;
    const reqBody = {
      commodity_offer_id: cOffer.unique_id,
      transportir_id: Number(d.transportir),
      type: d.type,
      quantity: Number(d.quantity),
      price: Number(d.price),
    };
    if (d.loading_date && d.loading_date.length === 2) {
      reqBody.loading_date_from = moment(d.loading_date[0]).format(constant.FORMAT_API_DATE);
      reqBody.loading_date_to = moment(d.loading_date[1]).format(constant.FORMAT_API_DATE);
    }
    if (d.eta_warehouse && d.eta_warehouse.length === 2) {
      reqBody.eta_warehouse_from = moment(d.eta_warehouse[0]).format(constant.FORMAT_API_DATE);
      reqBody.eta_warehouse_to = moment(d.eta_warehouse[1]).format(constant.FORMAT_API_DATE);
    }

    if (d.type === constant.TRANSPORTIR_TYPE_SEA_20231013) {
      reqBody.ship_id = Number(d.ship);
    }
    console.log("reqBody");
    console.log(reqBody);
    if (isEdit) {
      api.logistic.offers
        .edit(id, reqBody)
        .then(function (response) {
          Modal.success({
            ...constant.MODAL_SUCCESS_DEFAULT_PROPS,
            content: t("swalDefaultSuccess"),
            onOk: () => {
              props.history.push("/logistic/offers");
            },
          });
        })
        .catch(function (error) {
          utils.swal.Error({ msg: utils.getErrMsg(error) });
        })
        .finally(function () {
          setPageLoading(false);
        });
    } else {
      api.logistic.offers
        .create(reqBody)
        .then(function (response) {
          resetForm();
          getLogOffers();
          message.success(t("success"));
        })
        .catch(function (error) {
          utils.swal.Error({ msg: utils.getErrMsg(error) });
        })
        .finally(function () {
          setPageLoading(false);
        });
    }
  };

  const handleOnSubmit = (values) => {
    setFormData(values);
    console.log("values");
    console.log(values);
    const numFmt = configs.FORM_NUMBER_FORMAT.format;

    const confirmDataObj = {
      type: utils.snakeToTitleCase(values.type),
      transportir: transportirs.find((el) => el.value === Number(values.transportir)).label,
      quantity: numFmt(values.quantity),
      price: numFmt(values.price),
    };
    if (values.type === constant.TRANSPORTIR_TYPE_SEA_20231013) {
      confirmDataObj.ship = ships.find((el) => el.value === Number(values.ship)).label;
    }
    if (values.loading_date.length === 2) {
      const loadingDateFrom = values.loading_date[0].format(constant.FORMAT_DISPLAY_DATE);
      const loadingDateTo = values.loading_date[1].format(constant.FORMAT_DISPLAY_DATE);
      confirmDataObj.loading_date = `${loadingDateFrom} - ${loadingDateTo}`;
    }

    if (values.eta_warehouse.length === 2) {
      const etaFrom = values.eta_warehouse[0].format(constant.FORMAT_DISPLAY_DATE);
      const etaTo = values.eta_warehouse[1].format(constant.FORMAT_DISPLAY_DATE);
      confirmDataObj.eta_warehouse = `${etaFrom} - ${etaTo}`;
    }
    setModalConfirmData(confirmDataObj);
    setModalConfirmShow(true);
  };

  let initialValues;
  if (constant.isDevelopment()) {
    initialValues = {
      // type: "land",
      // transportir: "1",
      // ship: "1",
      // quantity: 1000,
      // price: 10000,
      // loading_date: [moment(), moment()],
      // eta_warehouse: [moment(), moment()],
    };
  }

  let maxQty = Number.MAX_SAFE_INTEGER;
  if (needs && needs[type]) {
    maxQty = needs[type];
    if (fulfillment && fulfillment[type]) {
      maxQty = needs[type] - fulfillment[type].qty;
    }
  }

  if (ship && ship.capacity && Number(maxQty) > Number(ship.capacity)) {
    maxQty = Number(ship.capacity);
  }

  let seaQtyLeft = 0;
  let landQtyLeft = 0;
  if (needs) {
    if (needs.sea) {
      seaQtyLeft = Number(needs.sea);
      if (fulfillment && fulfillment.sea) {
        seaQtyLeft = Number(needs.sea) - Number(fulfillment.sea.qty);
      }
    }
    if (needs.land) {
      landQtyLeft = Number(needs.land);
      if (fulfillment && fulfillment.land) {
        landQtyLeft = Number(needs.land) - Number(fulfillment.land.qty);
      }
    }
  }

  let needSea = false;
  if (cOffer && constant.TERMS_OF_HANDOVER_SEA.includes(cOffer.terms_of_handover)) {
    needSea = true;
  }

  let needLand = false;
  if (cOffer && cOffer.terms_of_handover !== "fob") {
    needLand = true;
  }

  const seaFulFilled =
    !needSea || (needSea === true && seaQtyLeft === 0 && fulfillment.sea.approved);
  const landFulFilled =
    !needLand || (needLand === true && landQtyLeft === 0 && fulfillment.land.approved);
  const logisticFulfilled = seaFulFilled && landFulFilled;

  return (
    <PageContainer
      title={t("logistic")}
      additionalAction={
        logisticFulfilled ? (
          <Tag color="success">
            <strong>FulFilled</strong>
          </Tag>
        ) : (
          <Tag color="red">
            <strong>Not FulFilled</strong>
          </Tag>
        )
      }
    >
      <SyncOverlay loading={pageLoading} />
      <ModalConfirm
        isEdit={isEdit}
        values={modalConfirmData}
        visible={modalConfirmShow}
        onCancel={() => {
          setModalConfirmShow(false);
        }}
        onOk={() => {
          handleOnConfirm();
          setModalConfirmShow(false);
        }}
      />

      <ModalRecap
        visible={modalRecapShow}
        onCancel={() => {
          setModalRecapShow(false);
        }}
        onOk={() => {
          setModalRecapShow(false);
          getLogOffers();
        }}
        data={modalRecapData}
      />

      <ModalSPKPembongkaran
        visible={modalSPKBongkarShow}
        onCancel={() => {
          setModalSPKBongkarShow(false);
        }}
        onOk={() => {
          setModalSPKBongkarShow(false);
          getLogOffers();
        }}
        data={modalSPKBongkarData}
      />

      <ModalEditFiles
        visible={modalEditFilesShow}
        onCancel={() => {
          setModalEditFilesShow(false);
        }}
        onOk={() => {
          setModalEditFilesShow(false);
        }}
        buttons={modalEditFilesButtons}
      />

      <ModalUpload
        visible={modalUploadShow}
        onCancel={() => {
          setModalUploadShow(false);
          getLogOffers();
          setModalUploadData(null);
          setModalUploadFile(null);
        }}
        onOk={() => {
          setModalUploadShow(false);
          getLogOffers();
          setModalUploadData(null);
          setModalUploadFile(null);
          setModalEditFilesShow(false);
        }}
        data={modalUploadData}
        existingFile={modalUploadFile}
      />

      <ModalReject
        visible={modalRejectShow}
        onCancel={() => {
          setModalRejectShow(false);
        }}
        onSuccess={() => {
          setModalRejectShow(false);
          message.success("Offer Rejected");
          getLogOffers();
        }}
        id={actionLogOfferId}
      />
      <ModalApprove
        visible={modalApproveShow}
        onCancel={() => {
          setModalApproveShow(false);
        }}
        onSuccess={() => {
          setModalApproveShow(false);
          message.success("Offer Approved");
          getLogOffers();
        }}
        id={actionLogOfferId}
      />
      <ModalAdjust
        visible={modalAdjustShow}
        onCancel={() => {
          setModalAdjustShow(false);
        }}
        onSuccess={() => {
          setModalAdjustShow(false);
          message.success("Offer Adjusted");
          getLogOffers();
        }}
        id={actionLogOfferId}
        data={modalAdjustData}
      />

      <ModalTransportirCreate
        visible={modalCreateTransportirShow}
        onCancel={() => {
          setModalCreateTransportirShow(false);
        }}
        onSuccess={() => {
          handler.getTransportirs(setPageLoading, setTransportirs);
          setModalCreateTransportirShow(false);
          message.success(`${t("transportir")} ${t("toastSuffixSuccess")}`);
        }}
      />

      <ModalShipCreate
        visible={modalCreateShipShow}
        onCancel={() => {
          setModalCreateShipShow(false);
        }}
        onSuccess={() => {
          handler.getShips(setPageLoading, setShips, form.getFieldValue("transportir"));
          setModalCreateShipShow(false);
          message.success(`${t("ship")} ${t("toastSuffixSuccess")}`);
        }}
        transportirId={form.getFieldValue("transportir")}
      />

      <ModalLoading
        visible={modalLoadingShow}
        onCancel={() => {
          setModalLoadingShow(false);
        }}
        onSuccess={() => {
          setModalLoadingShow(false);
          message.success("Success");
          getLogOffers();
        }}
        id={actionLogOfferId}
      />

      <ModalDelivery
        visible={modalDeliveryShow}
        onCancel={() => {
          setModalDeliveryShow(false);
        }}
        onSuccess={() => {
          setModalDeliveryShow(false);
          message.success("Success");
          getLogOffers();
        }}
        data={modalDeliveryData}
        id={actionLogOfferId}
      />

      <ModalDelivered
        visible={modalDeliveredShow}
        onCancel={() => {
          setModalDeliveredShow(false);
        }}
        onSuccess={() => {
          setModalDeliveredShow(false);
          message.success("Success");
          getLogOffers();
        }}
        id={actionLogOfferId}
      />

      <ModalDischarge
        visible={modalDischargeShow}
        onCancel={() => {
          setModalDischargeShow(false);
        }}
        onSuccess={() => {
          setModalDischargeShow(false);
          message.success("Success");
          getLogOffers();
        }}
        id={actionLogOfferId}
        // maxQty={modalDischargeMaxQty}
      />

      <div className="compact-wrapper">
        <div
          style={{
            maxWidth: "1200px",
          }}
        >
          <Row gutter={16}>
            {cOffer && (
              <>
                <Col xs={24} lg={10}>
                  <Descriptions bordered column={1} size="small" className="log-desc mb-3">
                    <Descriptions.Item
                      className="mb-0"
                      label={t("offerId")}
                      style={{ width: "300px" }}
                      labelStyle={{ width: "100px" }}
                    >
                      <strong>{cOffer.id}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item
                      className="mb-0"
                      label={t("commodity")}
                      style={{ width: "300px" }}
                      labelStyle={{ width: "100px" }}
                    >
                      <strong>{cOffer.cmdty.name}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item
                      className="mb-0"
                      label={t("approvedAt")}
                      style={{ width: "300px" }}
                      labelStyle={{ width: "100px" }}
                    >
                      <strong>
                        {moment(cOffer.top_mgmt_action_time).format(
                          constant.FORMAT_DISPLAY_DATETIME,
                        )}
                      </strong>
                    </Descriptions.Item>
                    <Descriptions.Item
                      className="mb-0"
                      label={t("supplier")}
                      style={{ width: "300px" }}
                      labelStyle={{ width: "100px" }}
                    >
                      <strong>{cOffer.spplr.name}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item
                      className="mb-0"
                      label={t("quantity")}
                      style={{ width: "300px" }}
                      labelStyle={{ width: "100px" }}
                    >
                      <strong>{utils.thousandSeparator(cOffer.quantity)}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item
                      className="mb-0"
                      label="Fulfillment Needs"
                      style={{ width: "300px" }}
                      labelStyle={{ width: "100px" }}
                    >
                      {needs && (
                        <strong>
                          {needSea && (
                            <Row gutter={12} className="mb-2">
                              <Col flex="auto">
                                {`${t("sea")}: ${utils.thousandSeparator(needs.sea)}`} MT
                              </Col>
                              <Col xs={24} lg={12} className="text-center">
                                {seaQtyLeft === 0 && (
                                  <>
                                    {fulfillment.sea.approved === true ? (
                                      <Tag className="ma-0" color="success">
                                        Fulfilled
                                      </Tag>
                                    ) : (
                                      <Tag className="ma-0" color="warning">
                                        Pending Approval
                                      </Tag>
                                    )}
                                  </>
                                )}
                              </Col>
                            </Row>
                          )}
                          {needLand ? (
                            <Row gutter={12}>
                              <Col flex="auto">
                                {`${t("land")}: ${utils.thousandSeparator(needs.land)}`} MT
                              </Col>
                              <Col xs={24} lg={12} className="text-center">
                                {landQtyLeft === 0 && (
                                  <>
                                    {fulfillment.land.approved === true ? (
                                      <Tag className="ma-0" color="success">
                                        Fulfilled
                                      </Tag>
                                    ) : (
                                      <Tag className="ma-0" color="warning">
                                        Pending Approval
                                      </Tag>
                                    )}
                                  </>
                                )}
                              </Col>
                            </Row>
                          ) : null}
                        </strong>
                      )}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col xs={24} lg={14}>
                  <Descriptions size="small" bordered column={1} className="log-desc mb-3">
                    <Descriptions.Item className="mb-0" label={t("handoverDate")}>
                      <strong>{`${moment(cOffer.handover_date_from).format(
                        constant.FORMAT_DISPLAY_DATE,
                      )} - ${moment(cOffer.handover_date_to).format(
                        constant.FORMAT_DISPLAY_DATE,
                      )}`}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item className="mb-0" label={t("termsOfHandover")}>
                      <strong>{constant.TERMS_OF_HANDOVER_MAP[cOffer.terms_of_handover]}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item className="mb-0" label={t("handoverLocation")}>
                      <strong>{cOffer.hOver_Loc.name}</strong>
                    </Descriptions.Item>
                    {cOffer.handover_location && (
                      <Descriptions.Item className="mb-0" label={t("handoverDescription")}>
                        <strong>{constant.getWarehouseDesc(cOffer.handover_location)}</strong>
                      </Descriptions.Item>
                    )}
                    <Descriptions.Item className="mb-0" label={t("warehouse")}>
                      <strong>{`${cOffer.whs.warehouse_id} - ${cOffer.whs.name}`}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item className="mb-0" label={t("eta")}>
                      <strong>{`${moment(cOffer.eta_from).format(
                        constant.FORMAT_DISPLAY_DATE,
                      )} - ${moment(cOffer.eta_to).format(constant.FORMAT_DISPLAY_DATE)}`}</strong>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </>
            )}
          </Row>
          <br />
        </div>

        {logOffersSea && logOffersSea.length > 0 && (
          <>
            <SectionHeading title={t("sea")} withDivider />
            {/* <Divider className="mt-3 mb-3" /> */}

            <Table
              size="small"
              dataSource={logOffersSea}
              columns={[
                utils.getPlainCol(t("status"), "status", {
                  render: (val, row) => {
                    return (
                      <>
                        <Tag className="mb-2" color={utils.getLogOfferStatusColor(val)}>
                          {utils.snakeToTitleCase(val)}
                        </Tag>
                        <br />
                        {row.discharged_date && <Tag color="success">{t("discharged")}</Tag>}
                      </>
                    );
                  },
                }),
                utils.getPlainCol(t("documents"), "documents", {
                  render: (_, row) => {
                    const fileType = constant.FILE_TYPE_SPAL;
                    const filesExist = row && row.files && row.files.length > 0;
                    const fileSuratPerjanjian =
                      filesExist && row.files.find((el) => el.type === fileType);
                    // const fileInsurance =
                    //   filesExist && row.files.find((el) => el.type === typeInsurance);
                    // const docCompleted = fileSuratPerjanjian && fileInsurance;
                    const docCompleted = true;
                    // fileSuratPerjanjian && row.spk && row.spk.pdf_path ? true : false;

                    return (
                      <>
                        {row.status === constant.STATUS_APPROVED ? (
                          <>
                            {docCompleted ? (
                              <Tag color={"success"}>Complete</Tag>
                            ) : (
                              <Tag color={"warning"}>Not Complete</Tag>
                            )}
                          </>
                        ) : (
                          "-"
                        )}
                      </>
                    );
                  },
                }),
                utils.getPlainCol(t("transportir"), "transportir", {
                  render: (val) => val.name,
                }),

                utils.getPlainCol(t("ship"), "ship", {
                  render: (val) => {
                    if (!val || !val.name) return "-";

                    return val.name;
                  },
                }),
                // utils.getNumericCol(t("quantity"), "quantity"),
                // utils.getNumericCol(t("price"), "price"),
                // utils.getPlainCol(`${t("Estimated")} ${t("loadingDate")}`, "loading_date", {
                //   render: (_, row) => {
                //     return `${moment(row.loading_date_from).format(
                //       constant.FORMAT_DISPLAY_DATE_COMPACT,
                //     )} - ${moment(row.loading_date_to).format(
                //       constant.FORMAT_DISPLAY_DATE_COMPACT,
                //     )}`;
                //   },
                // }),
                // utils.getPlainCol(`${t("ETA")} ${t("warehouse")}`, "eta", {
                //   render: (_, row) => {
                //     return `${moment(row.eta_from).format(
                //       constant.FORMAT_DISPLAY_DATE_COMPACT,
                //     )} - ${moment(row.eta_to).format(constant.FORMAT_DISPLAY_DATE_COMPACT)}`;
                //   },
                // }),
                utils.getPlainCol(t("info"), "info", {
                  width: "300px",

                  render: (_, row) => {
                    return (
                      <table>
                        <tr>
                          <td>{`${t("quantity")}`}</td>
                          <td>:</td>
                          <td>{utils.thousandSeparator(Number(row.quantity).toFixed(2))}</td>
                        </tr>
                        <tr>
                          <td>{`${t("price")}/Kg`}</td>
                          <td>:</td>
                          <td>{utils.thousandSeparator(Number(row.price).toFixed(2))}</td>
                        </tr>
                        {row.budget && row.budget.budget && (
                          <tr>
                            <td>{t("budget")}</td>
                            <td>:</td>
                            <td>{utils.thousandSeparator(Number(row.budget.budget).toFixed(2))}</td>
                          </tr>
                        )}
                        <tr>
                          <td>{`${t("Estimated")} ${t("loadingDate")}`}</td>
                          <td>:</td>
                          <td>
                            {`${moment(row.loading_date_from).format(
                              constant.FORMAT_DISPLAY_DATE_COMPACT,
                            )} - ${moment(row.loading_date_to).format(
                              constant.FORMAT_DISPLAY_DATE_COMPACT,
                            )}`}
                          </td>
                        </tr>
                        <tr>
                          <td>{`${t("ETA")} ${t("warehouse")}`}</td>
                          <td>:</td>
                          <td>
                            {`${moment(row.eta_from).format(
                              constant.FORMAT_DISPLAY_DATE_COMPACT,
                            )} - ${moment(row.eta_to).format(
                              constant.FORMAT_DISPLAY_DATE_COMPACT,
                            )}`}
                          </td>
                        </tr>
                        <tr>
                          <td>{`${t("Actual")} ${t("loadingDate")}`}</td>
                          <td>:</td>
                          <td>
                            {row.actual_loading_date
                              ? moment(row.actual_loading_date).format(
                                  constant.FORMAT_DISPLAY_DATE_COMPACT,
                                )
                              : "-"}
                          </td>
                        </tr>
                        <tr>
                          <td>{`${t("delivery")}`}</td>
                          <td>:</td>
                          <td>
                            {row.delivery_date
                              ? moment(row.delivery_date).format(
                                  constant.FORMAT_DISPLAY_DATE_COMPACT,
                                )
                              : "-"}
                          </td>
                        </tr>
                        <tr>
                          <td>{`${t("delivered")}`}</td>
                          <td>:</td>
                          <td>
                            {row.delivered_date ? (
                              <Tag color="success">
                                {moment(row.delivered_date).format(
                                  constant.FORMAT_DISPLAY_DATE_COMPACT,
                                )}
                              </Tag>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      </table>
                    );
                  },
                }),
                // utils.getPlainCol(`${t("loading")}`, "actual_loading_date", {
                //
                //   render: (_, row) => {
                //     if (!row.actual_loading_date) return "-";

                //     return moment(row.actual_loading_date).format(
                //       constant.FORMAT_DISPLAY_DATE_COMPACT,
                //     );
                //   },
                // }),
                // utils.getPlainCol(t("delivery"), "delivery_date", {
                //
                //   render: (_, row) => {
                //     if (!row.delivery_date) return "-";

                //     return moment(row.delivery_date).format(constant.FORMAT_DISPLAY_DATE_COMPACT);
                //   },
                // }),
                // utils.getPlainCol(t("delivered"), "delivered_date", {
                //
                //   render: (_, row) => {
                //     if (!row.delivered_date) return "-";

                //     return (
                //       <Tag color="success">
                //         {moment(row.delivered_date).format(constant.FORMAT_DISPLAY_DATE_COMPACT)}
                //       </Tag>
                //     );
                //   },
                // }),
                utils.getPlainCol(t("action"), "action", {
                  width: "150px",

                  render: (_, row) => {
                    let btnReject = null;
                    let btnApprove = null;
                    if (
                      row.status === constant.STATUS_PENDING_APPROVAL ||
                      row.status === constant.STATUS_ADJUST
                    ) {
                      btnReject = (
                        <Button
                          className="mr-1 mb-1"
                          type="danger"
                          size="small"
                          onClick={() => {
                            setActionLogOfferId(row.logistic_offer_id);
                            setModalRejectShow(true);
                          }}
                        >
                          {t("reject")}
                        </Button>
                      );

                      btnApprove = (
                        <Button
                          className="mr-1 mb-1"
                          type="primary"
                          size="small"
                          onClick={() => {
                            setActionLogOfferId(row.logistic_offer_id);
                            setModalApproveShow(true);
                          }}
                        >
                          {t("approve")}
                        </Button>
                      );
                    }

                    let btnAdjust = null;
                    if (row.status === constant.STATUS_PENDING_APPROVAL) {
                      btnAdjust = (
                        <Button
                          className="mr-1 mb-1"
                          color="yellow"
                          size="small"
                          onClick={() => {
                            setActionLogOfferId(row.logistic_offer_id);
                            setModalAdjustData({
                              price: row.price,
                            });
                            setModalAdjustShow(true);
                          }}
                        >
                          {t("adjust")}
                        </Button>
                      );
                    }

                    let btnSuratPerjanjian = null; // SPAL or SPAD
                    let btnInsurance = null;
                    let btnContract = null;
                    let btnCargoReadiness = null;
                    let btnBL = null;
                    let btnEditFiles = null;
                    let btnUploads = [];
                    let btnRecap = null;
                    let btnPembongkaran = null;
                    if (row.status === constant.STATUS_APPROVED) {
                      const fileType = constant.FILE_TYPE_SPAL;
                      const fileTypeText = fileType.toUpperCase();

                      const filesExist = row && row.files && row.files.length > 0;

                      const fileSuratPerjanjian =
                        filesExist && row.files.find((el) => el.type === fileType);

                      const btnSuratPerjanjianUpload = (onClickAdditional) => {
                        const btnOnClick = () => {
                          setModalUploadShow(true);
                          setModalUploadData({
                            type: fileType,
                            type_text: fileTypeText,
                            unique_id: row.logistic_offer_id,
                          });
                          if (onClickAdditional) onClickAdditional();
                        };
                        return (
                          <Button className="mr-1 mb-1" size="small" onClick={btnOnClick}>
                            {fileTypeText}
                          </Button>
                        );
                      };

                      if (fileSuratPerjanjian) {
                        btnSuratPerjanjian = (
                          <Button
                            className="mr-1 mb-1"
                            type="primary"
                            size="small"
                            onClick={() => {
                              utils.openInNewTab(fileSuratPerjanjian.url);
                            }}
                          >
                            {fileTypeText}
                          </Button>
                        );
                        btnUploads.push(
                          btnSuratPerjanjianUpload(() => {
                            if (fileSuratPerjanjian) setModalUploadFile(fileSuratPerjanjian);
                          }),
                        );
                      } else {
                        btnSuratPerjanjian = btnSuratPerjanjianUpload();
                      }

                      const getBtnContractUpload = (onClickAdditional) => {
                        const btnOnClick = () => {
                          setModalUploadShow(true);
                          setModalUploadData({
                            type: typeContract,
                            type_text: typeTextContract,
                            unique_id: row.logistic_offer_id,
                          });
                          if (onClickAdditional) onClickAdditional();
                        };

                        return (
                          <Button className="mr-1 mb-1" size="small" onClick={btnOnClick}>
                            {typeTextContract}
                          </Button>
                        );
                      };

                      const fileContract =
                        filesExist && row.files.find((el) => el.type === typeContract);
                      if (fileContract) {
                        btnContract = (
                          <Button
                            className="mr-1 mb-1"
                            type="primary"
                            size="small"
                            onClick={() => {
                              utils.openInNewTab(fileContract.url);
                            }}
                          >
                            {typeTextContract}
                          </Button>
                        );
                        btnUploads.push(
                          getBtnContractUpload(() => {
                            if (fileContract) setModalUploadFile(fileContract);
                          }),
                        );
                        // } else if (!row.actual_loading_date) {
                      } else {
                        btnContract = getBtnContractUpload();
                      }

                      const getBtnCargoReadinessUpload = (onClickAdditional) => {
                        const btnOnClick = () => {
                          setModalUploadShow(true);
                          setModalUploadData({
                            type: typeCargoReadiness,
                            type_text: typeTextCargoReadiness,
                            unique_id: row.logistic_offer_id,
                          });
                          if (onClickAdditional) onClickAdditional();
                        };

                        return (
                          <Button className="mr-1 mb-1" size="small" onClick={btnOnClick}>
                            {typeTextCargoReadiness}
                          </Button>
                        );
                      };

                      const fileCargoReadiness =
                        filesExist && row.files.find((el) => el.type === typeCargoReadiness);
                      if (fileCargoReadiness) {
                        btnCargoReadiness = (
                          <Button
                            className="mr-1 mb-1"
                            type="primary"
                            size="small"
                            onClick={() => {
                              utils.openInNewTab(fileCargoReadiness.url);
                            }}
                          >
                            {typeTextCargoReadiness}
                          </Button>
                        );
                        btnUploads.push(
                          getBtnCargoReadinessUpload(() => {
                            if (fileCargoReadiness) setModalUploadFile(fileCargoReadiness);
                          }),
                        );
                        // } else if (!row.actual_loading_date) {
                      } else {
                        btnCargoReadiness = getBtnCargoReadinessUpload();
                      }

                      const fileInsurance =
                        filesExist && row.files.find((el) => el.type === typeInsurance);

                      const getBtnInsuranceUpload = (onClickAdditional) => {
                        const btnOnClick = () => {
                          setModalUploadShow(true);
                          setModalUploadData({
                            type: typeInsurance,
                            type_text: typeTextInsurance,
                            unique_id: row.logistic_offer_id,
                          });
                          if (onClickAdditional) onClickAdditional();
                        };

                        return (
                          <Button className="mr-1 mb-1" size="small" onClick={btnOnClick}>
                            {typeTextInsurance}
                          </Button>
                        );
                      };

                      if (fileInsurance) {
                        btnInsurance = (
                          <Button
                            className="mr-1 mb-1"
                            type="primary"
                            size="small"
                            onClick={() => {
                              utils.openInNewTab(fileInsurance.url);
                            }}
                          >
                            {typeTextInsurance}
                          </Button>
                        );
                        btnUploads.push(
                          getBtnInsuranceUpload(() => {
                            if (fileInsurance) setModalUploadFile(fileInsurance);
                          }),
                        );
                        // } else if (!row.actual_loading_date) {
                      } else {
                        btnInsurance = getBtnInsuranceUpload();
                      }

                      const fileBL =
                        filesExist && row.files.find((el) => el.type === constant.FILE_TYPE_BL);

                      const getBtnBLUpload = (onClickAdditional) => {
                        const btnOnClick = () => {
                          setModalUploadShow(true);
                          setModalUploadData({
                            type: constant.FILE_TYPE_BL,
                            type_text: constant.FILE_TYPE_BL.toUpperCase(),
                            unique_id: row.logistic_offer_id,
                          });
                          if (onClickAdditional) onClickAdditional();
                        };

                        return (
                          <Button className="mr-1 mb-1" size="small" onClick={btnOnClick}>
                            {constant.FILE_TYPE_BL.toUpperCase()}
                          </Button>
                        );
                      };
                      if (fileBL) {
                        btnBL = (
                          <Button
                            className="mr-1 mb-1"
                            type="primary"
                            size="small"
                            onClick={() => {
                              utils.openInNewTab(fileBL.url);
                            }}
                          >
                            {constant.FILE_TYPE_BL.toUpperCase()}
                          </Button>
                        );
                        btnUploads.push(
                          getBtnBLUpload(() => {
                            if (fileBL) setModalUploadFile(fileBL);
                          }),
                        );
                      }

                      if (fileSuratPerjanjian || fileInsurance || fileBL) {
                        btnEditFiles = (
                          <Button
                            className="mr-1 mb-1"
                            size="small"
                            onClick={() => {
                              setModalEditFilesShow(true);
                              setModalEditFilesButtons(btnUploads);
                            }}
                          >
                            {t("edit")}
                          </Button>
                        );
                      }

                      if (row.type === constant.TRANSPORTIR_TYPE_SEA_20231013) {
                        if (row.spk.pdf_path) {
                          // already created
                          btnRecap = (
                            <Button
                              type="primary"
                              className="mr-1 mb-1"
                              size="small"
                              onClick={() => {
                                utils.openInNewTab(row.spk.pdf_path);
                              }}
                            >
                              {t("SPK Pemuatan")}
                            </Button>
                          );
                        } else {
                          btnRecap = (
                            <Button
                              className="mr-1 mb-1"
                              size="small"
                              onClick={() => {
                                setModalRecapShow(true);
                                setModalRecapData({
                                  isEdit: false,
                                  lOffer: row,
                                  cOffer: cOffer,
                                });
                              }}
                            >
                              {t("Buat SPK Pemuatan")}
                            </Button>
                          );
                        }

                        if (row.spk_bongkar && row.spk_bongkar.pdf_path) {
                          btnPembongkaran = (
                            <Button
                              type="primary"
                              className="mr-1 mb-1"
                              size="small"
                              onClick={() => {
                                utils.openInNewTab(row.spk_bongkar.pdf_path);
                              }}
                            >
                              {t("SPK Pembongkaran")}
                            </Button>
                          );
                        }
                      }
                    }

                    const actionsEl = (
                      <>
                        {utils.renderWithPermission(
                          userInfo.permissions,
                          btnAdjust,
                          "logistic_offer@adjust",
                        )}
                        {utils.renderWithPermission(
                          userInfo.permissions,
                          btnReject,
                          "logistic_offer@reject",
                        )}
                        {utils.renderWithPermission(
                          userInfo.permissions,
                          btnApprove,
                          "logistic_offer@approve",
                        )}
                        {utils.renderWithPermission(
                          userInfo.permissions,
                          btnSuratPerjanjian,
                          "logistic@SPAL",
                        )}
                        {utils.renderWithPermission(
                          userInfo.permissions,
                          btnInsurance,
                          "logistic@insurance",
                        )}
                        {utils.renderWithPermission(
                          userInfo.permissions,
                          btnRecap,
                          "logistic@SPK_pemuatan",
                        )}
                        {utils.renderWithPermission(
                          userInfo.permissions,
                          btnPembongkaran,
                          "logistic@SPK_pembongkaran",
                        )}
                        {utils.renderWithPermission(userInfo.permissions, btnBL, "logistic@BL")}
                        {btnContract}
                        {btnCargoReadiness}
                        {!row.actual_loading_date && btnEditFiles}
                      </>
                    );

                    const elExist =
                      btnReject || btnAdjust || btnApprove || btnSuratPerjanjian || btnInsurance;
                    if (!elExist) {
                      return null;
                    }

                    // let popoverVisible;
                    // if (hideActionPopup === true) {
                    //   popoverVisible = false;
                    // }
                    // return (
                    //   <Popover content={actionsEl} trigger="click" visible={popoverVisible}>
                    //     <Button
                    //       type="primary"
                    //       onClick={() => {
                    //         setHideActionPopup(false);
                    //       }}
                    //     >
                    //       <MoreOutlined />
                    //     </Button>
                    //   </Popover>
                    // );
                    return actionsEl;
                  },
                }),
                utils.getPlainCol(t("activity"), "activity", {
                  width: "150px",
                  render: (_, row) => {
                    if (!logisticFulfilled) return "-";
                    const fileType = constant.FILE_TYPE_SPAL;
                    const filesExist = row && row.files && row.files.length > 0;
                    const fileSuratPerjanjian =
                      filesExist && row.files.find((el) => el.type === fileType);
                    const fileInsurance =
                      filesExist && row.files.find((el) => el.type === typeInsurance);
                    const docCompleted = true;
                    // fileSuratPerjanjian && fileInsurance && row.spk.pdf_path ? true : false;
                    if (!docCompleted) return "-";

                    let btnLoading;
                    let btnDelivery;
                    let btnSPKBongkar;
                    let btnDelivered;
                    let btnDischarge;
                    if (!row.actual_loading_date) {
                      btnLoading = (
                        <Button
                          className="mr-1 mb-1"
                          type="primary"
                          size="small"
                          onClick={() => {
                            setActionLogOfferId(row.logistic_offer_id);
                            setModalLoadingShow(true);
                          }}
                        >
                          {`${t("start")} ${t("loading")}`}
                        </Button>
                      );
                    }

                    if (row.actual_loading_date && !row.delivery_date) {
                      const fileBL =
                        filesExist && row.files.find((el) => el.type === constant.FILE_TYPE_BL);

                      btnDelivery = (
                        <Button
                          className="mr-1 mb-1"
                          type="primary"
                          size="small"
                          onClick={() => {
                            setActionLogOfferId(row.logistic_offer_id);
                            setModalDeliveryShow(true);
                            setModalDeliveryData({ fileBL: fileBL, transType: row.type });
                          }}
                        >
                          {`${t("start")} ${t("delivery")}`}
                        </Button>
                      );
                    }

                    if (row.delivery_date && !row.delivered_date) {
                      if (row.spk_bongkar && row.spk_bongkar.pdf_path) {
                        btnDelivered = (
                          <Button
                            className="mr-1 mb-1"
                            type="primary"
                            size="small"
                            onClick={() => {
                              setActionLogOfferId(row.logistic_offer_id);
                              setModalDeliveredShow(true);
                            }}
                          >
                            {`${t("setDelivered")}`}
                          </Button>
                        );
                      } else {
                        btnSPKBongkar = (
                          <Button
                            className="mr-1 mb-1"
                            type="primary"
                            size="small"
                            onClick={() => {
                              setModalSPKBongkarShow(true);
                              setModalSPKBongkarData({
                                isEdit: false,
                                lOffer: row,
                                cOffer: cOffer,
                              });
                            }}
                          >
                            {t("Buat SPK Pembongkaran")}
                          </Button>
                        );
                      }
                    }

                    if (row.delivered_date && !row.discharged_date) {
                      btnDischarge = (
                        <Button
                          className="mr-1 mb-1"
                          type="primary"
                          size="small"
                          onClick={() => {
                            setActionLogOfferId(row.logistic_offer_id);
                            setModalDischargeShow(true);
                            setModalDischargeMaxQty(row.quantity);
                          }}
                        >
                          {`${t("discharge")}`}
                        </Button>
                      );
                    }
                    if (row.discharged_date) return <Tag color="success">{t("done")}</Tag>;

                    return [btnLoading, btnDelivery, btnSPKBongkar, btnDelivered, btnDischarge];
                  },
                }),
              ]}
              {...configs.TABLE_SINGLEPAGE}
            />
          </>
        )}

        {/* pecah land sea */}

        <br />
        {logOffersLand && logOffersLand.length > 0 && (
          <>
            <SectionHeading title={t("land")} withDivider />
            {/* <Divider className="mt-3 mb-3" /> */}

            <Table
              size="small"
              dataSource={logOffersLand}
              columns={[
                utils.getPlainCol(t("status"), "status", {
                  render: (val, row) => {
                    return (
                      <>
                        <Tag className="mb-2" color={utils.getLogOfferStatusColor(val)}>
                          {utils.snakeToTitleCase(val)}
                        </Tag>
                        <br />
                        {row.discharged_date && <Tag color="success">{t("discharged")}</Tag>}
                      </>
                    );
                  },
                }),
                utils.getPlainCol(t("documents"), "documents", {
                  render: (_, row) => {
                    const fileType = constant.FILE_TYPE_SPAD;
                    const filesExist = row && row.files && row.files.length > 0;
                    const fileSuratPerjanjian =
                      filesExist && row.files.find((el) => el.type === fileType);
                    // const fileInsurance =
                    //   filesExist && row.files.find((el) => el.type === typeInsurance);
                    // const docCompleted = fileSuratPerjanjian && fileInsurance;
                    const docCompleted = true;
                    // fileSuratPerjanjian ? true : false;

                    return (
                      <>
                        {row.status === constant.STATUS_APPROVED ? (
                          <>
                            {docCompleted ? (
                              <Tag color={"success"}>Complete</Tag>
                            ) : (
                              <Tag color={"warning"}>Not Complete</Tag>
                            )}
                          </>
                        ) : (
                          "-"
                        )}
                      </>
                    );
                  },
                }),
                utils.getPlainCol(t("transportir"), "transportir", {
                  render: (val) => val.name,
                }),

                utils.getPlainCol(t("info"), "info", {
                  width: "300px",

                  render: (_, row) => {
                    return (
                      <table>
                        <tr>
                          <td>{`${t("quantity")}`}</td>
                          <td>:</td>
                          <td>{utils.thousandSeparator(Number(row.quantity).toFixed(2))}</td>
                        </tr>
                        <tr>
                          <td>{`${t("price")}/Kg`}</td>
                          <td>:</td>
                          <td>{utils.thousandSeparator(Number(row.price).toFixed(2))}</td>
                        </tr>
                        {row.budget && row.budget.budget && (
                          <tr>
                            <td>{t("budget")}</td>
                            <td>:</td>
                            <td>{utils.thousandSeparator(Number(row.budget.budget).toFixed(2))}</td>
                          </tr>
                        )}
                        <tr>
                          <td>{`${t("Estimated")} ${t("loadingDate")}`}</td>
                          <td>:</td>
                          <td>
                            {`${moment(row.loading_date_from).format(
                              constant.FORMAT_DISPLAY_DATE_COMPACT,
                            )} - ${moment(row.loading_date_to).format(
                              constant.FORMAT_DISPLAY_DATE_COMPACT,
                            )}`}
                          </td>
                        </tr>
                        <tr>
                          <td>{`${t("ETA")} ${t("warehouse")}`}</td>
                          <td>:</td>
                          <td>
                            {`${moment(row.eta_from).format(
                              constant.FORMAT_DISPLAY_DATE_COMPACT,
                            )} - ${moment(row.eta_to).format(
                              constant.FORMAT_DISPLAY_DATE_COMPACT,
                            )}`}
                          </td>
                        </tr>
                        <tr>
                          <td>{`${t("Actual")} ${t("loadingDate")}`}</td>
                          <td>:</td>
                          <td>
                            {row.actual_loading_date
                              ? moment(row.actual_loading_date).format(
                                  constant.FORMAT_DISPLAY_DATE_COMPACT,
                                )
                              : "-"}
                          </td>
                        </tr>
                        <tr>
                          <td>{`${t("delivery")}`}</td>
                          <td>:</td>
                          <td>
                            {row.delivery_date
                              ? moment(row.delivery_date).format(
                                  constant.FORMAT_DISPLAY_DATE_COMPACT,
                                )
                              : "-"}
                          </td>
                        </tr>
                        <tr>
                          <td>{`${t("delivered")}`}</td>
                          <td>:</td>
                          <td>
                            {row.delivered_date ? (
                              <Tag color="success">
                                {moment(row.delivered_date).format(
                                  constant.FORMAT_DISPLAY_DATE_COMPACT,
                                )}
                              </Tag>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      </table>
                    );
                  },
                }),
                utils.getPlainCol(t("action"), "action", {
                  width: "150px",
                  render: (_, row) => {
                    let btnReject = null;
                    let btnApprove = null;
                    if (
                      row.status === constant.STATUS_PENDING_APPROVAL ||
                      row.status === constant.STATUS_ADJUST
                    ) {
                      btnReject = (
                        <Button
                          className="mr-1 mb-1"
                          type="danger"
                          size="small"
                          onClick={() => {
                            setActionLogOfferId(row.logistic_offer_id);
                            setModalRejectShow(true);
                          }}
                        >
                          {t("reject")}
                        </Button>
                      );

                      btnApprove = (
                        <Button
                          className="mr-1 mb-1"
                          type="primary"
                          size="small"
                          onClick={() => {
                            setActionLogOfferId(row.logistic_offer_id);
                            setModalApproveShow(true);
                          }}
                        >
                          {t("approve")}
                        </Button>
                      );
                    }

                    let btnAdjust = null;
                    if (row.status === constant.STATUS_PENDING_APPROVAL) {
                      btnAdjust = (
                        <Button
                          className="mr-1 mb-1"
                          color="yellow"
                          size="small"
                          onClick={() => {
                            setActionLogOfferId(row.logistic_offer_id);
                            setModalAdjustData({
                              price: row.price,
                            });
                            setModalAdjustShow(true);
                          }}
                        >
                          {t("adjust")}
                        </Button>
                      );
                    }

                    let btnSuratPerjanjian = null; // SPAL or SPAD
                    let btnInsurance = null;
                    let btnContract = null;
                    let btnCargoReadiness = null;
                    // let btnBL = null;
                    let btnEditFiles = null;
                    let btnUploads = [];
                    if (row.status === constant.STATUS_APPROVED) {
                      const fileType = constant.FILE_TYPE_SPAD;
                      const fileTypeText = fileType.toUpperCase();

                      const filesExist = row && row.files && row.files.length > 0;

                      const fileSuratPerjanjian =
                        filesExist && row.files.find((el) => el.type === fileType);

                      const btnSuratPerjanjianUpload = (onClickAdditional) => {
                        const btnOnClick = () => {
                          setModalUploadShow(true);
                          setModalUploadData({
                            type: fileType,
                            type_text: fileTypeText,
                            unique_id: row.logistic_offer_id,
                          });
                          if (onClickAdditional) onClickAdditional();
                        };
                        return (
                          <Button className="mr-1 mb-1" size="small" onClick={btnOnClick}>
                            {fileTypeText}
                          </Button>
                        );
                      };

                      if (fileSuratPerjanjian) {
                        btnSuratPerjanjian = (
                          <Button
                            className="mr-1 mb-1"
                            type="primary"
                            size="small"
                            onClick={() => {
                              utils.openInNewTab(fileSuratPerjanjian.url);
                            }}
                          >
                            {fileTypeText}
                          </Button>
                        );
                        btnUploads.push(
                          btnSuratPerjanjianUpload(() => {
                            if (fileSuratPerjanjian) setModalUploadFile(fileSuratPerjanjian);
                          }),
                        );
                      } else {
                        btnSuratPerjanjian = btnSuratPerjanjianUpload();
                      }

                      const getBtnContractUpload = (onClickAdditional) => {
                        const btnOnClick = () => {
                          setModalUploadShow(true);
                          setModalUploadData({
                            type: typeContract,
                            type_text: typeTextContract,
                            unique_id: row.logistic_offer_id,
                          });
                          if (onClickAdditional) onClickAdditional();
                        };

                        return (
                          <Button className="mr-1 mb-1" size="small" onClick={btnOnClick}>
                            {typeTextContract}
                          </Button>
                        );
                      };

                      const fileContract =
                        filesExist && row.files.find((el) => el.type === typeContract);
                      if (fileContract) {
                        btnContract = (
                          <Button
                            className="mr-1 mb-1"
                            type="primary"
                            size="small"
                            onClick={() => {
                              utils.openInNewTab(fileContract.url);
                            }}
                          >
                            {typeTextContract}
                          </Button>
                        );
                        btnUploads.push(
                          getBtnContractUpload(() => {
                            if (fileContract) setModalUploadFile(fileContract);
                          }),
                        );
                        // } else if (!row.actual_loading_date) {
                      } else {
                        btnContract = getBtnContractUpload();
                      }

                      const getBtnCargoReadinessUpload = (onClickAdditional) => {
                        const btnOnClick = () => {
                          setModalUploadShow(true);
                          setModalUploadData({
                            type: typeCargoReadiness,
                            type_text: typeTextCargoReadiness,
                            unique_id: row.logistic_offer_id,
                          });
                          if (onClickAdditional) onClickAdditional();
                        };

                        return (
                          <Button className="mr-1 mb-1" size="small" onClick={btnOnClick}>
                            {typeTextCargoReadiness}
                          </Button>
                        );
                      };

                      const fileCargoReadiness =
                        filesExist && row.files.find((el) => el.type === typeCargoReadiness);
                      if (fileCargoReadiness) {
                        btnCargoReadiness = (
                          <Button
                            className="mr-1 mb-1"
                            type="primary"
                            size="small"
                            onClick={() => {
                              utils.openInNewTab(fileCargoReadiness.url);
                            }}
                          >
                            {typeTextCargoReadiness}
                          </Button>
                        );
                        btnUploads.push(
                          getBtnCargoReadinessUpload(() => {
                            if (fileCargoReadiness) setModalUploadFile(fileCargoReadiness);
                          }),
                        );
                        // } else if (!row.actual_loading_date) {
                      } else {
                        btnCargoReadiness = getBtnCargoReadinessUpload();
                      }

                      const fileInsurance =
                        filesExist && row.files.find((el) => el.type === typeInsurance);

                      const getBtnInsuranceUpload = (onClickAdditional) => {
                        const btnOnClick = () => {
                          setModalUploadShow(true);
                          setModalUploadData({
                            type: typeInsurance,
                            type_text: typeTextInsurance,
                            unique_id: row.logistic_offer_id,
                          });
                          if (onClickAdditional) onClickAdditional();
                        };

                        return (
                          <Button className="mr-1 mb-1" size="small" onClick={btnOnClick}>
                            {typeTextInsurance}
                          </Button>
                        );
                      };

                      if (fileInsurance) {
                        btnInsurance = (
                          <Button
                            className="mr-1 mb-1"
                            type="primary"
                            size="small"
                            onClick={() => {
                              utils.openInNewTab(fileInsurance.url);
                            }}
                          >
                            {typeTextInsurance}
                          </Button>
                        );
                        btnUploads.push(
                          getBtnInsuranceUpload(() => {
                            if (fileInsurance) setModalUploadFile(fileInsurance);
                          }),
                        );
                        // } else if (!row.actual_loading_date) {
                      } else {
                        btnInsurance = getBtnInsuranceUpload();
                      }

                      const fileBL =
                        filesExist && row.files.find((el) => el.type === constant.FILE_TYPE_BL);

                      const getBtnBLUpload = (onClickAdditional) => {
                        const btnOnClick = () => {
                          setModalUploadShow(true);
                          setModalUploadData({
                            type: constant.FILE_TYPE_BL,
                            type_text: constant.FILE_TYPE_BL.toUpperCase(),
                            unique_id: row.logistic_offer_id,
                          });
                          if (onClickAdditional) onClickAdditional();
                        };

                        return (
                          <Button className="mr-1 mb-1" size="small" onClick={btnOnClick}>
                            {constant.FILE_TYPE_BL.toUpperCase()}
                          </Button>
                        );
                      };

                      // if (row.delivery_date) {
                      //   if (fileBL) {
                      //     btnBL = (
                      //       <Button
                      //         className="mr-1 mb-1"
                      //         type="primary"
                      //         size="small"
                      //         onClick={() => {
                      //           utils.openInNewTab(fileBL.url);
                      //         }}
                      //       >
                      //         {constant.FILE_TYPE_BL.toUpperCase()}
                      //       </Button>
                      //     );
                      //     btnUploads.push(
                      //       getBtnBLUpload(() => {
                      //         if (fileBL) setModalUploadFile(fileBL);
                      //       }),
                      //     );
                      //   } else {
                      //     btnBL = getBtnBLUpload();
                      //   }
                      // }

                      if (fileSuratPerjanjian || fileInsurance) {
                        btnEditFiles = (
                          <Button
                            className="mr-1 mb-1"
                            size="small"
                            onClick={() => {
                              setModalEditFilesShow(true);
                              setModalEditFilesButtons(btnUploads);
                            }}
                          >
                            {t("edit")}
                          </Button>
                        );
                      }
                    }

                    const actionsEl = (
                      <>
                        {utils.renderWithPermission(
                          userInfo.permissions,
                          btnAdjust,
                          "logistic_offer@adjust",
                        )}
                        {utils.renderWithPermission(
                          userInfo.permissions,
                          btnReject,
                          "logistic_offer@reject",
                        )}
                        {utils.renderWithPermission(
                          userInfo.permissions,
                          btnApprove,
                          "logistic_offer@approve",
                        )}
                        {utils.renderWithPermission(
                          userInfo.permissions,
                          btnSuratPerjanjian,
                          "logistic@SPAD",
                        )}
                        {utils.renderWithPermission(
                          userInfo.permissions,
                          btnInsurance,
                          "logistic@insurance",
                        )}
                        {btnContract}
                        {btnCargoReadiness}
                        {/* {btnBL} */}
                        {!row.actual_loading_date && btnEditFiles}
                      </>
                    );

                    const elExist =
                      btnReject || btnAdjust || btnApprove || btnSuratPerjanjian || btnInsurance;
                    if (!elExist) {
                      return null;
                    }

                    // let popoverVisible;
                    // if (hideActionPopup === true) {
                    //   popoverVisible = false;
                    // }
                    // return (
                    //   <Popover content={actionsEl} trigger="click" visible={popoverVisible}>
                    //     <Button
                    //       type="primary"
                    //       onClick={() => {
                    //         setHideActionPopup(false);
                    //       }}
                    //     >
                    //       <MoreOutlined />
                    //     </Button>
                    //   </Popover>
                    // );
                    return actionsEl;
                  },
                }),
                utils.getPlainCol(t("activity"), "activity", {
                  width: "150px",
                  render: (_, row) => {
                    if (!logisticFulfilled) return "-";
                    const fileType = constant.FILE_TYPE_SPAD;
                    const filesExist = row && row.files && row.files.length > 0;
                    const fileSuratPerjanjian =
                      filesExist && row.files.find((el) => el.type === fileType);
                    // const fileInsurance =
                    //   filesExist && row.files.find((el) => el.type === typeInsurance);
                    // const docCompleted = fileSuratPerjanjian && fileInsurance;
                    const docCompleted = true;
                    // fileSuratPerjanjian ? true : false;

                    let btnLoading;
                    let btnDelivery;
                    let btnDelivered;
                    let btnDischarge;
                    if (docCompleted) {
                      if (!row.actual_loading_date) {
                        btnLoading = (
                          <Button
                            className="mr-1 mb-1"
                            type="primary"
                            size="small"
                            onClick={() => {
                              setActionLogOfferId(row.logistic_offer_id);
                              setModalLoadingShow(true);
                            }}
                          >
                            {`${t("start")} ${t("loading")}`}
                          </Button>
                        );
                      }

                      if (row.actual_loading_date && !row.delivery_date) {
                        const fileBL =
                          filesExist && row.files.find((el) => el.type === constant.FILE_TYPE_BL);
                        btnDelivery = (
                          <Button
                            className="mr-1 mb-1"
                            type="primary"
                            size="small"
                            onClick={() => {
                              setActionLogOfferId(row.logistic_offer_id);
                              setModalDeliveryShow(true);
                              setModalDeliveryData({ fileBL: fileBL, transType: row.type });
                            }}
                          >
                            {`${t("start")} ${t("delivery")}`}
                          </Button>
                        );
                      }

                      if (row.delivery_date && !row.delivered_date) {
                        btnDelivered = (
                          <Button
                            className="mr-1 mb-1"
                            type="primary"
                            size="small"
                            onClick={() => {
                              setActionLogOfferId(row.logistic_offer_id);
                              setModalDeliveredShow(true);
                            }}
                          >
                            {`${t("setDelivered")}`}
                          </Button>
                        );
                      }

                      if (row.delivered_date && !row.discharged_date) {
                        btnDischarge = (
                          <Button
                            className="mr-1 mb-1"
                            type="primary"
                            size="small"
                            onClick={() => {
                              setActionLogOfferId(row.logistic_offer_id);
                              setModalDischargeShow(true);
                              setModalDischargeMaxQty(row.quantity);
                            }}
                          >
                            {`${t("discharge")}`}
                          </Button>
                        );
                      }
                    }

                    if (row.discharged_date) return <Tag color="success">{t("done")}</Tag>;
                    return [btnLoading, btnDelivery, btnDelivered, btnDischarge];
                  },
                }),
              ]}
              {...configs.TABLE_SINGLEPAGE}
            />
          </>
        )}
      </div>

      <br />
      <div
        style={{
          maxWidth: "1200px",
        }}
      >
        {((needSea && seaQtyLeft !== 0) || landQtyLeft !== 0) && (
          <>
            {fulfillment && (
              <Descriptions
                bordered
                size="small"
                className="log-desc"
                style={{ maxWidth: "425px" }}
              >
                <Descriptions.Item
                  className="mb-0"
                  label="Logistic Fulfillment"
                  style={{ width: "300px" }}
                  labelStyle={{ width: "100px" }}
                >
                  <strong>
                    <table>
                      {needSea === true && (
                        <tr>
                          <td style={{ width: "35px" }}>{t("sea")}</td>
                          <td style={{ width: "10px" }}>:</td>
                          <td style={{ width: "90px" }}>
                            {utils.thousandSeparator(fulfillment.sea.qty)} MT
                          </td>
                          <td style={{ width: "95px" }}>
                            {seaQtyLeft === 0 ? (
                              <>
                                {fulfillment.sea.approved === true ? (
                                  <Tag className="ma-0" color="success">
                                    Fulfilled
                                  </Tag>
                                ) : (
                                  <Tag className="ma-0" color="warning">
                                    Pending Approval
                                  </Tag>
                                )}
                              </>
                            ) : (
                              <Tag color="red">-{utils.thousandSeparator(seaQtyLeft)} MT</Tag>
                            )}
                          </td>
                        </tr>
                      )}

                      {needLand ? (
                        <tr>
                          <td style={{ width: "35px" }}>{t("land")}</td>
                          <td style={{ width: "10px" }}>:</td>
                          <td style={{ width: "90px" }}>
                            {utils.thousandSeparator(fulfillment.land.qty)} MT
                          </td>
                          <td style={{ width: "95px" }}>
                            {landQtyLeft === 0 ? (
                              <>
                                {fulfillment.land.approved === true ? (
                                  <Tag className="ma-0" color="success">
                                    Fulfilled
                                  </Tag>
                                ) : (
                                  <Tag className="ma-0" color="warning">
                                    Pending Approval
                                  </Tag>
                                )}
                              </>
                            ) : (
                              <Tag color="red">-{utils.thousandSeparator(landQtyLeft)} MT</Tag>
                            )}
                          </td>
                        </tr>
                      ) : null}
                    </table>
                  </strong>
                </Descriptions.Item>
              </Descriptions>
            )}
            <br />

            {utils.renderWithPermission(
              userInfo.permissions,
              <>
                <SectionHeading title={"Create Logistic Offer"} withDivider />
                <Form
                  form={form}
                  onFinish={handleOnSubmit}
                  autoComplete="off"
                  labelCol={{ span: 6 }}
                  initialValues={initialValues}
                  style={{
                    maxWidth: "750px",
                  }}
                >
                  <Form.Item
                    label={t("type")}
                    name="type"
                    rules={[
                      {
                        required: true,
                        message: `${t("please")} ${t("select")} ${t("type")}`,
                      },
                    ]}
                  >
                    <Select
                      showSearch
                      placeholder={`${t("select")} ${t("type")}`}
                      {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                      onChange={(value) => {
                        setType(value);
                        form.setFieldsValue({ transportir: undefined });
                      }}
                    >
                      {constant.TRANSPORTIR_TYPE_LIST_20231013 &&
                        constant.TRANSPORTIR_TYPE_LIST_20231013.map((d) => {
                          if (
                            fulfillment &&
                            fulfillment[d.value] &&
                            Number(fulfillment[d.value].qty) === Number(needs[d.value])
                          ) {
                            return null;
                          }

                          if (
                            d.value === constant.TRANSPORTIR_TYPE_SEA_20231013 &&
                            needSea === false
                          ) {
                            return null;
                          }

                          if (
                            d.value === constant.TRANSPORTIR_TYPE_LAND_20231013 &&
                            needLand === false
                          ) {
                            return null;
                          }

                          return <Select.Option key={d.value}>{d.label}</Select.Option>;
                        })}
                    </Select>
                  </Form.Item>
                  <br />
                  {type && (
                    <>
                      <Form.Item label={t("transportir")}>
                        <Row gutter={12}>
                          <Col xs={24} lg={18}>
                            <Form.Item
                              className="mb-2"
                              name="transportir"
                              rules={[
                                {
                                  required: true,
                                  message: `${t("please")} ${t("select")} ${t("transportir")}`,
                                },
                              ]}
                            >
                              <Select
                                showSearch
                                placeholder={`${t("select")} ${t("transportir")}`}
                                {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                                onChange={(value) => {
                                  form.setFieldsValue({ ship: undefined });
                                  if (type === constant.TRANSPORTIR_TYPE_SEA_20231013)
                                    handler.getShips(setPageLoading, setShips, value);
                                }}
                                options={transportirs.filter((el) => el.types.includes(type))}
                              />
                            </Form.Item>
                          </Col>

                          {utils.renderWithPermission(
                            userInfo.permissions,
                            <Col xs={24} lg={6}>
                              <Button
                                onClick={() => {
                                  setModalCreateTransportirShow(true);
                                }}
                                block
                              >
                                {`${t("add")} ${t("new")}`}
                              </Button>
                            </Col>,
                            "logistic_transportir@create",
                          )}
                        </Row>
                      </Form.Item>

                      {type === constant.TRANSPORTIR_TYPE_SEA_20231013 && (
                        <Form.Item label={t("ship")}>
                          <Row gutter={12}>
                            <Col xs={24} lg={18}>
                              <Form.Item
                                className="mb-2"
                                name="ship"
                                rules={[
                                  {
                                    required: true,
                                    message: `${t("please")} ${t("select")} ${t("ship")}`,
                                  },
                                ]}
                              >
                                <Select
                                  showSearch
                                  placeholder={`${t("select")} ${t("ship")}`}
                                  {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                                  options={ships}
                                  onChange={(value) => {
                                    setShip(ships.find((el) => el.value === value));
                                    form.setFieldsValue({ quantity: undefined });
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            {utils.renderWithPermission(
                              userInfo.permissions,
                              <Col xs={24} lg={6}>
                                <Button
                                  onClick={() => {
                                    setModalCreateShipShow(true);
                                  }}
                                  block
                                >
                                  {`${t("add")} ${t("new")}`}
                                </Button>
                              </Col>,
                              "logistic_transportir_ship@create",
                            )}
                          </Row>
                          {/* {ship && (
                            <Row gutter={12} className="mt-1">
                              <Col>Max Ship Capacity: {utils.thousandSeparator(ship.capacity)}</Col>
                            </Row>
                          )} */}
                        </Form.Item>
                      )}

                      <Form.Item
                        name="quantity"
                        label={`${t("quantity")}`}
                        rules={[
                          {
                            required: true,
                            message: `${t("please")} ${t("input")} ${t("quantity")}`,
                          },
                        ]}
                      >
                        <InputNumber
                          addonAfter={"MT"}
                          style={{ width: "100%" }}
                          placeholder={`${t("input")} ${t("quantity")}`}
                          {...configs.FORM_MONEY_DEFAULT_PROPS}
                          max={maxQty}
                        />
                      </Form.Item>

                      <Form.Item label={`${t("price")}`} colon={false}>
                        <Row gutter={12}>
                          <Col xs={24} lg={12}>
                            <Form.Item
                              name="price"
                              rules={[
                                {
                                  required: true,
                                  message: `${t("please")} ${t("input")} ${t("price")}`,
                                },
                              ]}
                              colon={false}
                              className="mb-0"
                            >
                              <InputNumber
                                addonAfter={"/Kg"}
                                style={{ width: "100%" }}
                                placeholder={`${t("input")} ${t("price")}`}
                                {...configs.FORM_MONEY_DEFAULT_PROPS}
                                onChange={(val) => {
                                  if (val > budget) {
                                    setOverBudget(true);
                                  } else {
                                    setOverBudget(false);
                                  }
                                }}
                              />
                            </Form.Item>
                          </Col>
                          {budget && (
                            <Col xs={24} lg={12}>
                              <Form.Item className="mb-0">
                                Budget:{" "}
                                {overBudget === true ? (
                                  <>
                                    <Tag color="red">{utils.thousandSeparator(budget)}</Tag>
                                    <span style={{ color: "#cf1322" }}>(Over)</span>
                                  </>
                                ) : (
                                  <Tag color="success">{utils.thousandSeparator(budget)}</Tag>
                                )}
                              </Form.Item>
                            </Col>
                          )}
                        </Row>
                      </Form.Item>

                      <Form.Item
                        name="loading_date"
                        label={`${t("Estimated")} ${t("loadingDate")}`}
                        rules={[
                          {
                            required: true,
                            message: `${t("please")} ${t("input")} ${t("Estimated")} ${t(
                              "loadingDate",
                            )}`,
                          },
                        ]}
                      >
                        <DatePicker.RangePicker
                          style={{ width: "100%" }}
                          inputReadOnly={true}
                          onChange={(value) => {
                            form.setFieldsValue({ eta_warehouse: undefined });
                          }}
                          {...utils.FORM_RANGEPICKER_PROPS}
                        />
                      </Form.Item>

                      <Form.Item
                        name="eta_warehouse"
                        label={`${t("etaWarehouse")}`}
                        rules={[
                          {
                            required: true,
                            message: `${t("please")} ${t("input")} ${t("etaWarehouse")}`,
                          },
                        ]}
                      >
                        <DatePicker.RangePicker
                          style={{ width: "100%" }}
                          inputReadOnly={true}
                          onChange={(value) => {
                            console.log("value");
                            console.log(value);
                          }}
                          {...utils.FORM_RANGEPICKER_PROPS}
                        />
                      </Form.Item>
                      <Divider />
                      <Form.Item className="text-right mb-0">
                        <Button type="secondary" className="mr-2" onClick={props.history.goBack}>
                          {t("cancel")}
                        </Button>
                        <Button type="primary" htmlType="submit">
                          {t("submit")}
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form>
              </>,
              "logistic_transportir@create",
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
};

export default withRouter(LogOfferForm);
