import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import {
  Row,
  Col,
  Form,
  Button,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Switch,
  message,
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
import Decimal from "decimal.js";
import ModalSupplierCreate from "../admin/suppliers/ModalSupplierCreate";
import ModalWarehouseCreate from "../config/warehouse/ModalWarehouseCreate";
import ModalCommodityCreate from "../config/commodity/ModalCommodityCreate";
import ModalHandoverLocationCreate from "../config/handover_location/ModalHandoverLocationCreate";
import OfferFormModalConfirm from "./OfferFormModalConfirm";

const OfferForm = (props) => {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const { isEdit, id } = props;
  console.log(props);
  const userInfo = utils.getUserInfo();
  const ppn = utils.getPPN();
  const defaultCommodity = 61; //id CPO

  const [pageLoading, setPageLoading] = useState(false);

  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [commoditiesVal, setCommoditiesVal] = useState([]);
  const [handoverLocations, setHandoverLocations] = useState([]);
  const [editTempWHID, setEditTempWHID] = useState(null);
  const [editTempSupplierID, setEditTempSupplierID] = useState(null);

  const [showNotice, setShowNotice] = useState(true);

  const [formData, setFormData] = useState(null);
  const [modalConfirmShow, setModalConfirmShow] = useState(false);
  const [modalConfirmData, setModalConfirmData] = useState(null);
  const [modalCreateCommodityShow, setModalCreateCommodityShow] = useState(false);
  const [modalCreateSupplierShow, setModalCreateSupplierShow] = useState(false);
  const [modalCreateWarehouseShow, setModalCreateWarehouseShow] = useState(false);
  const [modalCreateHandoverLocationShow, setModalCreateHandoverLocationShow] = useState(false);
  const [requiredFieldsTrucking, setRequiredFieldsTrucking] = useState(false);
  const [requiredFieldsShip, setRequiredFieldsShip] = useState(false);

  const getCommodities = () => {
    setPageLoading(true);
    api.master.commodity
      .list("", 1000, 1)
      .then(function (response) {
        const rsBody = response.data.rs_body;
        let commodities = [];
        rsBody.commodities.forEach((el) => {
          commodities.push({ value: el.id, label: el.name });
        });
        console.log(rsBody.commodities);
        setCommodities(commodities);
        setCommoditiesVal(rsBody.commodities);
      })
      .catch(function (error) {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(function () {
        setPageLoading(false);
      });
  };

  useEffect(() => {
    if (isEdit && !id) {
      utils.swal.Error({
        msg: t("swalDefaultError"),
        cbFn: () => {
          props.history.push("/offers");
          return;
        },
      });
      return;
    }
    handler.getHandoverLocations(setPageLoading, setHandoverLocations);
    getCommodities();
    if (!isEdit) {
      handler.getSuppliers(setPageLoading, setSuppliers, defaultCommodity);
      handler.getWarehouses(setPageLoading, setWarehouses, defaultCommodity);
    }
  }, []);

  useEffect(() => {
    if (commodities.length > 0) {
      if (isEdit) {
        const fCommodity = form.getFieldValue("commodity");
        console.log("fCommodity: ", fCommodity);
        if (!fCommodity) {
          getOffer();
        }
      }
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
  }, [suppliers, handoverLocations, commodities]);

  useEffect(() => {
    if (warehouses.length > 0) {
      if (isEdit && editTempWHID) {
        const currWH = warehouses.find((el) => el.value === editTempWHID);
        if (currWH) {
          form.setFieldsValue({ warehouse: currWH.value });
        }
      }
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
  }, [warehouses, editTempWHID]);

  useEffect(() => {
    if (suppliers.length > 0) {
      if (isEdit && editTempSupplierID) {
        const currSupplier = suppliers.find((el) => el.value === editTempSupplierID);
        if (currSupplier) {
          form.setFieldsValue({ supplier: currSupplier.value });
          setShowNotice(false);
        }
      }
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
  }, [suppliers, editTempSupplierID]);

  const onPriceChanged = () => {
    const priceExclude = form.getFieldValue("price_exclude");
    const priceFreight = form.getFieldValue("price_freight");
    const priceFreightDarat = form.getFieldValue("price_freight_darat");
    const priceFreightKapal = form.getFieldValue("price_freight_kapal");
    const priceFreightBongkar = form.getFieldValue("price_freight_bongkar");
    const priceInsurance = form.getFieldValue("price_insurance");
    const priceSusut = form.getFieldValue("price_susut");
    const priceCOF = form.getFieldValue("price_cof");

    let tempPrice = new Decimal(0);
    let freightPriceTotal = new Decimal(0);
    if (ppn && priceExclude)
      tempPrice = new Decimal(priceExclude).mul(constant.getPPNMultiplier(ppn));

    if (priceFreightDarat) {
      freightPriceTotal = freightPriceTotal.add(priceFreightDarat);
      tempPrice = tempPrice.add(priceFreightDarat);
    }
    if (priceFreightKapal) {
      freightPriceTotal = freightPriceTotal.add(priceFreightKapal);
      tempPrice = tempPrice.add(priceFreightKapal);
    }

    if (priceFreightBongkar) tempPrice = tempPrice.add(priceFreightBongkar);
    if (priceInsurance) tempPrice = tempPrice.add(priceInsurance);
    if (priceSusut) tempPrice = tempPrice.add(priceSusut);
    if (priceCOF) tempPrice = tempPrice.add(priceCOF);
    tempPrice = tempPrice.toFixed(2);

    form.setFieldsValue({
      price_freight: Number(freightPriceTotal),
      price_all_in: Number(tempPrice),
    });
  };

  const getOffer = () => {
    setPageLoading(true);
    api.offers
      .get(id)
      .then(function (response) {
        const offer = response.data.rs_body;

        const setField = {
          date: moment(offer.datetime),
          week: offer.week,
          price_exclude: Number(offer.price_exclude),
          quantity: Number(offer.quantity),
          quality_ffa: Number(offer.quality_ffa),
          quality_mi: Number(offer.quality_mi),
          handover_date: [moment(offer.handover_date_from), moment(offer.handover_date_to)],
          eta: [moment(offer.eta_from), moment(offer.eta_to)],
          terms_of_payment: offer.terms_of_payment,
          dealer_notes: offer.dealer_notes,
          is_recommended: offer.dealer_is_recommended,
          handover_location: offer.hOver_Loc.id,
        };

        const currCommodity = commodities.find((el) => el.value === offer.cmdty.id);
        console.log(commodities, "ktl1");
        if (currCommodity) {
          setField.commodity = currCommodity.value;
          handler.getWarehouses(setPageLoading, setWarehouses, currCommodity.value);
          handler.getSuppliers(setPageLoading, setSuppliers, currCommodity.value);
          console.log(offer.whs.id);
          setEditTempWHID(offer.whs.id);
          setEditTempSupplierID(offer.spplr.id);
        }

        if (offer.price_freight) setField.price_freight = Number(offer.price_freight);
        if (offer.price_freight_darat)
          setField.price_freight_darat = Number(offer.price_freight_darat);
        if (offer.price_freight_kapal)
          setField.price_freight_kapal = Number(offer.price_freight_kapal);
        if (offer.price_freight_bongkar)
          setField.price_freight_bongkar = Number(offer.price_freight_bongkar);
        if (offer.price_insurance) setField.price_insurance = Number(offer.price_insurance);
        if (offer.price_susut) setField.price_susut = Number(offer.price_susut);
        if (offer.price_cof) setField.price_cof = Number(offer.price_cof);

        if (offer.handover_location_desc) {
          setField.handover_description = offer.hOver_Loc;
        }

        if (offer.quality_dobi) {
          setField.quality_dobi = Number(offer.quality_dobi);
        }
        if (constant.TERMS_OF_HANDOVER_LIST.find((el) => el.value === offer.terms_of_handover)) {
          setField.terms_of_handover = constant.TERMS_OF_HANDOVER_LIST.find(
            (el) => el.value === offer.terms_of_handover,
          ).value;
        }
        if (constant.TERMS_OF_LOADING_LIST.find((el) => el.value === offer.terms_of_loading)) {
          setField.terms_of_loading = constant.TERMS_OF_LOADING_LIST.find(
            (el) => el.value === offer.terms_of_loading,
          ).value;
        }
        form.setFieldsValue(setField);
      })
      .catch(function (error) {
        utils.swal.Error({
          msg: utils.getErrMsg(error),
          cbFn: () => {
            props.history.push("/offers");
            return;
          },
        });
      })
      .finally(function () {
        setPageLoading(false);
        onPriceChanged();
      });
  };

  const resetForm = () => {
    form.resetFields();
  };

  const handleOnConfirm = () => {
    setPageLoading(true);
    const d = formData;

    const reqBody = {
      date: moment(d.date).format(constant.FORMAT_API_DATE),
      week: d.week,
      supplier_id: Number(d.supplier),
      warehouse_id: Number(d.warehouse),
      commodity_id: Number(d.commodity),
      handover_location_id: Number(d.handover_location),

      price_exclude: Number(d.price_exclude),
      price: Number(d.price_all_in),

      quantity: Number(d.quantity),
      quality_ffa: Number(d.quality_ffa),
      quality_mi: Number(d.quality_mi),

      handover_date_from: moment(d.handover_date[0]).format(constant.FORMAT_API_DATE),
      handover_date_to: moment(d.handover_date[1]).format(constant.FORMAT_API_DATE),
      eta_from: moment(d.eta[0]).format(constant.FORMAT_API_DATE),
      eta_to: moment(d.eta[1]).format(constant.FORMAT_API_DATE),

      terms_of_payment: d.terms_of_payment,
      terms_of_handover: d.terms_of_handover,
      terms_of_loading: d.terms_of_loading,
      dealer_notes: d.dealer_notes,
      dealer_is_recommended: d.is_recommended,
    };
    if (d.price_freight) reqBody.price_freight = Number(d.price_freight);
    if (d.price_freight_darat) reqBody.price_freight_darat = Number(d.price_freight_darat);
    if (d.price_freight_kapal) reqBody.price_freight_kapal = Number(d.price_freight_kapal);
    if (d.price_freight_bongkar) reqBody.price_freight_bongkar = Number(d.price_freight_bongkar);
    if (d.price_insurance) reqBody.price_insurance = Number(d.price_insurance);
    if (d.price_susut) reqBody.price_susut = Number(d.price_susut);
    if (d.price_cof) reqBody.price_cof = Number(d.price_cof);
    if (d.quality_dobi) reqBody.quality_dobi = Number(d.quality_dobi);
    if (d.handover_description) reqBody.handover_description = d.handover_description;

    console.log("reqBody");
    console.log(reqBody);
    if (isEdit) {
      api.offers
        .edit(id, reqBody)
        .then(function (response) {
          Modal.success({
            ...constant.MODAL_DEFAULT_PROPS,
            content: t("swalDefaultSuccess"),
            onOk: () => {
              props.history.push("/offers");
            },
            onCancel: () => {
              props.history.push("/offers");
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
      api.offers
        .create(reqBody)
        .then(function (response) {
          resetForm();
          Modal.success({
            ...constant.MODAL_DEFAULT_PROPS,
            content: t("swalDefaultSuccess"),
            onOk: () => {
              props.history.push("/offers");
            },
            onCancel: () => {
              utils.scrollToTop();
            },
            cancelText: t("createAnotherOne"),
            okCancel: true,
          });
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
    if (!values.handover_description) delete values.handover_description;
    if (!values.price_freight) delete values.price_freight;
    if (!values.price_freight_darat) delete values.price_freight_darat;
    if (!values.price_freight_kapal) delete values.price_freight_kapal;
    // if (!values.price_freight_bongkar) delete values.price_freight_bongkar;
    if (!values.price_insurance) delete values.price_insurance;
    if (!values.price_susut) delete values.price_susut;
    if (!values.price_cof) delete values.price_cof;
    if (!values.quality_dobi) delete values.quality_dobi;
    setModalConfirmShow(true);
    setFormData(values);

    console.log("values");
    console.log(values);

    const numFmt = configs.FORM_NUMBER_FORMAT.format;
    const date = moment(values.date).format(constant.FORMAT_DISPLAY_DATE);
    const handoverDateFrom = moment(values.handover_date[0]).format(constant.FORMAT_DISPLAY_DATE);
    const handoverDateTo = moment(values.handover_date[1]).format(constant.FORMAT_DISPLAY_DATE);

    const etaFrom = moment(values.eta[0]).format(constant.FORMAT_DISPLAY_DATE);
    const etaTo = moment(values.eta[1]).format(constant.FORMAT_DISPLAY_DATE);
    const modalConfirmObj = {
      date: date,
      week: values.week,
      supplier: suppliers.find((el) => el.value === Number(values.supplier)).label,
      warehouse: warehouses.find((el) => el.value === Number(values.warehouse)).label,
      commodity: commodities.find((el) => el.value === Number(values.commodity)).label,
      handover_location: handoverLocations.find(
        (el) => el.value === Number(values.handover_location),
      ).label,
      price_exclude: numFmt(values.price_exclude),
      price_all_in: numFmt(values.price_all_in),
      quantity: numFmt(values.quantity),
      quality_ffa: numFmt(values.quality_ffa),
      quality_mi: numFmt(values.quality_mi),
      handover_date: `${handoverDateFrom} - ${handoverDateTo}`,
      eta: `${etaFrom} - ${etaTo}`,
      terms_of_handover: constant.TERMS_OF_HANDOVER_MAP[values.terms_of_handover],
      terms_of_loading: constant.TERMS_OF_LOADING_MAP[values.terms_of_loading],
      terms_of_payment: values.terms_of_payment,
      dealer_notes: values.dealer_notes,
      is_recommended: values.is_recommended,
    };
    modalConfirmObj.handover_description = values.handover_description
      ? values.handover_description
      : "-";
    modalConfirmObj.price_freight = values.price_freight ? numFmt(values.price_freight) : "-";
    modalConfirmObj.price_freight_darat = values.price_freight_darat
      ? numFmt(values.price_freight_darat)
      : "-";

    modalConfirmObj.price_insurance = values.price_insurance ? numFmt(values.price_insurance) : "-";
    modalConfirmObj.price_susut = values.price_susut ? numFmt(values.price_susut) : "-";
    modalConfirmObj.price_cof = values.price_cof ? numFmt(values.price_cof) : "-";
    modalConfirmObj.quality_dobi = values.quality_dobi ? numFmt(values.quality_dobi) : "-";
    setModalConfirmData(modalConfirmObj);
  };

  // let etaMinDate;
  // if (handoverDateTo) {
  //   etaMinDate = handoverDateTo;
  // } else if (handoverDateFrom) {
  //   etaMinDate = handoverDateFrom;
  // } else {
  //   etaMinDate = moment().toDate();
  // }

  let initialValues = {
    date: moment(),
    commodity: 61,
    is_recommended: false,
  };
  if (constant.isDevelopment()) {
    // initialValues = {
    //   supplier: 18,
    //   // warehouse: 1,
    //   handover_location: 1,
    //   price_exclude: 12000,
    //   price_freight: 1000,
    //   // price_insurance: 1200,
    //   // price_susut: 900,
    //   price_cof: 800,
    //   quantity: 1000,
    //   quality_ffa: 5.1,
    //   quality_mi: 7.32,
    //   // quality_dobi: 12.11,
    //   handover_date: [moment("2022-03-27T05:39:03.591Z"), moment("2022-04-06T05:39:03.591Z")],
    //   terms_of_handover: "loco_luar_pulau",
    //   // handover_description: "handover desc",
    //   eta: [moment("2022-03-27T05:39:10.555Z"), moment("2022-03-31T05:39:10.555Z")],
    //   terms_of_loading: "trucking",
    //   terms_of_payment: "sadasd",
    //   dealer_notes: "asdasdasd",
    //   is_recommended: true,
    //   // commodity: 1,
    // };
    // onPriceChanged();
  }

  return (
    <>
      <SyncOverlay loading={pageLoading} />
      <OfferFormModalConfirm
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
      <ModalSupplierCreate
        commodities={commoditiesVal}
        visible={modalCreateSupplierShow}
        onCancel={() => {
          setModalCreateSupplierShow(false);
        }}
        onSuccess={() => {
          let fCommodity = form.getFieldValue("commodity");
          if (!fCommodity) fCommodity = defaultCommodity;
          handler.getSuppliers(setPageLoading, setSuppliers, fCommodity);
          setModalCreateSupplierShow(false);
          message.success(`${t("supplier")} ${t("toastSuffixSuccess")}`);
        }}
      />

      <ModalCommodityCreate
        visible={modalCreateCommodityShow}
        onCancel={() => {
          setModalCreateCommodityShow(false);
        }}
        onSuccess={() => {
          handler.getCommodities(setPageLoading, setCommodities);
          setModalCreateCommodityShow(false);
          message.success(`${t("commodity")} ${t("toastSuffixSuccess")}`);
        }}
      />

      <ModalWarehouseCreate
        setPageLoading={setPageLoading}
        visible={modalCreateWarehouseShow}
        onCancel={() => {
          setModalCreateWarehouseShow(false);
        }}
        onSuccess={() => {
          let fCommodity = form.getFieldValue("commodity");
          if (!fCommodity) fCommodity = defaultCommodity;
          handler.getWarehouses(setPageLoading, setWarehouses, fCommodity);
          setModalCreateWarehouseShow(false);
          message.success(`${t("warehouse")} ${t("toastSuffixSuccess")}`);
        }}
      />
      <ModalHandoverLocationCreate
        visible={modalCreateHandoverLocationShow}
        onCancel={() => {
          setModalCreateHandoverLocationShow(false);
        }}
        onSuccess={() => {
          handler.getHandoverLocations(setPageLoading, setHandoverLocations);
          setModalCreateHandoverLocationShow(false);
          message.success(`${t("handoverLocation")} ${t("toastSuffixSuccess")}`);
        }}
      />
      <Form
        form={form}
        name="form-offer"
        onFinish={handleOnSubmit}
        autoComplete="off"
        labelCol={{ span: 5 }}
        initialValues={!isEdit ? initialValues : undefined}
      >
        <Form.Item
          name="date"
          label={t("date")}
          rules={[
            {
              required: true,
              message: `${t("required")}`,
            },
          ]}
        >
          <DatePicker allowClear={false} inputReadOnly={true} {...utils.FORM_DATEPICKER_PROPS} />
        </Form.Item>
        <Form.Item
          name="week"
          label={t("Week")}
          rules={[
            {
              required: true,
              message: `${t("please")} ${t("select")} ${t("week")}`,
            },
          ]}
        >
          <Select
            showSearch
            placeholder={`${t("select")} ${t("week")}`}
            {...configs.FORM_SELECT_SEARCHABLE_PROPS}
            options={[
              { label: "Week 1", value: "W1" },
              { label: "Week 2", value: "W2" },
              { label: "Week 3", value: "W3" },
              { label: "Week 4", value: "W4" },
              { label: "Week 5", value: "W5" },
            ]}
          />
        </Form.Item>
        <Form.Item label={t("commodity")}>
          <Row gutter={12}>
            <Col xs={24} lg={18}>
              <Form.Item
                className="mb-2"
                name="commodity"
                rules={[
                  {
                    required: true,
                    message: `${t("please")} ${t("select")} ${t("commodity")}`,
                  },
                ]}
              >
                <Select
                  showSearch
                  placeholder={`${t("select")} ${t("commodity")}`}
                  {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                  options={commodities}
                  onChange={(val) => {
                    handler.getWarehouses(setPageLoading, setWarehouses, val);
                    handler.getSuppliers(setPageLoading, setSuppliers, val);
                    form.setFieldsValue({ supplier: undefined, warehouse: undefined });
                  }}
                />
              </Form.Item>
            </Col>
            {utils.renderWithPermission(
              userInfo.permissions,
              <Col xs={24} lg={6}>
                <Button
                  onClick={() => {
                    setModalCreateCommodityShow(true);
                  }}
                  block
                >
                  {`${t("add")} ${t("new")}`}
                </Button>
              </Col>,
              "config@commodity",
            )}
          </Row>
        </Form.Item>
        <Form.Item label={t("supplier")} className={showNotice ? "mb-0" : ""}>
          <Row gutter={12}>
            <Col xs={24} lg={18}>
              <Form.Item
                className="mb-2"
                name="supplier"
                rules={[
                  {
                    required: true,
                    message: `${t("please")} ${t("select")} ${t("supplier")}`,
                  },
                ]}
              >
                <Select
                  showSearch
                  placeholder={`${t("select")} ${t("supplier")}`}
                  {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                  options={suppliers}
                  onChange={() => {
                    setShowNotice(false);
                  }}
                />
              </Form.Item>
            </Col>
            {utils.renderWithPermission(
              userInfo.permissions,
              <Col xs={24} lg={6}>
                <Button
                  onClick={() => {
                    setModalCreateSupplierShow(true);
                  }}
                  block
                >
                  {`${t("add")} ${t("new")}`}
                </Button>
              </Col>,
              "supplier@create",
            )}
          </Row>
        </Form.Item>

        {showNotice && (
          <Form.Item label={" "} colon={false} style={{ marginTop: "-10px" }}>
            <span style={{ color: "#faad14", fontSize: "12px" }}>{t("noticeSupplierSite")}</span>
          </Form.Item>
        )}
        <Form.Item label={t("warehouse")}>
          <Row gutter={12}>
            <Col xs={24} lg={18}>
              <Form.Item
                className="mb-2"
                name="warehouse"
                rules={[
                  {
                    required: true,
                    message: `${t("please")} ${t("select")} ${t("warehouse")}`,
                  },
                ]}
              >
                <Select
                  showSearch
                  placeholder={`${t("select")} ${t("warehouse")}`}
                  {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                  options={warehouses}
                />
              </Form.Item>
            </Col>
            {utils.renderWithPermission(
              userInfo.permissions,
              <Col xs={24} lg={6}>
                <Button
                  onClick={() => {
                    setModalCreateWarehouseShow(true);
                  }}
                  block
                >
                  {`${t("add")} ${t("new")}`}
                </Button>
              </Col>,
              "config@warehouse",
            )}
          </Row>
        </Form.Item>
        <Form.Item label={t("handover")}>
          <Form.Item
            name="handover_date"
            label={`${t("handoverDate")}`}
            rules={[
              { required: true, message: `${t("please")} ${t("input")} ${t("handoverDate")}` },
            ]}
            labelCol={{ span: 7 }}
          >
            <DatePicker.RangePicker {...utils.FORM_RANGEPICKER_PROPS} />
          </Form.Item>
          <Form.Item
            name="terms_of_handover"
            label={t("termsOfHandover")}
            rules={[
              {
                required: true,
                message: `${t("please")} ${t("select")} ${t("termsOfHandover")}`,
              },
            ]}
            labelCol={{ span: 7 }}
          >
            <Select
              showSearch
              placeholder={`${t("select")} ${t("termsOfHandover")}`}
              {...configs.FORM_SELECT_SEARCHABLE_PROPS}
              options={constant.TERMS_OF_HANDOVER_LIST}
              onChange={(val) => {
                const includedLabels = [
                  "Gresik",
                  "Marunda",
                  "MCT",
                  "Tg Priok",
                  "Bekasi",
                  "Tg Perak",
                  "Jakarta",
                ];
                val === "cif" || val === "franco"
                  ? setHandoverLocations(
                      handoverLocations.filter((el) => includedLabels.includes(el.label)),
                    )
                  : handler.getHandoverLocations(setPageLoading, setHandoverLocations);

                if (val === "loco_luar_pulau") {
                  setRequiredFieldsTrucking(true);
                  setRequiredFieldsShip(true);
                }
                if (val === "fob") {
                  setRequiredFieldsTrucking(false);
                  setRequiredFieldsShip(true);
                }
                if (val === "franco" || val === "cif" || val === "loco_dalam_pulau") {
                  setRequiredFieldsTrucking(false);
                  setRequiredFieldsShip(false);
                }
                form.setFieldsValue({ price_freight_darat: null, price_freight_kapal: null });
              }}
            />
          </Form.Item>
          <Form.Item label={t("handoverLocation")} labelCol={{ span: 7 }}>
            <Row gutter={12}>
              <Col xs={24} lg={18}>
                <Form.Item
                  className="mb-2"
                  name="handover_location"
                  rules={[
                    {
                      required: true,
                      message: `${t("please")} ${t("select")} ${t("handoverLocation")}`,
                    },
                  ]}
                >
                  <Select
                    showSearch
                    placeholder={`${t("select")} ${t("handoverLocation")}`}
                    {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                    options={handoverLocations}
                  />
                </Form.Item>
              </Col>
              {utils.renderWithPermission(
                userInfo.permissions,
                <Col xs={24} lg={6}>
                  <Button
                    onClick={() => {
                      setModalCreateHandoverLocationShow(true);
                    }}
                    block
                  >
                    {`${t("add")} ${t("new")}`}
                  </Button>
                </Col>,
                "config@handover_location",
              )}
            </Row>
          </Form.Item>
        </Form.Item>
        <Form.Item label={t("price")}>
          <Form.Item
            name="price_exclude"
            label={`${t("priceExclude")}`}
            rules={[
              { required: true, message: `${t("please")} ${t("input")} ${t("priceExclude")}` },
            ]}
            labelCol={{ span: 6 }}
          >
            <InputNumber
              addonAfter={"/Kg"}
              style={{ width: "100%" }}
              placeholder={`${t("input")} ${t("priceExclude")}`}
              {...configs.FORM_MONEY_DEFAULT_PROPS}
              onChange={onPriceChanged}
            />
          </Form.Item>

          <Form.Item
            name="price_freight_darat"
            label={`${t("freight")} ${t("land")}`}
            // rules={[{ required: true, message: `${t("please")} ${t("input")} ${t("freight")}` }]}
            labelCol={{ span: 6 }}
            rules={[
              {
                required: requiredFieldsTrucking,
                message: `${t("please")} ${t("input")} ${t("freight")}`,
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder={`${t("input")} ${t("freight")} ${t("land")}`}
              {...configs.FORM_MONEY_DEFAULT_PROPS}
              onChange={onPriceChanged}
              disabled={!requiredFieldsTrucking}
            />
          </Form.Item>
          <Form.Item
            name="price_freight_kapal"
            label={`${t("freight")} ${t("ship")}`}
            // rules={[{ required: true, message: `${t("please")} ${t("input")} ${t("freight")}` }]}
            labelCol={{ span: 6 }}
            rules={[
              {
                required: requiredFieldsShip,
                message: `${t("please")} ${t("input")} ${t("freight")}`,
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder={`${t("input")} ${t("freight")} ${t("ship")}`}
              {...configs.FORM_MONEY_DEFAULT_PROPS}
              onChange={onPriceChanged}
              disabled={!requiredFieldsShip}
            />
          </Form.Item>
          <Form.Item
            name="price_freight"
            label={`${t("Total")} ${t("freight")}`}
            // rules={[{ required: true, message: `${t("please")} ${t("input")} ${t("freight")}` }]}
            labelCol={{ span: 6 }}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder={`${t("Total")} ${t("freight")}`}
              {...configs.FORM_MONEY_DEFAULT_PROPS}
              disabled
            />
          </Form.Item>
          <Form.Item
            name="price_insurance"
            label={`${t("insurance")}`}
            // rules={[{ required: true, message: `${t("please")} ${t("input")} ${t("insurance")}` }]}
            labelCol={{ span: 6 }}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder={`${t("input")} ${t("insurance")}`}
              {...configs.FORM_MONEY_DEFAULT_PROPS}
              onChange={onPriceChanged}
            />
          </Form.Item>

          <Form.Item
            name="price_susut"
            label={`${t("susut")}`}
            // rules={[{ required: true, message: `${t("please")} ${t("input")} ${t("susut")}` }]}
            labelCol={{ span: 6 }}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder={`${t("input")} ${t("susut")}`}
              {...configs.FORM_MONEY_DEFAULT_PROPS}
              onChange={onPriceChanged}
            />
          </Form.Item>

          <Form.Item
            name="price_cof"
            label={`${t("COF")}`}
            // rules={[{ required: true, message: `${t("please")} ${t("input")} ${t("COF")}` }]}
            labelCol={{ span: 6 }}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder={`${t("input")} ${t("COF")}`}
              {...configs.FORM_MONEY_DEFAULT_PROPS}
              onChange={onPriceChanged}
            />
          </Form.Item>

          <Form.Item name="price_all_in" label={`${t("priceAllIn")}`} labelCol={{ span: 6 }}>
            <InputNumber
              addonAfter={"/Kg"}
              style={{ width: "100%" }}
              placeholder={`${t("input")} ${t("priceAllIn")}`}
              {...configs.FORM_MONEY_DEFAULT_PROPS}
              disabled
            />
          </Form.Item>
        </Form.Item>
        <Form.Item
          name="quantity"
          label={`${t("quantity")}`}
          rules={[{ required: true, message: `${t("please")} ${t("input")} ${t("quantity")}` }]}
        >
          <InputNumber
            addonAfter={"MT"}
            style={{ width: "100%" }}
            placeholder={`${t("input")} ${t("quantity")}`}
            {...configs.FORM_MONEY_DEFAULT_PROPS}
          />
        </Form.Item>
        <Form.Item label={t("quality")}>
          <Input.Group>
            <Form.Item
              name="quality_ffa"
              label={t("FFA")}
              rules={[{ required: true, message: `${t("please")} ${t("input")} ${t("FFA")}` }]}
              labelCol={{ span: 2 }}
            >
              <InputNumber
                addonAfter={"%"}
                style={{ width: "100%" }}
                placeholder={`${t("input")} ${t("FFA")}`}
                {...configs.FORM_MONEY_DEFAULT_PROPS}
                max={100}
                min={0}
              />
            </Form.Item>

            <Form.Item
              name="quality_mi"
              label={t("MI")}
              rules={[{ required: true, message: `${t("please")} ${t("input")} ${t("MI")}` }]}
              labelCol={{ span: 2 }}
            >
              <InputNumber
                addonAfter={"%"}
                style={{ width: "100%" }}
                placeholder={`${t("input")} ${t("MI")}`}
                {...configs.FORM_MONEY_DEFAULT_PROPS}
                max={100}
                min={0}
              />
            </Form.Item>

            <Form.Item name="quality_dobi" label={t("dobi")} labelCol={{ span: 2 }}>
              <InputNumber
                addonAfter={"%"}
                style={{ width: "100%" }}
                placeholder={`${t("input")} ${t("DOBI")}`}
                {...configs.FORM_MONEY_DEFAULT_PROPS}
                max={100}
                min={0}
              />
            </Form.Item>
          </Input.Group>
        </Form.Item>

        <Form.Item
          name="eta"
          label={`${t("eta")}`}
          rules={[{ required: true, message: `${t("please")} ${t("input")} ${t("eta")}` }]}
        >
          <DatePicker.RangePicker {...utils.FORM_RANGEPICKER_PROPS} />
        </Form.Item>
        <Form.Item label={t("termsOfLoading")} name="terms_of_loading" rules={[]}>
          <Select
            showSearch
            placeholder={`${t("select")} ${t("termsOfLoading")}`}
            {...configs.FORM_SELECT_SEARCHABLE_PROPS}
            options={constant.TERMS_OF_LOADING_LIST}
          />
        </Form.Item>
        <Form.Item
          label={t("termsOfPayment")}
          name="terms_of_payment"
          rules={[
            {
              required: true,
              message: `${t("please")} ${t("input")} ${t("termsOfPayment")}`,
            },
          ]}
        >
          <Input.TextArea
            placeholder={`${t("input")} ${t("termsOfPayment")}`}
            rows={constant.FORM_TEXT_AREA_ROW}
            maxLength={constant.FORM_TEXT_AREA_LIMIT}
          />
        </Form.Item>
        <Form.Item
          label={t("dealerNotes")}
          name="dealer_notes"
          rules={[
            {
              required: true,
              message: `${t("please")} ${t("input")} ${t("dealerNotes")}`,
            },
          ]}
        >
          <Input.TextArea
            placeholder={`${t("input")} ${t("dealerNotes")}`}
            rows={constant.FORM_TEXT_AREA_ROW}
            maxLength={constant.FORM_TEXT_AREA_LIMIT}
          />
        </Form.Item>
        <Form.Item name="is_recommended" label={t("isRecommended")} valuePropName="checked">
          <Switch />
        </Form.Item>
        <Divider />
        <Form.Item className="mb-0 text-right">
          <Button type="secondary" className="mr-2" onClick={props.history.goBack}>
            {t("cancel")}
          </Button>
          <Button type="primary" htmlType="submit">
            {t("submit")}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default withRouter(OfferForm);
