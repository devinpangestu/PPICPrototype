import React, { useState, useEffect, useRef } from "react";
import { withRouter } from "react-router-dom";
import { api } from "api";
import constant from "constant";
import { SyncOverlay } from "components";
import utils from "utils";
import logo from "assets/images/logo_bkp.png";
import { useTranslation } from "react-i18next";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

import { Form, Input, Button, Image, Card } from "antd";
import { Encrypt } from "utils/encryption";
import ReCAPTCHA from "react-google-recaptcha";
import moment from "moment";

function Login(props) {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const recaptchaRef = useRef();
  const [pageLoading, setPageLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [captchaValue, setCaptchaValue] = useState(null);
  useEffect(() => {
    if (sessionStorage.getItem(constant.ACCESS_TOKEN)) {
      localStorage.setItem(constant.ACCESS_TOKEN, sessionStorage.getItem(constant.ACCESS_TOKEN));
    }
    if (utils.getUserInfo()) {
      redirectLogin();
    }
  }, []);

  const handleSubmitClick = (values) => {
    console.log("Success:", { ...values, password: Encrypt(values.password) });
    setPageLoading(true);
    setLoginAttempts((prevAttempts) => prevAttempts + 1);
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
        sessionStorage.setItem(constant.ACCESS_TOKEN, rsBody.access_token);
        if (rsBody.refresh_token) {
          localStorage.setItem(constant.REFRESH_TOKEN, rsBody.refresh_token);
        }
        redirectLogin(setLoginAttempts);
      })
      .catch(function (error) {
        if (captchaValue) {
          recaptchaRef.current.reset();
          localStorage.removeItem(constant.GRECAPTCHA);
          setCaptchaValue(null);
        }
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(() => {
        setPageLoading(false);
      });
  };

  const redirectLogin = (setLoginAttempts) => {
    let redirectTo = "/ppic/dashboard";
    if (!utils.getUserInfo().password_changed) {
      redirectTo = "/change-password";
    } else if (
      moment(utils.getUserInfo().password_changed)
        .add(90, "days")
        .format(constant.FORMAT_API_DATE) < moment().format(constant.FORMAT_API_DATE)
    ) {
      redirectTo = "/change-password";
    } else if (utils.redirectRole(utils.getUserInfo().role.id, 2)) {
      redirectTo = "/ppic/dashboard";
    } else if (utils.redirectRole(utils.getUserInfo().role.id, 3)) {
      redirectTo = "/procurement/dashboard";
    } else if (utils.redirectRole(utils.getUserInfo().role.id, 4)) {
      redirectTo = "/procurement/dashboard";
    } else if (utils.redirectRole(utils.getUserInfo().role.id, 5)) {
      redirectTo = "/supplier/dashboard";
    } else if (utils.redirectRole(utils.getUserInfo().role.id, 6)) {
      redirectTo = "/ppic/dashboard";
    }
    setLoginAttempts && setLoginAttempts(0);
    window.location = import.meta.env.VITE_WEB_BASE_URL + redirectTo;
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const onChangeCaptcha = (value) => {
    setCaptchaValue(value);
    console.log("Captcha value:", value);
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
            {loginAttempts >= 2 && (
              <Form.Item
                name="captcha"
                rules={[{ required: true, message: "Please input the captcha you got!" }]}
                style={{ justifyContent: "center", display: "flex" }}
              >
                {/* Show captcha after 2 or more failed login attempts */}

                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey="6LduxYIpAAAAAFd3ZTmgRkZcQcxmRyKaV2FEVE6U"
                  onChange={onChangeCaptcha}
                />
              </Form.Item>
            )}

            {/* <Form.Item name="remember" valuePropName="checked" className="mb-2">
              <Checkbox>{t("stayLoggedIn")}</Checkbox>
            </Form.Item> */}

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
