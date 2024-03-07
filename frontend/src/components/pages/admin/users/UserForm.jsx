import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { Row, Col, Form, Button, Input, Select, Modal } from "antd";
import { api } from "api";
import utils from "utils";
import handler from "handler";
import { SpinnerOverlay, SyncOverlay } from "components";
import { useTranslation } from "react-i18next";
import constant from "constant";

const UserForm = ({ isEdit, userId, onCancel, onSuccess }) => {
  const [t] = useTranslation();
  const [form] = Form.useForm();

  const [pageLoading, setPageLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [purchasingValue, setPurchasingValue] = useState(false);
  useEffect(() => {
    handler.getRoles(setPageLoading, setRoles);
  }, []);

  useEffect(() => {
    if (roles && roles.length > 0 && isEdit) getUser();
  }, [roles, userId]);

  const getUser = () => {
    if (userId) {
      setPageLoading(true);
      api.users
        .get(userId)
        .then(function (response) {
          const user = response.data.rs_body;
          console.log(user);
          user.role.id === constant.ROLE_PURCHASING
            ? setPurchasingValue(true)
            : setPurchasingValue(false);
          form.setFieldsValue({
            role: roles.find((el) => el.value === user.role.id).value,
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            oracle_username: user.oracle_username,
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

    const user = {
      user_id: values.user_id,
      role_id: values.role,
      name: values.name,
      email: values.email,
    };
    if (isEdit) {
      api.users
        .edit(userId, user)
        .then(function (response) {
          onSuccess();
          Modal.success({
            ...constant.MODAL_SUCCESS_DEFAULT_PROPS,
            onOk: () => {
              onCancel();
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
      api.users
        .create(user)
        .then(function (response) {
          onSuccess();
          resetForm();
          Modal.success({
            ...constant.MODAL_SUCCESS_DEFAULT_PROPS,
            onOk: () => {
              onCancel();
            },
          });
        })
        .catch(function (error) {
          utils.swal.Error({ msg: utils.getErrMsg(error) });
        })
        .finally(function () {
          setPageLoading(false);
        });
    }
  };

  const resetForm = () => {
    form.resetFields();
  };

  if (isEdit && !userId) {
    return null;
  }

  return (
    <>
      <SyncOverlay loading={pageLoading} />
      <Form
        form={form}
        onFinish={handleOnSubmit}
        autoComplete="off"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 20 }}
      >
        <Row>
          <Col xs={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }} xl={{ span: 24 }}>
            <Form.Item
              label={t("employeeId")}
              name="user_id"
              rules={[
                {
                  required: true,
                  message: `${t("please")} ${t("input")} ${t("employeeId")}`,
                },
              ]}
            >
              <Input placeholder={`${t("input")} ${t("employeeId")}`} />
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
              label="Role"
              name="role"
              rules={[
                {
                  required: true,
                  message: `${t("please")} ${t("select")} ${t("role")}`,
                },
              ]}
            >
              <Select
                placeholder={`${t("select")} ${t("role")}`}
                options={roles}
                onChange={(value) => {
                  setPurchasingValue(value === constant.ROLE_PURCHASING);
                }}
              />
            </Form.Item>
            {purchasingValue && (
              <Form.Item
                label="Oracle Username"
                name="oracle_username"
                rules={[
                  {
                    required: true,
                    message: `${t("please")} ${t("select")} ${t("oracleUsername")}`,
                  },
                ]}
              >
                <Input placeholder={`${t("input")} ${t("oracleUsername")}`} />
              </Form.Item>
            )}
            <Form.Item
              label={t("Email")}
              name="email"
              rules={[
                {
                  required: false,
                  message: `${t("please")} ${t("input")} ${t("email")}`,
                },
              ]}
            >
              <Input placeholder={`${t("input")} ${t("email")}`} />
            </Form.Item>

            <Form.Item wrapperCol={{ span: 24 }} className="mb-0 text-right">
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

export default withRouter(UserForm);
