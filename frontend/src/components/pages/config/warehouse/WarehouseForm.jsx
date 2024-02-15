import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { Row, Col, Form, Button, Input, Select, Checkbox } from "antd";
import { api } from "api";
import { SpinnerOverlay, SyncOverlay } from "components";
import { useTranslation } from "react-i18next";
import utils from "utils";
import configs from "configs";

const WarehouseForm = (props) => {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const { commodities, isEdit, id, onCancel, onSuccess } = props;

  const [pageLoading, setPageLoading] = useState(false);

  const getWarehouse = () => {
    if (id) {
      setPageLoading(true);
      api.master.warehouse
        .get(id)
        .then(function (response) {
          const wh = response.data.rs_body;
          const cIds = [];
          for (let i = 0; i < wh.cmdts.length; i++) {
            const c = wh.cmdts[i];
            cIds.push(c.id);
          }
          form.setFieldsValue({
            warehouse_id: wh.warehouse_id,
            name: wh.name,
            commodities: cIds,
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

  useEffect(() => {
    if (isEdit) getWarehouse();
  }, [id]);

  if (!commodities || (commodities && commodities.length === 0)) {
    return null;
  }
  const handleOnSubmit = (values) => {
    setPageLoading(true);
    const reqBody = {
      warehouse_id: values.warehouse_id,
      name: values.name,
      commodities: values.commodities,
    };
    if (isEdit) {
      api.master.warehouse
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
      api.master.warehouse
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
        name="form-warehouse"
        initialValues={{
          remember: false,
        }}
        onFinish={handleOnSubmit}
        onFinishFailed={handleOnSubmitFailed}
        autoComplete="off"
        layout="vertical"
      >
        <Form.Item
          label={t("warehouseId")}
          name="warehouse_id"
          rules={[
            {
              required: true,
              message: `${t("please")} ${t("input")} ${t("warehouseId")}`,
            },
          ]}
        >
          <Input placeholder={`${t("input")} ${t("warehouseId")}`} />
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
          label={t("commodities")}
          name="commodities"
          rules={[
            {
              required: true,
              message: `${t("please")} ${t("input")} ${t("commodities")}`,
            },
          ]}
        >
          <Checkbox.Group>
            <Row>
              {commodities.map((el) => {
                return (
                  <Col span={24}>
                    <Checkbox value={el.value}>{el.label}</Checkbox>
                  </Col>
                );
              })}
            </Row>
          </Checkbox.Group>
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

export default withRouter(WarehouseForm);
