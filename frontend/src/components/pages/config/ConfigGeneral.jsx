import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { PageContainer } from "components/layout";
import {
  Row,
  Col,
  Form,
  Card,
  InputNumber,
  Select,
  message,
  Button,
  Typography,
  Divider,
} from "antd";
import { api } from "api";
import { SpinnerOverlay, SyncOverlay, TableNotFoundNotice } from "components";

import { useTranslation } from "react-i18next";
import utils from "utils";
import configs from "configs";
import { Link } from "react-router-dom";

const { Title } = Typography;

const ConfigGeneral = (props) => {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const [pageLoading, setPageLoading] = useState(false);

  const [beforeValMap, setBeforeValMap] = useState({});

  const userInfo = utils.getUserInfo();

  useEffect(() => {
    getMasterConfig();
  }, []);

  const getMasterConfig = () => {
    setPageLoading(true);
    api.master.config
      .list()
      .then(function (response) {
        const rsBody = response.data.rs_body;
        const setF = {};
        for (let i = 0; i < rsBody.length; i++) {
          const el = rsBody[i];
          setF[el.name] = el.value;
        }
        setBeforeValMap({ ...beforeValMap, ...setF });
        form.setFieldsValue(setF);
      })
      .catch(function (error) {
        utils.swal.Error({
          msg: utils.getErrMsg(error),
          cbFn: () => {
            props.history.goBack();
            return;
          },
        });
      })
      .finally(function () {
        setPageLoading(false);
      });
  };

  const handleOnSubmit = (values) => {
    const reqConfigs = [];
    for (const key in values) {
      if (Object.hasOwnProperty.call(values, key)) {
        const val = values[key];
        if (val === beforeValMap[key]) {
          continue;
        }

        const cfg = {
          name: key,
          value: val,
        };
        reqConfigs.push(cfg);
      }
    }

    if (reqConfigs.length === 0) {
      return;
    }

    setPageLoading(true);
    const reqBody = {
      configs: reqConfigs,
    };
    api.master.config
      .edit(reqBody)
      .then(function (response) {
        message.success(`${t("config")} ${t("toastSuffixSuccess")} ${t("updated")}`);
        window.location.reload();
      })
      .catch(function (error) {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(function () {
        setPageLoading(false);
      });
  };

  return (
    <PageContainer
      title={t("config")}
      breadcrumbs={[
        {
          text: t("config"),
          link: "/config",
        },
      ]}
    >
      <SyncOverlay loading={pageLoading} />
      <Row gutter={16} className="mb-4">
        <Col span={12}>
          <Row gutter={16}>
            {utils.renderWithPermission(
              userInfo.permissions,
              <Col span={12}>
                <Link to="/config/warehouse">
                  <Card>
                    <Title level={5} className="text-center mb-0">
                      {t("warehouse")}
                    </Title>
                  </Card>
                </Link>
              </Col>,
              "config@warehouse",
            )}
            {utils.renderWithPermission(
              userInfo.permissions,
              <Col span={12}>
                <Link to="/config/handover-location">
                  <Card>
                    <Title level={5} className="text-center mb-0">
                      {t("handoverLocation")}
                    </Title>
                  </Card>
                </Link>
              </Col>,
              "config@handover_location",
            )}
            {utils.renderWithPermission(
              userInfo.permissions,
              <Col span={12}>
                <Link to="/config/budget-transportir">
                  <Card>
                    <Title level={5} className="text-center mb-0">
                      {t("budgetTransportir")}
                    </Title>
                  </Card>
                </Link>
              </Col>,
              "config@budget_transportir",
            )}
            {utils.renderWithPermission(
              userInfo.permissions,
              <Col span={12}>
                <Link to="/config/commodity">
                  <Card>
                    <Title level={5} className="text-center mb-0">
                      {t("commodity")}
                    </Title>
                  </Card>
                </Link>
              </Col>,
              "config@commodity",
            )}
            {utils.renderWithPermission(
              userInfo.permissions,
              <Col span={12}>
                <Link to="/config/commodity-fee">
                  <Card>
                    <Title level={5} className="text-center mb-0">
                      {t("commodityFee")}
                    </Title>
                  </Card>
                </Link>
              </Col>,
              "config@fee",
            )}
            {utils.renderWithPermission(
              userInfo.permissions,
              <Col span={12}>
                <Link to="/admin/permissions">
                  <Card>
                    <Title level={5} className="text-center mb-0">
                      {t("permissions")}
                    </Title>
                  </Card>
                </Link>
              </Col>,
              "role@view",
              "role@create",
              "role@edit",
              "role@delete",
            )}
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form
                form={form}
                name="form-config"
                onFinish={handleOnSubmit}
                autoComplete="off"
                layout="vertical"
              >
                <Form.Item
                  name="ppn"
                  label={`${t("ppn")}`}
                  rules={[{ required: true, message: `${t("please")} ${t("input")} ${t("ppn")}` }]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder={`${t("input")} ${t("ppn")}`}
                    {...configs.FORM_MONEY_DEFAULT_PROPS}
                  />
                </Form.Item>

                {/* <Form.Item
                  name="unit"
                  label={`${t("unit")}`}
                  rules={[{ required: true, message: `${t("please")} ${t("input")} ${t("unit")}` }]}
                >
                  <Select placeholder={`${t("select")} ${t("unit")}`}>
                    <Select.Option key={"kg"}>kg</Select.Option>
                    <Select.Option key={"mt"}>MT</Select.Option>
                  </Select>
                </Form.Item> */}
                <Form.Item className="text-right">
                  <Button type="primary" htmlType="submit">
                    {t("update")}
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </Col>
        
        {/* <Col span={12}>
          <Title level={5}>{t("changelog")}</Title>
        </Col> */}
      </Row>
    </PageContainer>
  );
};

export default withRouter(ConfigGeneral);
