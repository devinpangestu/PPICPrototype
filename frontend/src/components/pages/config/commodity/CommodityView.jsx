import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { PageContainer } from "components/layout";
import { SpinnerOverlay, SyncOverlay } from "components";
import { Row, Col, Input, Form, Table, Button, message, Modal } from "antd";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import configs from "configs";
import { SearchOutlined } from "@ant-design/icons";
import ModalCommodityCreate from "./ModalCommodityCreate";
import ModalCommodityEdit from "./ModalCommodityEdit";
import constant from "constant";

const CommodityView = (props) => {
  const [t] = useTranslation();
  const userInfo = utils.getUserInfo();

  const pageSize = configs.pageSize.master.commodity;

  const [search, setSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [commodities, setCommodities] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  // modal
  const [modalCreateShow, setModalCreateShow] = useState(false);
  const [modalEditShow, setModalEditShow] = useState(false);
  const [modalEditId, setModalEditId] = useState(null);

  useEffect(() => {
    loadCommodities();
  }, [search, pageNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  const onFinish = (values) => {
    setSearch(values.search);
  };

  const loadCommodities = () => {
    setTableLoading(true);
    api.master.commodity
      .list(search, pageSize, pageNumber)
      .then(function (response) {
        const rsBody = response.data.rs_body;
        setCommodities(rsBody.commodities);
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
  if (commodities) {
    for (let i = 0; i < commodities.length; i++) {
      dataSource.push({
        key: i + 1,
        ...commodities[i],
      });
    }
  }

  const columns = [
    {
      title: t("commodityId"),
      dataIndex: "commodity_id",
      key: "commodity_id",
    },
    {
      title: t("name"),
      dataIndex: "name",
      key: "name",
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
              // "commodity@edit",
            )}
            {utils.renderWithPermission(
              userInfo.permissions,
              <Button
                type="danger"
                onClick={() => {
                  Modal.confirm({
                    ...constant.MODAL_CONFIRM_DANGER_PROPS,
                    content: t("swalConfirmDelete", { id: wh.commodity_id }),
                    onOk: () => {
                      setTableLoading(true);
                      api.master.commodity
                        .delete(wh.id)
                        .then(function (response) {
                          loadCommodities();
                          message.success(
                            `${t("commodity")} ${t("toastSuffixSuccess")} ${t("toastDeleted")}`,
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
              // "commodity@delete",
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
      title={t("commodity")}
      additionalAction={
        <Button
          size="small"
          onClick={() => {
            setModalCreateShow(true);
          }}
        >
          {`${t("add")} ${t("commodity")}`}
        </Button>
      }
      breadcrumbs={[
        {
          text: t("config"),
          link: "/config",
        },
        {
          text: t("commodity"),
          link: "/commodity",
        },
      ]}
    >
      <SyncOverlay loading={tableLoading} />
      <ModalCommodityCreate
        visible={modalCreateShow}
        onCancel={() => {
          setModalCreateShow(false);
        }}
        onSuccess={() => {
          loadCommodities();
          setModalCreateShow(false);
          message.success(`${t("commodity")} ${t("toastSuffixSuccess")} ${t("toastCreated")}`);
        }}
      />
      <ModalCommodityEdit
        visible={modalEditShow}
        id={modalEditId}
        onCancel={() => {
          setModalEditShow(false);
        }}
        onSuccess={() => {
          loadCommodities();
          setModalEditShow(false);
          message.success(`${t("commodity")} ${t("toastSuffixSuccess")} ${t("toastEdited")}`);
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

export default withRouter(CommodityView);
