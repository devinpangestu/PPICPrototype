import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { Row, Col, Form, Button, Checkbox, Input } from "antd";
import { SpinnerOverlay, SyncOverlay } from "components";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import constant from "constant";

const TransportirForm = ({ isEdit, id, onCancel, onSuccess, history }) => {
  const [t] = useTranslation();
  const [form] = Form.useForm();

  const [pageLoading, setPageLoading] = useState(false);
  const transportirTypeList = constant.TRANSPORTIR_TYPE_LIST;

  useEffect(() => {
    if (isEdit) getTransportir();

    if (constant.isDevelopment()) {
      // form.setFieldsValue({
      //   transportir_id: "TRANSPORTIR_1",
      //   types: ["sea", "land"],
      //   name: "TRANSPORTIR_1",
      // });
    }
  }, [isEdit, id]);

  const getTransportir = () => {
    if (id) {
      setPageLoading(true);
      api.logistic.transportirs
        .get(id)
        .then(function (response) {
          const res = response.data.rs_body;

          form.setFieldsValue({
            transportir_id: res.transportir_id,
            types: res.types,
            name: res.name,
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
    console.log("values");
    console.log(values);
    setPageLoading(true);

    const reqBody = {
      transportir_id: values.transportir_id,
      types: values.types,
      name: values.name,
    };
    if (isEdit) {
      api.logistic.transportirs
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
      api.logistic.transportirs
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
          name="transportir_id"
          label={t("transportirId")}
          rules={[
            {
              required: true,
              message: `${t("please")} ${t("input")} ${t("transportirId")}`,
            },
          ]}
        >
          <Input placeholder={`${t("input")} ${t("transportirId")}`} />
        </Form.Item>
        <Form.Item
          name="types"
          className="mb-2"
          label={t("transportirType")}
          rules={[
            {
              required: true,
              message: t("checkAtLeastOne"),
            },
          ]}
        >
          <Checkbox.Group options={transportirTypeList} />
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

export default withRouter(TransportirForm);
