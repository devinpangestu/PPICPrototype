import React, { useState, useEffect } from "react";
import { Link, withRouter } from "react-router-dom";
import { PageContainer } from "components/layout";
import { SpinnerOverlay, SyncOverlay } from "components";
import { Row, Col, Form, Table, Button, Input, message, Modal } from "antd";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import configs from "configs";
import { SearchOutlined } from "@ant-design/icons";
import ModalSupplierCreate from "./ModalSupplierCreate";
import ModalSupplierEdit from "./ModalSupplierEdit";
import constant from "constant";
import RestrictedPage from "RestrictedPage";

const SupplierView = (props) => {
  const [t] = useTranslation();
  const userInfo = utils.getUserInfo();
  const pageSize = configs.pageSize.supplier;

  const [commodities, setCommodities] = useState([]);

  const [search, setSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [suppliers, setSuppliers] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  // modal
  const [modalCreateShow, setModalCreateShow] = useState(false);
  const [modalEditShow, setModalEditShow] = useState(false);
  const [modalEditId, setModalEditId] = useState(null);

  useEffect(() => {
    loadCommodities();
  }, []);

  useEffect(() => {
    loadSuppliers();
  }, [search, pageNumber]);

  const onFinish = (values) => {
    setSearch(values.search);
  };

  const loadCommodities = () => {
    setTableLoading(true);
    api.master.commodity
      .list("", 1000, 1)
      .then(function (response) {
        const rsBody = response.data.rs_body;
        setCommodities(rsBody.commodities);
      })
      .catch(function (error) {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(function () {
        setTableLoading(false);
      });
  };
  const loadSuppliers = () => {
    setTableLoading(true);
    api.suppliers
      .list(search, pageSize, pageNumber)
      .then(function (response) {
        const rsBody = response.data.rs_body;
        console.log(rsBody);
        setTotalData(rsBody.total);
        setSuppliers(rsBody.suppliers);
      })
      .catch(function (error) {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(function () {
        setTableLoading(false);
      });
  };

  const handleOnDelete = (supplierId) => {
    Modal.confirm({
      ...constant.MODAL_CONFIRM_DANGER_PROPS,
      content: t("swalConfirmDelete", { id: supplierId }),
      onOk: () => {
        setTableLoading(true);
        api.suppliers
          .delete(supplierId)
          .then(function (response) {
            loadSuppliers();
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

  if (suppliers) {
    for (let i = 0; i < suppliers.length; i++) {
      const user = suppliers[i];
      dataSource.push({
        key: i + 1,
        ...user,
      });
    }
  }

  const columns = [
    {
      title: t("supplierId"),
      dataIndex: "supplier_id",
      key: "supplier_id",
    },
    {
      title: t("name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("history"),
      dataIndex: "history",
      key: "history",
      render: (_, supplier) => {
        return utils.renderWithPermission(
          userInfo.permissions,
          <Link to={`/history/suppliers/${supplier.supplier_id}`}>
            <Button>{t("history")}</Button>
          </Link>,
          "supplier@view",
        );
      },
    },
    {
      title: t("action"),
      dataIndex: "action",
      key: "action",
      render: (_, supplier) => {
        if (!supplier.super_supplier) {
          return (
            <>
              {utils.renderWithPermission(
                userInfo.permissions,
                <Button
                  type="primary"
                  className="mr-2"
                  onClick={() => {
                    setModalEditShow(true);
                    setModalEditId(supplier.supplier_id);
                  }}
                >
                  {t("edit")}
                </Button>,
                "supplier@edit",
              )}
              {utils.renderWithPermission(
                userInfo.permissions,
                <Button
                  type="danger"
                  onClick={() => {
                    handleOnDelete(supplier.supplier_id);
                  }}
                >
                  {t("delete")}
                </Button>,
                "supplier@delete",
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
  console.log(utils.havePermission(userInfo.permissions, "supplier@view"));
  return utils.havePermission(userInfo.permissions, "supplier@view") ? (
    <>
      <PageContainer
        title={t("supplier")}
        breadcrumbs={[
          {
            text: t("supplier"),
            link: "/suppliers",
          },
        ]}
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
                {`${t("add")} ${t("supplier")}`}
              </Button>,
              "supplier@create",
            )}
          </>
        }
      >
        <SyncOverlay loading={tableLoading} />

        {utils.renderWithPermission(
          userInfo.permissions,
          <ModalSupplierCreate
            commodities={commodities}
            visible={modalCreateShow}
            onCancel={() => {
              setModalCreateShow(false);
            }}
            onSuccess={() => {
              loadSuppliers();
              setModalCreateShow(false);
              message.success(`${t("supplier")} ${t("toastSuffixSuccess")} ${t("toastCreated")}`);
            }}
          />,
          "supplier@create",
          "supplier@view",
        )}

        {utils.renderWithPermission(
          userInfo.permissions,
          <ModalSupplierEdit
            commodities={commodities}
            visible={modalEditShow}
            onCancel={() => {
              setModalEditShow(false);
            }}
            supplierId={modalEditId}
            onSuccess={() => {
              loadSuppliers();
              setModalEditShow(false);
              message.success(`${t("supplier")} ${t("toastSuffixSuccess")} ${t("toastEdited")}`);
            }}
          />,
          "supplier@create",
          "supplier@view",
          "supplier@edit",
        )}

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
    </>
  ) : (
    <>
      <RestrictedPage />
    </>
  );
};

export default withRouter(SupplierView);
