import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { Row, Col, Form, Button, Input, Checkbox, Divider } from "antd";
import { api } from "api";
import { SpinnerOverlay, SyncOverlay } from "components";
import { useTranslation } from "react-i18next";
import utils from "utils";

const SupplierForm = (props) => {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const { commodities, isEdit, supplierId, onCancel, onSuccess } = props;

  const [pageLoading, setPageLoading] = useState(false);

  const loadSiteIDs = () => {
    const sIDs = [];
    for (let i = 0; i < commodities.length; i++) {
      const c = commodities[i];
      sIDs[i] = {
        commodity_id: c.id,
        site_id: "",
        name: c.name,
      };
      form.setFieldsValue({
        site_ids: sIDs,
      });
    }
  };

  useEffect(() => {
    if (isEdit) {
      getSupplier();
    } else {
      loadSiteIDs();
    }
  }, [supplierId]);

  const getSupplier = () => {
    if (supplierId) {
      setPageLoading(true);
      api.suppliers
        .get(supplierId)
        .then(function (response) {
          const supplier = response.data.rs_body;
          const sIDs = [];
          for (let i = 0; i < commodities.length; i++) {
            const c = commodities[i];
            sIDs[i] = {
              commodity_id: c.id,
              site_id: "",
              name: c.name,
            };
            for (let j = 0; j < supplier.site_ids.length; j++) {
              const s = supplier.site_ids[j];
              if (s.commodity_id === c.id) {
                sIDs[i].site_id = s.site_id;
              }
            }
          }

          form.setFieldsValue({
            supplier_id: supplier.supplier_id,
            name: supplier.name,
            site_ids: sIDs,
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

    const sIds = [];
    for (let i = 0; i < values.site_ids.length; i++) {
      const el = values.site_ids[i];
      if (el.site_id) {
        sIds.push(el);
      }
    }
    const supplier = {
      supplier_id: values.supplier_id,
      site_ids: sIds,
      name: values.name,
    };
    if (isEdit) {
      api.suppliers
        .edit(supplierId, supplier)
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
      api.suppliers
        .create(supplier)
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

  const handleOnSubmitFailed = (errorInfo) => {
    console.log(errorInfo);
  };

  const resetForm = () => {
    form.resetFields();
    loadSiteIDs();
  };

  if (!commodities) {
    return null;
  }

  if (isEdit && !supplierId) {
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
          label={t("supplierId")}
          name="supplier_id"
          rules={[
            {
              required: true,
              message: `${t("please")} ${t("input")} ${t("supplierId")}`,
            },
          ]}
        >
          <Input placeholder={`${t("input")} ${t("supplierId")}`} />
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

        <Form.List name="site_ids">
          {(fields, { add, remove }) => {
            return (
              <Row className="mb-4">
                <Col span={24}>
                  {fields.map(({ key, name, ...restField }) => {
                    let showLabel = false;
                    if (key === 0) {
                      showLabel = true;
                    }

                    if (utils.isMobile()) {
                      showLabel = true;
                    }

                    return (
                      <Row key={key} gutter={12} className="mb-2">
                        <Col>
                          <Form.Item
                            className="mb-0"
                            name={[name, "name"]}
                            {...restField}
                            label={showLabel && t("commodity")}
                          >
                            <Input className={"input-readonly"} readOnly />
                          </Form.Item>
                        </Col>
                        <Col>
                          <Form.Item
                            className="mb-0"
                            name={[name, "site_id"]}
                            {...restField}
                            label={showLabel && t("site_id")}
                          >
                            <Input placeholder={t("site_id")} />
                          </Form.Item>
                        </Col>
                      </Row>
                    );
                  })}
                </Col>
              </Row>
            );
          }}
        </Form.List>

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

export default withRouter(SupplierForm);
