import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { PageContainer } from "components/layout";
import { SpinnerOverlay, SyncOverlay } from "components";
import { Row, Col, Input, Form, Table, Button, message, Modal, Tag, Space } from "antd";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import configs from "configs";
import { SearchOutlined } from "@ant-design/icons";
import ModalWarehouseCreate from "./ModalWarehouseCreate";
import ModalWarehouseEdit from "./ModalWarehouseEdit";
import constant from "constant";

const WarehouseView = (props) => {
  const [t] = useTranslation();
  const userInfo = utils.getUserInfo();

  const pageSize = configs.pageSize.master.warehouse;

  const [search, setSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [warehouses, setWarehouses] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  // modal
  const [modalCreateShow, setModalCreateShow] = useState(false);
  const [modalEditShow, setModalEditShow] = useState(false);
  const [modalEditId, setModalEditId] = useState(null);

  useEffect(() => {
    loadWarehouses();
  }, [search, pageNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  const onFinish = (values) => {
    setSearch(values.search);
  };

  const loadWarehouses = () => {
    setTableLoading(true);
    api.master.warehouse
      .list(search, pageSize, pageNumber)
      .then(function (response) {
        const rsBody = response.data.rs_body;
        setWarehouses(rsBody.warehouses);
        setTotalData(rsBody.total);
      })
      .catch(function (error) {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(function () {
        setTableLoading(false);
      });
  };

  const dataSource = [];
  if (warehouses) {
    for (let i = 0; i < warehouses.length; i++) {
      dataSource.push({
        key: i + 1,
        ...warehouses[i],
      });
    }
  }

  const columns = [
    {
      title: t("warehouseId"),
      dataIndex: "warehouse_id",
      key: "warehouse_id",
    },
    {
      title: t("name"),
      dataIndex: "name",
      key: "name",
    },

    {
      title: t("commodities"),
      dataIndex: "cmdts",
      key: "cmdts",
      render: (_, row) => {
        const el = [];
        for (const c of row.cmdts) {
          el.push(<Tag key={c.id}>{c.name}</Tag>);
        }
        return <Space>{el}</Space>;
      },
    },
    {
      title: t("action"),
      dataIndex: "action",
      key: "action",
      render: (_, wh) => {
        return (
          <>
            {utils.renderWithPermission(
              userInfo.permissions,
              <Button
                type="primary"
                className="mr-2"
                onClick={() => {
                  setModalEditShow(true);
                  setModalEditId(wh.id);
                }}
              >
                {t("edit")}
              </Button>,
              // "warehouse@edit",
            )}
            {utils.renderWithPermission(
              userInfo.permissions,
              <Button
                type="danger"
                onClick={() => {
                  Modal.confirm({
                    ...constant.MODAL_CONFIRM_DANGER_PROPS,
                    content: t("swalConfirmDelete", { id: wh.warehouse_id }),
                    onOk: () => {
                      setTableLoading(true);
                      api.master.warehouse
                        .delete(wh.id)
                        .then(function (response) {
                          loadWarehouses();
                          message.success(
                            `${t("warehouse")} ${t("toastSuffixSuccess")} ${t("toastDeleted")}`,
                          );
                        })
                        .catch(function (error) {
                          utils.swal.Error({ msg: utils.getErrMsg(error) });
                        })
                        .finally(function () {
                          setTableLoading(false);
                        });
                    },
                  });
                }}
              >
                {t("delete")}
              </Button>,
              // "warehouse@delete",
            )}
          </>
        );
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
      title={t("warehouse")}
      additionalAction={
        <Button
          size="small"
          onClick={() => {
            setModalCreateShow(true);
          }}
        >
          {`${t("add")} ${t("warehouse")}`}
        </Button>
      }
      breadcrumbs={[
        {
          text: t("config"),
          link: "/config",
        },
        {
          text: t("warehouse"),
          link: "/warehouse",
        },
      ]}
    >
      <SyncOverlay loading={tableLoading} />
      <ModalWarehouseCreate
        setPageLoading={setTableLoading}
        visible={modalCreateShow}
        onCancel={() => {
          setModalCreateShow(false);
        }}
        onSuccess={() => {
          loadWarehouses();
          setModalCreateShow(false);
          message.success(`${t("warehouse")} ${t("toastSuffixSuccess")} ${t("toastCreated")}`);
        }}
      />
      <ModalWarehouseEdit
        setPageLoading={setTableLoading}
        visible={modalEditShow}
        id={modalEditId}
        onCancel={() => {
          setModalEditShow(false);
        }}
        onSuccess={() => {
          loadWarehouses();
          setModalEditShow(false);
          message.success(`${t("warehouse")} ${t("toastSuffixSuccess")} ${t("toastEdited")}`);
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

export default withRouter(WarehouseView);
