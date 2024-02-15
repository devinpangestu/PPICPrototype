import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import {
  Row,
  Col,
  Form,
  Button,
  Select,
  InputNumber,
  Descriptions,
  Tag,
  message,
  Table,
  Modal,
  Input,
  Divider,
  Collapse,
} from "antd";
import { DeleteOutlined, LockOutlined } from "@ant-design/icons";
import { api } from "api";
import handler from "handler";
import { SyncOverlay } from "components";
import { useTranslation } from "react-i18next";
import utils from "utils";
import constant from "constant";
import configs from "configs";
import moment from "moment";
import ModalTransportirCreate from "../transportir/ModalCreate";
import ModalShipCreate from "../transportir/ship/ModalCreate";
import ModalConfirm from "./Modal/ModalConfirm";
import ModalConfirmExistingLogistic from "./Modal/ModalConfirmExistingLogistic";
import qs from "query-string";
import { SectionHeading } from "components/Section";
import ModalReject from "./Modal/ModalReject";
import ModalApprove from "./Modal/ModalApprove";
import ModalAdjust from "./Modal/ModalAdjust";
import ModalUpload from "../../../ModalUpload";
import ModalEditFiles from "./Modal/ModalEditFiles";
import ModalRecap from "./Modal/ModalRecap";
import ModalLoading from "./Modal/ModalLoading";
import { PageContainer } from "components/layout";
import ModalDelivery from "./Modal/ModalDelivery";
import ModalInputBL from "./Modal/ModalInputBL";
import ModalSearchBR from "./Modal/ModalSearchBR";
import ModalSearchGR from "./Modal/ModalSearchGR";
import ModalDelivered from "./Modal/ModalDelivered";
import ModalSPKPembongkaran from "./Modal/ModalSPKPembongkaran";
import ModalInputMutuFinal from "./Modal/ModalInputMutuFinal";
import ModalDischarge from "./Modal/ModalDischarge";
import ModalInputBASTMuat from "./Modal/ModalInputBASTMuat";
import ModalSplitShip from "./Modal/ModalSplitShip";
import ModalContractNumber from "./Modal/ModalContractNumber";
import ModalSplitLoadingTruck from "./Modal/ModalSplitLoadingTruck";
import ModalSplitDischargedTruck from "./Modal/ModalSplitDischargedTruck";
import SearchBRModalConfirm from "./Modal/SearchBRModalConfirm";
import useModalStore from "stores/useModalStore";
import SearchGRModalConfirm from "./Modal/SearchGRModalConfirm";

const { Panel } = Collapse;

