import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { PageContainer } from "components/layout";
import { SpinnerOverlay, SyncOverlay } from "components";
import { Row, Col, Form, Table, Button, Input, message, Modal } from "antd";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import configs from "configs";
import { SearchOutlined } from "@ant-design/icons";
import ModalHandoverLocationCreate from "./ModalHandoverLocationCreate";
import ModalHandoverLocationEdit from "./ModalHandoverLocationEdit";
import constant from "constant";

const HandoverLocationView = (props) => {
  const [t] = useTranslation();
  const userInfo = utils.getUserInfo();

  const pageSize = configs.pageSize.master.handover_location;

  const [search, setSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [handoverLocations, setHandoverLocations] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  // modal
  const [modalCreateShow, setModalCreateShow] = useState(false);
  const [modalEditShow, setModalEditShow] = useState(false);
  const [modalEditId, setModalEditId] = useState(null);

  useEffect(() => {
    loadHandoverLocations();
  }, [search, pageNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  const onFinish = (values) => {
    setSearch(values.search);
  };

  const loadHandoverLocations = () => {
    setTableLoading(true);
    api.master.handover_location
      .list(search, pageSize, pageNumber)
      .then(function (response) {
        const rsBody = response.data.rs_body;
        setHandoverLocations(rsBody.handover_locations);
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

  if (handoverLocations) {
    for (let i = 0; i < handoverLocations.length; i++) {
      const user = handoverLocations[i];
      dataSource.push({
        key: i + 1,
        ...user,
      });
    }
  }

  const columns = [
    {
      title: t("locationId"),
      dataIndex: "location_id",
      key: "location_id",
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
      render: (_, h) => {
        return (
          <>
            {utils.renderWithPermission(
              userInfo.permissions,
              <Button
                className="mr-2"
                onClick={() => {
                  setModalEditShow(true);
                  setModalEditId(h.id);
                }}
              >
                {t("edit")}
              </Button>,
              // "handover_location@edit",
            )}
            {utils.renderWithPermission(
              userInfo.permissions,
              <Button
                type="danger"
                onClick={() => {
                  Modal.confirm({
                    ...constant.MODAL_CONFIRM_DANGER_PROPS,
                    content: t("swalConfirmDelete", { id: h.location_id }),
                    onOk: () => {
                      setTableLoading(true);
                      api.master.handover_location
                        .delete(h.id)
                        .then(function (response) {
                          loadHandoverLocations();
                          message.success(
                            `${t("handoverLocation")} ${t("toastSuffixSuccess")} ${t(
                              "toastDeleted",
                            )}`,
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
              // "handover_location@delete",
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
      title={t("handoverLocation")}
      additionalAction={
        <Button
          size="small"
          onClick={() => {
            setModalCreateShow(true);
          }}
        >
          {`${t("add")} ${t("handoverLocation")}`}
        </Button>
      }
      breadcrumbs={[
        {
          text: t("config"),
          link: "/config",
        },
        {
          text: t("handoverLocation"),
          link: "/handover-location",
        },
      ]}
    >
      <SyncOverlay loading={tableLoading} />
      <ModalHandoverLocationCreate
        visible={modalCreateShow}
        onCancel={() => {
          setModalCreateShow(false);
        }}
        onSuccess={() => {
          loadHandoverLocations();
          setModalCreateShow(false);
          message.success(
            `${t("handoverLocation")} ${t("toastSuffixSuccess")} ${t("toastCreated")}`,
          );
        }}
      />
      <ModalHandoverLocationEdit
        visible={modalEditShow}
        onCancel={() => {
          setModalEditShow(false);
        }}
        id={modalEditId}
        onSuccess={() => {
          loadHandoverLocations();
          setModalEditShow(false);
          message.success(
            `${t("handoverLocation")} ${t("toastSuffixSuccess")} ${t("toastEdited")}`,
          );
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

export default withRouter(HandoverLocationView);
