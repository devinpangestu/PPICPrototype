import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { PageContainer } from "components/layout";
import { Row, Col, Form, Button, Input, Modal } from "antd";
import { api } from "api";
import utils from "utils";
import { SpinnerOverlay, SyncOverlay } from "components";
import { useTranslation } from "react-i18next";
import handler from "handler";
import errors from "errors";
import constant from "constant";
import moment from "moment";

const ChangePassword = (props) => {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const [pageLoading, setPageLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const validatePassword = () => {
    // Check if passwords match

    const passwordsMatch = password === confirmPassword;

    if (!passwordsMatch) {
      // Update errors state
      setErrors({
        confirmPassword: !passwordsMatch,
      });
      return false; // Passwords do not match, stop further validation
    } else {
      // Define your password validation criteria
      const regexPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&-_])[A-Za-z\d@$!%*?&-_]{8,}$/;

      // Perform validation
      const isValid = regexPattern.test(password);
      // Update errors state for other password criteria
      setErrors({
        capitalLetter: !/(?=.*[A-Z])/.test(password),
        digit: !/(?=.*\d)/.test(password),
        specialCharacter: !/[@$!%*?&-_]/.test(password),
        length: password.length < 8,
        confirmPassword: !passwordsMatch,
      });

      // Return overall validation status
      return isValid;
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    // Clear errors when the user types
    setErrors({});
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    // Clear errors when the user types
    setErrors({});
  };

  const handleOnSubmit = (values) => {
    setPageLoading(true);

    try {
      if (validatePassword()) {
        // Passwords are valid, proceed with form submission or other actions
        const rqBody = {
          old_password: values.old_password,
          new_password: values.new_password,
          new_password_confirm: values.new_password_confirm,
        };

        api.auth
          .changePassword(rqBody)
          .then(function (response) {
            Modal.success({
              ...constant.MODAL_SUCCESS_DEFAULT_PROPS,
              onOk: () => {
                handler.handleLogoutClick();
              },
            });
          })
          .catch(function (error) {
            utils.swal.Error({ msg: utils.getErrMsg(error) });
          })
          .finally(function () {
            setPageLoading(false);
          });
      } else {
        // Passwords are invalid, display error messages
        utils.swal.Error({ msg: "Passwords are invalid. Please correct errors." });
        console.log("Passwords are invalid. Please correct errors.");
        setPageLoading(false); // Ensure setPageLoading(false) is called in the else block
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      setPageLoading(false); // Ensure setPageLoading(false) is called in case of an exception
    }
  };

  const handleOnSubmitFailed = () => {
    utils.swal.Error({ msg: errors.SomethingWentWrong.get().error_message });
  };

  return (
    <PageContainer
      title={`${t("changePassword")} ${
        !utils.getUserInfo().password_changed
          ? "for new User"
          : moment(utils.getUserInfo().password_changed)
              .add(90, "days")
              .format(constant.FORMAT_API_DATE) < moment().format(constant.FORMAT_API_DATE)
          ? ""
          : "(Password Expired)"
      }`}
    >
      <SyncOverlay loading={pageLoading} />
      <Row>
        <Col xs={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }} xl={{ span: 24 }}>
          <Form
            form={form}
            name="form-login"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
            onFinish={handleOnSubmit}
            onFinishFailed={handleOnSubmitFailed}
            autoComplete="off"
            onPaste={(e) => {
              e.preventDefault();
              alert("Geez! You are not allowed to paste here.");
              return false;
            }}
            onCopy={(e) => {
              e.preventDefault();
              alert("Geez! You are not allowed to Copy here.");
              return false;
            }}
          >
            <Form.Item
              label={t("oldPassword")}
              name="old_password"
              rules={[
                {
                  required: true,
                  message: `${t("please")} ${t("input")} ${t("oldPassword")}`,
                },
              ]}
            >
              <Input.Password placeholder={`${t("input")} ${t("oldPassword")}`} />
            </Form.Item>
            <Form.Item
              label={t("newPassword")}
              name="new_password"
              rules={[
                {
                  required: true,
                  message: `${t("please")} ${t("input")} ${t("newPassword")}`,
                },
              ]}
            >
              <Input.Password
                placeholder={`${t("input")} ${t("newPassword")}`}
                onChange={handlePasswordChange}
              />
            </Form.Item>
            <Form.Item
              label={t("newPasswordConfirm")}
              name="new_password_confirm"
              rules={[
                {
                  required: true,
                  message: `${t("please")} ${t("input")} ${t("newPasswordConfirm")}`,
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("new_password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject("The two passwords do not match");
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder={`${t("input")} ${t("newPasswordConfirm")}`}
                onChange={handleConfirmPasswordChange}
              />
            </Form.Item>
            {errors.confirmPassword && <p>Passwords do not match.</p>}
            {errors.capitalLetter && <p>Must contain at least one capital letter.</p>}
            {errors.digit && <p>Must contain at least one digit.</p>}
            {errors.specialCharacter && <p>Special characters #%^+= not allowed.</p>}
            {errors.length && <p>Must be at least 8 characters long.</p>}
            <Form.Item wrapperCol={{ span: 24 }} className="text-right">
              <Button type="primary" htmlType="submit">
                {t("submit")}
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default withRouter(ChangePassword);
