import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { Row, Col, Form, Button, Input, Select, InputNumber } from "antd";
import { api } from "api";
import utils from "utils";
import { SpinnerOverlay, SyncOverlay } from "components";
import { useTranslation } from "react-i18next";
import constant from "constant";
import configs from "configs";

const ShipmentBudgetForm = ({
  isEdit,
  id,
  onCancel,
  onSuccess,
  // ShipmentBudgets,
  handoverLocations,
  destinationLocations,
}) => {
  const [t] = useTranslation();
  const [form] = Form.useForm();

  const [pageLoading, setPageLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    types: "",
  });

  const handleSelectChange = (value) => {
    setFormValues({ ...formValues, types: value });
  };

  useEffect(() => {
    if (isEdit) getShipmentBudget();
  }, [id]);

  const getShipmentBudget = () => {
    if (id) {
      setPageLoading(true);
      api.master.shipmentBudgets
        .get(id)
        .then(function (response) {
          const rsBody = response.data.rs_body;
          form.setFieldsValue({
            types: rsBody.types,
            handover_location: Number(rsBody.handover_location_id),
            destination_location: Number(rsBody.destination_location_id),
            budget: rsBody.budget,
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
      types: values.types,
      handover_location_id: Number(values.handover_location),
      destination_location_id: Number(values.destination_location),
      budget: values.budget,
    };
    if (isEdit) {
      api.master.shipmentBudgets
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
      api.master.shipmentBudgets
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

  const handleOnSubmitFailed = (errorInfo) => {};

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
        initialValues={{
          remember: false,
        }}
        onFinish={handleOnSubmit}
        onFinishFailed={handleOnSubmitFailed}
        autoComplete="off"
        layout="vertical"
      >
        <Row>
          <Col xs={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }} xl={{ span: 24 }}>
            <Form.Item
              name="types"
              label={`${t("types")}`}
              rules={[{ required: true, message: `${t("required")}` }]}
            >
              <Select
                showSearch
                placeholder={`${t("select")} ${t("types")}`}
                {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                options={constant.SHIPMENT_TYPE_LIST}
                onChange={handleSelectChange}
              />
            </Form.Item>

            <Form.Item
              name="handover_location"
              label={t("handoverLocation")}
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

            <Form.Item
              name="destination_location"
              label={t("destinationLocation")}
              rules={[
                {
                  required: true,
                  message: `${t("please")} ${t("select")} ${t("destinationLocation")}`,
                },
              ]}
            >
              <Select
                showSearch
                placeholder={`${t("select")} ${t("destinationLocation")}`}
                {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                options={destinationLocations}
              />
            </Form.Item>
            <Form.Item
              name="budget"
              label={`${t("budget")}`}
              rules={[{ required: true, message: `${t("please")} ${t("input")} ${t("budget")}` }]}
              labelCol={{ span: 4 }}
            >
              <InputNumber
                addonBefore={"Rp"}
                addonAfter={"/Kg"}
                style={{ width: "100%" }}
                placeholder={`${t("input")} ${t("budget")}`}
                {...configs.FORM_MONEY_DEFAULT_PROPS}
              />
            </Form.Item>
            {/* <Form.Item
              name="warehouse"
              label={t("warehouse")}
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
                options={destinationLocations}
              />
            </Form.Item> */}

            {/* <Form.Item
              name="handover_location"
              label={t("handoverLocation")}
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
              
            <Form.Item
              name="warehouse"
              label={t("warehouse")}
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
              
            <Form.Item
              name="budget"
              label={`${t("budget")}`}
              rules={[{ required: true, message: `${t("please")} ${t("input")} ${t("budget")}` }]}
              labelCol={{ span: 4 }}
            >
              <InputNumber
                addonBefore={"Rp"}
                addonAfter={"/Kg"}
                style={{ width: "100%" }}
                placeholder={`${t("input")} ${t("budget")}`}
                {...configs.FORM_MONEY_DEFAULT_PROPS}
              />
            </Form.Item> */}

            <Form.Item wrapperCol={{ span: 24 }} className="text-right mb-0">
              <Button type="secondary" className="mr-2" onClick={onCancel}>
                {t("cancel")}
              </Button>
              <Button type="primary" htmlType="submit">
                {t("submit")}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default withRouter(ShipmentBudgetForm);
