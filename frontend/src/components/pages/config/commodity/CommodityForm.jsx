import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { Row, Col, Form, Button, Input } from "antd";
import { api } from "api";
import { SpinnerOverlay, SyncOverlay } from "components";
import { useTranslation } from "react-i18next";
import utils from "utils";
import constant from "constant";

const CommodityForm = (props) => {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const { isEdit, id, onCancel, onSuccess } = props;

  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    if (isEdit) getCommodity();
  }, [id]);

  const getCommodity = () => {
    if (id) {
      setPageLoading(true);
      api.master.commodity
        .get(id)
        .then(function (response) {
          const wh = response.data.rs_body;
          form.setFieldsValue({
            commodity_id: wh.commodity_id,
            name: wh.name,
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

  const handleOnSubmit = (values) => {
    setPageLoading(true);
    const reqBody = {
      commodity_id: values.commodity_id,
      name: values.name,
    };
    if (isEdit) {
      api.master.commodity
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
      api.master.commodity
        .create(reqBody)
        .then(function (response) {
          onSuccess();
          resetForm();
        })
        .catch(function (error) {
          utils.swal.Error({ msg: utils.getErrMsg(error) });
        })
        .finally(function () {
          setPageLoading(false);
        });
    }
  };

  const handleOnSubmitFailed = (errorInfo) => {
    console.log(errorInfo);
  };

  const resetForm = () => {
    form.resetFields();
  };

  if (isEdit && !id) {
    return null;
  }

  return (
    <>
      <SyncOverlay loading={pageLoading} />
      <Form
        form={form}
        name="form-commodity"
        initialValues={{
          remember: false,
        }}
        onFinish={handleOnSubmit}
        onFinishFailed={handleOnSubmitFailed}
        autoComplete="off"
        layout="vertical"
      >
        <Form.Item
          label={t("commodityId")}
          name="commodity_id"
          rules={[
            {
              required: true,
              message: `${t("please")} ${t("input")} ${t("commodityId")}`,
            },
          ]}
        >
          <Input placeholder={`${t("input")} ${t("commodityId")}`} />
        </Form.Item>
        <Form.Item
          label={t("name")}
          name="name"
          rules={[
            {
              required: true,
              message: `${t("please")} ${t("input")} ${t("name")}`,
            },
          ]}
        >
          <Input placeholder={`${t("input")} ${t("name")}`} />
        </Form.Item>
        <Form.Item className="text-right mb-0">
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

export default withRouter(CommodityForm);
