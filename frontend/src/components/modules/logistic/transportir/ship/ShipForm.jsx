import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { Form, Button, InputNumber, Input } from "antd";
import { SpinnerOverlay, SyncOverlay } from "components";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import constant from "constant";
import configs from "configs";

const ShipForm = ({ onCancel, onSuccess, isEdit, transportirId, id, shipName, history }) => {
  const [t] = useTranslation();
  const [form] = Form.useForm();

  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    if (isEdit) getShip();

    if (constant.isDevelopment()) {
      // form.setFieldsValue({
      //   ship_id: "SHIP_1",
      //   name: "SHIP_1",
      //   capacity: 1000,
      // });
    }
    form.setFieldsValue({
      ship_id: shipName,
      name: shipName,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!transportirId) return null;

  const getShip = () => {
    if (id) {
      setPageLoading(true);
      api.logistic.ships
        .get(id)
        .then(function (response) {
          const rsBody = response.data.rs_body;
          form.setFieldsValue({
            ship_id: rsBody.ship_id,
            name: rsBody.name,
            capacity: rsBody.capacity,
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
      transportir_id: transportirId,
      ship_id: values.ship_id,
      name: values.name,
      capacity: values.capacity,
    };
    if (isEdit) {
      api.logistic.ships
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
      api.logistic.ships
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
          name="ship_id"
          label={t("shipId")}
          rules={[
            {
              required: true,
              message: `${t("please")} ${t("input")} ${t("shipId")}`,
            },
          ]}
        >
          <Input placeholder={`${t("input")} ${t("shipId")}`} />
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

        <Form.Item
          name="capacity"
          label={`${t("capacity")}`}
          rules={[{ required: true, message: `${t("please")} ${t("input")} ${t("capacity")}` }]}
          colon={false}
        >
          <InputNumber
            addonAfter={"Kg"}
            style={{ width: "100%" }}
            placeholder={`${t("input")} ${t("capacity")}`}
            {...configs.FORM_MONEY_DEFAULT_PROPS}
          />
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

export default withRouter(ShipForm);
