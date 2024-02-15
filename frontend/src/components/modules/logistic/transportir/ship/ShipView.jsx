import React, { useState, useEffect } from "react";
import { Link, withRouter } from "react-router-dom";
import { PageContainer } from "components/layout";
import { SpinnerOverlay, SyncOverlay, TableNotFoundNotice } from "components";
import { Row, Col, Space, Form, Table, Button, Descriptions, Input, Modal, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import configs from "configs";
import constant from "constant";
import qs from "query-string";
import ModalImportCSV from "./ModalImportCSV";
import moment from "moment";
import { getTypesTags } from "../common";
import ModalCreate from "./ModalCreate";
import ModalEdit from "./ModalEdit";
import { SectionHeading } from "components/Section";

const TransportirShipView = (props) => {
  const [t] = useTranslation();
  const userInfo = utils.getUserInfo();
  const queryString = qs.parse(props.location.search);
  const qSearch = queryString.search ? queryString.search : "";

  const pageSize = configs.pageSize.logistic.transportir;

  const [search, setSearch] = useState(qSearch ? qSearch : "");
  const [pageNumber, setPageNumber] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const [transportir, setTransportir] = useState(null);
  const [ships, setShips] = useState([]);

  const [tableLoading, setTableLoading] = useState(false);
  const [modalImportCSVShow, setModalImportCSVShow] = useState(false);

  const [modalCreateShow, setModalCreateShow] = useState(false);
  const [modalEditShow, setModalEditShow] = useState(false);
  const [modalEditId, setModalEditId] = useState(null);

  useEffect(() => {
    loadShips();
  }, [search, pageNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isNaN(props.match.params.id)) return props.history.goBack();

  const transportirId = Number(props.match.params.id);

  const loadShips = () => {
    setTableLoading(true);

    api.logistic.ships
      .list(transportirId, search, pageSize, pageNumber)
      .then(function (response) {
        const rsBody = response.data.rs_body;
        if (
          !rsBody.transportir ||
          (!rsBody.transportir.types.includes(constant.TRANSPORTIR_TYPE_SHIP) &&
            !rsBody.transportir.types.includes(constant.TRANSPORTIR_TYPE_SEA_20231013))
        )
          return props.history.goBack();

        setTransportir(rsBody.transportir);
        setShips(rsBody.ships);
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
  if (ships) {
    for (let i = 0; i < ships.length; i++) {
      const d = ships[i];

      dataSource.push({
        key: i + 1,
        ...d,
      });
    }
  }

  const columns = [
    {
      title: t("shipId"),
      dataIndex: "ship_id",
      key: "ship_id",
    },
    {
      title: t("name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("capacity"),
      dataIndex: "capacity",
      key: "capacity",
      render: (val) => utils.thousandSeparator(val),
    },
    {
      title: t("history"),
      dataIndex: "history",
      key: "history",
      render: (_, row) => {
        return utils.renderWithPermission(
          userInfo.permissions,
          <Link to={`/logistic/transportir/${transportir.id}/ship/${row.id}/history`}>
            <Button>{t("history")}</Button>
          </Link>,
          // "transportir@view",
        );
      },
    },
    {
      title: t("action"),
      dataIndex: "action",
      key: "action",
      render: (_, row) => {
        return (
          <Space>
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
              // "transportir@edit",
            )}
            {utils.renderWithPermission(
              userInfo.permissions,
              <Button
                type="danger"
                onClick={() => {
                  Modal.confirm({
                    ...constant.MODAL_CONFIRM_DANGER_PROPS,
                    content: t("swalConfirmDelete", { id: row.name }),
                    onOk: () => {
                      setTableLoading(true);
                      api.logistic.ships
                        .delete(row.id)
                        .then(function (response) {
                          loadShips();
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
              // "transportir@delete",
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
    <PageContainer>
      <SyncOverlay loading={tableLoading} />
      <ModalImportCSV
        visible={modalImportCSVShow}
        onCancel={() => setModalImportCSVShow(false)}
        onSuccess={() => {
          setModalImportCSVShow(false);
          loadShips();
          message.success(`${t("ship")} ${t("toastSuffixSuccess")} ${t("toastImported")}`);
        }}
        transportirId={transportirId}
        id={transportirId}
      />
      <ModalCreate
        visible={modalCreateShow}
        onCancel={() => {
          setModalCreateShow(false);
        }}
        onSuccess={() => {
          loadShips();
          setModalCreateShow(false);
          message.success(`${t("ship")} ${t("toastSuffixSuccess")} ${t("toastCreated")}`);
        }}
        transportirId={transportirId}
      />
      <ModalEdit
        visible={modalEditShow}
        onCancel={() => {
          setModalEditShow(false);
        }}
        onSuccess={() => {
          loadShips();
          setModalEditShow(false);
          message.success(`${t("ship")} ${t("toastSuffixSuccess")} ${t("toastEdited")}`);
        }}
        transportirId={transportirId}
        id={modalEditId}
      />

      {transportir && (
        <>
          <Row className="mb-6">
            <Col span={12}>
              <SectionHeading title={t("transportirDetail")} withDivider />
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="ID">{transportir.transportir_id}</Descriptions.Item>
                <Descriptions.Item label="Name">{transportir.name}</Descriptions.Item>
                <Descriptions.Item label="Types">
                  {getTypesTags(transportir.types)}
                </Descriptions.Item>
                <Descriptions.Item label="Created At">
                  {moment(transportir.created_at).format(constant.FORMAT_DISPLAY_DATETIME)}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
          <SectionHeading
            withDivider
            title={t("ships")}
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
                      {`${t("add")} ${t("ship")}`}
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
                  "logistic_transportir_ship@create",
                )}
              </>
            }
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
          {ships && ships.length > 0 ? (
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
        </>
      )}
    </PageContainer>
  );
};

export default withRouter(TransportirShipView);
