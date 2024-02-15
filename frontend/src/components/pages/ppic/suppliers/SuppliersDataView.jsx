import React, { useState, useEffect, useCallback } from "react";
import { withRouter } from "react-router-dom";
import { PageContainer } from "components/layout";
import {
  Modal,
  Row,
  Col,
  Form,
  Table,
  Button,
  Input,
  Tag,
  DatePicker,
  Select,
  Space,
  message,
  Checkbox,
  Typography,
  Card,
} from "antd";
import { CheckCircleTwoTone, CloseCircleTwoTone } from "@ant-design/icons";
import { SectionHeading, SyncOverlay, TableNotFoundNotice } from "components";
import ModalExport from "components/ModalExport";
import { api } from "api";
import { useTranslation } from "react-i18next";
import configs from "configs";
import utils from "utils";
// import ModalImportCSV from "./modal/ModalImportCSV";
import moment from "moment";
import constant from "constant";
import handler from "handler";
// import ModalSplitSchedule from "./modal/ModalSplitSchedule";

const SuppliersDataView = (props) => {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const userInfo = utils.getUserInfo();

  const centerCol = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  const pageSize = configs.pageSize.ppic.suppliers;

  const transportirId = props.match.params.transportir_id;
  const shipId = props.match.params.ship;
  const [offers, setOffers] = useState([]);
  const [currPage, setCurrPage] = useState(1);
  const [currPageSize, setCurrPageSize] = useState(pageSize);
  const [suppliers, setSuppliers] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [totalData, setTotalData] = useState(0);
  const [search, setSearch] = useState("");
  const [filterValue, setFilterValue] = useState({});
  const [tableLoading, setTableLoading] = useState(false);
  const [modalImportCSVShow, setModalImportCSVShow] = useState(false);
  const [modalCreateShow, setModalCreateShow] = useState(false);
  const [modalEditShow, setModalEditShow] = useState(false);
  const [modalEditId, setModalEditId] = useState(null);
  const [modalSplitScheduleShow, setModalSplitScheduleShow] = useState(false);
  const [modalSplitScheduleData, setModalSplitScheduleData] = useState(null);
  const [previewRowChecked, setPreviewRowChecked] = useState(Array(offers.length).fill(true));

  useEffect(() => {
    loadSuppliers();
  }, [search, filterValue]);

  useEffect(() => {
    handler.getSuppliersOptionList(setTableLoading, setSupplierOptions);
  }, []);
  const applyFilter = (values) => {
    if (!values) {
      return;
    }

    let newFilterValue = {};
    if (values.ref_id) {
      newFilterValue.ref_id = values.ref_id;
    }

    setFilterValue(newFilterValue);
  };
  const resetFilter = () => {
    form.resetFields();
    setFilterValue({});
  };
  const loadSuppliers = () => {
    setTableLoading(true);
    api.ppicSuppliers
      .list(pageSize, 1, null, filterValue)
      .then(function (response) {
        const rsBody = response.data.rs_body;
        setSuppliers(rsBody.suppliers);
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
  if (suppliers && suppliers.length > 0) {
    for (let i = 0; i < suppliers.length; i++) {
      const d = suppliers[i];
      dataSource.push({
        key: i + 1,
        ...d,
      });
    }
  }
  const columns = [
    {
      title: t("supplierName"),
      dataIndex: "supplier_name",
      key: "supplier_name",
      width: 270,
      render: (_, row) => {
        return <Typography.Text>{row.name}</Typography.Text>;
      },
    },
    {
      title: t("Email"),
      dataIndex: "email",
      key: "email",
      width: 200,
      render: (_, row) => {
        return <Typography.Text style={{ maxWidth: 300 }}>{row.email}</Typography.Text>;
      },
    },
    {
      title: () => {
        return <Typography.Text style={centerCol}>{"Request Status"}</Typography.Text>;
      },
      dataIndex: "user_status",
      key: "user_status",
      width: 150,
      render: (_, row) => {
        return (
          <Typography.Text style={centerCol}>
            {row.user_status ? (
              <CheckCircleTwoTone twoToneColor="#52c41a" />
            ) : (
              <CloseCircleTwoTone twoToneColor="#eb2f96" />
            )}
          </Typography.Text>
        );
      },
    },
    {
      title: () => {
        return <Typography.Text style={centerCol}>{"Verified Status"}</Typography.Text>;
      },
      dataIndex: "verified_status",
      key: "verified_status",
      width: 150,
      render: (_, row) => {
        return (
          <Typography.Text style={centerCol}>
            {row.verified_status ? (
              <CheckCircleTwoTone twoToneColor="#52c41a" />
            ) : (
              <CloseCircleTwoTone twoToneColor="#eb2f96" />
            )}
          </Typography.Text>
        );
      },
    },
    {
      title: () => {
        return <Typography.Text style={centerCol}>{t("action")}</Typography.Text>;
      },
      dataIndex: "action",
      key: "action",
      fixed: "right",
      align: "center",
      render: (_, row) => {
        const showButton =
          (!row.user_status && !row.verified_status) || (row.user_status && !row.verified_status);
        if (!showButton) return null;
        return (
          <>
            <div>
              <Button
                type="primary"
                onClick={() => {
                  Modal.confirm({
                    ...constant.MODAL_SUCCESS_DEFAULT_PROPS,
                    content: `Create User & Send Email to ${row.name} ?`,
                    onOk: async () => {
                      setTableLoading(true);
                      await api.ppicSuppliers
                        .createUserAndSendEmail(row.id)
                        .then((res) => {
                          message.success(`Create User Request Sent to ${row.email}`);
                          loadSuppliers();
                          handler.getSuppliersOptionList(setTableLoading, setSupplierOptions);
                        })
                        .catch((err) => {
                          utils.swal.Error({ msg: utils.getErrMsg(err) });
                        })
                        .finally(() => {
                          setTableLoading(false);
                        });
                    },
                  });

                  // setModalSplitScheduleData(row);
                  // setModalSplitScheduleShow(true);
                }}
                style={{
                  maxWidth: "200px", // Set your desired maximum width
                  whiteSpace: "normal", // Allow text to wrap
                }}
              >
                {t("Create User & Send Email")}
              </Button>
            </div>
          </>
        );
      },
    },
  ];
  return (
    <PageContainer
      title={t("Supplier Data View")}
      additionalAction={
        <>
          {utils.renderWithPermission(
            userInfo.permissions,
            <Space>
              <Button
                size="small"
                onClick={() => {
                  Modal.confirm({
                    ...constant.MODAL_SUCCESS_DEFAULT_PROPS,
                    content: `Refresh New Supplier Data ?`,
                    onOk: async () => {
                      setTableLoading(true);
                      await api.ppicSuppliers
                        .refresh_suppliers()
                        .then((res) => {
                          message.success("Success");
                          loadSuppliers();
                          handler.getSuppliersOptionList(setTableLoading, setSupplierOptions);
                        })
                        .catch((err) => {
                          utils.swal.Error({ msg: utils.getErrMsg(err) });
                        })
                        .finally(() => {
                          setTableLoading(false);
                        });
                    },
                  });
                }}
              >
                {`${t("Refresh")} ${t("supplier")} ${t("data")}`}
              </Button>
            </Space>,
            "ppic@create",
          )}
        </>
      }
    >
      <SyncOverlay loading={tableLoading} />
      <Row gutter={16}>
        <Col xs={24} lg={24} xl={24}>
          <Card size="small">
            <SectionHeading title={"Filter"} withDivider />
            <Form form={form} onFinish={applyFilter} layout="vertical" className="form-filter">
              {/* <Form.Item className="mb-1" label={t("searchPO")} name="search_PO">
                <Input placeholder={t("searchPO")} />
              </Form.Item>
              <Form.Item className="mb-1" label={t("transactionDate")} name="transaction_date">
                <DatePicker.RangePicker
                  style={{ width: "100%" }}
                  {...utils.FORM_RANGEPICKER_PROPS}
                />
              </Form.Item> */}
              <Form.Item className="mb-1" label={t("supplier")} name="ref_id">
                <Select
                  showSearch
                  placeholder={t("select")}
                  options={supplierOptions}
                  {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                />
              </Form.Item>

              <Form.Item className="text-right mt-4 mb-0">
                <Row gutter={8}>
                  <Col span={12}>
                    <Button block onClick={resetFilter}>
                      {t("reset")}
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button block type="primary" htmlType="submit">
                      {t("applyFilter")}
                    </Button>
                  </Col>
                </Row>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} lg={24} xl={24}>
          {suppliers && suppliers.length > 0 ? (
            <Table
              dataSource={dataSource}
              columns={columns}
              pagination={{
                ...configs.TABLE_PAGINATION_SUPPLIER_DATA,
                total: totalData,
                pageSize: currPageSize,
                current: currPage,
                showLessItems: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} ${t("of")} ${total} ${t("items")}`,
                onChange: (page, pageSize) => {
                  setTableLoading(true);
                  setCurrPage(page);
                  setCurrPageSize(pageSize);
                  api.ppicSuppliers
                    .list(pageSize, page, null, null)
                    .then(function (response) {
                      const rsBody = response.data.rs_body;
                      setSuppliers(rsBody.suppliers);
                      setTotalData(rsBody.total);
                    })
                    .catch(function (error) {
                      utils.swal.Error({ msg: utils.getErrMsg(error) });
                    })
                    .finally(function () {
                      setTableLoading(false);
                    });
                },
              }}
              size="small"
              scroll={{ x: "70vw", y: "60vh" }}
              sticky={true}
            />
          ) : (
            <TableNotFoundNotice />
          )}
        </Col>
      </Row>
    </PageContainer>
  );
};

export default withRouter(SuppliersDataView);
