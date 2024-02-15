import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { Row, Col, Form, Button, Checkbox, Input, DatePicker, Select } from "antd";
import { SpinnerOverlay, SyncOverlay } from "components";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import constant from "constant";
import configs from "configs";
import handler from "handler";
import moment from "moment";

const ScheduleForm = ({ isEdit, id, onCancel, onSuccess, history }) => {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const [pageLoading, setPageLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const transportirTypeList = constant.TRANSPORTIR_TYPE_LIST;

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

  const handleOnSubmit = (values) => {
    setPageLoading(true);
    const reqBody = {
      submission_date: moment(values.submission_date).format(constant.FORMAT_API_DATE),
      supplier_name: values.supplier_name,
      po_number: values.po_number,
      po_qty: parseInt(values.po_qty),
      po_outs: parseInt(values.po_outs),
      sku_code: values.sku_code,
      sku_name: values.sku_name,
      qty_delivery: parseInt(values.qty_delivery),
      est_delivery: moment(values.est_delivery),
    };
    if (isEdit) {
      api.ppic
        .edit(id, reqBody)
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
      api.ppic
        .create(reqBody)
        .then(function (response) {
          resetForm();
          onSuccess();
        })
        .catch(function (error) {
          utils.swal.Error({ msg: utils.getErrMsg(error) });
        })
        .finally(function () {
          setPageLoading(false);
        });
    }
  };

  return (
    <>
      <SyncOverlay loading={pageLoading} />
      <Form form={form} onFinish={handleOnSubmit} autoComplete="off" layout="vertical">
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
          <DatePicker allowClear={false} inputReadOnly={true} {...utils.FORM_DATEPICKER_PROPS} />
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
              required: true,
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
          <DatePicker allowClear={false} inputReadOnly={true} {...utils.FORM_DATEPICKER_PROPS} />
        </Form.Item>
        <Form.Item className="mb-0 text-right">
          <Button type="secondary" className="mr-2" onClick={onCancel}>
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

export default withRouter(ScheduleForm);