const LogOfferForm = (props) => {
  const onChange = (key) => {
    console.log(key);
  };
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
  const [typeExistingLogistic, setTypeExistingLogistic] = useState(null);
  const [currLogOfferSelect, setCurrLogOfferSelect] = useState("");

  const [ship, setShip] = useState(null);
  const [needs, setNeeds] = useState({ ship: 0, discharged_truck: 0, loading_truck: 0 });
  const [fulfillment, setFulfillment] = useState({
    ship: { qty: 0, approved: false },
    discharged_truck: { qty: 0, approved: false },
    loading_truck: { qty: 0, approved: false },
  });
  const [maxQtyExistingLogistic, setMaxQtyExistingLogistic] = useState(0);
  const [qtyLTruckFulfilledExistingLogistic, setQtyLTruckFulfilledExistingLogistic] = useState(0);
  const [qtyShipFulfilledExistingLogistic, setQtyShipFulfilledExistingLogistic] = useState(0);

  //needed because Discharged Truck can be splitted in one logistic offer
  //(need to count the quantity before can start shipping)
  const [qtyDTruckFulfilledExistingLogistic, setQtyDTruckFulfilledExistingLogistic] = useState(0);
  const [commodityOfferId, setCommodityOfferId] = useState(null);
  // const [logOffers, setLogOffers] = useState([]);
  const [fullLogOffers, setFullLogOffers] = useState([]);
  const [logOffersIdInPage, setLogOffersIdInPage] = useState([]);
  const [logOffersLoadingTruckIdInPage, setLogOffersLoadingTruckIdInPage] = useState([]);
  const [logOffersShipIdInPage, setLogOffersShipIdInPage] = useState([]);
  const [logOffersDischargedTruckIdInPage, setLogOffersDischargedTruckIdInPage] = useState([]);
  const [logOffersFrancoIdInPage, setLogOffersFrancoIdInPage] = useState([]);

  const [logOffersShip, setLogOffersShip] = useState([]);
  const [logOffersLoadingTruck, setLogOffersLoadingTruck] = useState([]);
  const [logOffersDischargedTruck, setLogOffersDischargedTruck] = useState([]);
  const [logOffersFranco, setLogOffersFranco] = useState([]);
  const [cOffer, setCOffer] = useState(null);

  const [pageLoading, setPageLoading] = useState(false);
  // 1702257906363 1702257879514

  const [transportirs, setTransportirs] = useState([]);
  const [ships, setShips] = useState([]);
  const [allRoutes, setAllRoutes] = useState([]);
  const [shipRoutes, setShipRoutes] = useState([]);
  const [dischargeRoutes, setDischargeRoutes] = useState([]);
  const [modalConfirmShow, setModalConfirmShow] = useState(false);
  const [modalConfirmData, setModalConfirmData] = useState(null);
  const [qualitySummary, setQualitySummary] = useState({
    final_qffa: 0,
    final_qmi: 0,
    final_qdobi: 0,
    final_qtotox: 0,
    final_qiv: 0,
    finalhoverqffa: 0,
    finalhoverqmi: 0,
    finalhoverqdobi: 0,
    finalhoverqtotox: 0,
    finalhoverqiv: 0,
  });

  const [setActualLoadingAllLogistic, setSetActualLoadingAllLogistic] = useState({});

  const [modalConfirmExistingLogisticShow, setModalConfirmExistingLogisticShow] = useState(false);
  const [modalConfirmExistingLogisticData, setModalConfirmExistingLogisticData] = useState(null);

  // actions
  const [actionLogOfferUniqueId, setActionLogOfferUniqueId] = useState(null);
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

  //contract numbers
  const [modalContractNumberShow, setModalContractNumberShow] = useState(false);
  const [modalContractNumberData, setModalContractNumberData] = useState(null);

  const [budget, setBudget] = useState(null);
  const [overBudget, setOverBudget] = useState(false);

  // loading
  const [modalLoadingShow, setModalLoadingShow] = useState(false);

  // delivery
  const [modalDeliveryShow, setModalDeliveryShow] = useState(false);
  const [modalDeliveryData, setModalDeliveryData] = useState({});

  // input BL
  const [modalInputBLShow, setModalInputBLShow] = useState(false);
  const [modalInputBLData, setModalInputBLData] = useState({});

  //AutoBR
  const { modalAutoBR, modalSearchBR, modalAutoGR, modalSearchGR } = useModalStore();

  // delivered
  const [modalDeliveredShow, setModalDeliveredShow] = useState(false);

  // contract numbers
  //input BAST Pabrik
  const [modalInputBASTShow, setModalInputBASTShow] = useState(false);
  // discharge
  const [modalDischargeShow, setModalDischargeShow] = useState(false);
  const [modalDischargeMaxQty, setModalDischargeMaxQty] = useState(0);

  //mutu
  const [modalInputMutuFinalShow, setModalInputMutuFinalShow] = useState(false);

  // spk pembongkaran
  const [modalSPKBongkarShow, setModalSPKBongkarShow] = useState(false);
  const [modalSPKBongkarData, setModalSPKBongkarData] = useState(null);

  //split loading truck
  const [modalSplitLoadingTruckShow, setModalSplitLoadingTruckShow] = useState(false);
  const [modalSplitLoadingTruckData, setModalSplitLoadingTruckData] = useState(null);

  //split ship
  const [modalSplitShipShow, setModalSplitShipShow] = useState(false);
  const [modalSplitShipData, setModalSplitShipData] = useState(null);

  //split discharged truck
  const [modalSplitDischargedTruckShow, setModalSplitDischargedTruckShow] = useState(false);
  const [modalSplitDischargedTruckData, setModalSplitDischargedTruckData] = useState(null);

  const [openForm, setOpenForm] = useState(null); // State to track the open form

  // Handle the type selection
  const handleTypeSelection = (logOfferId) => {
    setOpenForm(logOfferId);
  };

  useEffect(() => {
    if (isEdit && !id) {
      utils.swal.Error({
        msg: t("swalDefaultError"),
        cbFn: () => {
          props.history.push("/logistic/offers");
          return;
        },
      });
      return;
    }
  }, []);

  useEffect(() => {
    if (!modalContractNumberShow) {
      getCOffer();
      handler.getTransportirs(setPageLoading, setTransportirs);
      handler.getAllRoutes(setPageLoading, setAllRoutes);
      handler.getShipRoutes(setPageLoading, setShipRoutes);
      handler.getDischargeRoutes(setPageLoading, setDischargeRoutes);
    }
    if (new Date().getTime() > userInfo.expired_at) {
      utils.swal.Error({
        msg: "User not Authorized, please login again",
        cbFn: () => {
          // alert("ppn failed")
          handler.handleLogout();
          return;
        },
      });
    }
  }, [modalContractNumberShow]);

  useEffect(() => {
    if (cOffer !== null) {
      if (cOffer.status !== constant.STATUS_APPROVED) {
        props.history.push("/logistic/offers");
        return;
      }

      if (cOffer.terms_of_handover === "fob" || cOffer.terms_of_handover === "cif") {
        setNeeds({ ship: cOffer.quantity, discharged_truck: cOffer.quantity });
        // setType("ship");
      } else if (cOffer.terms_of_handover === "loco_dalam_pulau") {
        setNeeds({ discharged_truck: cOffer.quantity });
        // setType("loading_truck");
      } else {
        // loco
        setNeeds({
          ship: cOffer.quantity,
          loading_truck: cOffer.quantity,
          discharged_truck: cOffer.quantity,
        });
        // setType("loading_truck");
      }
      getLogOffers();
      // getBudget();
    }
  }, [cOffer]);

  useEffect(() => {
    const cFulfill = {
      ship: { qty: 0, approved: false },
      loading_truck: { qty: 0, approved: false },
      discharged_truck: { qty: 0, approved: false },
    };
    let total = 0;
    if (logOffersLoadingTruck && logOffersLoadingTruck.length > 0) {
      for (let i = 0; i < logOffersLoadingTruck.length; i++) {
        total += parseInt(logOffersLoadingTruck[i].quantity);
        console.log(total);
        const logOffer = logOffersLoadingTruck[i];
        if (logOffer.status === constant.STATUS_REJECTED) {
          continue;
        }
        if (logOffersLoadingTruck.length === 1) {
          cFulfill[constant.TRANSPORTIR_TYPE_LOADING_TRUCK].qty += Number(logOffer.quantity);
          cFulfill[constant.TRANSPORTIR_TYPE_LOADING_TRUCK].approved =
            logOffer.status === constant.STATUS_APPROVED;
        } else {
          if (cFulfill[constant.TRANSPORTIR_TYPE_LOADING_TRUCK].qty !== needs.loading_truck) {
            cFulfill[constant.TRANSPORTIR_TYPE_LOADING_TRUCK].qty += Number(logOffer.quantity);
            if (cFulfill[constant.TRANSPORTIR_TYPE_LOADING_TRUCK] > needs.loading_truck) {
            }
          } else if (
            cFulfill[constant.TRANSPORTIR_TYPE_LOADING_TRUCK].qty === Number(logOffer.quantity)
          ) {
            cFulfill[constant.TRANSPORTIR_TYPE_LOADING_TRUCK].qty = Number(logOffer.quantity);
          }

          cFulfill[constant.TRANSPORTIR_TYPE_LOADING_TRUCK].approved =
            logOffer.status === constant.STATUS_APPROVED;
        }
        // cFulfill[constant.TRANSPORTIR_TYPE_LOADING_TRUCK].qty += Number(logOffer.quantity);
        // cFulfill[constant.TRANSPORTIR_TYPE_LOADING_TRUCK].approved =
        //   logOffer.status === constant.STATUS_APPROVED;
      }
    }
    if (logOffersShip && logOffersShip.length > 0) {
      for (let i = 0; i < logOffersShip.length; i++) {
        const logOffer = logOffersShip[i];
        if (logOffer.status === constant.STATUS_REJECTED) {
          continue;
        }
        cFulfill[constant.TRANSPORTIR_TYPE_SHIP].qty += Number(logOffer.quantity);
        cFulfill[constant.TRANSPORTIR_TYPE_SHIP].approved =
          logOffer.status === constant.STATUS_APPROVED;
      }
    }

    if (logOffersDischargedTruck && logOffersDischargedTruck.length > 0) {
      for (let i = 0; i < logOffersDischargedTruck.length; i++) {
        const logOffer = logOffersDischargedTruck[i];
        if (logOffer.status === constant.STATUS_REJECTED) {
          continue;
        }
        cFulfill[constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK].qty += Number(logOffer.quantity);
        cFulfill[constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK].approved =
          logOffer.status === constant.STATUS_APPROVED;
      }
    }
    setFulfillment(cFulfill);
  }, [logOffersShip, logOffersLoadingTruck, logOffersDischargedTruck]);

  if (cOfferId === "") {
    props.history.push("/logistic/offers");
    return;
  }

  // const getBudget = () => {
  //   if (!cOffer) return;
  //   if (!cOffer.hOver_Loc) return;
  //   if (!cOffer.whs) return;
  //   api.master.budget_transportir
  //     .getByParams(cOffer.hOver_Loc.id, cOffer.whs.id, cOffer.terms_of_handover)
  //     .then(function (response) {
  //       const resBudget = response.data.rs_body;
  //       console.log("budget");
  //       console.log(budget);
  //       setBudget(resBudget.budget);
  //     });
  // };

  // const getRouteShipBudget = () => {
  //   if (!cOffer) return;
  //   api.master.budget_transportir
  //     .getByParams(cOffer.hOver_Loc.id, cOffer.whs.id, cOffer.terms_of_handover)
  //     .then(function (response) {
  //       const resBudget = response.data.rs_body;
  //       console.log("budget");
  //       console.log(budget);
  //       setBudget(resBudget.budget);
  //     });
  // };
  // const getRouteDischargeBudget = () => {
  //   if (!cOffer) return;
  //   api.master.budget_transportir
  //     .getByParams(cOffer.hOver_Loc.id, cOffer.whs.id, cOffer.terms_of_handover)
  //     .then(function (response) {
  //       const resBudget = response.data.rs_body;
  //       console.log("budget");
  //       console.log(budget);
  //       setBudget(resBudget.budget);
  //     });
  // };

  const getLogOffers = () => {
    setPageLoading(true);
    api.logistic.offers
      .list("", 1000, 1, cOffer.unique_id)
      .then(function (response) {
        const res = response.data.rs_body;
        const logOffers = res.offers;
        // setLogOffers(logOffers);

        setFullLogOffers(
          logOffers.filter((el) => el.status === "approved" || el.status === "pending_approval"),
        );

        //sort by release num
        setLogOffersIdInPage(
          logOffers
            .sort((a, b) => a.release_num - b.release_num)
            .map((logOffer) => logOffer.logistic_offer_id)
            .filter((value, index, self) => self.indexOf(value) === index),
        );

        setCommodityOfferId(cOffer.unique_id);
        setLogOffersShip(logOffers.filter((el) => el.type === constant.TRANSPORTIR_TYPE_SHIP));
        setLogOffersShipIdInPage(
          logOffers
            .filter((el) => el.type === constant.TRANSPORTIR_TYPE_SHIP)
            .map((logOfferId) => logOfferId.logistic_offer_id)
            .filter((value, index, self) => {
              return self.indexOf(value) === index;
            }),
        );
        setLogOffersLoadingTruck(
          logOffers.filter((el) => el.type === constant.TRANSPORTIR_TYPE_LOADING_TRUCK),
        );
        setLogOffersLoadingTruckIdInPage(
          logOffers
            .filter((el) => el.type === constant.TRANSPORTIR_TYPE_LOADING_TRUCK)
            .map((logOfferId) => logOfferId.logistic_offer_id)
            .filter((value, index, self) => {
              return self.indexOf(value) === index;
            }),
        );
        setLogOffersDischargedTruck(
          logOffers.filter((el) => el.type === constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK),
        );
        setLogOffersDischargedTruckIdInPage(
          logOffers
            .filter((el) => el.type === constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK)
            .map((logOfferId) => logOfferId.logistic_offer_id)
            .filter((value, index, self) => {
              return self.indexOf(value) === index;
            }),
        );
        setLogOffersFranco(logOffers.filter((el) => el.type === constant.TRANSPORTIR_TYPE_FRANCO));
        setLogOffersFrancoIdInPage(
          logOffers
            .filter((el) => el.type === constant.TRANSPORTIR_TYPE_FRANCO)
            .map((logOfferId) => logOfferId.logistic_offer_id)
            .filter((value, index, self) => {
              return self.indexOf(value) === index;
            }),
        );
        const uniqueLogOfferIds = new Set();
        let totalQuantityLocoLP = 0;
        let totalQuantityFob = 0;
        let totalQuantityCif = 0; // Variable to store total quantity for cif type
        let totalQuantityFranco = 0;
        let totalQuantityLocoDP = 0;
        let totalQuantity = 0; // Variable to store total quantity for all types
        const inputtedLogOffers = logOffers
          .filter((logistic) => {
            const logOfferId = logistic.logistic_offer_id;
            const isInputted = logistic.final_qffa !== undefined && logistic.final_qffa !== null;

            if (!uniqueLogOfferIds.has(logOfferId) && isInputted) {
              uniqueLogOfferIds.add(logOfferId); // Add unique logOfferId to the Set

              // Increment totalQuantity for inputted logistic offers
              totalQuantity += logistic.quantity;

              // Additional handling for specific types
              switch (logistic.type) {
                case "loco_luar_pulau":
                  totalQuantityLocoLP += logistic.quantity;
                  return true;
                case "fob":
                  totalQuantityFob += logistic.quantity;
                  return true;
                case "cif":
                  // Calculate total quantity for cif type
                  totalQuantityCif += logistic.quantity;
                  return true; // Include all cif types initially
                case "franco":
                  totalQuantityFranco += logistic.quantity;
                  return true;
                case "loco_dalam_pulau":
                  totalQuantityLocoDP += logistic.quantity;
                  return true;
                default:
                  return true; // Include other types by default
              }
            }

            return false;
          })
          .filter((logistic) => {
            console.log(logistic);
            // Additional filtering for cif type after calculating total
            if (logistic.type === "cif" && logistic.sub_type === "discharged_truck") {
              return logistic.quantity === totalQuantityCif;
            }

            return true;
          });
        const qualityFields = [
          "final_qffa",
          "final_qmi",
          "final_qdobi",
          "final_qtotox",
          "final_qiv",
          "finalhoverqffa",
          "finalhoverqmi",
          "finalhoverqdobi",
          "finalhoverqtotox",
          "finalhoverqiv",
        ];

        const calculatedQuality = qualityFields.reduce((acc, field) => {
          const weightedSum = inputtedLogOffers.reduce((sum, logistic) => {
            const logisticQuality = logistic[field];
            const logisticQuantity = logistic.quantity;

            // Check if the logistic has a defined quality for the current field
            if (logisticQuality !== undefined) {
              sum += (logisticQuality * logisticQuantity) / totalQuantity;
            }

            return sum;
          }, 0);

          // Update the state with the calculated weighted average for the current quality field
          acc[field] = weightedSum;

          return acc;
        }, {});

        setQualitySummary((prevState) => ({
          ...prevState,
          ...calculatedQuality,
        }));

        if (isEdit) {
          const currLogOffer = logOffers.find((el) => el.id === id);

          let selectedTransportir = null;
          for (let i = 0; i < transportirs.length; i++) {
            const t = transportirs[i];
            if (t.value === currLogOffer.trnsprtr.id) {
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
            // loading_date: [
            //   moment(currLogOffer.loading_date_from),
            //   moment(currLogOffer.loading_date_to),
            // ],
            // eta_warehouse: [
            //   moment(currLogOffer.eta_warehouse_from),
            //   moment(currLogOffer.eta_warehouse_to),
            // ],
          };

          form.setFieldsValue(setField);
        }
      })
      .catch(function (error) {
        console.log(error);
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
    setType(null);
    setTypeExistingLogistic(null);
  };

  const handlePutBR = (logOffer) => {
    console.log("handleOnConfirmAutoBR");
    api.logistic.offers
      .putBR(cOffer.po_number, logOffer[0].release_num, logOffer[0].logistic_offer_id)
      .then(function (response) {
        resetForm();
        getLogOffers();
        message.success(t("success"));
      })
      .catch(function (error) {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(function () {
        modalAutoBR.setData({});
        setPageLoading(false);
      });
  };
  const handlePutGR = (logOffer) => {
    console.log(logOffer);
    api.logistic.offers
      .putGR(cOffer.po_number, logOffer[0].release_num, logOffer[0].logistic_offer_id)
      .then(function (response) {
        resetForm();
        getLogOffers();
        message.success(t("success"));
      })
      .catch(function (error) {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(function () {
        modalAutoGR.setData({});
        setPageLoading(false);
      });
  };

  const handleOnConfirm = () => {
    setPageLoading(true);
    const d = formData;
    console.log(d, "anjay");
    const numFmt = configs.FORM_NUMBER_FORMAT.format;
    const reqBody = {
      commodity_offer_id: cOffer.unique_id,
      transportir_id: Number(d.transportir),
      budget: isNaN(numFmt(allRoutes.find((el) => el.value === Number(d.route))?.budget))
        ? 0
        : numFmt(allRoutes.find((el) => el.value === Number(d.route))?.budget),
      type: d.type,
      quantity: Number(d.quantity),
      price: Number(d.price),
      route: d.route ? Number(d.route) : null,
    };

    // if (d.loading_date && d.loading_date.length === 2) {
    //   reqBody.loading_date_from = d.loading_date[0].format(constant.FORMAT_API_DATE);
    //   reqBody.loading_date_to = d.loading_date[1].format(constant.FORMAT_API_DATE);
    // }
    // if (d.eta_warehouse && d.eta_warehouse.length === 2) {
    //   reqBody.eta_warehouse_from = d.eta_warehouse[0].format(constant.FORMAT_API_DATE);
    //   reqBody.eta_warehouse_to = d.eta_warehouse[1].format(constant.FORMAT_API_DATE);
    // }

    if (d.type === constant.TRANSPORTIR_TYPE_SHIP) {
      reqBody.ship_id = Number(d.ship);
    }
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
      console.log("masuk sini");
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

  const handleOnConfirmExistingLogistic = () => {
    setPageLoading(true);
    const d = formData;
    console.log(d);
    if (!d.logistic_offer_id) {
      setPageLoading(true);
      const d = formData;
      console.log(d);
      const reqBody = {
        commodity_offer_id: cOffer.unique_id,
        transportir_id: Number(d.transportir),
        route: d.route ? Number(d.route) : null,
        budget: d.budget ? Number(d.budget) : null,
        type: d.type,
        quantity: Number(d.quantity),
        price: Number(d.price),
      };

      // if (d.loading_date && d.loading_date.length === 2) {
      //   reqBody.loading_date_from = d.loading_date[0].format(constant.FORMAT_API_DATE);
      //   reqBody.loading_date_to = d.loading_date[1].format(constant.FORMAT_API_DATE);
      // }
      // if (d.eta_warehouse && d.eta_warehouse.length === 2) {
      //   reqBody.eta_warehouse_from = d.eta_warehouse[0].format(constant.FORMAT_API_DATE);
      //   reqBody.eta_warehouse_to = d.eta_warehouse[1].format(constant.FORMAT_API_DATE);
      // }

      if (d.type === constant.TRANSPORTIR_TYPE_SHIP) {
        reqBody.ship_id = Number(d.ship);
      }
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
    } else {
      const reqBody = {
        commodity_offer_id: cOffer.unique_id,
        logistic_offer_id: d.logistic_offer_id,
        route: d[`route-${d.logistic_offer_id}`] ? Number(d[`route-${d.logistic_offer_id}`]) : null,
        budget: allRoutes.find((el) => el.value === Number(d[`route-${d.logistic_offer_id}`]))
          .budget,
        transportir_id: Number(d[`transportir-${d.logistic_offer_id}`]),
        ship_id: Number(d[`ship-${d.logistic_offer_id}`]),
        type: d[`type-${d.logistic_offer_id}`],
        quantity: Number(d[`quantity-${d.logistic_offer_id}`]),
        price: Number(d[`price-${d.logistic_offer_id}`]),
        release_num: d.release_num,
      };

      // if (
      //   d[`loading_date-${d.logistic_offer_id}`] &&
      //   d[`loading_date-${d.logistic_offer_id}`].length === 2
      // ) {
      //   reqBody.loading_date_from = d[`loading_date-${d.logistic_offer_id}`][0].format(
      //     constant.FORMAT_API_DATE,
      //   );
      //   reqBody.loading_date_to = d[`loading_date-${d.logistic_offer_id}`][1].format(
      //     constant.FORMAT_API_DATE,
      //   );
      // }
      // if (
      //   d[`eta_warehouse-${d.logistic_offer_id}`] &&
      //   d[`eta_warehouse-${d.logistic_offer_id}`].length === 2
      // ) {
      //   reqBody.eta_warehouse_from = d[`eta_warehouse-${d.logistic_offer_id}`][0].format(
      //     constant.FORMAT_API_DATE,
      //   );
      //   reqBody.eta_warehouse_to = d[`eta_warehouse-${d.logistic_offer_id}`][1].format(
      //     constant.FORMAT_API_DATE,
      //   );
      // }

      if (d.type === constant.TRANSPORTIR_TYPE_SHIP) {
        reqBody.ship_id = Number(d.ship);
      }
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
          .createFromDraft(d.logistic_offer_id, reqBody)
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
    }
  };

  const handleDeleteExistingLogistic = (logisticOfferId) => {
    console.log(logisticOfferId);
    api.logistic.offers
      .delete(logisticOfferId)
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
  };
  const handleLockGR = (logisticOfferId) => {
    console.log(logisticOfferId);
    api.logistic.offers
      .lockGR(logisticOfferId)
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
  };

  const handleOnSubmit = (values) => {
    console.log("handleOnSubmit");
    setFormData(values);
    console.log(values);
    const numFmt = configs.FORM_NUMBER_FORMAT.format;

    const confirmDataObj = {
      type: utils.snakeToTitleCase(values.type),
      budget: isNaN(numFmt(allRoutes.find((el) => el.value === Number(values.route))?.budget))
        ? 0
        : numFmt(allRoutes.find((el) => el.value === Number(values.route))?.budget),
      route: values.route ? allRoutes.find((el) => el.value === Number(values.route)).label : null,
      transportir: transportirs.find((el) => el.value === Number(values.transportir)).label,
      quantity: numFmt(values.quantity),
      price: numFmt(values.price),
    };
    if (values.type === constant.TRANSPORTIR_TYPE_SHIP) {
      confirmDataObj.ship = ships.find((el) => el.value === Number(values.ship)).label;
    }
    // if (values.loading_date.length === 2) {
    //   const loadingDateFrom = values.loading_date[0].format(constant.FORMAT_DISPLAY_DATE);
    //   const loadingDateTo = values.loading_date[1].format(constant.FORMAT_DISPLAY_DATE);
    //   confirmDataObj.loading_date = `${loadingDateFrom} - ${loadingDateTo}`;
    // }

    // if (values.eta_warehouse.length === 2) {
    //   const etaFrom = values.eta_warehouse[0].format(constant.FORMAT_DISPLAY_DATE);
    //   const etaTo = values.eta_warehouse[1].format(constant.FORMAT_DISPLAY_DATE);
    //   confirmDataObj.eta_warehouse = `${etaFrom} - ${etaTo}`;
    // }
    setModalConfirmData(confirmDataObj);
    setModalConfirmShow(true);
  };

  const handleOnSubmitExistingLogistic = (values) => {
    console.log("values", values);
    setFormData(values);

    const numFmt = configs.FORM_NUMBER_FORMAT.format;
    console.log();

    if (values[`type`]) {
      console.log("handleOnSubmit");
      setFormData(values);
      console.log(values);
      const numFmt = configs.FORM_NUMBER_FORMAT.format;

      const confirmDataObj = {
        type: utils.snakeToTitleCase(values.type),
        budget: allRoutes.find((el) => el.value === Number(values.route))?.budget ?? 0,
        route:
          allRoutes.find((el) => el.value === Number(values.route))?.label ??
          `${cOffer.spplr.name} - ${cOffer.hOver_Loc.name}`,
        transportir: transportirs.find((el) => el.value === Number(values.transportir)).label,
        quantity: numFmt(values.quantity),
        price: numFmt(values.price),
      };
      if (values.type === constant.TRANSPORTIR_TYPE_SHIP) {
        confirmDataObj.ship = ships.find((el) => el.value === Number(values.ship)).label;
      }
      // if (values.loading_date.length === 2) {
      //   const loadingDateFrom = values.loading_date[0].format(constant.FORMAT_DISPLAY_DATE);
      //   const loadingDateTo = values.loading_date[1].format(constant.FORMAT_DISPLAY_DATE);
      //   confirmDataObj.loading_date = `${loadingDateFrom} - ${loadingDateTo}`;
      // }

      // if (values.eta_warehouse.length === 2) {
      //   const etaFrom = values.eta_warehouse[0].format(constant.FORMAT_DISPLAY_DATE);
      //   const etaTo = values.eta_warehouse[1].format(constant.FORMAT_DISPLAY_DATE);
      //   confirmDataObj.eta_warehouse = `${etaFrom} - ${etaTo}`;
      // }
      console.log(confirmDataObj);
      setModalConfirmData(confirmDataObj);
      setModalConfirmShow(true);
    } else {
      const confirmDataObj = {
        type: utils.snakeToTitleCase(values[`type-${values.logistic_offer_id}`]),
        transportir: transportirs.find(
          (el) => el.value === Number(values[`transportir-${values.logistic_offer_id}`]),
        ).label,
        budget: allRoutes.find(
          (el) => el.value === Number(values[`route-${values.logistic_offer_id}`]),
        ).budget,
        route: allRoutes.find(
          (el) => el.value === Number(values[`route-${values.logistic_offer_id}`]),
        ).label,
        quantity: numFmt(values[`quantity-${values.logistic_offer_id}`]),
        price: numFmt(values[`price-${values.logistic_offer_id}`]),
      };
      if (values.type === constant.TRANSPORTIR_TYPE_SHIP) {
        confirmDataObj.ship = ships.find(
          (el) => el.value === Number(values[`ship-${values.logistic_offer_id}`]),
        ).label;
      }
      // if (values[`loading_date-${values.logistic_offer_id}`].length === 2) {
      //   const loadingDateFrom = values[`loading_date-${values.logistic_offer_id}`][0].format(
      //     constant.FORMAT_DISPLAY_DATE,
      //   );
      //   const loadingDateTo = values[`loading_date-${values.logistic_offer_id}`][1].format(
      //     constant.FORMAT_DISPLAY_DATE,
      //   );
      //   confirmDataObj.loading_date = `${loadingDateFrom} - ${loadingDateTo}`;
      // }

      // if (values[`eta_warehouse-${values.logistic_offer_id}`].length === 2) {
      //   const etaFrom = values[`eta_warehouse-${values.logistic_offer_id}`][0].format(
      //     constant.FORMAT_DISPLAY_DATE,
      //   );
      //   const etaTo = values[`eta_warehouse-${values.logistic_offer_id}`][1].format(
      //     constant.FORMAT_DISPLAY_DATE,
      //   );
      //   confirmDataObj.eta_warehouse = `${etaFrom} - ${etaTo}`;
      // }
      setModalConfirmExistingLogisticData(confirmDataObj);
      setModalConfirmExistingLogisticShow(true);
    }
  };

  const handleOnConfirmAutoBR = async (logOffer) => {
    setPageLoading(true);

    const modalConfirmObj = {
      po_number: cOffer.po_number,
      release_num: logOffer[0].release_num,
    };
    const dataToShow = await api.logistic.offers
      .getBR(cOffer.po_number, logOffer[0].release_num)
      .then(function (response) {
        modalAutoBR.setShow(true);
        return response.data;
      })
      .catch(function (error) {
        modalAutoBR.setShow(false);
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(function () {
        setPageLoading(false);
      });

    modalConfirmObj.br_date = dataToShow?.rs_body.br_date
      ? moment(dataToShow?.rs_body.br_date).format(constant.FORMAT_DISPLAY_DATETIME)
      : "-";
    modalConfirmObj.br_quantity = dataToShow?.rs_body.br_quantity ?? "-";
    modalConfirmObj.logOffer = logOffer;
    modalAutoBR.setData(modalConfirmObj);
  };

  const handleOnConfirmAutoGR = async (logOffer) => {
    setPageLoading(true);

    const modalConfirmObj = {
      po_number: cOffer.po_number,
      release_num: logOffer[0].release_num,
    };
    const dataToShow = await api.logistic.offers
      .getGR(cOffer.po_number, logOffer[0].release_num)
      .then(function (response) {
        modalAutoGR.setShow(true);
        return response.data;
      })
      .catch(function (error) {
        modalAutoGR.setShow(false);
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(function () {
        setPageLoading(false);
      });

    modalConfirmObj.cOffer = cOffer;
    modalConfirmObj.lOffer = logOffer;

    modalConfirmObj.gr_number = dataToShow?.rs_body.gr_number
      ? JSON.parse(dataToShow?.rs_body.gr_number)
      : "-";
    modalConfirmObj.gr_quantity = dataToShow?.rs_body.gr_quantity ?? "-";

    modalAutoGR.setData(modalConfirmObj);
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

  let maxQty = {
    loading_truck: needs.loading_truck,
    ship: needs.ship,
    discharged_truck: needs.discharged_truck,
  };

  if (needs && needs[typeExistingLogistic]) {
    maxQty[typeExistingLogistic] = needs[typeExistingLogistic];
    if (fulfillment && fulfillment[typeExistingLogistic]) {
      maxQty[typeExistingLogistic] =
        needs[typeExistingLogistic] + fulfillment[typeExistingLogistic].qty;
    }
  }

  if (ship && ship.capacity && Number(maxQty) > Number(ship.capacity)) {
    maxQty = Number(ship.capacity);
  }

  let shipQtyLeft = 0;
  let loadingTruckQtyLeft = 0;
  let dischargedTruckQtyLeft = 0;
  if (needs) {
    if (needs.ship) {
      shipQtyLeft = Number(needs.ship);
      if (fulfillment && fulfillment.ship) {
        shipQtyLeft = Number(needs.ship) - Number(fulfillment.ship.qty);
      }
    }
    if (needs.loading_truck) {
      loadingTruckQtyLeft = Number(needs.loading_truck);
      if (fulfillment && fulfillment.loading_truck) {
        loadingTruckQtyLeft = Number(needs.loading_truck) - Number(fulfillment.loading_truck.qty);
      }
    }
    if (needs.discharged_truck) {
      dischargedTruckQtyLeft = Number(needs.discharged_truck);
      if (fulfillment && fulfillment.discharged_truck) {
        dischargedTruckQtyLeft =
          Number(needs.discharged_truck) - Number(fulfillment.discharged_truck.qty);
      }
    }
  }
  console.log(dischargedTruckQtyLeft);
  let needShip = false;
  if (cOffer && constant.TERMS_OF_HANDOVER_SHIP.includes(cOffer.terms_of_handover)) {
    needShip = true;
  }

  let needLoadingTruck = false;
  if (cOffer && constant.TERMS_OF_HANDOVER_LOADING_TRUCK.includes(cOffer.terms_of_handover)) {
    needLoadingTruck = true;
  }

  let needDischargedTruck = false;
  console.log(
    cOffer && constant.TERMS_OF_HANDOVER_DISCHARGED_TRUCK.includes(cOffer.terms_of_handover),
  );

  if (cOffer && constant.TERMS_OF_HANDOVER_DISCHARGED_TRUCK.includes(cOffer.terms_of_handover)) {
    needDischargedTruck = true;
  }

  const shipFulFilled =
    !needShip || (needShip === true && shipQtyLeft === 0 && fulfillment.ship.approved);
  const loadingTruckFulFilled =
    !needLoadingTruck ||
    (needLoadingTruck === true && loadingTruckQtyLeft === 0 && fulfillment.loading_truck.approved);
  const dischargedTruckFulFilled =
    !needDischargedTruck ||
    (needDischargedTruck === true &&
      dischargedTruckQtyLeft === 0 &&
      fulfillment.discharged_truck.approved);
  const logisticFulfilled = shipFulFilled && loadingTruckFulFilled && dischargedTruckFulFilled;
  let btnInputContractNum;
  if (cOffer && cOffer.po_number && cOffer.contract_number) {
    // already created
    btnInputContractNum = (
      <Button
        type="primary"
        className="ml-16 mr-1 mb-1"
        size="small"
        onClick={() => {
          setModalContractNumberShow(true);
          setModalContractNumberData({
            isEdit: true,
            cOffer: cOffer,
          });
        }}
      >
        {t("Edit Contract Number")}
      </Button>
    );
  } else if (cOffer && cOffer.po_number && !cOffer.contract_number) {
    btnInputContractNum = (
      <Button
        type="primary"
        className="ml-16 mr-1 mb-1"
        size="small"
        onClick={() => {
          setModalContractNumberShow(true);
          setModalContractNumberData({
            isEdit: false,
            cOffer: cOffer,
          });
        }}
      >
        {t("Input Contract Number")}
      </Button>
    );
  } else if (cOffer && !cOffer.po_number) {
    btnInputContractNum = (
      <Tag style={{ marginLeft: 20, textAlign: "center" }} color="red">
        PO Number currently <br />
        not generated
      </Tag>
    );
  }

  return (
    <PageContainer
      title={t("logistic")}
      additionalAction={
        logisticFulfilled ? (
          <Tag color="success">
            <strong> FulFilled</strong>
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
          getCOffer();
          setBudget(0);
          setOverBudget(false);
        }}
      />

      <ModalConfirmExistingLogistic
        isEdit={isEdit}
        values={modalConfirmExistingLogisticData}
        visible={modalConfirmExistingLogisticShow}
        onCancel={() => {
          setModalConfirmExistingLogisticShow(false);
        }}
        onOk={() => {
          handleOnConfirmExistingLogistic();
          setModalConfirmExistingLogisticShow(false);
          getCOffer();
          setBudget(0);
          setOverBudget(false);
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

      <ModalContractNumber
        visible={modalContractNumberShow}
        onCancel={() => {
          setModalContractNumberShow(false);
        }}
        onOk={() => {
          setModalContractNumberShow(false);
          getLogOffers();
        }}
        data={modalContractNumberData}
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
        data={typeExistingLogistic}
        unique_id={actionLogOfferUniqueId}
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
        data={typeExistingLogistic}
        id={actionLogOfferId}
        unique_id={actionLogOfferUniqueId}
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
        unique_id={actionLogOfferUniqueId}
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
          handler.getShips(
            setPageLoading,
            setShips,
            form.getFieldValue(
              `transportir${currLogOfferSelect.length > 2 ? `-${currLogOfferSelect}` : ""}`,
            ),
          );
          setModalCreateShipShow(false);
          message.success(`${t("ship")} ${t("toastSuffixSuccess")}`);
        }}
        transportirId={form.getFieldValue(
          `transportir${currLogOfferSelect.length > 2 ? `-${currLogOfferSelect}` : ""}`,
        )}
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
        unique_id={actionLogOfferUniqueId}
        dischargeDate={
          cOffer &&
          cOffer.terms_of_handover === "loco_luar_pulau" &&
          typeExistingLogistic === "ship"
            ? moment(
                fullLogOffers.filter((el) => {
                  return el.logistic_offer_id === actionLogOfferId && el.type === "loading_truck";
                })[0]?.discharged_date,
              ) ?? null
            : cOffer &&
              cOffer.terms_of_handover === "loco_luar_pulau" &&
              typeExistingLogistic === "discharged_truck"
            ? fullLogOffers.filter((el) => {
                return el.logistic_offer_id === actionLogOfferId && el.type === "ship";
              })[0]?.discharged_date ?? null
            : cOffer &&
              (cOffer.terms_of_handover === "fob" || cOffer.terms_of_handover === "cif") &&
              typeExistingLogistic === "discharged_truck"
            ? fullLogOffers.filter((el) => {
                return el.logistic_offer_id === actionLogOfferId && el.type === "ship";
              })[0]?.discharged_date ?? null
            : null
        }
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
        unique_id={actionLogOfferUniqueId}
        actualLoading={
          cOffer &&
          (cOffer.terms_of_handover === "loco_luar_pulau" ||
            cOffer.terms_of_handover === "fob" ||
            cOffer.terms_of_handover === "cif") &&
          typeExistingLogistic === "ship"
            ? moment(
                fullLogOffers.filter((el) => {
                  return (
                    el.logistic_offer_id === actionLogOfferId && el.type === typeExistingLogistic
                  );
                })[0]?.actual_loading_date ?? null,
              )
            : null
        }
      />

      <ModalInputBL
        isEdit={isEdit}
        visible={modalInputBLShow}
        onCancel={() => {
          setModalInputBLShow(false);
        }}
        onSuccess={() => {
          setModalInputBLShow(false);
          message.success("Success");
          getLogOffers();
        }}
        id={actionLogOfferId}
        unique_id={actionLogOfferUniqueId}
      />
      <ModalInputMutuFinal
        isEdit={isEdit}
        visible={modalInputMutuFinalShow}
        onCancel={() => {
          setModalInputMutuFinalShow(false);
        }}
        onSuccess={() => {
          setModalInputMutuFinalShow(false);
          message.success("Success");
          getLogOffers();
          getCOffer();
        }}
        id={actionLogOfferId}
        unique_id={actionLogOfferUniqueId}
      />
      <ModalSearchBR
        isEdit={isEdit}
        visible={modalSearchBR.show}
        onCancel={() => {
          modalSearchBR.setShow(false);
        }}
        onSuccess={() => {
          modalSearchBR.setShow(false);
          message.success("Success");
          getLogOffers();
        }}
        id={actionLogOfferId}
        unique_id={actionLogOfferUniqueId}
        data={modalSearchBR.data}
        renderForm={getLogOffers}
      />
      <SearchBRModalConfirm
        isEdit={false}
        values={modalAutoBR.data}
        visible={modalAutoBR.show}
        onCancel={() => {
          modalAutoBR.setShow(false);
        }}
        onOk={() => {
          handlePutBR(modalAutoBR.data.logOffer);
          modalAutoBR.setShow(false);
        }}
      />
      <ModalSearchGR
        isEdit={isEdit}
        visible={modalSearchGR.show}
        onCancel={() => {
          modalSearchGR.setShow(false);
        }}
        onSuccess={() => {
          modalSearchGR.setShow(false);
          message.success("Success");
          getLogOffers();
        }}
        id={actionLogOfferId}
        unique_id={actionLogOfferUniqueId}
        data={modalSearchGR.data}
        renderForm={getLogOffers}
      />
      <SearchGRModalConfirm
        isEdit={false}
        values={modalAutoGR.data}
        visible={modalAutoGR.show}
        onCancel={() => {
          modalAutoGR.setShow(false);
        }}
        onOk={() => {
          handlePutGR(modalAutoGR.data.lOffer);
          modalAutoGR.setShow(false);
        }}
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
        unique_id={actionLogOfferUniqueId}
        deliveryDate={
          cOffer &&
          (cOffer.terms_of_handover === "loco_luar_pulau" ||
            cOffer.terms_of_handover === "fob" ||
            cOffer.terms_of_handover === "cif") &&
          typeExistingLogistic === "ship" &&
          (fullLogOffers.filter((el) => {
            return el.logistic_offer_id === actionLogOfferId && el.type === typeExistingLogistic;
          })[0]?.delivery_date ??
            null)
        }
      />

      <ModalInputBASTMuat
        visible={modalInputBASTShow}
        onCancel={() => {
          setModalInputBASTShow(false);
        }}
        onSuccess={() => {
          setModalInputBASTShow(false);
          message.success("Success");
          getLogOffers();
        }}
        id={actionLogOfferId}
        unique_id={actionLogOfferUniqueId}

        // maxQty={modalDischargeMaxQty}
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
        unique_id={actionLogOfferUniqueId}
        actualLoading={
          cOffer &&
          (cOffer.terms_of_handover === "loco_luar_pulau" ||
            cOffer.terms_of_handover === "fob" ||
            cOffer.terms_of_handover === "cif") &&
          typeExistingLogistic === "ship"
            ? fullLogOffers.filter((el) => {
                return (
                  el.logistic_offer_id === actionLogOfferId && el.type === typeExistingLogistic
                );
              })[0]?.delivered_date ?? null
            : fullLogOffers.filter((el) => {
                return (
                  el.logistic_offer_id === actionLogOfferId && el.type === typeExistingLogistic
                );
              })[0]?.actual_loading_date ?? null
        }
        // maxQty={modalDischargeMaxQty}
      />

      <ModalSplitLoadingTruck
        visible={modalSplitLoadingTruckShow}
        onCancel={() => {
          setModalSplitLoadingTruckShow(false);
        }}
        onSuccess={() => {
          setModalSplitLoadingTruckShow(false);
          message.success("Offer Splitted Successfully");
          getLogOffers();
        }}
        id={actionLogOfferId}
        unique_id={actionLogOfferUniqueId}
        data={modalSplitLoadingTruckData}
      />
      <ModalSplitShip
        visible={modalSplitShipShow}
        onCancel={() => {
          setModalSplitShipShow(false);
        }}
        onSuccess={() => {
          setModalSplitShipShow(false);
          message.success("Offer Splitted Successfully");
          getLogOffers();
        }}
        id={actionLogOfferId}
        unique_id={actionLogOfferUniqueId}
        data={modalSplitShipData}
      />
      <ModalSplitDischargedTruck
        visible={modalSplitDischargedTruckShow}
        onCancel={() => {
          setModalSplitDischargedTruckShow(false);
        }}
        onSuccess={() => {
          setModalSplitDischargedTruckShow(false);
          message.success("Offer Splitted Successfully");
          getLogOffers();
        }}
        id={actionLogOfferId}
        unique_id={actionLogOfferUniqueId}
        data={modalSplitDischargedTruckData}
      />

      <div className="compact-wrapper">
        <div
          style={{
            maxWidth: "2400px",
          }}
        >
          <Row gutter={32}>
            {cOffer && (
              <>
                <Col xs={24} xl={12} xxl={8}>
                  <Descriptions bordered column={1} size="small" className="log-desc mb-3">
                    <Descriptions.Item
                      className="mb-0"
                      label={cOffer.po_number ? "PO Number" : t("offerId")}
                      style={{ width: "300px" }}
                      labelStyle={{ width: "100px" }}
                    >
                      <strong>{cOffer.po_number || cOffer.id}</strong>
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
                    {cOffer.terms_of_handover !== "franco" && (
                      <Descriptions.Item
                        className="mb-0"
                        label="Fulfillment Needs"
                        style={{ width: "300px" }}
                        labelStyle={{ width: "100px" }}
                      >
                        {needs && (
                          <strong>
                            {needLoadingTruck && (
                              <Row gutter={32}>
                                <Col xs={15} flex="auto">
                                  {`${t("loadingTruck")}: ${utils.thousandSeparator(
                                    needs.loading_truck,
                                  )}`}{" "}
                                  MT
                                </Col>
                                <Col xs={8} className="text-center">
                                  {loadingTruckQtyLeft === 0 && (
                                    <>
                                      {fulfillment.loading_truck.approved === true ? (
                                        <Tag className="ma-0" color="success">
                                          Load Fulfilled
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
                            {needShip && (
                              <Row gutter={32}>
                                <Col xs={15} flex="auto">
                                  {`${t("ship")}: ${utils.thousandSeparator(needs.ship)}`} MT
                                </Col>
                                <Col xs={8} className="text-center">
                                  {shipQtyLeft === 0 && (
                                    <>
                                      {fulfillment.ship.approved === true ? (
                                        <Tag className="ma-0" color="success">
                                          Ship Fulfilled
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
                            {needDischargedTruck && (
                              <Row gutter={32}>
                                <Col xs={15} flex="auto">
                                  {`${t("dischargedTruck")}: ${utils.thousandSeparator(
                                    needs.discharged_truck,
                                  )}`}{" "}
                                  MT
                                </Col>
                                <Col xs={8} className="text-center">
                                  {dischargedTruckQtyLeft === 0 && (
                                    <>
                                      {fulfillment.discharged_truck.approved === true ? (
                                        <Tag className="ma-0" color="success">
                                          Discharge Fulfilled
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
                          </strong>
                        )}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Col>
                <Col xs={24} xl={12} xxl={8}>
                  <Descriptions size="small" bordered column={1} className="log-desc mb-3">
                    <Descriptions.Item
                      className="mb-0"
                      label={t("contractNumber")}
                      style={{ width: "300px" }}
                      labelStyle={{ width: "100px" }}
                    >
                      <strong style={{ display: "flex", alignItems: "center" }}>
                        {`${
                          !cOffer.contract_number ? "Not Available Yet" : cOffer.contract_number
                        }`}
                        {utils.renderWithPermission(
                          userInfo.permissions,
                          btnInputContractNum,
                          "logistic@SPK_pemuatan",
                        )}
                      </strong>
                    </Descriptions.Item>
                    <Descriptions.Item
                      className="mb-0"
                      label={t("handoverDate")}
                      style={{ width: "300px" }}
                      labelStyle={{ width: "100px" }}
                    >
                      <strong>{`${moment(cOffer.handover_date_from).format(
                        constant.FORMAT_DISPLAY_DATE,
                      )} - ${moment(cOffer.handover_date_to).format(
                        constant.FORMAT_DISPLAY_DATE,
                      )}`}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item
                      className="mb-0"
                      label={t("termsOfHandover")}
                      style={{ width: "300px" }}
                      labelStyle={{ width: "100px" }}
                    >
                      <strong>{constant.TERMS_OF_HANDOVER_MAP[cOffer.terms_of_handover]}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item
                      className="mb-0"
                      label={t("handoverLocation")}
                      style={{ width: "300px" }}
                      labelStyle={{ width: "100px" }}
                    >
                      <strong>{cOffer.hOver_Loc ? cOffer.hOver_Loc.name : "-"}</strong>
                    </Descriptions.Item>
                    {cOffer.handover_location && (
                      <Descriptions.Item
                        className="mb-0"
                        label={t("handoverDescription")}
                        style={{ width: "300px" }}
                        labelStyle={{ width: "100px" }}
                      >
                        <strong>{constant.getWarehouseDesc(cOffer.handover_location)}</strong>
                      </Descriptions.Item>
                    )}
                    <Descriptions.Item
                      className="mb-0"
                      label={t("warehouse")}
                      style={{ width: "300px" }}
                      labelStyle={{ width: "100px" }}
                    >
                      <strong>{`${cOffer.whs.warehouse_id} - ${cOffer.whs.name}`}</strong>
                    </Descriptions.Item>

                    <Descriptions.Item
                      className="mb-0"
                      label={t("eta")}
                      style={{ width: "300px" }}
                      labelStyle={{ width: "100px" }}
                    >
                      <strong>{`${moment(cOffer.eta_from).format(
                        constant.FORMAT_DISPLAY_DATE,
                      )} - ${moment(cOffer.eta_to).format(constant.FORMAT_DISPLAY_DATE)}`}</strong>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col xs={24} xxl={8}>
                  <Descriptions
                    bordered
                    column={2}
                    size="small"
                    className="log-desc"
                    labelStyle={{ width: "500px", textAlign: "center", backgroundColor: "#00703c" }}
                  >
                    <Descriptions.Item label={"Penyerahan"}></Descriptions.Item>
                    <Descriptions.Item label={"Pabrik"}></Descriptions.Item>
                  </Descriptions>
                  <Descriptions bordered column={2} size="small" className="log-desc mb-4">
                    <Descriptions.Item
                      className="mb-0"
                      label={"FFA"}
                      style={{ width: "300px" }}
                      labelStyle={{ width: "100px" }}
                    >
                      <strong>
                        {qualitySummary.finalhoverqffa
                          ? qualitySummary.finalhoverqffa.toFixed(2)
                          : 0}
                      </strong>
                    </Descriptions.Item>
                    <Descriptions.Item
                      className="mb-0"
                      label={"FFA"}
                      style={{ width: "300px" }}
                      labelStyle={{ width: "100px" }}
                    >
                      <strong>
                        {qualitySummary.final_qffa ? qualitySummary.final_qffa.toFixed(2) : 0}
                      </strong>
                    </Descriptions.Item>
                    <Descriptions.Item
                      className="mb-0"
                      label={"MI"}
                      style={{ width: "300px" }}
                      labelStyle={{ width: "100px" }}
                    >
                      <strong>
                        {qualitySummary.finalhoverqmi ? qualitySummary.finalhoverqmi.toFixed(2) : 0}
                      </strong>
                    </Descriptions.Item>
                    <Descriptions.Item
                      className="mb-0"
                      label={"MI"}
                      style={{ width: "300px" }}
                      labelStyle={{ width: "100px" }}
                    >
                      <strong>
                        {qualitySummary.final_qmi ? qualitySummary.final_qmi.toFixed(2) : 0}
                      </strong>
                    </Descriptions.Item>
                    <Descriptions.Item
                      className="mb-0"
                      label={"DOBI"}
                      style={{ width: "300px" }}
                      labelStyle={{ width: "100px" }}
                    >
                      <strong>
                        {qualitySummary.finalhoverqdobi
                          ? qualitySummary.finalhoverqdobi.toFixed(2)
                          : 0}
                      </strong>
                    </Descriptions.Item>
                    <Descriptions.Item
                      className="mb-0"
                      label={"DOBI"}
                      style={{ width: "300px" }}
                      labelStyle={{ width: "100px" }}
                    >
                      <strong>
                        {qualitySummary.final_qdobi ? qualitySummary.final_qdobi.toFixed(2) : 0}
                      </strong>
                    </Descriptions.Item>
                    <Descriptions.Item
                      className="mb-0"
                      label={"TOTOX"}
                      style={{ width: "300px" }}
                      labelStyle={{ width: "100px" }}
                    >
                      <strong>
                        {qualitySummary.finalhoverqtotox
                          ? qualitySummary.finalhoverqtotox.toFixed(2)
                          : 0}
                      </strong>
                    </Descriptions.Item>
                    <Descriptions.Item
                      className="mb-0"
                      label={"TOTOX"}
                      style={{ width: "300px" }}
                      labelStyle={{ width: "100px" }}
                    >
                      <strong>
                        {qualitySummary.final_qtotox ? qualitySummary.final_qtotox.toFixed(2) : 0}
                      </strong>
                    </Descriptions.Item>
                    <Descriptions.Item
                      className="mb-0"
                      label={"IV"}
                      style={{ width: "300px" }}
                      labelStyle={{ width: "100px" }}
                    >
                      <strong>
                        {qualitySummary.finalhoverqiv ? qualitySummary.finalhoverqiv.toFixed(2) : 0}
                      </strong>
                    </Descriptions.Item>
                    <Descriptions.Item
                      className="mb-0"
                      label={"IV"}
                      style={{ width: "300px" }}
                      labelStyle={{ width: "100px" }}
                    >
                      <strong>
                        {qualitySummary.final_qiv ? qualitySummary.final_qiv.toFixed(2) : 0}
                      </strong>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </>
            )}
          </Row>
          <br />
        </div>

        {/* end pecah*/}
      </div>

      <br />
      <div
        style={{
          maxWidth: "1200px",
        }}
      >
        {
          <>
            {fulfillment && cOffer?.terms_of_handover !== "franco" && (
              <Descriptions
                bordered
                size="small"
                className="log-desc"
                style={{ maxWidth: "1000px" }}
              >
                <Descriptions.Item
                  className="mb-0"
                  label="Logistic Fulfillment"
                  style={{ width: "200px" }}
                  labelStyle={{ width: "100px" }}
                >
                  <strong>
                    <table>
                      {needLoadingTruck === true && (
                        <tr style={{ fontSize: "15px" }}>
                          <td style={{ width: "4em" }}>{t("loadingTruck")}</td>
                          <td style={{ width: "10px" }}>:</td>
                          <td style={{ width: "90px" }}>
                            {utils.thousandSeparator(fulfillment.loading_truck.qty.toFixed(3))} MT
                            {console.log(fulfillment)}
                          </td>
                          <td style={{ width: "95px" }}>
                            {loadingTruckQtyLeft === 0 ? (
                              <>
                                {fulfillment.loading_truck.approved === true ? (
                                  <Tag className="ma-0" color="success">
                                    Load Fulfilled
                                  </Tag>
                                ) : (
                                  <Tag className="ma-0" color="warning">
                                    Pending Approval
                                  </Tag>
                                )}
                              </>
                            ) : (
                              <Tag color="red">
                                {loadingTruckQtyLeft < 0 ? "+" : "-"}
                                {utils.thousandSeparator(loadingTruckQtyLeft.toFixed(3))} MT
                              </Tag>
                            )}
                          </td>
                        </tr>
                      )}
                      {needShip === true && (
                        <tr style={{ fontSize: "15px" }}>
                          <td style={{ width: "4em" }}>{t("ship")}</td>
                          <td style={{ width: "10px" }}>:</td>
                          <td style={{ width: "90px" }}>
                            {utils.thousandSeparator(fulfillment.ship.qty.toFixed(3))} MT
                          </td>
                          <td style={{ width: "95px" }}>
                            {shipQtyLeft === 0 ? (
                              <>
                                {fulfillment.ship.approved === true ? (
                                  <Tag className="ma-0" color="success">
                                    Ship Fulfilled
                                  </Tag>
                                ) : (
                                  <Tag className="ma-0" color="warning">
                                    Pending Approval
                                  </Tag>
                                )}
                              </>
                            ) : (
                              <Tag color="red">
                                {shipQtyLeft < 0 ? "+" : "-"}
                                {utils.thousandSeparator(shipQtyLeft.toFixed(3))} MT
                              </Tag>
                            )}
                          </td>
                        </tr>
                      )}

                      {needDischargedTruck === true && (
                        <tr style={{ fontSize: "15px" }}>
                          <td style={{ width: "4em" }}>{t("discharge")}</td>
                          <td style={{ width: "10px" }}>:</td>
                          <td style={{ width: "90px" }}>
                            {utils.thousandSeparator(fulfillment.discharged_truck.qty.toFixed(3))}{" "}
                            MT
                          </td>
                          <td style={{ width: "95px" }}>
                            {dischargedTruckQtyLeft === 0 ? (
                              <>
                                {fulfillment.discharged_truck.approved === true ? (
                                  <Tag className="ma-0" color="success">
                                    Discharge Fulfilled
                                  </Tag>
                                ) : (
                                  <Tag className="ma-0" color="warning">
                                    Pending Approval
                                  </Tag>
                                )}
                              </>
                            ) : (
                              <Tag color="red">
                                {dischargedTruckQtyLeft < 0 ? "+" : "-"}
                                {utils.thousandSeparator(dischargedTruckQtyLeft.toFixed(3))} MT
                              </Tag>
                            )}
                          </td>
                        </tr>
                      )}
                    </table>
                  </strong>
                </Descriptions.Item>
              </Descriptions>
            )}
            <br />
          </>
        }
      </div>
      <br />

      {(!cOffer
        ? null
        : cOffer.terms_of_handover === "loco_luar_pulau"
        ? needLoadingTruck &&
          (!cOffer.quantity ? 0 : cOffer.quantity) !== fulfillment.loading_truck.qty
        : cOffer.terms_of_handover === "fob" || cOffer.terms_of_handover === "cif"
        ? needShip && (!cOffer.quantity ? 0 : cOffer.quantity) !== fulfillment.ship.qty
        : cOffer.terms_of_handover === "loco_dalam_pulau"
        ? needDischargedTruck && logOffersIdInPage.length === 0
        : null) && (
        <>
          {utils.renderWithPermission(
            userInfo.permissions,
            <>
              <SectionHeading
                title={"Create New Logistic Offer"}
                withDivider
                style={{ fontSize: "30px" }}
              />
              <Form
                form={form}
                onFinish={handleOnSubmit}
                autoComplete="off"
                labelCol={{ span: 6 }}
                initialValues={{
                  quantity: needs[type],
                  price: cOffer.terms_of_handover === "cif" ? 0 : null,
                }}
                style={{
                  maxWidth: "750px",
                }}
              >
                <Form.Item
                  label={t("type")}
                  name="type"
                  rules={[
                    {
                      message: `${t("please")} ${t("select")} ${t("type")}`,
                    },
                  ]}
                >
                  <Select
                    showSearch
                    placeholder={`${t("select")} ${t("type")}`}
                    {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                    onChange={(value) => {
                      logOffersIdInPage.map((el2) => form.resetFields([`type-${el2}`]));
                      form.setFieldsValue({ quantity: needs[value] - fulfillment[value].qty });
                      setType(value);
                      form.setFieldsValue({ transportir: undefined });
                      setCurrLogOfferSelect("");
                    }}
                  >
                    {constant.TRANSPORTIR_TYPE_LIST &&
                      constant.TRANSPORTIR_TYPE_LIST.map((d) => {
                        if (
                          fulfillment &&
                          fulfillment[d.value] &&
                          Number(fulfillment[d.value].qty) === Number(needs[d.value])
                        ) {
                          return null;
                        }

                        if (
                          fulfillment &&
                          fulfillment["discharged_truck"] &&
                          d.value === constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK
                        ) {
                          if (
                            Number(fulfillment["ship"].qty) !== Number(needs["ship"]) &&
                            needShip === true
                          ) {
                            return null;
                          }
                        }

                        if (
                          fulfillment &&
                          fulfillment["ship"] &&
                          d.value === constant.TRANSPORTIR_TYPE_SHIP
                        ) {
                          if (
                            Number(fulfillment["loading_truck"].qty) !==
                              Number(needs["loading_truck"]) &&
                            needLoadingTruck === true
                          ) {
                            return null;
                          }
                        }

                        if (
                          d.value === constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK &&
                          needDischargedTruck === false
                        ) {
                          return null;
                        }

                        if (d.value === constant.TRANSPORTIR_TYPE_SHIP && needShip === false) {
                          return null;
                        }

                        if (
                          d.value === constant.TRANSPORTIR_TYPE_LOADING_TRUCK &&
                          needLoadingTruck === false
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

                                if (type === constant.TRANSPORTIR_TYPE_SHIP) console.log(value);
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

                    {type === constant.TRANSPORTIR_TYPE_SHIP &&
                      cOffer.terms_of_handover !== "cif" && (
                        <>
                          <Form.Item label={t("shipRoute")}>
                            <Row gutter={12}>
                              <Col xs={24} lg={18}>
                                <Form.Item
                                  className="mb-2"
                                  name="route"
                                  rules={[
                                    {
                                      required: true,
                                      message: `${t("please")} ${t("select")} ${t("shipRoute")}`,
                                    },
                                  ]}
                                >
                                  <Select
                                    showSearch
                                    placeholder={`${t("select")} ${t("shipRoute")}`}
                                    {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                                    onChange={(value) => {
                                      setBudget(shipRoutes.find((el) => el.value === value).budget);
                                      // form.setFieldsValue({ ship: undefined });
                                      // handler.getShips(setPageLoading, setShips, value);
                                    }}
                                    options={shipRoutes
                                      .filter((el) => el.types.includes(type))
                                      .filter((el2) => el2.handover.id === cOffer.hOver_Loc.id)}
                                  />
                                </Form.Item>
                              </Col>
                            </Row>
                          </Form.Item>
                        </>
                      )}
                    {type === constant.TRANSPORTIR_TYPE_SHIP && (
                      <>
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
                      </>
                    )}
                    {type === constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK && (
                      <Form.Item label={t("dischargeRoute")}>
                        <Row gutter={12}>
                          <Col xs={24} lg={18}>
                            <Form.Item
                              className="mb-2"
                              name="route"
                              rules={[
                                {
                                  required: true,
                                  message: `${t("please")} ${t("select")} ${t("dischargeRoute")}`,
                                },
                              ]}
                            >
                              <Select
                                showSearch
                                placeholder={`${t("select")} ${t("dischargeRoute")}`}
                                {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                                onChange={(value) => {
                                  setBudget(
                                    dischargeRoutes.find((el) => el.value === value).budget,
                                  );
                                  // form.setFieldsValue({ ship: undefined });
                                  // handler.getShips(setPageLoading, setShips, value);
                                }}
                                options={
                                  logOffersShip[0]?.sRoute.destination_location_id
                                    ? dischargeRoutes
                                        .filter((el) => el.types.includes(type))
                                        .filter(
                                          (el2) =>
                                            logOffersShip[0].sRoute.destination_location_id ===
                                            el2.handover.id,
                                        )
                                    : cOffer.terms_of_handover === "loco_dalam_pulau"
                                    ? dischargeRoutes.filter((el) => {
                                        return (
                                          el.types.includes(type) &&
                                          el.handover.id === cOffer.hOver_Loc.id
                                        );
                                      })
                                    : dischargeRoutes
                                }
                              />
                            </Form.Item>
                          </Col>
                        </Row>
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
                        disabled={type !== constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK}
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
                              disabled={
                                cOffer.terms_of_handover === "cif" &&
                                type === constant.TRANSPORTIR_TYPE_SHIP
                                  ? true
                                  : false
                              }
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

                    {/* <Form.Item
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
                    </Form.Item> */}
                    <Divider />
                    <Form.Item className="text-right mb-0">
                      <Button type="secondary" className="mr-2" onClick={resetForm}>
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
            "logistic_offer@create",
          )}
        </>
      )}
      <Collapse accordion={true}>
        {logOffersIdInPage.map((logOfferId, index) => {
          const isLocoLuarPulau = cOffer.terms_of_handover === "loco_luar_pulau";
          const isFob = cOffer.terms_of_handover === "fob";
          const isCIF = cOffer.terms_of_handover === "cif";
          const isFranco = cOffer.terms_of_handover === "franco";
          const isLocoDalamPulau = cOffer.terms_of_handover === "loco_dalam_pulau";
          const statusCondition = (el) =>
            el.logistic_offer_id === logOfferId &&
            (el.status === "approved" || el.status === "pending_approval");

          const getQuantity = (offers) =>
            offers.filter(statusCondition).reduce((prev, curr) => prev + curr.quantity, 0);

          const quantitiesEqualLOCO =
            getQuantity(logOffersLoadingTruck) === getQuantity(logOffersShip) &&
            getQuantity(logOffersShip) === getQuantity(logOffersDischargedTruck) &&
            getQuantity(logOffersLoadingTruck) === getQuantity(logOffersDischargedTruck);

          const quantitiesEqualFOB =
            getQuantity(logOffersShip) === getQuantity(logOffersDischargedTruck);

          const quantitiesEqualCIF =
            getQuantity(logOffersShip) === getQuantity(logOffersDischargedTruck);
          const shouldRenderForm =
            (isLocoLuarPulau && !quantitiesEqualLOCO) ||
            (isFob && !quantitiesEqualFOB) ||
            (isCIF && !quantitiesEqualCIF) ||
            isLocoDalamPulau;
          return (
            <>
              {cOffer &&
                (!cOffer.quantity
                  ? 0
                  : cOffer.quantity !== fulfillment.loading_truck.qty && !cOffer.quantity
                  ? 0
                  : cOffer.quantity !== fulfillment.ship.qty && !cOffer.quantity
                  ? 0
                  : cOffer.quantity !== fulfillment.discharged_truck.qty) && (
                  <>
                    {utils.renderWithPermission(
                      userInfo.permissions,
                      <>
                        {cOffer && shouldRenderForm && (
                          <SectionHeading
                            title={`Create Logistic Offer (${logOfferId})`}
                            withDivider
                            key={`section-heading-${logOfferId}`}
                            style={{ fontSize: "30px", marginTop: "5px" }}
                          />
                        )}

                        <Form
                          form={form}
                          name={`form-${logOfferId}`}
                          onFinish={handleOnSubmitExistingLogistic}
                          autoComplete="off"
                          labelCol={{ span: 6 }}
                          initialValues={{ quantity: needs[type] }}
                          style={{
                            maxWidth: "750px",
                          }}
                          key={`form-${logOfferId}`}
                        >
                          {cOffer && shouldRenderForm && (
                            <Form.Item
                              label={t("type")}
                              name={`type-${logOfferId}`}
                              key={`type-${logOfferId}`}
                              onChange={() => handleTypeSelection(logOfferId)}
                              rules={[
                                {
                                  // required: true,
                                  message: `${t("please")} ${t("select")} ${t("type")}`,
                                },
                              ]}
                            >
                              <Select
                                showSearch
                                placeholder={`${t("select")} ${t("type")}`}
                                {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                                onChange={(value) => {
                                  logOffersIdInPage
                                    .filter((el) => el !== logOfferId)
                                    .map((el2) => form.resetFields([`type-${el2}`]));
                                  form.resetFields(["type"]);
                                  setType(null);
                                  form.setFieldsValue({
                                    logistic_offer_id: logOfferId,
                                    quantity: 0,
                                  });

                                  const matchingLogOffers = fullLogOffers.filter(
                                    (el) => el.logistic_offer_id === logOfferId,
                                  );

                                  if (value === constant.TRANSPORTIR_TYPE_SHIP) {
                                    const loadingTruckOffer = matchingLogOffers.find(
                                      (el) => el.type === constant.TRANSPORTIR_TYPE_LOADING_TRUCK,
                                    );
                                    if (loadingTruckOffer) {
                                      console.log(loadingTruckOffer.quantity, "loadingTruckOffer");
                                      setMaxQtyExistingLogistic(loadingTruckOffer.quantity);
                                      form.setFieldsValue({
                                        logistic_offer_id: logOfferId,
                                        release_num: loadingTruckOffer.release_num,
                                        [`quantity-${logOfferId}`]: loadingTruckOffer.quantity,
                                      });
                                      maxQty = loadingTruckOffer.quantity;
                                    }
                                  } else if (value === constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK) {
                                    if (
                                      matchingLogOffers.some(
                                        (el) => el.type === constant.TRANSPORTIR_TYPE_SHIP,
                                      )
                                    ) {
                                      setMaxQtyExistingLogistic(
                                        matchingLogOffers.find(
                                          (el) => el.type === constant.TRANSPORTIR_TYPE_SHIP,
                                        ).quantity -
                                          matchingLogOffers
                                            .filter(
                                              (el) =>
                                                el.type ===
                                                constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK,
                                            )
                                            .reduce((prev, curr) => prev + curr.quantity, 0),
                                      );
                                      form.setFieldsValue({
                                        logistic_offer_id: logOfferId,
                                        release_num: matchingLogOffers.find(
                                          (el) => el.type === constant.TRANSPORTIR_TYPE_SHIP,
                                        ).release_num,
                                        [`quantity-${logOfferId}`]:
                                          matchingLogOffers.find(
                                            (el) => el.type === constant.TRANSPORTIR_TYPE_SHIP,
                                          ).quantity -
                                          matchingLogOffers
                                            .filter(
                                              (el) =>
                                                el.type ===
                                                constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK,
                                            )
                                            .reduce((prev, curr) => prev + curr.quantity, 0),
                                        [`price-${logOfferId}`]:
                                          cOffer.terms_of_handover === "cif" ? 0 : null,
                                      });
                                    } else {
                                      setMaxQtyExistingLogistic(
                                        cOffer.quantity -
                                          matchingLogOffers
                                            .filter(
                                              (el) =>
                                                el.type ===
                                                constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK,
                                            )
                                            .reduce((prev, curr) => prev + curr.quantity, 0),
                                      );
                                    }
                                  }
                                  setTypeExistingLogistic(value);
                                  form.setFieldsValue({ transportir: undefined });
                                  // console.log(form.getFieldValue(`type-${logOfferId}`), "type1697");
                                }}
                              >
                                {constant.TRANSPORTIR_TYPE_LIST &&
                                  constant.TRANSPORTIR_TYPE_LIST.map((d) => {
                                    const matchingLogOffers = fullLogOffers.filter(
                                      (el) => el.logistic_offer_id === logOfferId,
                                    );

                                    if (
                                      fulfillment &&
                                      fulfillment[d.value] &&
                                      Number(fulfillment[d.value].qty) === Number(needs[d.value])
                                    ) {
                                      return null;
                                    }

                                    if (
                                      fullLogOffers
                                        .filter((el) => el.logistic_offer_id === logOfferId)
                                        .filter(
                                          (el2) =>
                                            el2.type === d.value &&
                                            el2.type !== constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK,
                                        ).length > 0
                                    ) {
                                      return null;
                                    }

                                    if (cOffer.terms_of_handover === "loco_luar_pulau") {
                                      if (
                                        matchingLogOffers.filter(
                                          (el2) =>
                                            el2.type === constant.TRANSPORTIR_TYPE_LOADING_TRUCK,
                                        ).length === 0
                                      ) {
                                        if (
                                          d.value === constant.TRANSPORTIR_TYPE_SHIP ||
                                          d.value === constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK
                                        ) {
                                          return null;
                                        }
                                      } else if (
                                        matchingLogOffers.filter(
                                          (el2) => el2.type === constant.TRANSPORTIR_TYPE_SHIP,
                                        ).length === 0
                                      ) {
                                        if (
                                          d.value === constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK
                                        ) {
                                          return null;
                                        }
                                      }
                                    } else if (cOffer.terms_of_handover === "fob") {
                                      if (
                                        matchingLogOffers.filter(
                                          (el2) => el2.type === constant.TRANSPORTIR_TYPE_SHIP,
                                        ).length === 0
                                      ) {
                                        if (
                                          d.value === constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK
                                        ) {
                                          return null;
                                        }
                                      }
                                    } else if (cOffer.terms_of_handover === "cif") {
                                      if (
                                        matchingLogOffers.filter(
                                          (el2) => el2.type === constant.TRANSPORTIR_TYPE_SHIP,
                                        ).length === 0
                                      ) {
                                        if (
                                          d.value === constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK
                                        ) {
                                          return null;
                                        }
                                      }
                                    } else if (cOffer.terms_of_handover === "franco") {
                                    }

                                    if (
                                      d.value === constant.TRANSPORTIR_TYPE_LOADING_TRUCK &&
                                      needLoadingTruck === false
                                    ) {
                                      return null;
                                    }
                                    if (
                                      d.value === constant.TRANSPORTIR_TYPE_SHIP &&
                                      needShip === false
                                    ) {
                                      return null;
                                    }
                                    if (
                                      d.value === constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK &&
                                      needDischargedTruck === false
                                    ) {
                                      return null;
                                    }

                                    return <Select.Option key={d.value}>{d.label}</Select.Option>;
                                  })}
                              </Select>
                            </Form.Item>
                          )}

                          {form.getFieldValue(`type-${logOfferId}`) && (
                            <>
                              <Form.Item
                                hidden
                                name="logistic_offer_id"
                                label={`${t("logOfferId")}`}
                                key={`logistic_offer_id-${logOfferId}`}
                              >
                                <Input
                                  style={{ width: "100%" }}
                                  {...utils.FORM_RANGEPICKER_PROPS}
                                />
                              </Form.Item>
                              <Form.Item
                                hidden
                                name="release_num"
                                label={`${t("releaseNum")}`}
                                key={`release_num-${logOfferId}`}
                              >
                                <Input style={{ width: "100%" }} />
                              </Form.Item>
                              <Form.Item
                                key={`transportir-${logOfferId}`}
                                name={`transportir-${logOfferId}`}
                                label={t("transportir")}
                              >
                                <Row gutter={12}>
                                  <Col xs={24} lg={18}>
                                    <Form.Item
                                      className="mb-2"
                                      name={`transportir-${logOfferId}`}
                                      rules={[
                                        {
                                          required: true,
                                          message: `${t("please")} ${t("select")} ${t(
                                            "transportir",
                                          )}`,
                                        },
                                      ]}
                                    >
                                      <Select
                                        showSearch
                                        placeholder={`${t("select")} ${t("transportir")}`}
                                        {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                                        onChange={(value) => {
                                          form.setFieldsValue({ ship: undefined });
                                          if (
                                            typeExistingLogistic === constant.TRANSPORTIR_TYPE_SHIP
                                          )
                                            handler.getShips(setPageLoading, setShips, value);
                                          setCurrLogOfferSelect(logOfferId);
                                        }}
                                        options={transportirs.filter((el) =>
                                          el.types.includes(typeExistingLogistic),
                                        )}
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

                              {typeExistingLogistic === constant.TRANSPORTIR_TYPE_SHIP &&
                                cOffer.terms_of_handover !== "cif" && (
                                  <>
                                    <Form.Item label={t("shipRoute")}>
                                      <Row gutter={12}>
                                        <Col xs={24} lg={18}>
                                          <Form.Item
                                            className="mb-2"
                                            key={`route-${logOfferId}`}
                                            name={`route-${logOfferId}`}
                                            rules={[
                                              {
                                                required: true,
                                                message: `${t("please")} ${t("select")} ${t(
                                                  "shipRoute",
                                                )}`,
                                              },
                                            ]}
                                          >
                                            <Select
                                              showSearch
                                              placeholder={`${t("select")} ${t("shipRoute")}`}
                                              {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                                              onChange={(value) => {
                                                setBudget(
                                                  shipRoutes.find((el) => el.value === value)
                                                    .budget,
                                                );
                                                // form.setFieldsValue({ ship: undefined });
                                                // handler.getShips(setPageLoading, setShips, value);
                                              }}
                                              name={`route-${logOfferId}`}
                                              options={
                                                cOffer.hOver_Loc.id
                                                  ? shipRoutes
                                                      .filter((el) =>
                                                        el.types.includes(typeExistingLogistic),
                                                      )
                                                      .filter(
                                                        (el2) =>
                                                          el2.handover.id === cOffer.hOver_Loc.id,
                                                      )
                                                  : shipRoutes
                                              }
                                            />
                                          </Form.Item>
                                        </Col>
                                      </Row>
                                    </Form.Item>
                                    <Form.Item
                                      key={`ship-${logOfferId}`}
                                      name={`ship-${logOfferId}`}
                                      label={t("ship")}
                                    >
                                      <Row gutter={12}>
                                        <Col xs={24} lg={18}>
                                          <Form.Item
                                            className="mb-2"
                                            name={`ship-${logOfferId}`}
                                            rules={[
                                              {
                                                required: true,
                                                message: `${t("please")} ${t("select")} ${t(
                                                  "ship",
                                                )}`,
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
                                          <Col>
                                            Max Ship Capacity:{" "}
                                            {utils.thousandSeparator(ship.capacity)}
                                          </Col>
                                        </Row>
                                      )} */}
                                    </Form.Item>
                                  </>
                                )}

                              {typeExistingLogistic ===
                                constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK && (
                                <>
                                  <Form.Item label={t("dischargeRoute")}>
                                    <Row gutter={12}>
                                      <Col xs={24} lg={18}>
                                        <Form.Item
                                          className="mb-2"
                                          key={`route-${logOfferId}`}
                                          name={`route-${logOfferId}`}
                                          rules={[
                                            {
                                              required: true,
                                              message: `${t("please")} ${t("select")} ${t(
                                                "dischargeRoute",
                                              )}`,
                                            },
                                          ]}
                                        >
                                          <Select
                                            showSearch
                                            placeholder={`${t("select")} ${t("dischargeRoute")}`}
                                            {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                                            onChange={(value) => {
                                              // form.setFieldsValue({ ship: undefined });
                                              // handler.getShips(setPageLoading, setShips, value);

                                              setBudget(
                                                dischargeRoutes.find((el) => el.value === value)
                                                  .budget,
                                              );
                                              if (form.getFieldValue(`price-${logOfferId}`)) {
                                                if (
                                                  dischargeRoutes.find((el) => el.value === value)
                                                    .budget >
                                                  form.getFieldValue(`price-${logOfferId}`)
                                                ) {
                                                  setOverBudget(true);
                                                } else {
                                                  setOverBudget(false);
                                                }
                                              }
                                            }}
                                            name={`dRoute-${logOfferId}`}
                                            options={
                                              isCIF
                                                ? dischargeRoutes.filter(
                                                    (el2) =>
                                                      el2.handover.id === cOffer.hOver_Loc.id,
                                                  )
                                                : isLocoDalamPulau
                                                ? dischargeRoutes.filter(
                                                    (el2) =>
                                                      el2.handover.id === cOffer.hOver_Loc.id,
                                                  )
                                                : dischargeRoutes
                                                    .filter((el) =>
                                                      el.types.includes(typeExistingLogistic),
                                                    )
                                                    .filter(
                                                      (el2) =>
                                                        logOffersShip.filter((el) => {
                                                          return el.logistic_offer_id == logOfferId;
                                                        })[0]?.sRoute.destination_location_id ==
                                                        el2.handover.id,
                                                    )
                                              // ? dischargeRoutes
                                              //     .filter((el) =>
                                              //       el.types.includes(typeExistingLogistic),
                                              //     )
                                              //     .filter(
                                              //       (el2) =>
                                              //         logOffersShip.filter((el) => {
                                              //           return el.logistic_offer_id == logOfferId;
                                              //         })[0]?.sRoute.destination_location_id ==
                                              //         el2.handover.id,
                                              //     )
                                              // : dischargeRoutes.filter(
                                              //     (el2) =>
                                              //       el2.handover.id === cOffer.hOver_Loc.id,
                                              //   )
                                            }
                                          />
                                        </Form.Item>
                                      </Col>

                                      {/* {utils.renderWithPermission(
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
                              )} */}
                                    </Row>
                                  </Form.Item>
                                </>
                              )}
                              <Form.Item
                                key={`quantity-${logOfferId}`}
                                name={`quantity-${logOfferId}`}
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
                                  max={maxQtyExistingLogistic}
                                  disabled={
                                    typeExistingLogistic !==
                                    constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK
                                  }
                                />
                              </Form.Item>

                              <Form.Item
                                key={`price-${logOfferId}`}
                                name={`price-${logOfferId}`}
                                label={`${t("price")}`}
                                colon={false}
                              >
                                <Row gutter={12}>
                                  <Col xs={24} lg={12}>
                                    <Form.Item
                                      name={`price-${logOfferId}`}
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
                                        disabled={
                                          cOffer.terms_of_handover === "cif" &&
                                          typeExistingLogistic === constant.TRANSPORTIR_TYPE_SHIP
                                            ? true
                                            : false
                                        }
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
                                          <Tag color="success">
                                            {utils.thousandSeparator(budget)}
                                          </Tag>
                                        )}
                                      </Form.Item>
                                    </Col>
                                  )}
                                </Row>
                              </Form.Item>

                              {/* <Form.Item
                                key={`loading_date-${logOfferId}`}
                                name={`loading_date-${logOfferId}`}
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
                                    const dynamicEta = `eta_warehouse-${logOfferId}`;
                                    form.setFieldsValue({ [dynamicEta]: undefined });
                                  }}
                                  {...utils.FORM_RANGEPICKER_PROPS}
                                />
                              </Form.Item>

                              <Form.Item
                                key={`eta_warehouse-${logOfferId}`}
                                name={`eta_warehouse-${logOfferId}`}
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
                              </Form.Item> */}
                              <Divider />
                              <Form.Item className="text-right mb-0">
                                <Button type="secondary" className="mr-2" onClick={resetForm}>
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
                      "logistic_offer@create",
                    )}
                  </>
                )}
              {logOffersIdInPage.length > 0 && cOffer.terms_of_handover !== "franco" && (
                <Panel
                  header={
                    <>
                      <SectionHeading
                        title={`Logistic List - (${logOfferId}) - Expected Release Number : (${
                          logOffersIdInPage.indexOf(logOfferId) + 1
                        })`}
                        style={{ fontSize: "30px" }}
                      />
                      <Table
                        size="small"
                        dataSource={[
                          fullLogOffers.filter((el) => el.logistic_offer_id === logOfferId)[0],
                        ]}
                        columns={[
                          utils.getPlainCol(t("info"), "info", {
                            width: "1px",
                            render: (_, row) => {
                              return (
                                <table>
                                  <tr style={{ fontSize: "15px" }}>
                                    <td>{`${t("blQuantity")}`}</td>
                                    <td>:</td>
                                    <td>
                                      {row.quantity_bl
                                        ? utils.thousandSeparator(
                                            Number(row.quantity_bl).toFixed(3),
                                          )
                                        : "-"}{" "}
                                      MT
                                    </td>
                                  </tr>
                                  <tr style={{ fontSize: "15px" }}>
                                    <td>{`${t("quantityBRReceived")}`}</td>
                                    <td>:</td>
                                    <td>
                                      {row.br_quantity
                                        ? utils.thousandSeparator(
                                            Number(row.br_quantity).toFixed(3),
                                          )
                                        : "-"}{" "}
                                      MT
                                    </td>
                                  </tr>
                                  <tr style={{ fontSize: "15px" }}>
                                    <td>{`${t("BRDate")}`}</td>
                                    <td>:</td>
                                    <td>
                                      {row.br_date
                                        ? moment(row.br_date)
                                            .utc()
                                            .format(constant.FORMAT_DISPLAY_DATETIME)
                                        : "-"}
                                    </td>
                                  </tr>
                                  <tr style={{ fontSize: "15px" }}>
                                    <td>{`${t("GRNumber")}`}</td>
                                    <td>:</td>
                                    <td>
                                      {row.gr_number ? JSON.parse(row.gr_number).join(", ") : "-"}
                                    </td>
                                  </tr>
                                  <tr style={{ fontSize: "15px" }}>
                                    <td>{`${t("quantityGR")}`}</td>
                                    <td>:</td>
                                    <td>
                                      {console.log(row)}
                                      {row.gr_quantity
                                        ? utils.thousandSeparator(
                                            Number(row.gr_quantity).toFixed(3),
                                          )
                                        : "-"}{" "}
                                      MT
                                    </td>
                                  </tr>
                                </table>
                              );
                            },
                          }),
                          utils.getPlainCol(t("action"), "action", {
                            width: "40px",
                            render: (_, row) => {
                              let btnEditBLNumber;

                              if (
                                ((isFob || isLocoLuarPulau || isCIF) &&
                                  !(
                                    loadingTruckQtyLeft === 0 &&
                                    shipQtyLeft === 0 &&
                                    dischargedTruckQtyLeft === 0
                                  )) ||
                                (row.quantity_bl && isLocoDalamPulau && !row.discharged_date)
                              ) {
                                btnEditBLNumber = (
                                  <Button
                                    className="mr-1 mb-1"
                                    type="primary"
                                    size="small"
                                    onClick={() => {
                                      setTypeExistingLogistic(
                                        constant.TRANSPORTIR_TYPE_LOADING_TRUCK,
                                      );
                                      setActionLogOfferUniqueId(row.id);
                                      setActionLogOfferId(row.logistic_offer_id);
                                      setModalInputBLShow(true);
                                    }}
                                  >
                                    {`${t("edit")} ${t("blQuantity")}`}
                                  </Button>
                                );
                              }

                              const actionsEl = <>{btnEditBLNumber}</>;
                              const elExist = btnEditBLNumber;
                              if (!elExist) {
                                return null;
                              }

                              return actionsEl;
                            },
                          }),
                          utils.getPlainCol(t("Mutu Final Penyerahan"), "penyerahan", {
                            width: "40px",
                            render: (_, row) => {
                              return (
                                <table>
                                  <tr style={{ fontSize: "15px" }}>
                                    <td>{`${t("FFA")}`}</td>
                                    <td>:</td>
                                    <td>
                                      {row.finalhoverqffa
                                        ? utils.thousandSeparator(
                                            Number(row.finalhoverqffa).toFixed(2),
                                          )
                                        : "-"}{" "}
                                    </td>
                                  </tr>
                                  <tr style={{ fontSize: "15px" }}>
                                    <td>{`${t("M+I")}`}</td>
                                    <td>:</td>
                                    <td>
                                      {row.finalhoverqmi
                                        ? utils.thousandSeparator(
                                            Number(row.finalhoverqmi).toFixed(2),
                                          )
                                        : "-"}{" "}
                                    </td>
                                  </tr>
                                  <tr style={{ fontSize: "15px" }}>
                                    <td>{`${t("DOBI")}`}</td>
                                    <td>:</td>
                                    <td>
                                      {row.finalhoverqdobi
                                        ? utils.thousandSeparator(
                                            Number(row.finalhoverqdobi).toFixed(2),
                                          )
                                        : "-"}{" "}
                                    </td>
                                  </tr>
                                  <tr style={{ fontSize: "15px" }}>
                                    <td>{`${t("TOTOX")}`}</td>
                                    <td>:</td>
                                    <td>
                                      {row.finalhoverqtotox
                                        ? utils.thousandSeparator(
                                            Number(row.finalhoverqtotox).toFixed(2),
                                          )
                                        : "-"}{" "}
                                    </td>
                                  </tr>
                                  <tr style={{ fontSize: "15px" }}>
                                    <td>{`${t("IV")}`}</td>
                                    <td>:</td>
                                    <td>
                                      {row.finalhoverqiv
                                        ? utils.thousandSeparator(
                                            Number(row.finalhoverqiv).toFixed(2),
                                          )
                                        : "-"}{" "}
                                    </td>
                                  </tr>
                                </table>
                              );
                            },
                          }),
                          utils.getPlainCol(t("Mutu Final Pabrik"), "pabrik", {
                            width: "40px",
                            render: (_, row) => {
                              return (
                                <table>
                                  <tr style={{ fontSize: "15px" }}>
                                    <td>{`${t("FFA")}`}</td>
                                    <td>:</td>
                                    <td>
                                      {row.final_qffa
                                        ? utils.thousandSeparator(Number(row.final_qffa).toFixed(2))
                                        : "-"}{" "}
                                    </td>
                                  </tr>
                                  <tr style={{ fontSize: "15px" }}>
                                    <td>{`${t("M+I")}`}</td>
                                    <td>:</td>
                                    <td>
                                      {row.final_qmi
                                        ? utils.thousandSeparator(Number(row.final_qmi).toFixed(2))
                                        : "-"}{" "}
                                    </td>
                                  </tr>
                                  <tr style={{ fontSize: "15px" }}>
                                    <td>{`${t("DOBI")}`}</td>
                                    <td>:</td>
                                    <td>
                                      {row.final_qdobi
                                        ? utils.thousandSeparator(
                                            Number(row.final_qdobi).toFixed(2),
                                          )
                                        : "-"}{" "}
                                    </td>
                                  </tr>
                                  <tr style={{ fontSize: "15px" }}>
                                    <td>{`${t("TOTOX")}`}</td>
                                    <td>:</td>
                                    <td>
                                      {row.final_qtotox
                                        ? utils.thousandSeparator(
                                            Number(row.final_qtotox).toFixed(2),
                                          )
                                        : "-"}{" "}
                                    </td>
                                  </tr>
                                  <tr style={{ fontSize: "15px" }}>
                                    <td>{`${t("IV")}`}</td>
                                    <td>:</td>
                                    <td>
                                      {row.final_qiv
                                        ? utils.thousandSeparator(Number(row.final_qiv).toFixed(2))
                                        : "-"}{" "}
                                    </td>
                                  </tr>
                                </table>
                              );
                            },
                          }),
                        ]}
                        {...configs.TABLE_SINGLEPAGE}
                      />
                    </>
                  }
                  key={`${logOfferId}`}
                  onClick={() => {
                    const matchingLogOffers = fullLogOffers.filter(
                      (el) => el.logistic_offer_id === logOfferId,
                    );
                    if (isLocoLuarPulau || isFob || isCIF) {
                      setQtyDTruckFulfilledExistingLogistic(
                        parseInt(
                          matchingLogOffers.find((el) => el.type === constant.TRANSPORTIR_TYPE_SHIP)
                            .quantity -
                            matchingLogOffers
                              .filter(
                                (el) => el.type === constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK,
                              )
                              .reduce((prev, curr) => prev + curr.quantity, 0),
                        ),
                      );
                    } else if (isLocoDalamPulau) {
                      setQtyDTruckFulfilledExistingLogistic(
                        parseInt(
                          cOffer.quantity -
                            matchingLogOffers
                              .filter(
                                (el) => el.type === constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK,
                              )
                              .reduce((prev, curr) => prev + curr.quantity, 0),
                        ),
                      );
                    }
                  }}
                >
                  {logOffersLoadingTruck &&
                    logOffersLoadingTruckIdInPage.includes(logOfferId) &&
                    logOffersLoadingTruck.length > 0 && (
                      <>
                        <SectionHeading title={t("loadingMethod")} style={{ fontSize: "25px" }} />
                        {/* <Divider className="mt-3 mb-3" /> */}

                        <Table
                          size="small"
                          dataSource={logOffersLoadingTruck.filter(
                            (el) => el.logistic_offer_id === logOfferId,
                          )}
                          columns={[
                            utils.getPlainCol(t("status"), "status", {
                              render: (val, row) => {
                                return (
                                  <>
                                    <Tag className="mb-2" color={utils.getLogOfferStatusColor(val)}>
                                      {utils.snakeToTitleCase(val)}
                                    </Tag>
                                    <br />

                                    {row.discharged_date && (
                                      <Tag color="success">{t("discharged")}</Tag>
                                    )}
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
                                const fileInsurance =
                                  filesExist && row.files.find((el) => el.type === typeInsurance);
                                const fileContract =
                                  filesExist && row.files.find((el) => el.type === typeContract);
                                const fileCargoReadiness =
                                  filesExist &&
                                  row.files.find((el) => el.type === typeCargoReadiness);

                                // const docCompleted = fileSuratPerjanjian && fileInsurance;
                                const docCompleted = true;
                                // fileSuratPerjanjian ? true : false;

                                return (
                                  <>
                                    {row.status === constant.STATUS_APPROVED ? (
                                      <>
                                        {fileSuratPerjanjian &&
                                        fileInsurance &&
                                        fileCargoReadiness &&
                                        fileContract ? (
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

                            utils.getPlainCol(t("transportir"), "trnsprtr", {
                              render: (val) => val.name,
                            }),

                            utils.getPlainCol(t("info"), "info", {
                              width: "300px",

                              render: (_, row) => {
                                return (
                                  <table>
                                    <tr style={{ fontSize: "15px" }}>
                                      <td>{`${t("quantity")}`}</td>
                                      <td>:</td>
                                      <td>
                                        {utils.thousandSeparator(Number(row.quantity).toFixed(2))}
                                      </td>
                                    </tr>
                                    {cOffer.price_freight_darat && (
                                      <tr style={{ fontSize: "15px" }}>
                                        <td>{t("freight")}</td>
                                        <td>:</td>
                                        <td>
                                          {utils.thousandSeparator(
                                            Number(cOffer.price_freight_darat).toFixed(2),
                                          )}
                                        </td>
                                      </tr>
                                    )}
                                    <tr style={{ fontSize: "15px" }}>
                                      <td>{`${t("price")}/Kg`}</td>
                                      <td>:</td>
                                      <td>
                                        {utils.thousandSeparator(Number(row.price).toFixed(2))}
                                      </td>
                                      <td>
                                        {Number(row.price) <= Number(cOffer.price_freight_darat) ? (
                                          <Tag color="success">On Budget</Tag>
                                        ) : (
                                          <Tag color="red">Over Budget</Tag>
                                        )}
                                      </td>
                                    </tr>

                                    <tr style={{ fontSize: "15px" }}>
                                      <td>{`${t("actual")} ${t("loadingDate")}`}</td>
                                      <td>:</td>
                                      <td>
                                        {row.actual_loading_date
                                          ? moment(row.actual_loading_date).format(
                                              constant.FORMAT_DISPLAY_DATE_COMPACT,
                                            )
                                          : "-"}
                                      </td>
                                    </tr>

                                    <tr style={{ fontSize: "15px" }}>
                                      <td>{`${t("end")} ${t("loading")}`}</td>
                                      <td>:</td>
                                      <td>
                                        {row.discharged_date ? (
                                          <Tag color="success">
                                            {moment(row.discharged_date).format(
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
                                        setTypeExistingLogistic(
                                          constant.TRANSPORTIR_TYPE_LOADING_TRUCK,
                                        );
                                        setActionLogOfferUniqueId(row.id);
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
                                        setTypeExistingLogistic(
                                          constant.TRANSPORTIR_TYPE_LOADING_TRUCK,
                                        );
                                        setActionLogOfferUniqueId(row.id);
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
                                        setTypeExistingLogistic(
                                          constant.TRANSPORTIR_TYPE_LOADING_TRUCK,
                                        );
                                        setActionLogOfferUniqueId(row.id);
                                        setActionLogOfferId(row.logistic_offer_id);
                                        setModalAdjustData({
                                          price: row.price,
                                          commodity_offer_id: cOffer.unique_id,
                                          logistic_offer_id: row.logistic_offer_id,
                                          quantity: row.quantity,
                                          type: constant.TRANSPORTIR_TYPE_LOADING_TRUCK,
                                          terms_of_handover: cOffer.terms_of_handover,
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
                                      <Button
                                        className="mr-1 mb-1"
                                        size="small"
                                        onClick={btnOnClick}
                                      >
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
                                        if (fileSuratPerjanjian)
                                          setModalUploadFile(fileSuratPerjanjian);
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
                                      <Button
                                        className="mr-1 mb-1"
                                        size="small"
                                        onClick={btnOnClick}
                                      >
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
                                      <Button
                                        className="mr-1 mb-1"
                                        size="small"
                                        onClick={btnOnClick}
                                      >
                                        {typeTextCargoReadiness}
                                      </Button>
                                    );
                                  };

                                  const fileCargoReadiness =
                                    filesExist &&
                                    row.files.find((el) => el.type === typeCargoReadiness);
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
                                        if (fileCargoReadiness)
                                          setModalUploadFile(fileCargoReadiness);
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
                                      <Button
                                        className="mr-1 mb-1"
                                        size="small"
                                        onClick={btnOnClick}
                                      >
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
                                    filesExist &&
                                    row.files.find((el) => el.type === constant.FILE_TYPE_BL);

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
                                      <Button
                                        className="mr-1 mb-1"
                                        size="small"
                                        onClick={btnOnClick}
                                      >
                                        {constant.FILE_TYPE_BL.toUpperCase()}
                                      </Button>
                                    );
                                  };

                                  if (
                                    fileSuratPerjanjian ||
                                    fileCargoReadiness ||
                                    fileContract ||
                                    fileInsurance
                                  ) {
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
                                      btnInsurance,
                                      "logistic@insurance",
                                    )}
                                    {utils.renderWithPermission(
                                      userInfo.permissions,
                                      btnSuratPerjanjian,
                                      "logistic@SPAD",
                                    )}
                                    {btnContract}
                                    {btnCargoReadiness}
                                    {/* {btnBL} */}
                                    {btnEditFiles}
                                  </>
                                );

                                const elExist =
                                  btnReject ||
                                  btnAdjust ||
                                  btnApprove ||
                                  btnSuratPerjanjian ||
                                  btnInsurance;
                                if (!elExist) {
                                  return null;
                                }

                                return actionsEl;
                              },
                            }),
                            utils.getPlainCol(t("activity"), "activity", {
                              width: "150px",
                              render: (_, row) => {
                                //GA PERLU LENGKAPIN if (!logisticFulfilled) return "-";
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
                                let btnSplitLoadingTruck;
                                if (docCompleted) {
                                  if (
                                    !row.actual_loading_date &&
                                    row.status === constant.STATUS_APPROVED
                                  ) {
                                    btnSplitLoadingTruck = (
                                      <Button
                                        className="mr-1 mb-1"
                                        type="primary"
                                        size="small"
                                        onClick={() => {
                                          setTypeExistingLogistic(
                                            constant.TRANSPORTIR_TYPE_LOADING_TRUCK,
                                          );
                                          setActionLogOfferUniqueId(row.id);
                                          setActionLogOfferId(row.logistic_offer_id);
                                          setModalSplitLoadingTruckShow(true);
                                          setModalSplitLoadingTruckData({
                                            commodity_offer_id: cOffer.unique_id,
                                            logistic_offer_id: row.logistic_offer_id,

                                            quantity: row.quantity,
                                            type: "loading_truck",
                                            terms_of_handover: cOffer.terms_of_handover,
                                          });
                                        }}
                                      >
                                        {`${t("Split Truck")}`}
                                      </Button>
                                    );
                                    btnLoading = (
                                      <Button
                                        className="mr-1 mb-1"
                                        type="primary"
                                        size="small"
                                        onClick={() => {
                                          setTypeExistingLogistic(
                                            constant.TRANSPORTIR_TYPE_LOADING_TRUCK,
                                          );
                                          setActionLogOfferUniqueId(row.id);
                                          setActionLogOfferId(row.logistic_offer_id);
                                          setModalLoadingShow(true);
                                        }}
                                      >
                                        {`${t("start")} ${t("loading")}`}
                                      </Button>
                                    );
                                  }

                                  // if (row.actual_loading_date && !row.delivery_date) {
                                  //   const fileBL =
                                  //     filesExist &&
                                  //     row.files.find((el) => el.type === constant.FILE_TYPE_BL);
                                  //   btnDelivery = (
                                  //     <Button
                                  //       className="mr-1 mb-1"
                                  //       type="primary"
                                  //       size="small"
                                  //       onClick={() => {
                                  //         setTypeExistingLogistic(
                                  //           constant.TRANSPORTIR_TYPE_LOADING_TRUCK,
                                  //         );
                                  //         setActionLogOfferUniqueId(row.id);
                                  //         setActionLogOfferId(row.logistic_offer_id);
                                  //         setModalDeliveryShow(true);
                                  //         setModalDeliveryData({
                                  //           fileBL: fileBL,
                                  //           transType: row.type,
                                  //         });
                                  //       }}
                                  //     >
                                  //       {`${t("finish")} ${t("loading")} & ${t("start")} ${t(
                                  //         "delivery",
                                  //       )}`}
                                  //     </Button>
                                  //   );
                                  // }

                                  // if (row.delivery_date && !row.delivered_date) {
                                  //   btnDelivered = (
                                  //     <Button
                                  //       className="mr-1 mb-1"
                                  //       type="primary"
                                  //       size="small"
                                  //       onClick={() => {
                                  //         setTypeExistingLogistic(
                                  //           constant.TRANSPORTIR_TYPE_LOADING_TRUCK,
                                  //         );
                                  //         setActionLogOfferUniqueId(row.id);
                                  //         setActionLogOfferId(row.logistic_offer_id);
                                  //         setModalDeliveredShow(true);
                                  //       }}
                                  //     >
                                  //       {`${t("arrivedAtLPort")}`}
                                  //     </Button>
                                  //   );
                                  // }

                                  if (row.actual_loading_date && !row.discharged_date) {
                                    btnDischarge = (
                                      <Button
                                        className="mr-1 mb-1"
                                        type="primary"
                                        size="small"
                                        onClick={() => {
                                          setTypeExistingLogistic(
                                            constant.TRANSPORTIR_TYPE_LOADING_TRUCK,
                                          );
                                          setActionLogOfferUniqueId(row.id);
                                          setActionLogOfferId(row.logistic_offer_id);
                                          setModalDischargeShow(true);
                                          setModalDischargeMaxQty(row.quantity);
                                        }}
                                      >
                                        {`${t("end")} ${t("loading")}`}
                                      </Button>
                                    );
                                  }
                                }

                                if (row.discharged_date)
                                  return <Tag color="success">{t("done")}</Tag>;
                                return [
                                  btnLoading,
                                  btnDelivery,
                                  btnDelivered,
                                  btnDischarge,
                                  btnSplitLoadingTruck,
                                ];
                              },
                            }),
                          ]}
                          {...configs.TABLE_SINGLEPAGE}
                        />
                      </>
                    )}

                  {logOffersShip &&
                    logOffersShipIdInPage.includes(logOfferId) &&
                    logOffersShip.length > 0 && (
                      <>
                        <SectionHeading title={t("shipMethod")} style={{ fontSize: "25px" }} />
                        {/* <Divider className="mt-3 mb-3" /> */}
                        {console.log(
                          logOffersShip.filter((el) => el.logistic_offer_id === logOfferId),
                        )}
                        <Table
                          size="small"
                          dataSource={logOffersShip.filter(
                            (el) => el.logistic_offer_id === logOfferId,
                          )}
                          columns={[
                            utils.getPlainCol(t("status"), "status", {
                              width: "100px",
                              render: (val, row) => {
                                return (
                                  <>
                                    <Tag className="mb-2" color={utils.getLogOfferStatusColor(val)}>
                                      {utils.snakeToTitleCase(val)}
                                    </Tag>
                                    <br />
                                    {row.discharged_date && (
                                      <Tag color="success">{t("discharged")}</Tag>
                                    )}
                                  </>
                                );
                              },
                            }),
                            utils.getPlainCol(t("documents"), "documents", {
                              width: "100px",
                              render: (_, row) => {
                                const fileType = constant.FILE_TYPE_SPAL;
                                const filesExist = row && row.files && row.files.length > 0;
                                const fileSuratPerjanjian =
                                  filesExist && row.files.find((el) => el.type === fileType);
                                const fileInsurance =
                                  filesExist && row.files.find((el) => el.type === typeInsurance);
                                const fileContract =
                                  filesExist && row.files.find((el) => el.type === typeContract);
                                const fileCargoReadiness =
                                  filesExist &&
                                  row.files.find((el) => el.type === typeCargoReadiness);
                                // const docCompleted = fileSuratPerjanjian && fileInsurance;
                                const docCompleted = true;
                                // fileSuratPerjanjian && row.spk && row.spk.pdf_path ? true : false;

                                return (
                                  <>
                                    {row.status === constant.STATUS_APPROVED ? (
                                      <>
                                        {fileSuratPerjanjian &&
                                        row.spk &&
                                        row.spk.pdf_path &&
                                        row.spk_bongkar &&
                                        row.spk_bongkar.pdf_path &&
                                        fileCargoReadiness &&
                                        fileContract &&
                                        fileInsurance ? (
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
                            utils.getPlainCol(t("transportir"), "trnsprtr", {
                              width: "150px",
                              render: (val) => val.name,
                            }),

                            utils.getPlainCol(t("ship"), "ship", {
                              width: "150px",
                              render: (val) => {
                                if (!val || !val.name) return "-";

                                return val.name;
                              },
                            }),
                            utils.getPlainCol(t("info"), "info", {
                              width: "300px",

                              render: (_, row) => {
                                return (
                                  <table>
                                    <tr style={{ fontSize: "15px" }}>
                                      <td>{`${t("quantity")}`}</td>
                                      <td>:</td>
                                      <td>
                                        {utils.thousandSeparator(Number(row.quantity).toFixed(2))}
                                      </td>
                                    </tr>
                                    {row.budget && (
                                      <tr style={{ fontSize: "15px" }}>
                                        <td>{t("budget")}</td>
                                        <td>:</td>
                                        <td>
                                          {utils.thousandSeparator(Number(row.budget).toFixed(2))}
                                        </td>
                                      </tr>
                                    )}
                                    <tr style={{ fontSize: "15px" }}>
                                      <td>{`${t("price")}/Kg`}</td>
                                      <td>:</td>
                                      <td>
                                        {utils.thousandSeparator(Number(row.price).toFixed(2))}
                                      </td>
                                      <td>
                                        {row.budget && Number(row.price) <= Number(row.budget) ? (
                                          <Tag color="success">On Budget</Tag>
                                        ) : cOffer.terms_of_handover === "cif" ? (
                                          <Tag color="success">Free Ship</Tag>
                                        ) : (
                                          <Tag color="red">Over Budget</Tag>
                                        )}
                                      </td>
                                    </tr>

                                    {/* <tr style={{ fontSize: "15px" }}>
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
                                    <tr style={{ fontSize: "15px" }}>
                                      <td>{`${t("ETA")} ${t("warehouse")}`}</td>
                                      <td>:</td>
                                      <td>
                                        {`${moment(row.eta_from).format(
                                          constant.FORMAT_DISPLAY_DATE_COMPACT,
                                        )} - ${moment(row.eta_to).format(
                                          constant.FORMAT_DISPLAY_DATE_COMPACT,
                                        )}`}
                                      </td>
                                    </tr> */}
                                    <tr style={{ fontSize: "15px" }}>
                                      <td>{`${t("actual")} ${t("loadingDate")}`}</td>
                                      <td>:</td>
                                      <td>
                                        {row.actual_loading_date
                                          ? moment(row.actual_loading_date).format(
                                              constant.FORMAT_DISPLAY_DATE_COMPACT,
                                            )
                                          : "-"}
                                      </td>
                                    </tr>
                                    {cOffer.terms_of_handover !== "cif" && (
                                      <>
                                        <tr style={{ fontSize: "15px" }}>
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

                                        <tr style={{ fontSize: "15px" }}>
                                          <td>{`${t("arrivedAtDPort")}`}</td>
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
                                      </>
                                    )}
                                    <tr style={{ fontSize: "15px" }}>
                                      <td>{`${t("discharge")}`}</td>
                                      <td>:</td>
                                      <td>
                                        {row.discharged_date ? (
                                          <Tag color="success">
                                            {moment(row.discharged_date).format(
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
                                        setActionLogOfferUniqueId(row.id);
                                        setTypeExistingLogistic(constant.TRANSPORTIR_TYPE_SHIP);
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
                                        setTypeExistingLogistic(constant.TRANSPORTIR_TYPE_SHIP);
                                        setActionLogOfferUniqueId(row.id);
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
                                        setTypeExistingLogistic(constant.TRANSPORTIR_TYPE_SHIP);
                                        setActionLogOfferUniqueId(row.id);
                                        setActionLogOfferId(row.logistic_offer_id);
                                        setModalAdjustData({
                                          price: row.price,
                                          commodity_offer_id: cOffer.unique_id,
                                          logistic_offer_id: row.logistic_offer_id,
                                          quantity: row.quantity,
                                          type: constant.TRANSPORTIR_TYPE_SHIP,
                                          terms_of_handover: cOffer.terms_of_handover,
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
                                      <Button
                                        className="mr-1 mb-1"
                                        size="small"
                                        onClick={btnOnClick}
                                      >
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
                                        if (fileSuratPerjanjian)
                                          setModalUploadFile(fileSuratPerjanjian);
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
                                      <Button
                                        className="mr-1 mb-1"
                                        size="small"
                                        onClick={btnOnClick}
                                      >
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
                                      <Button
                                        className="mr-1 mb-1"
                                        size="small"
                                        onClick={btnOnClick}
                                      >
                                        {typeTextCargoReadiness}
                                      </Button>
                                    );
                                  };

                                  const fileCargoReadiness =
                                    filesExist &&
                                    row.files.find((el) => el.type === typeCargoReadiness);
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
                                        if (fileCargoReadiness)
                                          setModalUploadFile(fileCargoReadiness);
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
                                      <Button
                                        className="mr-1 mb-1"
                                        size="small"
                                        onClick={btnOnClick}
                                      >
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
                                    filesExist &&
                                    row.files.find((el) => el.type === constant.FILE_TYPE_BL);

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
                                      <Button
                                        className="mr-1 mb-1"
                                        size="small"
                                        onClick={btnOnClick}
                                      >
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

                                  if (
                                    fileSuratPerjanjian ||
                                    fileCargoReadiness ||
                                    fileContract ||
                                    fileInsurance
                                  ) {
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

                                  if (row.type === constant.TRANSPORTIR_TYPE_SHIP) {
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
                                  }

                                  if (row.type === constant.TRANSPORTIR_TYPE_SHIP) {
                                    if (row.spk_bongkar.pdf_path) {
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
                                    } else {
                                      btnPembongkaran = (
                                        <Button
                                          className="mr-1 mb-1"
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
                                    {utils.renderWithPermission(
                                      userInfo.permissions,
                                      btnBL,
                                      "logistic@BL",
                                    )}

                                    {btnContract}
                                    {btnCargoReadiness}
                                    {btnEditFiles}
                                  </>
                                );

                                const elExist =
                                  btnReject ||
                                  btnAdjust ||
                                  btnApprove ||
                                  btnSuratPerjanjian ||
                                  btnInsurance;
                                if (!elExist) {
                                  return null;
                                }

                                return actionsEl;
                              },
                            }),
                            utils.getPlainCol(t("activity"), "activity", {
                              width: "150px",
                              render: (_, row) => {
                                //GA PERLU LENGKAPIN if (!logisticFulfilled) return "-";
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
                                let btnInputBLNumber;
                                let btnAutoBR;
                                let btnAutoGR;
                                let btnLockGR;
                                let btnDelivered;
                                let btnDischarge;
                                let btnDelete;
                                let btnSplitShip;

                                let checkApprovalBefore =
                                  cOffer.terms_of_handover === "loco_luar_pulau"
                                    ? logOffersLoadingTruck[logOffersIdInPage.indexOf(logOfferId)]
                                        ?.discharged_date
                                      ? true
                                      : false
                                    : true;
                                if (
                                  checkApprovalBefore &&
                                  !row.actual_loading_date &&
                                  row.status === constant.STATUS_APPROVED
                                ) {
                                  btnSplitShip = (
                                    <Button
                                      className="mr-1 mb-1"
                                      type="primary"
                                      size="small"
                                      onClick={() => {
                                        setTypeExistingLogistic(constant.TRANSPORTIR_TYPE_SHIP);
                                        setActionLogOfferUniqueId(row.id);
                                        setActionLogOfferId(row.logistic_offer_id);
                                        setModalSplitShipShow(true);
                                        setModalSplitShipData({
                                          commodity_offer_id: cOffer.unique_id,
                                          logistic_offer_id: row.logistic_offer_id,
                                          quantity: row.quantity,
                                          type: "ship",
                                          terms_of_handover: cOffer.terms_of_handover,
                                        });
                                      }}
                                    >
                                      {`${t("Split Ship")}`}
                                    </Button>
                                  );
                                  btnLoading = (
                                    <Button
                                      className="mr-1 mb-1"
                                      type="primary"
                                      size="small"
                                      onClick={() => {
                                        setTypeExistingLogistic(constant.TRANSPORTIR_TYPE_SHIP);
                                        setActionLogOfferUniqueId(row.id);
                                        setActionLogOfferId(row.logistic_offer_id);
                                        setModalLoadingShow(true);
                                      }}
                                    >
                                      {`${t("start")} ${t("loading")}`}
                                    </Button>
                                  );
                                  btnDelete = (
                                    <Button
                                      type="danger"
                                      onClick={() => {
                                        Modal.confirm({
                                          ...constant.MODAL_CONFIRM_DANGER_PROPS,
                                          content:
                                            "Delete ship cause all data related to this ship will be deleted. Are you sure?",
                                          onOk: () => {
                                            handleDeleteExistingLogistic(row.logistic_offer_id);
                                          },
                                        });
                                      }}
                                      icon={<DeleteOutlined />}
                                    />
                                  );
                                } else if (
                                  logOffersLoadingTruck.length > 0 &&
                                  !logOffersLoadingTruck[logOffersIdInPage.indexOf(logOfferId)]
                                    ?.discharged_date
                                    ? true
                                    : false
                                ) {
                                  return (
                                    <Tag color="red">
                                      Complete the loading first before start shipping
                                    </Tag>
                                  );
                                }

                                if (
                                  (cOffer.terms_of_handover === "loco_luar_pulau" ||
                                    cOffer.terms_of_handover === "fob") &&
                                  row.actual_loading_date &&
                                  !row.quantity_bl
                                ) {
                                  return (btnInputBLNumber = (
                                    <Button
                                      className="mr-1 mb-1"
                                      type="primary"
                                      size="small"
                                      onClick={() => {
                                        setTypeExistingLogistic(constant.TRANSPORTIR_TYPE_SHIP);
                                        setActionLogOfferUniqueId(row.id);
                                        setActionLogOfferId(row.logistic_offer_id);
                                        setModalInputBLShow(true);
                                      }}
                                    >
                                      {`${t("input")} ${t("blQuantity")}`}
                                    </Button>
                                  ));
                                }

                                if (
                                  (cOffer.terms_of_handover === "loco_luar_pulau" ||
                                    cOffer.terms_of_handover === "fob") &&
                                  row.quantity_bl &&
                                  !row.br_quantity &&
                                  cOffer.po_number
                                ) {
                                  return (btnAutoBR = (
                                    <>
                                      <Button
                                        className="mr-1 mb-1"
                                        size="small"
                                        type="primary"
                                        onClick={() => {
                                          setTypeExistingLogistic(constant.TRANSPORTIR_TYPE_SHIP);
                                          setActionLogOfferUniqueId(row.id);
                                          setActionLogOfferId(row.logistic_offer_id);
                                          modalSearchBR.setShow(true);
                                          modalSearchBR.setData({
                                            cOffer,
                                            lOffer: logOffersShip.filter(
                                              (el) => el.logistic_offer_id === logOfferId,
                                            ),
                                            logOfferId,
                                          });
                                        }}
                                      >
                                        Manual Search BR
                                      </Button>
                                    </>
                                  ));
                                } else if (!cOffer.po_number) {
                                  return <Tag color="red">PO Number currently not generated</Tag>;
                                }

                                if (
                                  (cOffer.terms_of_handover === "loco_luar_pulau" ||
                                    cOffer.terms_of_handover === "fob") &&
                                  row.br_quantity &&
                                  !row.gr_lock
                                ) {
                                  btnAutoGR = (
                                    <>
                                      <Button
                                        className="mr-1 mb-1"
                                        size="small"
                                        type="primary"
                                        onClick={() => {
                                          handleOnConfirmAutoGR(
                                            logOffersShip.filter(
                                              (el) => el.logistic_offer_id === logOfferId,
                                            ),
                                          );
                                        }}
                                      >
                                        Get GR Quantity
                                      </Button>
                                      <div className="center">or</div>
                                      <Button
                                        className="mr-1 mb-1"
                                        size="small"
                                        type="warning"
                                        onClick={() => {
                                          setTypeExistingLogistic(constant.TRANSPORTIR_TYPE_SHIP);
                                          setActionLogOfferUniqueId(row.id);
                                          setActionLogOfferId(row.logistic_offer_id);
                                          modalSearchGR.setShow(true);
                                          modalSearchGR.setData({
                                            cOffer,
                                            lOffer: logOffersShip.filter(
                                              (el) => el.logistic_offer_id === logOfferId,
                                            ),
                                            logOfferId,
                                          });
                                        }}
                                      >
                                        Manual Search GR
                                      </Button>
                                    </>
                                  );
                                  //lock gr
                                }
                                if ((isLocoLuarPulau || isFob) && row.gr_quantity && !row.gr_lock) {
                                  btnLockGR = (
                                    <>
                                      <Button
                                        className="mr-1 mb-1"
                                        size="small"
                                        type="primary"
                                        style={{ background: "#faad14", borderColor: "yellow" }}
                                        onClick={() => {
                                          Modal.confirm({
                                            ...constant.MODAL_CONFIRM_DANGER_PROPS,
                                            content:
                                              "Setelah GR dikunci maka tidak bisa diubah lagi, apakah anda yakin?",
                                            onOk: () => {
                                              handleLockGR(row.logistic_offer_id);
                                            },
                                          });
                                        }}
                                        icon={<LockOutlined />}
                                      >
                                        Lock GR
                                      </Button>
                                    </>
                                  );
                                }
                                if (
                                  (isLocoLuarPulau || isFob) &&
                                  row.gr_lock &&
                                  !row.delivery_date
                                ) {
                                  const fileBL =
                                    filesExist &&
                                    row.files.find((el) => el.type === constant.FILE_TYPE_BL);

                                  btnDelivery = (
                                    <Button
                                      className="mr-1 mb-1"
                                      type="primary"
                                      size="small"
                                      onClick={() => {
                                        setTypeExistingLogistic(constant.TRANSPORTIR_TYPE_SHIP);
                                        setActionLogOfferUniqueId(row.id);
                                        setActionLogOfferId(row.logistic_offer_id);
                                        setModalDeliveryShow(true);
                                        setModalDeliveryData({
                                          fileBL: fileBL,
                                          transType: row.type,
                                        });
                                      }}
                                    >
                                      {`${t("finish")} ${t("loading")} & ${t("start")} ${t(
                                        "delivery",
                                      )}`}
                                    </Button>
                                  );
                                }
                                if (
                                  (row.delivery_date && !row.delivered_date) ||
                                  (isCIF && row.actual_loading_date && !row.delivered_date)
                                ) {
                                  // if (row.spk_bongkar && row.spk_bongkar.pdf_path) {
                                  btnDelivered = (
                                    <Button
                                      className="mr-1 mb-1"
                                      type="primary"
                                      size="small"
                                      onClick={() => {
                                        setTypeExistingLogistic(constant.TRANSPORTIR_TYPE_SHIP);
                                        setActionLogOfferUniqueId(row.id);
                                        setActionLogOfferId(row.logistic_offer_id);
                                        setModalDeliveredShow(true);
                                      }}
                                    >
                                      {`${t("arrivedAtDPort")}`}
                                    </Button>
                                  );
                                  // }
                                  // else {
                                  // btnSPKBongkar = (
                                  //   <Button
                                  //     className="mr-1 mb-1"
                                  //     type="primary"
                                  //     size="small"
                                  //     onClick={() => {
                                  //       setModalSPKBongkarShow(true);
                                  //       setModalSPKBongkarData({
                                  //         isEdit: false,
                                  //         lOffer: row,
                                  //         cOffer: cOffer,
                                  //       });
                                  //     }}
                                  //   >
                                  //     {t("Buat SPK Pembongkaran")}
                                  //   </Button>
                                  // );
                                  // }
                                }

                                if (
                                  (isCIF && row.delivered_date && !row.discharged_date) ||
                                  (row.gr_lock && row.delivered_date && !row.discharged_date)
                                ) {
                                  btnDischarge = (
                                    <Button
                                      className="mr-1 mb-1"
                                      type="primary"
                                      size="small"
                                      onClick={() => {
                                        setTypeExistingLogistic(constant.TRANSPORTIR_TYPE_SHIP);
                                        setActionLogOfferUniqueId(row.id);
                                        setActionLogOfferId(row.logistic_offer_id);
                                        setModalDischargeShow(true);
                                        setModalDischargeMaxQty(row.quantity);
                                      }}
                                    >
                                      {`${t("discharge")}`}
                                    </Button>
                                  );
                                }
                                if (row.discharged_date)
                                  return <Tag color="success">{t("done")}</Tag>;

                                return [
                                  btnLoading,
                                  btnSplitShip,
                                  btnDelete,
                                  btnDelivery,
                                  btnSPKBongkar,
                                  btnInputBLNumber,
                                  btnAutoBR,
                                  btnAutoGR,
                                  btnLockGR,
                                  btnDelivered,
                                  btnDischarge,
                                ];
                              },
                            }),
                          ]}
                          {...configs.TABLE_SINGLEPAGE}
                        />
                      </>
                    )}
                  {logOffersDischargedTruck &&
                    logOffersDischargedTruckIdInPage.includes(logOfferId) &&
                    logOffersDischargedTruck.length > 0 && (
                      <>
                        <SectionHeading title={t("dischargeMethod")} style={{ fontSize: "25px" }} />
                        {/* <Divider className="mt-3 mb-3" /> */}

                        <Table
                          size="small"
                          dataSource={logOffersDischargedTruck.filter(
                            (el) => el.logistic_offer_id === logOfferId,
                          )}
                          columns={[
                            utils.getPlainCol(t("status"), "status", {
                              render: (val, row) => {
                                return (
                                  <>
                                    <Tag className="mb-2" color={utils.getLogOfferStatusColor(val)}>
                                      {utils.snakeToTitleCase(val)}
                                    </Tag>
                                    <br />
                                    {row.discharged_date && (
                                      <Tag color="success">{t("discharged")}</Tag>
                                    )}
                                  </>
                                );
                              },
                            }),
                            utils.getPlainCol(t("documents"), "documents", {
                              render: (_, row) => {
                                const filesExist = row && row.files && row.files.length > 0;

                                const fileInsurance =
                                  filesExist && row.files.find((el) => el.type === typeInsurance);
                                const fileContract =
                                  filesExist && row.files.find((el) => el.type === typeContract);
                                const fileCargoReadiness =
                                  filesExist &&
                                  row.files.find((el) => el.type === typeCargoReadiness);
                                // const docCompleted = fileSuratPerjanjian && fileInsurance;
                                const docCompleted = true;
                                // fileSuratPerjanjian ? true : false;

                                return (
                                  <>
                                    {row.status === constant.STATUS_APPROVED ? (
                                      <>
                                        {fileInsurance && fileContract && fileCargoReadiness ? (
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

                            utils.getPlainCol(t("transportir"), "trnsprtr", {
                              render: (val) => val.name,
                            }),

                            utils.getPlainCol(t("info"), "info", {
                              width: "300px",

                              render: (_, row) => {
                                return (
                                  <table>
                                    <tr style={{ fontSize: "15px" }}>
                                      <td>{`${t("quantity")}`}</td>
                                      <td>:</td>
                                      <td>
                                        {utils.thousandSeparator(Number(row.quantity).toFixed(2))}
                                      </td>
                                    </tr>
                                    {row.budget && (
                                      <tr style={{ fontSize: "15px" }}>
                                        <td>{t("budget")}</td>
                                        <td>:</td>
                                        <td>
                                          {utils.thousandSeparator(Number(row.budget).toFixed(2))}
                                        </td>
                                      </tr>
                                    )}
                                    <tr style={{ fontSize: "15px" }}>
                                      <td>{`${t("price")}/Kg`}</td>
                                      <td>:</td>
                                      <td>
                                        {utils.thousandSeparator(Number(row.price).toFixed(2))}
                                      </td>
                                      <td>
                                        {row.budget && Number(row.price) <= Number(row.budget) ? (
                                          <Tag color="success">On Budget</Tag>
                                        ) : (
                                          <Tag color="red">Over Budget</Tag>
                                        )}
                                      </td>
                                    </tr>
                                    {/* <tr style={{ fontSize: "15px" }}>
                                      <td>{`${t("ETA")} ${t("warehouse")}`}</td>
                                      <td>:</td>
                                      <td>
                                        {`${moment(row.eta_from).format(
                                          constant.FORMAT_DISPLAY_DATE_COMPACT,
                                        )} - ${moment(row.eta_to).format(
                                          constant.FORMAT_DISPLAY_DATE_COMPACT,
                                        )}`}
                                      </td>
                                    </tr> */}
                                    <tr style={{ fontSize: "15px" }}>
                                      <td>{`${t("start")} ${t("discharge")} ${t("date")}`}</td>
                                      <td>:</td>
                                      <td>
                                        {row.actual_loading_date
                                          ? moment(row.actual_loading_date).format(
                                              constant.FORMAT_DISPLAY_DATE_COMPACT,
                                            )
                                          : "-"}
                                      </td>
                                    </tr>

                                    <tr style={{ fontSize: "15px" }}>
                                      <td>{`${t("endDischarge")} ${t("date")}`}</td>
                                      <td>:</td>
                                      <td>
                                        {row.discharged_date ? (
                                          <Tag color="success">
                                            {moment(row.discharged_date).format(
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
                                }

                                let btnAdjust = null;
                                if (row.status === constant.STATUS_PENDING_APPROVAL) {
                                  btnAdjust = (
                                    <Button
                                      className="mr-1 mb-1"
                                      color="yellow"
                                      size="small"
                                      onClick={() => {
                                        setTypeExistingLogistic(
                                          constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK,
                                        );
                                        setActionLogOfferUniqueId(row.id);
                                        setActionLogOfferId(row.logistic_offer_id);
                                        setModalAdjustData({
                                          price: row.price,
                                          commodity_offer_id: cOffer.unique_id,
                                          logistic_offer_id: row.logistic_offer_id,
                                          quantity: row.quantity,
                                          type: constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK,
                                          terms_of_handover: cOffer.terms_of_handover,
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
                                      if (fileSuratPerjanjian)
                                        setModalUploadFile(fileSuratPerjanjian);
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
                                  filesExist &&
                                  row.files.find((el) => el.type === typeCargoReadiness);
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
                                      if (fileCargoReadiness)
                                        setModalUploadFile(fileCargoReadiness);
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
                                  filesExist &&
                                  row.files.find((el) => el.type === constant.FILE_TYPE_BL);

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

                                if (
                                  fileSuratPerjanjian ||
                                  fileCargoReadiness ||
                                  fileContract ||
                                  fileInsurance
                                ) {
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
                                if (dischargedTruckQtyLeft !== 0) {
                                  btnAdjust = (
                                    <Button
                                      className="mr-1 mb-1"
                                      type="ghost"
                                      size="small"
                                      onClick={() => {
                                        setTypeExistingLogistic(
                                          constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK,
                                        );
                                        setActionLogOfferUniqueId(row.id);
                                        setActionLogOfferId(row.logistic_offer_id);
                                        setModalAdjustData({
                                          price: row.price,
                                          commodity_offer_id: cOffer.unique_id,
                                          logistic_offer_id: row.logistic_offer_id,
                                          quantity: row.quantity,
                                          type: constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK,
                                          terms_of_handover: cOffer.terms_of_handover,
                                        });
                                        setModalAdjustShow(true);
                                      }}
                                    >
                                      {`${t("adjust")} ${t("Quantity")}/${t("price")}`}
                                    </Button>
                                  );
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
                                      btnInsurance,
                                      "logistic@insurance",
                                    )}
                                    {btnContract}
                                    {btnCargoReadiness}
                                    {/* {btnBL} */}
                                    {btnEditFiles}
                                  </>
                                );

                                const elExist =
                                  btnReject ||
                                  btnAdjust ||
                                  btnApprove ||
                                  btnSuratPerjanjian ||
                                  btnInsurance;
                                if (!elExist) {
                                  return null;
                                }
                                return actionsEl;
                              },
                            }),

                            utils.getPlainCol(t("activity"), "activity", {
                              width: "150px",
                              render: (_, row) => {
                                //GA PERLU LENGKAPIN if (!logisticFulfilled) return "-";
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
                                let btnInputBLNumber;
                                let btnAutoBR;
                                let btnAutoGR;
                                let btnLockGR;
                                let btnDelivered;
                                let btnInputBAST;
                                let btnDischarge;
                                let btnInputMutuFinal;
                                let btnSplitDischargedTruck;

                                let checkApprovalBefore =
                                  isCIF || isFob || isLocoLuarPulau
                                    ? logOffersShip[0].actual_loading_date &&
                                      logOffersShip[0].discharged_date
                                      ? true
                                      : false
                                    : true;
                                if (docCompleted) {
                                  if (!cOffer.po_number) {
                                    return (
                                      <>
                                        <Tag color="red">PO Number currently not generated</Tag>
                                      </>
                                    );
                                  }

                                  if (
                                    ((isFob || isLocoLuarPulau) &&
                                      logOffersShip.length > 0 &&
                                      !(
                                        logOffersShip[logOffersIdInPage.indexOf(logOfferId)]
                                          .actual_loading_date &&
                                        logOffersShip[logOffersIdInPage.indexOf(logOfferId)]
                                          .delivery_date &&
                                        logOffersShip[logOffersIdInPage.indexOf(logOfferId)]
                                          .delivered_date &&
                                        logOffersShip[logOffersIdInPage.indexOf(logOfferId)]
                                          .discharged_date
                                      )) ||
                                    (isCIF &&
                                      logOffersShip.length > 0 &&
                                      !(
                                        logOffersShip[0].actual_loading_date &&
                                        logOffersShip[0].discharged_date
                                      ))
                                      ? true
                                      : false
                                  ) {
                                    return (
                                      <Tag color="red">
                                        Complete the ship first before start discharge
                                      </Tag>
                                    );
                                  }
                                  if (
                                    cOffer.po_number !== null &&
                                    qtyDTruckFulfilledExistingLogistic !== 0
                                  ) {
                                    return (
                                      <Tag color="red">
                                        Fill the discharge truck first before continue
                                      </Tag>
                                    );
                                  }
                                  if (
                                    ((isFob || isLocoLuarPulau) && !row.actual_loading_date) ||
                                    ((isLocoDalamPulau || isCIF) && !row.actual_loading_date)
                                  ) {
                                    btnLoading = (
                                      <Button
                                        className="mr-1 mb-1"
                                        type="primary"
                                        size="small"
                                        onClick={() => {
                                          setTypeExistingLogistic(
                                            constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK,
                                          );
                                          setActionLogOfferUniqueId(row.id);
                                          setActionLogOfferId(row.logistic_offer_id);
                                          setModalLoadingShow(true);
                                        }}
                                      >
                                        {`${t("start")} ${t("discharge")}`}
                                      </Button>
                                    );
                                  }
                                  if (
                                    cOffer.po_number &&
                                    checkApprovalBefore &&
                                    !row.quantity_bl &&
                                    row.status === constant.STATUS_APPROVED &&
                                    row.actual_loading_date
                                  ) {
                                    btnInputBLNumber = (
                                      <Button
                                        className="mr-1 mb-1"
                                        type="primary"
                                        size="small"
                                        onClick={() => {
                                          setTypeExistingLogistic(constant.TRANSPORTIR_TYPE_SHIP);
                                          setActionLogOfferUniqueId(row.id);
                                          setActionLogOfferId(row.logistic_offer_id);
                                          setModalInputBLShow(true);
                                        }}
                                      >
                                        {`${t("input")} ${t("blQuantity")}`}
                                      </Button>
                                    );
                                  }

                                  if (
                                    (isCIF || isLocoDalamPulau) &&
                                    row.quantity_bl &&
                                    !row.br_quantity &&
                                    cOffer.po_number
                                  ) {
                                    btnAutoBR = (
                                      <>
                                        <Button
                                          className="mr-1 mb-1"
                                          size="small"
                                          type="primary"
                                          onClick={() => {
                                            setTypeExistingLogistic(constant.TRANSPORTIR_TYPE_SHIP);
                                            setActionLogOfferUniqueId(row.id);
                                            setActionLogOfferId(row.logistic_offer_id);
                                            modalSearchBR.setShow(true);
                                            modalSearchBR.setData({
                                              cOffer,
                                              lOffer: logOffersShip.filter(
                                                (el) => el.logistic_offer_id === logOfferId,
                                              ),
                                              logOfferId,
                                            });
                                          }}
                                        >
                                          Manual Search BR
                                        </Button>
                                      </>
                                    );
                                  }

                                  if (
                                    (isLocoDalamPulau || isCIF) &&
                                    row.br_quantity &&
                                    !row.gr_lock
                                  ) {
                                    btnAutoGR = (
                                      <>
                                        <Button
                                          className="mr-1 mb-1"
                                          size="small"
                                          type="primary"
                                          onClick={() => {
                                            handleOnConfirmAutoGR(
                                              logOffersShip.filter(
                                                (el) => el.logistic_offer_id === logOfferId,
                                              ),
                                            );
                                          }}
                                        >
                                          Get GR Quantity
                                        </Button>
                                        <div className="center">or</div>
                                        <Button
                                          className="mr-1 mb-1"
                                          size="small"
                                          type="warning"
                                          onClick={() => {
                                            setTypeExistingLogistic(constant.TRANSPORTIR_TYPE_SHIP);
                                            setActionLogOfferUniqueId(row.id);
                                            setActionLogOfferId(row.logistic_offer_id);
                                            modalSearchGR.setShow(true);
                                            modalSearchGR.setData({
                                              cOffer,
                                              lOffer: logOffersShip.filter(
                                                (el) => el.logistic_offer_id === logOfferId,
                                              ),
                                              logOfferId,
                                            });
                                          }}
                                        >
                                          Manual Search GR
                                        </Button>
                                      </>
                                    );
                                    //lock gr
                                    if (
                                      (isCIF || isLocoDalamPulau) &&
                                      row.gr_quantity &&
                                      !row.gr_lock
                                    ) {
                                      btnLockGR = (
                                        <>
                                          <Button
                                            className="mr-1 mb-1"
                                            size="small"
                                            type="primary"
                                            style={{ background: "#faad14", borderColor: "yellow" }}
                                            onClick={() => {
                                              Modal.confirm({
                                                ...constant.MODAL_CONFIRM_DANGER_PROPS,
                                                content:
                                                  "Setelah GR dikunci maka tidak bisa diubah lagi, apakah anda yakin?",
                                                onOk: () => {
                                                  handleLockGR(row.logistic_offer_id);
                                                },
                                              });
                                            }}
                                            icon={<LockOutlined />}
                                          >
                                            Lock GR
                                          </Button>
                                        </>
                                      );
                                    }
                                  }
                                  if (
                                    ((isCIF || isLocoDalamPulau) &&
                                      row.gr_lock &&
                                      !(
                                        row.final_qffa ||
                                        row.final_qmi ||
                                        row.final_qdobi ||
                                        row.final_qtotox ||
                                        row.final_qiv
                                      )) ||
                                    ((isLocoLuarPulau || isFob) &&
                                      row.actual_loading_date &&
                                      !(
                                        row.final_qffa ||
                                        row.final_qmi ||
                                        row.final_qdobi ||
                                        row.final_qtotox ||
                                        row.final_qiv
                                      ) &&
                                      !row.discharged_date)
                                  ) {
                                    btnInputMutuFinal = (
                                      <Button
                                        className="mr-1 mb-1"
                                        type="primary"
                                        size="small"
                                        onClick={() => {
                                          setTypeExistingLogistic(
                                            constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK,
                                          );
                                          setActionLogOfferUniqueId(row.commodity_offer_id);
                                          setActionLogOfferId(row.logistic_offer_id);
                                          setModalInputMutuFinalShow(true);
                                        }}
                                      >
                                        {`${t("inputFinalQ")}`}
                                      </Button>
                                    );
                                  }

                                  if (
                                    (row.final_qffa ||
                                      row.final_qmi ||
                                      row.final_qdobi ||
                                      row.final_qtotox ||
                                      row.final_qiv) &&
                                    row.actual_loading_date &&
                                    !row.qty_bast
                                  ) {
                                    btnInputBAST = (
                                      <Button
                                        className="mr-1 mb-1"
                                        type="primary"
                                        size="small"
                                        onClick={() => {
                                          setTypeExistingLogistic(
                                            constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK,
                                          );
                                          setActionLogOfferUniqueId(row.id);
                                          setActionLogOfferId(row.logistic_offer_id);
                                          setModalInputBASTShow(true);
                                        }}
                                      >
                                        {`${t("Input Qty BAST Pabrik")}`}
                                      </Button>
                                    );
                                  }
                                  if (row.qty_bast && !row.discharged_date) {
                                    btnDischarge = (
                                      <Button
                                        className="mr-1 mb-1"
                                        type="primary"
                                        size="small"
                                        onClick={() => {
                                          setTypeExistingLogistic(
                                            constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK,
                                          );
                                          setActionLogOfferUniqueId(row.id);
                                          setActionLogOfferId(row.logistic_offer_id);
                                          setModalDischargeShow(true);
                                        }}
                                      >
                                        {`${t("endDischarge")}`}
                                      </Button>
                                    );
                                  }
                                }

                                if (row.discharged_date)
                                  return <Tag color="success">{t("done")}</Tag>;

                                return [
                                  btnLoading,
                                  btnDelivery,
                                  btnInputBLNumber,
                                  btnAutoBR,
                                  btnAutoGR,
                                  btnLockGR,
                                  btnDelivered,
                                  btnInputBAST,
                                  btnDischarge,
                                  btnInputMutuFinal,
                                  btnSplitDischargedTruck,
                                ];
                              },
                            }),
                          ]}
                          {...configs.TABLE_SINGLEPAGE}
                        />
                      </>
                    )}
                </Panel>
              )}
              {logOffersIdInPage.length > 0 && cOffer.terms_of_handover === "franco" && (
                <Panel
                  header={
                    <>
                      <SectionHeading
                        title={`Logistic List - (${logOfferId}) - Expected Release Number : (${
                          logOffersIdInPage.indexOf(logOfferId) + 1
                        })`}
                      />

                      <Table
                        size="small"
                        dataSource={logOffersFranco.filter(
                          (el) => el.logistic_offer_id === logOfferId,
                        )}
                        columns={[
                          utils.getPlainCol(t("status"), "status", {
                            width: "20px",
                            render: (val, row) => {
                              return (
                                <>
                                  <Tag className="mb-2" color={utils.getLogOfferStatusColor(val)}>
                                    {utils.snakeToTitleCase(val)}
                                  </Tag>
                                  <br />
                                  {!row.discharged_date &&
                                    row.status === "approved" &&
                                    row.actual_loading_date && (
                                      <Tag color="warning">{t("onTheWay")}</Tag>
                                    )}
                                  {row.discharged_date && (
                                    <Tag color="success">{t("discharged")}</Tag>
                                  )}
                                </>
                              );
                            },
                          }),
                          utils.getPlainCol(t("documents"), "documents", {
                            width: "20px",
                            render: (_, row) => {
                              const fileType = constant.FILE_TYPE_SPAD;
                              const filesExist = row && row.files && row.files.length > 0;
                              const fileSuratPerjanjian =
                                filesExist && row.files.find((el) => el.type === fileType);
                              const fileInsurance =
                                filesExist && row.files.find((el) => el.type === typeInsurance);
                              const fileContract =
                                filesExist && row.files.find((el) => el.type === typeContract);
                              const fileCargoReadiness =
                                filesExist &&
                                row.files.find((el) => el.type === typeCargoReadiness);
                              // const docCompleted = fileSuratPerjanjian && fileInsurance;
                              const docCompleted = true;
                              // fileSuratPerjanjian ? true : false;

                              return (
                                <>
                                  {row.status === constant.STATUS_APPROVED ? (
                                    <>
                                      {fileInsurance &&
                                      fileContract &&
                                      fileCargoReadiness &&
                                      row.spk_bongkar &&
                                      row.spk_bongkar.pdf_path ? (
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

                          utils.getPlainCol(t("transportir"), "trnsprtr", {
                            width: "20px",
                            render: (val) => val.name,
                          }),

                          utils.getPlainCol(t("info"), "info", {
                            width: "300px",
                            render: (_, row) => {
                              return (
                                <table>
                                  <tr style={{ fontSize: "15px" }}>
                                    <td>{`${t("blQuantity")}`}</td>
                                    <td>:</td>
                                    <td>
                                      {row.quantity_bl
                                        ? utils.thousandSeparator(
                                            Number(row.quantity_bl).toFixed(3),
                                          )
                                        : "-"}{" "}
                                      MT
                                    </td>
                                  </tr>
                                  <tr style={{ fontSize: "15px" }}>
                                    <td>{`${t("quantityBRReceived")}`}</td>
                                    <td>:</td>
                                    <td>
                                      {row.br_quantity
                                        ? utils.thousandSeparator(
                                            Number(row.br_quantity).toFixed(3),
                                          )
                                        : "-"}{" "}
                                      MT
                                    </td>
                                  </tr>
                                  <tr style={{ fontSize: "15px" }}>
                                    <td>{`${t("BRDate")}`}</td>
                                    <td>:</td>
                                    <td>
                                      {row.br_date
                                        ? moment(row.br_date)
                                            .utc()
                                            .format(constant.FORMAT_DISPLAY_DATETIME)
                                        : "-"}
                                    </td>
                                  </tr>
                                  <tr style={{ fontSize: "15px" }}>
                                    <td>{`${t("GRNumber")}`}</td>
                                    <td>:</td>
                                    <td>
                                      {row.gr_number ? JSON.parse(row.gr_number).join(", ") : "-"}
                                    </td>
                                  </tr>
                                  <tr style={{ fontSize: "15px" }}>
                                    <td>{`${t("quantityGR")}`}</td>
                                    <td>:</td>
                                    <td>
                                      {row.gr_quantity
                                        ? utils.thousandSeparator(
                                            Number(row.gr_quantity).toFixed(3),
                                          )
                                        : "-"}{" "}
                                      MT
                                    </td>
                                  </tr>
                                  <tr style={{ fontSize: "15px" }}>
                                    <td>{`${t("start")} ${t("discharged")}`}</td>
                                    <td>:</td>
                                    <td>
                                      {row.actual_loading_date ? (
                                        <Tag color="success">
                                          {moment(row.actual_loading_date).format(
                                            constant.FORMAT_DISPLAY_DATE_COMPACT,
                                          )}
                                        </Tag>
                                      ) : (
                                        "-"
                                      )}
                                    </td>
                                  </tr>
                                  <tr style={{ fontSize: "15px" }}>
                                    <td>{`${t("discharged")}`}</td>
                                    <td>:</td>
                                    <td>
                                      {row.discharged_date ? (
                                        <Tag color="success">
                                          {moment(row.discharged_date).format(
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
                                      setTypeExistingLogistic(
                                        constant.TRANSPORTIR_TYPE_LOADING_TRUCK,
                                      );
                                      setActionLogOfferUniqueId(row.id);
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
                                      setTypeExistingLogistic(
                                        constant.TRANSPORTIR_TYPE_LOADING_TRUCK,
                                      );
                                      setActionLogOfferUniqueId(row.id);
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
                                      setTypeExistingLogistic(
                                        constant.TRANSPORTIR_TYPE_LOADING_TRUCK,
                                      );
                                      setActionLogOfferUniqueId(row.id);
                                      setActionLogOfferId(row.logistic_offer_id);
                                      setModalAdjustData({
                                        price: row.price,
                                        commodity_offer_id: cOffer.unique_id,
                                        logistic_offer_id: row.logistic_offer_id,
                                        quantity: row.quantity,
                                        type: constant.TRANSPORTIR_TYPE_LOADING_TRUCK,
                                        terms_of_handover: cOffer.terms_of_handover,
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
                              let btnPembongkaran = null;
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
                                      if (fileSuratPerjanjian)
                                        setModalUploadFile(fileSuratPerjanjian);
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
                                  filesExist &&
                                  row.files.find((el) => el.type === typeCargoReadiness);
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
                                      if (fileCargoReadiness)
                                        setModalUploadFile(fileCargoReadiness);
                                    }),
                                  );
                                  // } else if (!row.actual_loading_date) {
                                } else {
                                  btnCargoReadiness = getBtnCargoReadinessUpload();
                                }
                                if (row.spk_bongkar.pdf_path) {
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
                                } else {
                                  btnPembongkaran = (
                                    <Button
                                      className="mr-1 mb-1"
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
                                  filesExist &&
                                  row.files.find((el) => el.type === constant.FILE_TYPE_BL);

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

                                if (
                                  fileSuratPerjanjian ||
                                  fileInsurance ||
                                  fileCargoReadiness ||
                                  fileContract
                                ) {
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
                                    btnInsurance,
                                    "logistic@insurance",
                                  )}
                                  {btnPembongkaran}
                                  {btnContract}
                                  {btnCargoReadiness}
                                  {/* {btnBL} */}
                                  {btnEditFiles}
                                </>
                              );

                              const elExist =
                                btnReject ||
                                btnPembongkaran ||
                                btnAdjust ||
                                btnApprove ||
                                btnSuratPerjanjian ||
                                btnInsurance;
                              if (!elExist) {
                                return null;
                              }

                              return actionsEl;
                            },
                          }),
                          utils.getPlainCol(t("activity"), "activity", {
                            width: "40px",
                            render: (_, row) => {
                              let btnInputBLNumber;
                              let btnLoading;
                              let btnEditBLNumber;
                              let btnAutoBR;
                              let btnAutoGR;
                              let btnLockGR;
                              let btnInputMutuFinal;
                              let btnInputBAST;
                              let btnDischarge;
                              if (!row.quantity_bl) {
                                btnInputBLNumber = (
                                  <Button
                                    className="mr-1 mb-1"
                                    type="primary"
                                    size="small"
                                    onClick={() => {
                                      setTypeExistingLogistic(constant.TRANSPORTIR_TYPE_SHIP);
                                      setActionLogOfferUniqueId(row.id);
                                      setActionLogOfferId(row.logistic_offer_id);
                                      setModalInputBLShow(true);
                                    }}
                                  >
                                    {`${t("input")} ${t("blQuantity")}`}
                                  </Button>
                                );
                              }
                              if (row.quantity_bl && !row.actual_loading_date) {
                                btnLoading = (
                                  <Button
                                    className="mr-1 mb-1"
                                    type="primary"
                                    size="small"
                                    onClick={() => {
                                      setTypeExistingLogistic(
                                        constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK,
                                      );
                                      setActionLogOfferUniqueId(row.id);
                                      setActionLogOfferId(row.logistic_offer_id);
                                      setModalLoadingShow(true);
                                    }}
                                  >
                                    {`${t("start")} ${t("loading")}`}
                                  </Button>
                                );
                              }
                              if (row.quantity_bl && cOffer.po_number) {
                                btnEditBLNumber = (
                                  <Button
                                    className="mr-1 mb-1"
                                    type="primary"
                                    size="small"
                                    onClick={() => {
                                      setTypeExistingLogistic(constant.TRANSPORTIR_TYPE_FRANCO);
                                      setActionLogOfferUniqueId(row.id);
                                      setActionLogOfferId(row.logistic_offer_id);
                                      setModalInputBLShow(true);
                                    }}
                                  >
                                    {`${t("edit")} ${t("blQuantity")}`}
                                  </Button>
                                );
                              }
                              if (row.actual_loading_date && cOffer.po_number && !row.br_quantity) {
                                btnAutoBR = (
                                  <>
                                    {/* <Button
                                      className="mr-1 mb-1"
                                      size="small"
                                      type="primary"
                                      onClick={() => {
                                        handleOnConfirmAutoBR(
                                          logOffersFranco.filter(
                                            (el) => el.logistic_offer_id === logOfferId,
                                          ),
                                        );
                                      }}
                                    >
                                      Get BR Quantity
                                    </Button>
                                    <div className="center">or</div> */}
                                    <Button
                                      className="mr-1 mb-1"
                                      size="small"
                                      type="primary"
                                      onClick={() => {
                                        setTypeExistingLogistic(constant.TRANSPORTIR_TYPE_FRANCO);
                                        setActionLogOfferUniqueId(row.id);
                                        setActionLogOfferId(row.logistic_offer_id);
                                        modalSearchBR.setShow(true);
                                        modalSearchBR.setData({
                                          cOffer,
                                          lOffer: logOffersFranco.filter(
                                            (el) => el.logistic_offer_id === logOfferId,
                                          ),
                                          logOfferId,
                                        });
                                      }}
                                    >
                                      Manual Search BR
                                    </Button>
                                  </>
                                );
                              } else if (!cOffer.po_number) {
                                return <Tag color="red">PO Number currently not generated</Tag>;
                              }

                              if (row.br_quantity && !row.gr_lock) {
                                btnAutoGR = (
                                  <>
                                    <Button
                                      className="mr-1 mb-1"
                                      size="small"
                                      type="primary"
                                      onClick={() => {
                                        handleOnConfirmAutoGR(
                                          logOffersFranco.filter(
                                            (el) => el.logistic_offer_id === logOfferId,
                                          ),
                                        );
                                      }}
                                    >
                                      Get GR Quantity
                                    </Button>
                                    <div className="center">or</div>
                                    <Button
                                      className="mr-1 mb-1"
                                      size="small"
                                      type="warning"
                                      onClick={() => {
                                        setTypeExistingLogistic(constant.TRANSPORTIR_TYPE_SHIP);
                                        setActionLogOfferUniqueId(row.id);
                                        setActionLogOfferId(row.logistic_offer_id);
                                        modalSearchGR.setShow(true);
                                        modalSearchGR.setData({
                                          cOffer,
                                          lOffer: logOffersShip.filter(
                                            (el) => el.logistic_offer_id === logOfferId,
                                          ),
                                          logOfferId,
                                        });
                                      }}
                                    >
                                      Manual Search GR
                                    </Button>
                                  </>
                                );
                              }

                              //lock gr
                              if (row.gr_quantity && !row.gr_lock) {
                                btnLockGR = (
                                  <>
                                    <Button
                                      className="mr-1 mb-1"
                                      size="small"
                                      type="warning"
                                      style={{ background: "#faad14", borderColor: "yellow" }}
                                      onClick={() => {
                                        Modal.confirm({
                                          ...constant.MODAL_CONFIRM_DANGER_PROPS,
                                          content:
                                            "Setelah GR dikunci maka tidak bisa diubah lagi, apakah anda yakin?",
                                          onOk: () => {
                                            handleLockGR(row.logistic_offer_id);
                                          },
                                        });
                                      }}
                                      icon={<LockOutlined />}
                                    >
                                      Lock GR
                                    </Button>
                                  </>
                                );
                              }

                              if (
                                row.gr_lock &&
                                ((!row.final_qffa && row.final_qffa == null) ||
                                  (!row.final_qmi && row.final_qmi == null) ||
                                  (!row.final_qdobi && row.final_qdobi == null) ||
                                  (!row.final_qtotox && row.final_qtotox == null) ||
                                  (!row.final_qiv && row.final_qiv == null))
                              ) {
                                btnInputMutuFinal = (
                                  <>
                                    <Button
                                      className="mr-1 mb-1"
                                      type="primary"
                                      size="small"
                                      onClick={() => {
                                        setTypeExistingLogistic(
                                          constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK,
                                        );
                                        setActionLogOfferUniqueId(row.commodity_offer_id);
                                        setActionLogOfferId(row.logistic_offer_id);
                                        setModalInputMutuFinalShow(true);
                                      }}
                                    >
                                      {`${t("inputFinalQ")}`}
                                    </Button>
                                  </>
                                );
                              }
                              if (
                                !row.qty_bast &&
                                row.gr_lock &&
                                (row.final_qffa ||
                                  row.final_qmi ||
                                  row.final_qdobi ||
                                  row.final_qtotox ||
                                  row.final_qiv)
                              ) {
                                btnInputBAST = (
                                  <Button
                                    className="mr-1 mb-1"
                                    type="primary"
                                    size="small"
                                    onClick={() => {
                                      setTypeExistingLogistic(
                                        constant.TRANSPORTIR_TYPE_DISCHARGED_TRUCK,
                                      );
                                      setActionLogOfferUniqueId(row.id);
                                      setActionLogOfferId(row.logistic_offer_id);
                                      setModalInputBASTShow(true);
                                    }}
                                  >
                                    {`${t("Input Qty BAST Pabrik")}`}
                                  </Button>
                                );
                              }
                              if (row.qty_bast && !row.discharged_date) {
                                btnDischarge = (
                                  <>
                                    <Button
                                      className="mr-1 mb-1"
                                      type="primary"
                                      size="small"
                                      onClick={() => {
                                        setTypeExistingLogistic(
                                          constant.TRANSPORTIR_TYPE_LOADING_TRUCK,
                                        );
                                        setActionLogOfferUniqueId(row.id);
                                        setActionLogOfferId(row.logistic_offer_id);
                                        setModalDischargeShow(true);
                                        setModalDischargeMaxQty(row.quantity);
                                      }}
                                    >
                                      {`${t("discharge")}`}
                                    </Button>
                                  </>
                                );
                              }
                              if (row.discharged_date)
                                return <Tag color="success">{t("done")}</Tag>;
                              const actionsEl = (
                                <>
                                  {btnInputBLNumber}
                                  {btnLoading}
                                  {btnEditBLNumber}
                                  {btnAutoBR}
                                  {btnAutoGR}
                                  {btnLockGR}
                                  {btnInputMutuFinal}
                                  {btnInputBAST}
                                  {btnDischarge}
                                </>
                              );
                              const elExist =
                                btnInputBLNumber ||
                                btnLoading ||
                                btnEditBLNumber ||
                                btnAutoBR ||
                                btnAutoGR ||
                                btnLockGR ||
                                btnInputMutuFinal ||
                                btnInputBAST ||
                                btnDischarge;
                              if (!elExist) {
                                return null;
                              }

                              return actionsEl;
                            },
                          }),
                        ]}
                        {...configs.TABLE_SINGLEPAGE}
                      />
                    </>
                  }
                  key={`${logOfferId}`}
                ></Panel>
              )}

              {index !== logOffersIdInPage.length - 1 && (
                <>
                  <div
                    style={{
                      height: "40px" /* pemisah log offer*/,
                      backgroundColor: "#00703c",
                      backgroundImage: "radial-gradient(circle, #00703c 1px, #ffffff 2px)",
                      backgroundSize: "5px 5px",
                    }}
                  />
                </>
              )}
            </>
          );
        })}
      </Collapse>
    </PageContainer>
  );
};

export default withRouter(LogOfferForm);
