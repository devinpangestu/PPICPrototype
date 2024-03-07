import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { PageContainer } from "components/layout";
import { SpinnerOverlay, SyncOverlay } from "components";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import configs from "configs";
import { Form, Table, Button, Input, Row, Col, Modal, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import ModalUserCreate from "./ModalUserCreate";
import ModalUserEdit from "./ModalUserEdit";
import constant from "constant";

const UserView = (props) => {
  const [t] = useTranslation();
  const userInfo = utils.getUserInfo();

  const pageSize = configs.pageSize.employee;

  const [search, setSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [users, setUsers] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  // modal
  const [modalCreateShow, setModalCreateShow] = useState(false);
  const [modalEditShow, setModalEditShow] = useState(false);
  const [modalEditId, setModalEditId] = useState(null);

  useEffect(() => {
    loadUsers();
  }, [search, pageNumber]);

  const onFinish = (values) => {
    setSearch(values.search);
  };

  const loadUsers = () => {
    setTableLoading(true);
    api.users
      .list(search, pageSize, pageNumber)
      .then(function (response) {
        const rsBody = response.data.rs_body;
        setUsers(rsBody.users);
        setTotalData(rsBody.total);
      })
      .catch(function (error) {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(function () {
        setTableLoading(false);
      });
  };

  const handleOnDelete = (employeeId) => {
    Modal.confirm({
      ...constant.MODAL_CONFIRM_DANGER_PROPS,
      content: t("swalConfirmDelete", { id: employeeId }),
      onOk: () => {
        setTableLoading(true);
        api.users
          .delete(employeeId)
          .then(function (response) {
            loadUsers();
          })
          .catch(function (error) {
            utils.swal.Error({ msg: utils.getErrMsg(error) });
          })
          .finally(function () {
            setTableLoading(false);
          });
      },
    });
  };

  const handleOnResetPwd = (employeeId) => {
    Modal.confirm({
      ...constant.MODAL_CONFIRM_DANGER_PROPS,
      content: t("swalConfirmResetPwdUser", { userId: employeeId }),
      onOk: () => {
        setTableLoading(true);
        api.users
          .resetPwd(employeeId)
          .then(function (response) {
            Modal.success({
              ...constant.MODAL_SUCCESS_DEFAULT_PROPS,
            });
            loadUsers();
          })
          .catch(function (error) {
            utils.swal.Error({ msg: utils.getErrMsg(error) });
          })
          .finally(function () {
            setTableLoading(false);
          });
      },
    });
  };

  const dataSource = [];

  if (users) {
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      dataSource.push({
        key: i + 1,
        ...user,
      });
    }
  }

  const columns = [
    {
      title: t("employeeId"),
      dataIndex: "user_id",
      key: "user_id",
    },
    {
      title: t("name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("role"),
      dataIndex: "role",
      key: "role",
      render: (role) => {
        return role.desc_;
      },
    },
    {
      title: t("action"),
      dataIndex: "action",
      key: "action",
      render: (_, user) => {
        if (!user.role.super_user) {
          if (user.role.id === constant.ROLE_SUPPLIER) {
            return (
              <>
                <Button
                  className="mr-2"
                  onClick={() => {
                    handleOnResetPwd(user.user_id);
                  }}
                  danger
                >
                  {t("resetPassword")}
                </Button>
                {utils.renderWithPermission(
                  userInfo.permissions,
                  <Button
                    type="danger"
                    onClick={() => {
                      handleOnDelete(user.user_id);
                    }}
                  >
                    {t("delete")}
                  </Button>,
                  "user@delete",
                )}
              </>
            );
          }
          return (
            <>
              <Button
                type="primary"
                className="mr-2"
                onClick={() => {
                  setModalEditShow(true);
                  setModalEditId(user.user_id);
                }}
              >
                {t("edit")}
              </Button>
              <Button
                className="mr-2"
                onClick={() => {
                  handleOnResetPwd(user.user_id);
                }}
                danger
              >
                {t("resetPassword")}
              </Button>

              {utils.renderWithPermission(
                userInfo.permissions,
                <Button
                  type="danger"
                  onClick={() => {
                    handleOnDelete(user.user_id);
                  }}
                >
                  {t("delete")}
                </Button>,
                "user@delete",
              )}
            </>
          );
        }
      },
    },
  ];

  const onTableChange = (pagination, filters, sorter, extra) => {
    setPageNumber(pagination.current);

    console.log("pagination: ", pagination);
    console.log("filters: ", filters);
    console.log("sorter: ", sorter);
    console.log("extra: ", extra);
  };

  return (
    <PageContainer
      title={t("employeeData")}
      additionalAction={
        <>
          {utils.renderWithPermission(
            userInfo.permissions,
            <Button
              size="small"
              onClick={() => {
                setModalCreateShow(true);
              }}
            >
              {`${t("add")} ${t("employee")}`}
            </Button>,
            "user@create",
          )}
        </>
      }
      breadcrumbs={[
        {
          text: t("employeeData"),
          link: "/admin/users",
        },
      ]}
    >
      <SyncOverlay loading={tableLoading} />
      <ModalUserCreate
        visible={modalCreateShow}
        onCancel={() => {
          setModalCreateShow(false);
        }}
        onSuccess={() => {
          loadUsers();
          setModalCreateShow(false);
          message.success(`${t("user")} ${t("toastSuffixSuccess")} ${t("toastCreated")}`);
        }}
      />
      <ModalUserEdit
        visible={modalEditShow}
        onCancel={() => {
          setModalEditShow(false);
        }}
        userId={modalEditId}
        onSuccess={() => {
          loadUsers();
          setModalEditShow(false);
          message.success(`${t("user")} ${t("toastSuffixSuccess")} ${t("toastEdited")}`);
        }}
      />
      <Form className="mb-2 w-100" onFinish={onFinish}>
        <Row gutter={12}>
          <Col xs={{ span: 24 }} md={{ span: 24 }} lg={{ span: 20 }} xl={{ span: 21 }}>
            <Form.Item name="search" className="mb-2">
              <Input
                prefix={<SearchOutlined className="site-form-item-icon" />}
                placeholder={t("searchHere")}
                className="w-100"
              />
            </Form.Item>
          </Col>
          <Col xs={{ span: 24 }} md={{ span: 24 }} lg={{ span: 4 }} xl={{ span: 3 }}>
            <Form.Item className="mb-0">
              <Button type="primary" htmlType="submit" block>
                {t("search")}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={{
          ...configs.TABLE_PAGINATION,
          total: totalData,
          pageSize: pageSize,
        }}
        scroll={configs.TABLE_SCROLL}
        onChange={onTableChange}
      />
    </PageContainer>
  );
};

export default withRouter(UserView);
