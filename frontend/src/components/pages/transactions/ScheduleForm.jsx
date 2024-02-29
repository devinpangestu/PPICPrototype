import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { Row, Col, Form, Button, Checkbox, Input, DatePicker, Select, Switch } from "antd";
import { SpinnerOverlay, SyncOverlay } from "components";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import constant from "constant";
import configs from "configs";
import handler from "handler";
import moment from "moment";
import ModalConfirmCreate from "./modal/ModalConfirmCreate";

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
  const handleSwitchChange = (checked) => {
    setAutoFill(checked);
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
            io_filter: res.io_filter,
            category_filter: res.category_filter,
            po_number: res.po_number,
            po_qty: parseInt(res.po_qty),
            po_outs: parseInt(res.po_outs),
            sku_code: res.sku_code,
            sku_name: res.sku_name,
            qty_delivery: parseInt(res.qty_delivery),
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

  const handleOnSubmit = async (values) => {
    setPageLoading(true);
    setFormData(values);
    let modalConfirmObj = {};
    if (autoFill) {
      modalConfirmObj = {
        po_number: values.po_number,
        line_num: values.line_num,
        auto_fill: true,
      };
    } else {
      modalConfirmObj = {
        submission_date: moment(values.submission_date).format(constant.FORMAT_API_DATE),
        io_filter: values.io_filter,
        category_filter: values.category_filter,
        supplier_name: values.supplier_name,
        po_number: values.po_number,
        po_qty: parseInt(values.po_qty),
        po_outs: parseInt(values.po_outs),
        sku_code: values.sku_code,
        sku_name: values.sku_name,
        qty_delivery: parseInt(values.qty_delivery),
        est_delivery: moment(values.est_delivery).format(constant.FORMAT_API_DATE),
        auto_fill: false,
      };
    }
    if (isEdit) {
      api.ppic
        .edit(id, modalConfirmObj)
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
          .getPODetail(modalConfirmObj)
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
            modalConfirmObj.qty_delivery = parseInt(values.qty_delivery);
            modalConfirmObj.est_delivery = moment(values.est_delivery);
            modalConfirmObj.buyer_name = response.data.rs_body.USER_NAME;
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
        const dataToShow = {};
        dataToShow.submission_date = moment(values.submission_date);
        dataToShow.io_filter = values.io_filter;
        dataToShow.category_filter = values.category_filter;
        dataToShow.po_number = values.po_number;
        dataToShow.po_qty = parseInt(values.po_qty);
        dataToShow.po_outs = parseInt(values.po_outs);
        dataToShow.sku_code = values.sku_code;
        dataToShow.sku_name = values.sku_name;
        dataToShow.supplier_name = values.supplier_name;
        dataToShow.qty_delivery = parseInt(values.qty_delivery);
        dataToShow.est_delivery = moment(values.est_delivery);
        setModalConfirmCreateData(dataToShow);
        setModalConfirmCreateShow(true);
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
        {autoFill ? (
          <>
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
              />
            </Form.Item>

            <Form.Item
              label={t("No PR/PO")}
              name="po_number"
              rules={[{ required: true, message: `${t("please")} ${t("input")} ${t("No PR/PO")}` }]}
            >
              <Input placeholder={`${t("input")} ${t("No PR/PO")}`} />
            </Form.Item>

            <Form.Item
              label={t("Line Number")}
              name="line_num"
              rules={[
                {
                  required: true,
                  message: `${t("please")} ${t("input")} ${t("Line Number")}`,
                },
              ]}
            >
              <Input placeholder={`${t("input")} ${t("Line Number")}`} />
            </Form.Item>

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
              <Input placeholder={`${t("input")} ${t("qtyDelivery")}`} />
            </Form.Item>
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
                {...utils.FORM_DATEPICKER_PROPS}
              />
            </Form.Item>
            <Form.Item className="mb-0 text-right">
              <Button type="secondary" className="mr-2" onClick={onCancel}>
                {t("cancel")}
              </Button>
              <Button type="primary" htmlType="submit">
                {t("submit")}
              </Button>
            </Form.Item>
          </>
        ) : (
          <>
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
              />
            </Form.Item>
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
              />
            </Form.Item>
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
              />
            </Form.Item>
            <Form.Item
              name="supplier_name"
              label={t("supplierName")}
              rules={[
                {
                  required: true,
                  message: `${t("please")} ${t("input")} ${t("supplierName")}`,
                },
              ]}
            >
              <Select
                showSearch
                placeholder={`${t("select")} ${t("supplier")}`}
                {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                options={suppliers}
              />
            </Form.Item>

            <Form.Item
              label={t("No PR/PO")}
              name="po_number"
              rules={[
                {
                  message: `${t("please")} ${t("input")} ${t("No PR/PO")}`,
                },
              ]}
            >
              <Input placeholder={`${t("input")} ${t("No PR/PO")}`} />
            </Form.Item>
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
              <Input placeholder={`${t("input")} ${t("Qty PR/PO")}`} />
            </Form.Item>
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
              <Input placeholder={`${t("input")} ${t("Outs PR/PO")}`} />
            </Form.Item>
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
              <Input placeholder={`${t("input")} ${t("qtyDelivery")}`} />
            </Form.Item>
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
                {...utils.FORM_DATEPICKER_PROPS}
              />
            </Form.Item>
            <Form.Item className="mb-0 text-right">
              <Button type="secondary" className="mr-2" onClick={onCancel}>
                {t("cancel")}
              </Button>
              <Button type="primary" htmlType="submit">
                {t("submit")}
              </Button>
            </Form.Item>
          </>
        )}
      </Form>
    </>
  );
};

export default withRouter(ScheduleForm);
