import React, { useState, useEffect } from "react";
import { Link, withRouter } from "react-router-dom";
import { PageContainer } from "components/layout";
import { SpinnerOverlay, SyncOverlay, TableNotFoundNotice } from "components";
import { Row, Col, Form, Table, Button, Input, Tag, Space, message, Modal, DatePicker } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import configs from "configs";
import constant from "constant";
import qs from "query-string";
import ModalImportCSV from "components/modules/logistic/transportir/ModalImportCSV";
import ModalCreate from "./ModalCreate";
import ModalEdit from "./ModalEdit";
import { getTypesTags } from "./common";

const TransportirView = (props) => {
  const [t] = useTranslation();
  const userInfo = utils.getUserInfo();
  const queryString = qs.parse(props.location.search);
  const qSearch = queryString.search ? queryString.search : "";

  const pageSize = configs.pageSize.logistic.transportir;

  const [search, setSearch] = useState(qSearch ? qSearch : "");
  const [pageNumber, setPageNumber] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [transportirs, setTransportirs] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [modalImportCSVShow, setModalImportCSVShow] = useState(false);

  // modal
  const [modalCreateShow, setModalCreateShow] = useState(false);
  const [modalEditShow, setModalEditShow] = useState(false);
  const [modalEditId, setModalEditId] = useState(null);

  useEffect(() => {
    loadTransportirs();
  }, [search, pageNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTransportirs = () => {
    setTableLoading(true);

    api.logistic.transportirs
      .list(search, pageSize, pageNumber)
      .then(function (response) {
        const rsBody = response.data.rs_body;
        setTransportirs(rsBody.transportirs);
        setTotalData(rsBody.total);
      })
      .catch(function (error) {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(function () {
        setTableLoading(false);
      });
  };

  const handleOnDelete = (transportirId) => {
    Modal.confirm({
      ...constant.MODAL_CONFIRM_DANGER_PROPS,
      content: t("swalConfirmDelete", { transportirName: transportirId }),
      onOk: () => {
        setTableLoading(true);
        api.logistic.transportirs
          .delete(transportirId)
          .then(function (response) {
            loadTransportirs();
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
  if (transportirs) {
    for (let i = 0; i < transportirs.length; i++) {
      const d = transportirs[i];

      let haveShip = false;
      for (let i = 0; i < d.types.length; i++) {
        const tType = d.types[i];

        if (
          tType === constant.TRANSPORTIR_TYPE_SEA_20231013 ||
          tType === constant.TRANSPORTIR_TYPE_SHIP
        ) {
          haveShip = true;
          break;
        }
      }
      dataSource.push({
        key: i + 1,
        ...d,
        haveShip: haveShip,
      });
    }
  }

  const columns = [
    {
      title: t("transportirId"),
      dataIndex: "transportir_id",
      key: "transportir_id",
    },
    {
      title: t("types"),
      dataIndex: "types",
      key: "types",
      render: (_, row) => {
        return getTypesTags(row.types);
      },
    },
    {
      title: t("name"),
      dataIndex: "name",
      key: "name",
    },
    // {
    //   title: t("history"),
    //   dataIndex: "history",
    //   key: "history",
    //   render: (_, row) => {
    //     return utils.renderWithPermission(
    //       userInfo.permissions,
    //       <Link to={`/logistic/transportir/history/${row.id}`}>
    //         <Button>{t("history")}</Button>
    //       </Link>,
    //       // "transportir@view",
    //     );
    //   },
    // },
    {
      title: t("action"),
      dataIndex: "action",
      key: "action",
      render: (_, row) => {
        let shipBtnProps = {};
        if (!row.haveShip) {
          shipBtnProps.style = { opacity: "0", pointerEvents: "none" };
        } else {
          shipBtnProps.to = `/logistic/transportir/${row.id}/ship`;
          shipBtnProps.target = "_blank";
          shipBtnProps.rel = "noopener noreferrer";
        }

        return (
          <Space>
            {utils.renderWithPermission(
              userInfo.permissions,
              <Link {...shipBtnProps}>
                <Button>{t("viewShips")}</Button>
              </Link>,
              "logistic_transportir_ship@view",
            )}

            {utils.renderWithPermission(
              userInfo.permissions,
              <Button
                type="primary"
                onClick={() => {
                  setModalEditId(row.id);
                  setModalEditShow(true);
                }}
              >
                {t("edit")}
              </Button>,
              "logistic_transportir@edit",
            )}
            {utils.renderWithPermission(
              userInfo.permissions,
              <Button
                type="danger"
                onClick={() => {
                  handleOnDelete(row.id);
                }}
              >
                {t("delete")}
              </Button>,
              "logistic_transportir@delete",
            )}
          </Space>
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
      title={t("transportir")}
      additionalAction={
        <>
          {utils.renderWithPermission(
            userInfo.permissions,
            <Space>
              <Button
                size="small"
                onClick={() => {
                  setModalCreateShow(true);
                }}
              >
                {`${t("add")} ${t("transportir")}`}
              </Button>
              <Button
                size="small"
                onClick={() => {
                  setModalImportCSVShow(true);
                }}
              >
                {t("importFromCSV")}
              </Button>
            </Space>,
            "logistic_transportir@create",
          )}
        </>
      }
    >
      <ModalImportCSV
        visible={modalImportCSVShow}
        onCancel={() => setModalImportCSVShow(false)}
        setPageLoading={setTableLoading}
        onSuccess={() => {
          loadTransportirs();
          setModalImportCSVShow(false);
          message.success(`${t("transportir")} ${t("toastSuffixSuccess")} ${t("toastImported")}`);
        }}
      />
      <ModalCreate
        visible={modalCreateShow}
        onCancel={() => {
          setModalCreateShow(false);
        }}
        onSuccess={() => {
          loadTransportirs();
          setModalCreateShow(false);
          message.success(`${t("transportir")} ${t("toastSuffixSuccess")} ${t("toastCreated")}`);
        }}
      />
      <ModalEdit
        visible={modalEditShow}
        onCancel={() => {
          setModalEditShow(false);
        }}
        id={modalEditId}
        onSuccess={() => {
          loadTransportirs();
          setModalEditShow(false);
          message.success(`${t("transportir")} ${t("toastSuffixSuccess")} ${t("toastEdited")}`);
        }}
      />
      <Form
        className="mb-2 w-100"
        onFinish={(values) => {
          console.log("values");
          console.log(values);
          const formSearch = values.search;
          if (formSearch) {
            props.history.push({ search: qs.stringify({ search: formSearch }) });
          } else {
            props.history.push({ search: "" });
          }
          setPageNumber(1);
          setSearch(formSearch);
        }}
      >
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
      <SyncOverlay loading={tableLoading} />
      {transportirs && transportirs.length > 0 ? (
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
      ) : (
        <TableNotFoundNotice />
      )}
    </PageContainer>
  );
};

export default withRouter(TransportirView);
