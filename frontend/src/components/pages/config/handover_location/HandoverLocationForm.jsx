import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { Row, Col, Form, Button, Input } from "antd";
import { api } from "api";
import utils from "utils";
import { SpinnerOverlay, SyncOverlay } from "components";
import { useTranslation } from "react-i18next";
import constant from "constant";

const HandoverLocationForm = (props) => {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const { isEdit, id, onCancel, onSuccess } = props;

  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    if (isEdit) getHandoverLocation();
  }, [id]);

  const getHandoverLocation = () => {
    if (id) {
      setPageLoading(true);
      api.master.handover_location
        .get(id)
        .then(function (response) {
          const loc = response.data.rs_body;
          form.setFieldsValue({
            location_id: loc.location_id,
            name: loc.name,
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
      location_id: values.location_id,
      name: values.name,
    };
    if (isEdit) {
      api.master.handover_location
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
      api.master.handover_location
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
        name="form-login"
        initialValues={{
          remember: false,
        }}
        onFinish={handleOnSubmit}
        onFinishFailed={handleOnSubmitFailed}
        autoComplete="off"
        layout="vertical"
      >
        <Form.Item
          label={t("locationId")}
          name="location_id"
          rules={[
            {
              required: true,
              message: `${t("please")} ${t("input")} ${t("locationId")}`,
            },
          ]}
        >
          <Input placeholder={`${t("input")} ${t("locationId")}`} />
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

export default withRouter(HandoverLocationForm);
