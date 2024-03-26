import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import {
  Row,
  Col,
  Form,
  Button,
  Checkbox,
  Input,
  DatePicker,
  Select,
  Switch,
  InputNumber,
  Descriptions,
} from "antd";
import { SpinnerOverlay, SyncOverlay } from "components";
import { ReloadOutlined } from "@ant-design/icons";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import constant from "constant";
import configs from "configs";
import handler from "handler";
import moment from "moment";
import ModalConfirmCreate from "./modal/ModalConfirmCreate";
import Search from "antd/lib/input/Search";

const ScheduleForm = ({ isEdit, id, onCancel, onSuccess, history }) => {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const userInfo = utils.getUserInfo();
  const [pageLoading, setPageLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [modalConfirmCreateData, setModalConfirmCreateData] = useState({});
  const [modalConfirmCreateShow, setModalConfirmCreateShow] = useState(false);
  const [formData, setFormData] = useState({});
  const [autoFill, setAutoFill] = useState(false);
  const [hutangKirim, setHutangKirim] = useState(false);
  const [lineNumShowManual, setLineNumShowManual] = useState(false);
  const [skuCodeShowManual, setSkuCodeShowManual] = useState(false);
  const [disableSubmit, setDisableSubmit] = useState(true);
  const [disableRefreshPOPR, setDisableRefreshPOPR] = useState(true);
  const [PRDetail, setPRDetail] = useState([]);
  const [showPRDetail, setShowPRDetail] = useState(false);
  const [selectedSKU, setSelectedSKU] = useState({});
  const [SKUNameOptions, setSKUNameOptions] = useState([]);

  const handleSwitchAutoFillChange = (checked) => {
    setAutoFill(checked);
  };
  const handleSwitchHutangKirimChange = (checked) => {
    setHutangKirim(checked);
  };
  const handleOnConfirm = (dataConfirm) => {
    setPageLoading(true);
    const reqBody = {
      ...dataConfirm,
      est_delivery: moment(dataConfirm.est_delivery).format(constant.FORMAT_API_DATE),
      submission_date: moment(dataConfirm.submission_date).format(constant.FORMAT_API_DATE),
    };

    api.ppic
      .create(reqBody)
      .then(function (response) {
        setModalConfirmCreateShow(false);
        setModalConfirmCreateData({});
        onSuccess();
      })
      .catch(function (error) {
        setModalConfirmCreateShow(false);
        setModalConfirmCreateData({});
        utils.swal.Error({ msg: utils.getErrMsg(error) });
        onCancel();
      })
      .finally(function () {
        setPageLoading(false);
      });
  };
  useEffect(() => {
    if (isEdit) {
      getOfferData();
    }
    handler.getSuppliersOptionList(setPageLoading, setSuppliers);
    if (constant.isDevelopment()) {
      // form.setFieldsValue({
      //   transportir_id: "TRANSPORTIR_1",
      //   types: ["sea", "land"],
      //   name: "TRANSPORTIR_1",
      // });
    }
  }, [isEdit, id]);

  const getOfferData = () => {
    if (id) {
      setPageLoading(true);
      api.ppic
        .get(id)
        .then(function (response) {
          const res = response.data.rs_body;

          form.setFieldsValue({
            submission_date: moment(res.submission_date),
            supplier_name: parseInt(res.supplier.ref_id),
            po_number: res.po_number,
            po_qty: Number(res.po_qty),
            po_outs: Number(res.po_outs),
            sku_code: res.sku_code,
            sku_name: res.sku_name,
            qty_delivery: Number(res.qty_delivery),
            est_delivery: moment(res.est_delivery),
          });
        })
        .catch(function (error) {
          utils.swal.Error({
            msg: utils.getErrMsg(error),
            cbFn: () => {
              onCancel();
              return;
            },
          });
        })
        .finally(function () {
          setPageLoading(false);
        });
    } else {
      utils.swal.Error({
        msg: t("swalDefaultError"),
        cbFn: () => {
          onCancel();
          return;
        },
      });
      return;
    }
  };

  const resetForm = () => {
    form.resetFields();
  };

  const handleRefreshPOPR = (value, _e, info) => {
    setPageLoading(true);
    const poNumber = form.getFieldValue("po_number");
    if (poNumber.substring(0, 2) === "PR") {
      api.ppic
        .getPRDetail({ pr_number: poNumber })
        .then(function (response) {
          const rsBody = response.data.rs_body;
          let skuNameOptions = [];
          console.log(rsBody);
          if (rsBody) {
            rsBody.forEach((el) => {
              skuNameOptions.push({ value: el.LINE_NUM, label: el.SKU_NAME });
            });
          } else {
            utils.swal.Error({ msg: "No Data in this PR" });
          }
          setPRDetail(rsBody);
          setSKUNameOptions(skuNameOptions);
        })
        .catch(function (error) {
          utils.swal.Error({ msg: utils.getErrMsg(error) });
        })
        .finally(function () {
          setPageLoading(false);
        });
    } else if (poNumber.substring(0, 2) === "PO" || poNumber.substring(0, 2) === "PI") {
      api.ppic
        .getPODetail({ po_number: poNumber })
        .then(function (response) {
          const rsBody = response.data.rs_body;
          let skuNameOptions = [];
          if (rsBody) {
            console.log(rsBody);
            if (rsBody) {
              rsBody.forEach((el) => {
                skuNameOptions.push({ value: el.LINE_NUM, label: el.SKU_NAME });
              });
            } else {
              utils.swal.Error({ msg: "No Data in this PO" });
            }
            setPRDetail(rsBody);
            setSKUNameOptions(skuNameOptions);
          } else {
            utils.swal.Error({ msg: "No Data in this PO" });
          }
        })
        .catch(function (error) {
          utils.swal.Error({ msg: utils.getErrMsg(error) });
        })
        .finally(function () {
          setPageLoading(false);
        });
    }
  };

  const handleOnSubmit = async (values) => {
    setPageLoading(true);
    setFormData(values);
    let modalConfirmObj = {}; //autoFill
    let dataToShow = {}; //manual
    console.log(values);
    modalConfirmObj = {
      submission_date: moment(values.submission_date).format(constant.FORMAT_API_DATE),
      io_filter: values.io_filter,
      category_filter: values.category_filter,
      supplier_name: values.supplier_name,
      po_number: values.po_number,
      line_num: selectedSKU?.LINE_NUM ?? null,
      po_qty: Number(values.po_qty),
      po_outs: Number(values.po_outs),
      sku_code: values.sku_code,
      sku_name: values.sku_name,
      qty_delivery: Number(values.qty_delivery),
      est_delivery: moment(values.est_delivery).format(constant.FORMAT_API_DATE),
      notes_ppic: values.notes,
      auto_fill: false,
    };

    if (hutangKirim) {
      modalConfirmObj.hutang_kirim = true;
    } else {
      modalConfirmObj.hutang_kirim = false;
    }
    if (isEdit) {
      api.ppic
        .edit(modalConfirmObj)
        .then(function (response) {
          onSuccess();
        })
        .catch(function (error) {
          utils.swal.Error({ msg: utils.getErrMsg(error) });
        })
        .finally(function () {
          setPageLoading(false);
        });
    } else {
      if (autoFill) {
        const dataToShow = await api.ppic
          .getPODetails(modalConfirmObj)
          .then(function (response) {
            modalConfirmObj.submission_date = moment(values.submission_date);
            modalConfirmObj.io_filter = values.io_filter;
            modalConfirmObj.category_filter = values.category_filter;
            modalConfirmObj.po_number = values.po_number;
            modalConfirmObj.po_qty = response.data.rs_body.QUANTITY;
            modalConfirmObj.po_outs = response.data.rs_body.QTY_OUTS;
            modalConfirmObj.sku_code = response.data.rs_body.KODE_SKU;
            modalConfirmObj.sku_name = response.data.rs_body.NAMA_SKU;
            modalConfirmObj.line_num = response.data.rs_body.LINE_NUM;
            modalConfirmObj.supplier_name = response.data.rs_body.VENDOR_NAME;
            modalConfirmObj.qty_delivery = Number(values.qty_delivery);
            modalConfirmObj.est_delivery = moment(values.est_delivery);
            modalConfirmObj.buyer_name = response.data.rs_body.USER_NAME;
            modalConfirmObj.hutang_kirim = values.hutang_kirim;
            modalConfirmObj.notes_ppic = values.notes;
            return modalConfirmObj;
          })
          .catch(function (error) {
            setModalConfirmCreateShow(false);
            setModalConfirmCreateData({});
            utils.swal.Error({ msg: utils.getErrMsg(error) });
            onCancel();
          })
          .finally(function () {
            setPageLoading(false);
          });
        setModalConfirmCreateData(dataToShow);
        setModalConfirmCreateShow(true);
      } else {
        if (
          values.po_number.substring(0, 2) === "PO" ||
          values.po_number.substring(0, 2) === "PI"
        ) {
          const dataToShow = await api.ppic
            .getPODetails(modalConfirmObj)
            .then(function (response) {
              console.log(response);
              modalConfirmObj.submission_date = moment(values.submission_date);
              modalConfirmObj.io_filter = values.io_filter;
              modalConfirmObj.category_filter = values.category_filter;
              modalConfirmObj.po_number = values.po_number;
              modalConfirmObj.po_qty = response.data.rs_body.QUANTITY;
              modalConfirmObj.po_outs = response.data.rs_body.QTY_OUTS;
              modalConfirmObj.sku_code = response.data.rs_body.KODE_SKU;
              modalConfirmObj.sku_name = response.data.rs_body.NAMA_SKU;
              modalConfirmObj.line_num = response.data.rs_body.LINE_NUM;
              modalConfirmObj.supplier_name = response.data.rs_body.VENDOR_NAME;
              modalConfirmObj.qty_delivery = Number(values.qty_delivery);
              modalConfirmObj.est_delivery = moment(values.est_delivery);
              modalConfirmObj.buyer_name = response.data.rs_body.USER_NAME;
              modalConfirmObj.hutang_kirim = values.hutang_kirim;
              modalConfirmObj.notes_ppic = values.notes;
              return modalConfirmObj;
            })
            .catch(function (error) {
              setModalConfirmCreateShow(false);
              setModalConfirmCreateData({});
              utils.swal.Error({ msg: utils.getErrMsg(error) });
              onCancel();
            })
            .finally(function () {
              setPageLoading(false);
            });
          setModalConfirmCreateData(dataToShow);
          setModalConfirmCreateShow(true);
        } else if (
          values.po_number === undefined ||
          values.po_number === "" ||
          values.po_number === null
        ) {
          dataToShow.submission_date = moment(values.submission_date);
          dataToShow.io_filter = values.io_filter;
          dataToShow.category_filter = values.category_filter;
          dataToShow.po_number = values.po_number;
          dataToShow.po_qty = Number(values.po_qty);
          dataToShow.po_outs = Number(values.po_outs);
          dataToShow.sku_code = values.sku_code;
          dataToShow.sku_name = values.sku_name;
          dataToShow.supplier_name = values.supplier_name;
          dataToShow.qty_delivery = Number(values.qty_delivery);
          dataToShow.est_delivery = moment(values.est_delivery);
          dataToShow.notes_ppic = values.notes;
          dataToShow.hutang_kirim = values.hutang_kirim;
          setModalConfirmCreateData(dataToShow);
          setModalConfirmCreateShow(true);
        } else if (values.po_number.substring(0, 2) === "PR") {
          const dataToShow = await api.ppic
            .getPODetails(modalConfirmObj)
            .then(function (response) {
              console.log(response.data.rs_body);
              modalConfirmObj.submission_date = moment(values.submission_date);
              modalConfirmObj.io_filter = values.io_filter;
              modalConfirmObj.category_filter = values.category_filter;
              modalConfirmObj.po_number = values.po_number;
              modalConfirmObj.po_qty = response.data.rs_body.PR_QTY;
              modalConfirmObj.po_outs = response.data.rs_body.QUANTITY_OUTSTANDING;
              modalConfirmObj.sku_code = response.data.rs_body.SKU_CODE;
              modalConfirmObj.sku_name = response.data.rs_body.SKU_NAME;
              modalConfirmObj.line_num = response.data.rs_body.LINE_NUMBER;
              modalConfirmObj.qty_delivery = Number(values.qty_delivery);
              modalConfirmObj.est_delivery = moment(values.est_delivery);
              modalConfirmObj.buyer_name = response.data.rs_body.USER_NAME;
              modalConfirmObj.hutang_kirim = values.hutang_kirim;
              modalConfirmObj.notes_ppic = values.notes;
              return modalConfirmObj;
            })
            .catch(function (error) {
              setModalConfirmCreateShow(false);
              setModalConfirmCreateData({});
              utils.swal.Error({ msg: utils.getErrMsg(error) });
              onCancel();
            })
            .finally(function () {
              setPageLoading(false);
            });
          setModalConfirmCreateData(dataToShow);
          setModalConfirmCreateShow(true);
        }
      }
    }
  };

  return (
    <>
      <ModalConfirmCreate
        isEdit={false}
        values={modalConfirmCreateData}
        visible={modalConfirmCreateShow}
        onCancel={() => {
          setModalConfirmCreateShow(false);
          setModalConfirmCreateData({});
          setPageLoading(false);
        }}
        onOk={() => {
          setModalConfirmCreateShow(false);
          handleOnConfirm(modalConfirmCreateData);
        }}
      />
      <SyncOverlay loading={pageLoading} />
      <Form form={form} onFinish={handleOnSubmit} autoComplete="off" layout="vertical">
        <Row gutter={16}>
          {/* <Col span={6}>
            <Form.Item name="auto_fill" label={t("autoFill")} valuePropName="checked">
              <Switch onChange={handleSwitchAutoFillChange} />
            </Form.Item>
          </Col> */}
          <Col span={12}>
            <Form.Item name="hutang_kirim" label={t("hutangKirim")} valuePropName="checked">
              <Switch onChange={handleSwitchHutangKirimChange} />
            </Form.Item>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="submission_date"
                  label={t("submissionDate")}
                  rules={[
                    {
                      required: true,
                      message: `${t("please")} ${t("input")} ${t("submissionDate")}`,
                    },
                  ]}
                >
                  <DatePicker
                    allowClear={false}
                    inputReadOnly={true}
                    {...utils.FORM_DATEPICKER_PROPS}
                    disabledDate={(current) => {
                      return current && current > moment();
                    }}
                    style={{ width: "100%" }}
                    onChange={() => {
                      if (
                        form.getFieldValue("submission_date") &&
                        form.getFieldValue("po_number") &&
                        form.getFieldValue("sku_name") &&
                        form.getFieldValue("io_filter") &&
                        form.getFieldValue("category_filter") &&
                        form.getFieldValue("est_delivery") &&
                        form.getFieldValue("qty_delivery")
                      ) {
                        setDisableSubmit(false);
                      } else {
                        setDisableSubmit(true);
                      }
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label={`No PR/PO ${lineNumShowManual ? "" : ""}`}
                  name="po_number"
                  rules={[
                    {
                      required: lineNumShowManual,
                      message: `${t("input")} ${t("No PR/PO")}`,
                    },
                  ]}
                >
                  <Input
                    onChange={(e) => {
                      if (e.target.value) {
                        setDisableRefreshPOPR(false);
                        setShowPRDetail(false);
                        setPRDetail([]);
                        setSKUNameOptions([]);
                        form.setFieldsValue({ sku_name: null });
                        if (e.target.value.substring(0, 2) === "PR") {
                          setLineNumShowManual(true);
                          setSkuCodeShowManual(true);
                        } else if (
                          e.target.value.substring(0, 2) === "PO" ||
                          e.target.value.substring(0, 2) === "PI"
                        ) {
                          setSkuCodeShowManual(false);
                          setLineNumShowManual(true);
                        } else {
                          setSkuCodeShowManual(false);
                          setLineNumShowManual(false);
                        }
                      } else {
                        setDisableRefreshPOPR(true);
                        setLineNumShowManual(false);
                      }
                      if (
                        form.getFieldValue("submission_date") &&
                        form.getFieldValue("po_number") &&
                        form.getFieldValue("sku_name") &&
                        form.getFieldValue("io_filter") &&
                        form.getFieldValue("category_filter") &&
                        form.getFieldValue("est_delivery") &&
                        form.getFieldValue("qty_delivery")
                      ) {
                        setDisableSubmit(false);
                      } else {
                        setDisableSubmit(true);
                      }
                    }}
                    placeholder={`${t("input")} ${t("No PR/PO")}`}
                    addonAfter={
                      <Button
                        type="primary"
                        icon={<ReloadOutlined />}
                        onClick={handleRefreshPOPR}
                        disabled={disableRefreshPOPR}
                      />
                    }
                    onPressEnter={handleRefreshPOPR}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              {SKUNameOptions.length > 0 && (
                <Col span={24}>
                  <Form.Item
                    name="sku_name"
                    label={t("SKU Name")}
                    rules={[
                      {
                        required: true,
                        message: `${t("please")} ${t("input")} ${t("SKU Name")}`,
                      },
                    ]}
                  >
                    <Select
                      showSearch
                      placeholder={`${t("select")} ${t("SKU Name")}`}
                      {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                      options={SKUNameOptions}
                      onChange={(value) => {
                        console.log(value);
                        const selectedSKU = PRDetail.find((el) => el.LINE_NUM === value);
                        setSelectedSKU(selectedSKU);
                        setShowPRDetail(true);
                        if (
                          form.getFieldValue("submission_date") &&
                          form.getFieldValue("po_number") &&
                          form.getFieldValue("sku_name") &&
                          form.getFieldValue("io_filter") &&
                          form.getFieldValue("category_filter") &&
                          form.getFieldValue("est_delivery") &&
                          form.getFieldValue("qty_delivery")
                        ) {
                          setDisableSubmit(false);
                        } else {
                          setDisableSubmit(true);
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
              )}
            </Row>
          </Col>
          {showPRDetail && (
            <Col span={12}>
              <Descriptions bordered column={1} size="small" className="mb-3">
                <Descriptions.Item
                  className="mb-0"
                  label={t("No PR/PO")}
                  style={{ width: "300px" }}
                  labelStyle={{ width: "200px" }}
                >
                  <strong>{selectedSKU?.PR_NUMBER || selectedSKU?.PO_NUMBER}</strong>
                </Descriptions.Item>
                <Descriptions.Item
                  className="mb-0"
                  label={t("SKU Name")}
                  style={{ width: "300px" }}
                  labelStyle={{ width: "100px" }}
                >
                  <strong>{selectedSKU?.SKU_NAME}</strong>
                </Descriptions.Item>
                <Descriptions.Item
                  className="mb-0"
                  label={"SKU Code"}
                  style={{ width: "300px" }}
                  labelStyle={{ width: "100px" }}
                >
                  <strong>{selectedSKU?.SKU_CODE}</strong>
                </Descriptions.Item>
                <Descriptions.Item
                  className="mb-0"
                  label={t("PO/PR Qty")}
                  style={{ width: "300px" }}
                  labelStyle={{ width: "100px" }}
                >
                  <strong>{selectedSKU?.PR_QTY || selectedSKU?.PO_QTY}</strong>
                </Descriptions.Item>
                <Descriptions.Item
                  className="mb-0"
                  label={t("PO/PR Outs")}
                  style={{ width: "300px" }}
                  labelStyle={{ width: "100px" }}
                >
                  <strong>{selectedSKU?.QUANTITY_OUTSTANDING}</strong>
                </Descriptions.Item>
                <Descriptions.Item
                  className="mb-0"
                  label={t("supplier")}
                  style={{ width: "300px" }}
                  labelStyle={{ width: "100px" }}
                >
                  <strong>{selectedSKU?.SUPPLIER_NAME}</strong>
                </Descriptions.Item>
                <Descriptions.Item
                  className="mb-0"
                  label={t("Buyer Name")}
                  style={{ width: "300px" }}
                  labelStyle={{ width: "100px" }}
                >
                  <strong>{selectedSKU?.USER_NAME}</strong>
                </Descriptions.Item>
              </Descriptions>
            </Col>
          )}
        </Row>

        <>
          <Row gutter={16}>
            {/* <Col span={12}>
              <Form.Item
                label={`No PR/PO ${lineNumShowManual ? "" : ""}`}
                name="po_number"
                rules={[
                  {
                    required: lineNumShowManual,
                    message: `${t("input")} ${t("No PR/PO")}`,
                  },
                ]}
              >
                <Input
                  onChange={(e) => {
                    if (e.target.value) {
                      setDisableRefreshPOPR(false);
                      setShowPRDetail(false);
                      setPRDetail([]);
                      setSKUNameOptions([]);
                      form.setFieldsValue({ sku_name: null });
                      if (e.target.value.substring(0, 2) === "PR") {
                        setLineNumShowManual(true);
                        setSkuCodeShowManual(true);
                      } else if (
                        e.target.value.substring(0, 2) === "PO" ||
                        e.target.value.substring(0, 2) === "PI"
                      ) {
                        setSkuCodeShowManual(false);
                        setLineNumShowManual(true);
                      } else {
                        setSkuCodeShowManual(false);
                        setLineNumShowManual(false);
                      }
                    } else {
                      setDisableRefreshPOPR(true);
                      setLineNumShowManual(false);
                    }
                    if (
                      form.getFieldValue("submission_date") &&
                      form.getFieldValue("po_number") &&
                      form.getFieldValue("sku_name") &&
                      form.getFieldValue("io_filter") &&
                      form.getFieldValue("category_filter") &&
                      form.getFieldValue("est_delivery") &&
                      form.getFieldValue("qty_delivery")
                    ) {
                      setDisableSubmit(false);
                    } else {
                      setDisableSubmit(true);
                    }
                  }}
                  placeholder={`${t("input")} ${t("No PR/PO")}`}
                  addonAfter={
                    <Button
                      type="primary"
                      icon={<ReloadOutlined />}
                      onClick={handleRefreshPOPR}
                      disabled={disableRefreshPOPR}
                    />
                  }
                />
              </Form.Item>
            </Col> */}
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="io_filter"
                label={t("I/O Pabrik")}
                rules={[
                  {
                    required: true,
                    message: `${t("please")} ${t("input")} ${t("I/O Pabrik")}`,
                  },
                ]}
              >
                <Select
                  showSearch
                  placeholder={`${t("select")} ${t("I/O Pabrik")}`}
                  {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                  options={constant.WAREHOUSE_LIST}
                  onChange={() => {
                    //check all required input
                    if (
                      form.getFieldValue("submission_date") &&
                      form.getFieldValue("po_number") &&
                      form.getFieldValue("sku_name") &&
                      form.getFieldValue("io_filter") &&
                      form.getFieldValue("category_filter") &&
                      form.getFieldValue("est_delivery") &&
                      form.getFieldValue("qty_delivery")
                    ) {
                      setDisableSubmit(false);
                    } else {
                      setDisableSubmit(true);
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category_filter"
                label={t("Item Category")}
                rules={[
                  {
                    required: true,
                    message: `${t("please")} ${t("input")} ${t("Item Category")}`,
                  },
                ]}
              >
                <Select
                  showSearch
                  placeholder={`${t("select")} ${t("Item Category")}`}
                  {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                  options={constant.PPIC_CATEGORY_LIST}
                  onChange={() => {
                    //check all required input
                    if (
                      form.getFieldValue("submission_date") &&
                      form.getFieldValue("po_number") &&
                      form.getFieldValue("sku_name") &&
                      form.getFieldValue("io_filter") &&
                      form.getFieldValue("category_filter") &&
                      form.getFieldValue("est_delivery") &&
                      form.getFieldValue("qty_delivery")
                    ) {
                      setDisableSubmit(false);
                    } else {
                      setDisableSubmit(true);
                    }
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* {!lineNumShowManual && (
            <Form.Item name="supplier_name" label={t("supplierName")}>
              <Select
                showSearch
                placeholder={`${t("select")} ${t("supplier")}`}
                {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                options={suppliers}
              />
            </Form.Item>
          )} */}
          {!lineNumShowManual && (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={t("Qty PR/PO")}
                    name="po_qty"
                    rules={[
                      {
                        required: true,
                        message: `${t("please")} ${t("input")} ${t("Qty PR/PO")}`,
                      },
                    ]}
                  >
                    <InputNumber
                      {...configs.FORM_MONEY_DEFAULT_PROPS}
                      placeholder={`${t("input")} ${t("Qty PR/PO")}`}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={t("Outs PR/PO")}
                    name="po_outs"
                    rules={[
                      {
                        required: true,
                        message: `${t("please")} ${t("input")} ${t("Outs PR/PO")}`,
                      },
                    ]}
                  >
                    <InputNumber
                      {...configs.FORM_MONEY_DEFAULT_PROPS}
                      placeholder={`${t("input")} ${t("Outs PR/PO")}`}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={t("SKUCode")}
                    name="sku_code"
                    rules={[
                      {
                        required: true,
                        message: `${t("please")} ${t("input")} ${t("SKUCode")}`,
                      },
                    ]}
                  >
                    <Input placeholder={`${t("input")} ${t("SKUCode")}`} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={t("SKUName")}
                    name="sku_name"
                    rules={[
                      {
                        required: true,
                        message: `${t("please")} ${t("input")} ${t("SKUName")}`,
                      },
                    ]}
                  >
                    <Input placeholder={`${t("input")} ${t("SKUName")}`} />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t("qtyDelivery")}
                name="qty_delivery"
                rules={[
                  {
                    required: true,
                    message: `${t("please")} ${t("input")} ${t("qtyDelivery")}`,
                  },
                ]}
              >
                <InputNumber
                  {...configs.FORM_MONEY_DEFAULT_PROPS}
                  placeholder={`${t("input")} ${t("qtyDelivery")}`}
                  style={{ width: "100%" }}
                  onChange={() => {
                    //check all required input
                    if (
                      form.getFieldValue("submission_date") &&
                      form.getFieldValue("po_number") &&
                      form.getFieldValue("sku_name") &&
                      form.getFieldValue("io_filter") &&
                      form.getFieldValue("category_filter") &&
                      form.getFieldValue("est_delivery") &&
                      form.getFieldValue("qty_delivery")
                    ) {
                      setDisableSubmit(false);
                    } else {
                      setDisableSubmit(true);
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t("estDelivery")}
                name="est_delivery"
                rules={[
                  {
                    required: true,
                    message: `${t("please")} ${t("input")} ${t("estDelivery")}`,
                  },
                ]}
              >
                <DatePicker
                  allowClear={false}
                  inputReadOnly={true}
                  style={{ width: "100%" }}
                  {...utils.FORM_DATEPICKER_PROPS}
                  disabledDate={(current) => {
                    return current && current < moment().startOf("day");
                  }}
                  onChange={(e) => {
                    console.log(e);
                    //check all required input
                    if (
                      form.getFieldValue("submission_date") &&
                      form.getFieldValue("po_number") &&
                      form.getFieldValue("sku_name") &&
                      form.getFieldValue("io_filter") &&
                      form.getFieldValue("category_filter") &&
                      form.getFieldValue("est_delivery") &&
                      form.getFieldValue("qty_delivery")
                    ) {
                      setDisableSubmit(false);
                    } else {
                      setDisableSubmit(true);
                    }
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name={"notes"}
            label={t("notes")}
            rules={[
              {
                message: `${t("input")} ${t("notes")}`,
              },
            ]}
          >
            <Input.TextArea
              placeholder={`${t("input")} ${t("notes")}`}
              rows={constant.FORM_TEXT_AREA_ROW}
              maxLength={constant.FORM_TEXT_AREA_LIMIT}
            />
          </Form.Item>
          <Form.Item className="mb-0 text-right">
            <Button type="secondary" className="mr-2" onClick={onCancel}>
              {t("cancel")}
            </Button>
            <Button type="primary" htmlType="submit" disabled={disableSubmit}>
              {t("submit")}
            </Button>
          </Form.Item>
        </>
      </Form>
    </>
  );
};

export default withRouter(ScheduleForm);
