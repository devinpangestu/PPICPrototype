import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { api } from "api";
import constant from "constant";
import { SpinnerOverlay, SyncOverlay } from "components";
import utils from "utils";
import logo from "assets/images/logo_bkp.png";
import { useTranslation } from "react-i18next";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

import { Form, Input, Button, Checkbox, Image, Card } from "antd";
import { Encrypt } from "utils/encryption";

function Login(props) {
  const [t] = useTranslation();
  const [form] = Form.useForm();

  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    if (utils.getUserInfo()) {
      redirectLogin();
    }
  }, []);

  const handleSubmitClick = (values) => {
    console.log("Success:", values);
    setPageLoading(true);

    const rqBody = {
      employee_id: values.employee_id,
      password: Encrypt(values.password),
      stay_logged_in: values.stay_logged_in,
    };
    api.auth
      .login(rqBody)
      .then(function (response) {
        const rsBody = response.data.rs_body;
        localStorage.setItem(constant.ACCESS_TOKEN, rsBody.access_token);
        if (rsBody.refresh_token) {
          localStorage.setItem(constant.REFRESH_TOKEN, rsBody.refresh_token);
        }

        redirectLogin();
      })
      .catch(function (error) {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
        setPageLoading(false);
      });
  };

  const redirectLogin = () => {
    let redirectTo = "/ppic/dashboard";
    if (utils.redirectRole(utils.getUserInfo().role.id, 2)) {
      redirectTo = "/ppic/dashboard";
    } else if (utils.redirectRole(utils.getUserInfo().role.id, 3)) {
      redirectTo = "/procurement/dashboard";
    } else if (utils.redirectRole(utils.getUserInfo().role.id, 4)) {
      redirectTo = "/supplier/dashboard";
    }
    window.location = import.meta.env.VITE_WEB_BASE_URL + redirectTo;
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <>
      <SyncOverlay loading={pageLoading} />
      <div className="login-box">
        <Card className="ma-auto" style={{ maxWidth: "400px" }}>
          <Form
            form={form}
            name="form-login"
            initialValues={{
              remember: false,
            }}
            onFinish={handleSubmitClick}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            layout="vertical"
          >
            <div className="text-center mb-6">
              <Image height={30} src={logo} fallback={constant.IMAGE_FALLBACK} preview={false} />
            </div>
            <Form.Item
              label={t("employeeId")}
              name="employee_id"
              rules={[
                {
                  required: true,
                  message: `${t("please")} ${t("input")} ${t("employeeId")}`,
                },
              ]}
            >
              <Input
                placeholder={`${t("input")} ${t("employeeId")}`}
                prefix={<UserOutlined className="site-form-item-icon" />}
              />
            </Form.Item>

            <Form.Item
              label={t("password")}
              name="password"
              rules={[
                {
                  required: true,
                  message: `${t("please")} ${t("input")} ${t("password")}`,
                },
              ]}
            >
              <Input.Password
                placeholder={`${t("input")} ${t("password")}`}
                prefix={<LockOutlined className="site-form-item-icon" />}
              />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked" className="mb-2">
              <Checkbox>{t("stayLoggedIn")}</Checkbox>
            </Form.Item>

            <Form.Item className="text-center mb-0">
              <Button type="primary" htmlType="submit" block>
                {t("login")}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </>
  );
}

export default withRouter(Login);
