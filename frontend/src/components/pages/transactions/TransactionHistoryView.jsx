import React, { useState, useEffect } from "react";
import { Link, withRouter } from "react-router-dom";
import { PageContainer } from "components/layout";
import { SpinnerOverlay, SyncOverlay, TableNotFoundNotice } from "components";
import TrnCard from "components/TrnCard";
import ModalSupplierHistory from "components/ModalSupplierHistory";
import {
  Row,
  Col,
  Form,
  Button,
  Card,
  Tag,
  Typography,
  Input,
  InputNumber,
  Pagination,
  DatePicker,
  Select,
  Collapse,
  Table,
  message,
  Progress,
} from "antd";
import { api } from "api";
import configs from "configs";
import { useTranslation } from "react-i18next";
import utils from "utils";
import ModalDelivered from "./ModalDelivered";
import handler from "handler";

import constant from "constant";
import moment from "moment";
import ModalPriceData from "components/ModalPriceData";
import ModalExport from "components/ModalExport";
import { SectionHeading } from "components/Section";
import ModalEdit from "./modal/ModalEdit";
import { viewTwoNumberBehindComma } from "utils/number";
import { authorizationCheck, isAccessTokenValid, isSessionTabValid, passwordChangedCheck } from "utils/auth";
const { Panel } = Collapse;

const Transaction = (props) => {
  const userInfo = utils.getUserInfo();
  const [form] = Form.useForm();
  const [pageLoading, setPageLoading] = useState(false);

  const [t] = useTranslation();

  const pageSize = configs.pageSize.transaction;

  // filter
  const [filterStatus, setFilterStatus] = useState(constant.STATUS_APPROVED);

  const [suppliers, setSuppliers] = useState([]);
  const [suppliersOptionList, setSuppliersOptionList] = useState([]);

  const [filterValue, setFilterValue] = useState({
    from_date: moment().subtract(6, "months").startOf("month").format(constant.FORMAT_API_DATE),
    to_date: moment().format(constant.FORMAT_API_DATE),
  });
  // filter

  const [pageNumber, setPageNumber] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [POLists, setPOLists] = useState([]);
  const [SKULists, setSKULists] = useState([]);

  const [selectedPOData, setSelectedPOData] = useState([]);
  const [selectedSKUData, setSelectedSKUData] = useState([]);

  const [modalEditShow, setModalEditShow] = useState(false);
  const [modalEditData, setModalEditData] = useState(null);

  const [modalExportShow, setModalExportShow] = useState(false);
  const [schedulePercentage, setSchedulePercentage] = useState([]);

  const [expandable, setExpandable] = useState({
    expandedRowRender: (record) => {
      const historyDetail = JSON.parse(record.history);
      return historyDetail.reverse().map((history, index) => {
        return (
          <>
            <p key={index} style={{ margin: 0, fontSize: "1rem" }}>
              {`${history?.detail}`}
            </p>
            <br />
          </>
        );
      });
    },

    rowExpandable: (record) => {
      return record.history;
    },
  });
  const tableProps = {
    expandable,
  };

  const EXPORT_TYPE = "transaction_history";

  useEffect(() => {
    if (utils.havePermission(userInfo.permissions, "ppic@view")) {
      handler.getSuppliersOptionList(setPageLoading, setSuppliersOptionList);
    }
    if (utils.havePermission(userInfo.permissions, "ppic@view")) {
      //   handler.getDealers(setPageLoading, setDealers);
    }
    form.setFieldsValue({
      transaction_date: [
        moment(filterValue.from_date, constant.FORMAT_API_DATE),
        moment(filterValue.to_date, constant.FORMAT_API_DATE),
      ],
    });
  }, []);

  useEffect(() => {
    const intervalId = handler.setupAuthorizationCheck(userInfo);
    authorizationCheck(userInfo);
    passwordChangedCheck(userInfo);
    isAccessTokenValid(localStorage.getItem(constant.ACCESS_TOKEN));
    isSessionTabValid(sessionStorage.getItem(constant.ACCESS_TOKEN));
    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [userInfo]);

  useEffect(() => {
    if (filterStatus === constant.STATUS_APPROVED) {
      loadAllPOInRange();
    } else if (filterStatus === constant.STATUS_REJECTED) {
      loadRejected();
    }
  }, [filterStatus, pageNumber, filterValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const statusPercentageValue = {
    A: 0,
    B: 100 / 5,
    C: 0,
    D: 100 / 5,
    E: (100 / 5) * 2,
    F: (100 / 5) * 3,
    G: (100 / 5) * 4,
    X: 100,
  };

  const countPercentage = (scheduleRow, complete, total) => {
    if (scheduleRow) {
      const percentage = (complete / total) * 100;
      setSchedulePercentage(percentage);
    }
  };

  const applyFilter = (values) => {
    if (!values) {
      return;
    }
    let newFilterValue = {};
    if (values.supplier_id) {
      newFilterValue.supplier_id = values.supplier_id;
    }

    if (values.transaction_date) {
      if (values.transaction_date[0]) {
        newFilterValue.from_date = moment(values.transaction_date[0]).format(
          constant.FORMAT_API_DATE,
        );
      }
      if (values.transaction_date[1]) {
        newFilterValue.to_date = moment(values.transaction_date[1]).format(
          constant.FORMAT_API_DATE,
        );
      }
    }

    if (values.search_PO) {
      newFilterValue.search_PO = values.search_PO;
    }

    setFilterValue(newFilterValue);
  };
  const renderStatusTag = (color, text) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Tag color={color} style={{ whiteSpace: "normal", textAlign: "center" }}>
        {text}
      </Tag>
    </div>
  );
  const resetFilter = () => {
    form.resetFields();
    setFilterValue({});
  };

  const loadAllPOInRange = () => {
    setPageLoading(true);
    api.transactions
      .getPOList(1000, 1, filterValue)
      .then(function (response) {
        const rsBody = response.data.rs_body;
        setPOLists([]);
        setPOLists(rsBody.transactions);
        setTotalData(rsBody.total);
      })
      .catch(function (error) {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(function () {
        setPageLoading(false);
      });
  };
  const getAllPOScheduleDetail = (poNumber) => {
    setPageLoading(true);
    api.transactions
      .getPOList(1000, 1, { po_number: poNumber })
      .then(function (response) {
        const rsBody = response.data.rs_body;
        setSelectedPOData([]);
        setSelectedPOData(rsBody.transactions);
        setSKULists(rsBody.transactions);
      })
      .catch(function (error) {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(function () {
        setPageLoading(false);
      });
  };

  const getAllSKUScheduleDetail = (poNumber, skuCode) => {
    setPageLoading(true);
    api.transactions
      .getPOList(1000, 1, { po_number: poNumber, sku_code: skuCode })
      .then(function (response) {
        const rsBody = response.data.rs_body;
        setSelectedSKUData(rsBody.transactions);
      })
      .catch(function (error) {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(function () {
        setPageLoading(false);
      });
  };

  const loadTransactions = () => {
    setPageLoading(true);

    api.transactions
      .list(pageSize, pageNumber, filterValue)
      .then(function (response) {
        const rsBody = response.data.rs_body;
        setTransactions(rsBody.transactions);
        setTotalData(rsBody.total);
      })
      .catch(function (error) {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(function () {
        setPageLoading(false);
      });
  };

  const loadRejected = () => {
    setPageLoading(true);

    filterValue.is_history = true;
    api.offers
      .list(filterStatus, pageSize, pageNumber, filterValue)
      .then(function (response) {
        const rsBody = response.data.rs_body;
        setTransactions(rsBody.offers);
        setTotalData(rsBody.total);
      })
      .catch(function (error) {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(function () {
        setPageLoading(false);
      });
  };

  const renderTable = () => {
    const handleCollapseChange = (activeKey) => {
      if (activeKey) {
        const PONumberCurrentClicked = POLists[activeKey].po_number;
        getAllPOScheduleDetail(PONumberCurrentClicked);
      }
    };

    if (POLists && POLists.length > 0) {
      const items = POLists.map((POList, index) => {
        return {
          key: index,
          label: {
            po_number: POList.po_number,
            supplier_name: POList.supplier_name,
            sku_count: POList.sku_count,
            total_schedule: POList.total_schedule,
            complete_schedule: POList.complete_schedule,
            schedules: POList.schedules,
          },
        };
      });
      return (
        <Collapse accordion={true} onChange={handleCollapseChange}>
          {items.map((item) => {
            const valuesMap = item.label.schedules.map(
              (schedule) => statusPercentageValue[schedule.flag_status],
            );
            const averagePercentage =
              valuesMap.reduce((sum, value) => sum + value, 0) / valuesMap.length;

            return (
              <Panel
                header={
                  <SectionHeading
                    title={`Schedule List
                    ${item.label.po_number}
                    ${item.label.supplier_name}
                    ${item.label.sku_count} SKU
                    ${item.label.complete_schedule} out of ${item.label.total_schedule} Schedule Completed`}
                    style={{ fontSize: "20px", whiteSpace: "pre-line" }}
                    additionalAction={(() => {
                      return (
                        <Progress
                          type="circle"
                          percent={viewTwoNumberBehindComma(averagePercentage)}
                        />
                      );
                    })()}
                    actionStyle={{ fontSize: "20px", textAlign: "right" }}
                  />
                }
                key={item.key}
              >
                {renderCollapseSKU(item.label.po_number)}
              </Panel>
            );
          })}
        </Collapse>
      );
    } else {
      return <TableNotFoundNotice />;
    }
  };

  const renderCollapseSKU = (poNumber) => {
    const handleCollapseChange = (activeKey) => {
      if (activeKey) {
        const SKUCodeCurrentClicked = SKULists[activeKey].sku_code;
        getAllSKUScheduleDetail(poNumber, SKUCodeCurrentClicked);
      }
    };

    if (selectedPOData && selectedPOData.length > 0) {
      const items = selectedPOData.map((POData, index) => {
        return {
          key: index,
          label: `(${POData.sku_code} - ${POData.sku_name})  ${POData.offer_count} Schedule`,
          children: `ini data panel ${index}`,
          data: POData.schedules,
        };
      });
      return (
        <Collapse accordion={true} onChange={handleCollapseChange}>
          {items.map((item) => {
            const valuesMap = item.data.map(
              (schedule) => statusPercentageValue[schedule.flag_status],
            );
            const averagePercentage =
              valuesMap.reduce((sum, value) => sum + value, 0) / valuesMap.length;

            return (
              <Panel
                header={
                  <SectionHeading
                    title={`SKU - ${item.label}`}
                    style={{ fontSize: "20px" }}
                    additionalAction={(() => {})()}
                    actionStyle={{
                      display: "flex",
                      justifyContent: "right",
                    }}
                  />
                }
                key={item.key}
              >
                {renderTableTransaction()}
              </Panel>
            );
          })}
        </Collapse>
      );
    } else {
      return <TableNotFoundNotice />;
    }
  };

  const renderTableTransaction = () => {
    const dataSource = [];
    if (selectedSKUData && selectedSKUData.length > 0) {
      for (let i = 0; i < selectedSKUData.length; i++) {
        const d = selectedSKUData[i];
        dataSource.push({
          key: i + 1,
          ...d,
        });
      }
    }
    const columns = [
      {
        title: t("Qty PR/PO"),
        dataIndex: "po_qty",
        key: "po_qty",
        width: "100px",
        render: (_, row) => {
          return utils.thousandSeparator(row.po_qty);
        },
      },
      {
        title: t("Outs PR/PO"),
        dataIndex: "po_outs",
        key: "po_outs",
        width: "100px",
        render: (_, row) => {
          return utils.thousandSeparator(row.po_outs);
        },
      },
      { title: t("SKUCode"), dataIndex: "sku_code", key: "sku_code" },
      { title: t("SKUName"), dataIndex: "sku_name", key: "sku_name" },
      {
        title: t("qtyDelivery"),
        dataIndex: "qty_delivery",
        key: "qty_delivery",
        width: "100px",
        render: (_, row) => {
          return utils.thousandSeparator(row.qty_delivery);
        },
      },
      {
        title: t("estDelivery"),
        dataIndex: "est_delivery",
        key: "est_delivery",
        width: "100px",
        render: (_, row) => {
          return moment(row.est_delivery).format(constant.FORMAT_DISPLAY_DATE) ?? "-";
        },
      },

      {
        title: t("action"),
        dataIndex: "action",
        fixed: "right",
        key: "action",
        align: "center",
        width: 150,
        render: (_, row) => {
          let btnEdit;
          let tag;

          const valuesMap = statusPercentageValue[row.flag_status];
          if (row.deleted_at !== null) {
            tag = renderStatusTag("error", "Deleted");
          }
          if (
            row.flag_status === constant.FLAG_STATUS_PPIC_INIT ||
            row.flag_status === constant.FLAG_STATUS_PROCUREMENT_RETUR
          ) {
            tag = renderStatusTag("error", "at PPIC");
          }
          if (
            row.flag_status === constant.FLAG_STATUS_PROCUREMENT_FROM_PPIC ||
            row.flag_status === constant.FLAG_STATUS_PPIC_SEND_RETUR_PROCUREMENT
          ) {
            tag = renderStatusTag("error", "at Procurement");
          }
          if (row.flag_status === constant.FLAG_STATUS_SUPPLIER) {
            tag = renderStatusTag("error", `at Supplier ${row.supplier.name}`);
          }
          if (
            row.flag_status === constant.FLAG_STATUS_PROCUREMENT_REQUEST &&
            row.split_from_id !== null
          ) {
            tag = renderStatusTag("warning", "Split Request (Supplier to Procurement)");
          }
          if (
            row.flag_status === constant.FLAG_STATUS_PROCUREMENT_REQUEST &&
            row.edit_from_id !== null
          ) {
            tag = renderStatusTag("warning", "Edit Request (Supplier to Procurement)");
          }
          if (row.flag_status === constant.FLAG_STATUS_PPIC_REQUEST && row.split_from_id !== null) {
            tag = renderStatusTag("warning", "Split Request (Procurement to PPIC)");
          }
          if (row.flag_status === constant.FLAG_STATUS_PPIC_REQUEST && row.edit_from_id !== null) {
            tag = renderStatusTag("warning", "Edit Request (Procurement to PPIC)");
          }
          if (row.flag_status === constant.FLAG_STATUS_COMPLETE_SCHEDULE) {
            tag = renderStatusTag("success", "Complete");
          }
          btnEdit = (
            <Button
              className="ma-0"
              size="small"
              type="primary"
              onClick={() => {
                setModalEditData(row.id);
                setModalEditShow(true);
              }}
              title="Available after the schedule is reach supplier"
              disabled={
                row.flag_status === constant.FLAG_STATUS_PPIC_INIT ||
                row.flag_status === constant.FLAG_STATUS_PROCUREMENT_FROM_PPIC ||
                row.flag_status === constant.FLAG_STATUS_PROCUREMENT_RETUR ||
                row.flag_status === constant.FLAG_STATUS_PPIC_SEND_RETUR_PROCUREMENT
              }
            >
              {t("Force Edit")}
            </Button>
          );

          return (
            <>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                {btnEdit}
              </div>
              <div
                style={{
                  marginTop: "8px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                {tag}
              </div>
            </>
          );
        },
      },
    ];

    return (
      <Table
        {...tableProps}
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        scroll={{ x: 1000 }}
        bordered
      />
    );
  };

  return (
    <PageContainer
      title={t("transactionHistory")}
      btnAction={
        filterStatus === constant.STATUS_APPROVED &&
        transactions &&
        transactions.length > 0 &&
        utils.havePermission(userInfo.permissions, "ppic@view") ? (
          <Button
            size="small"
            onClick={() => {
              setModalExportShow(true);
            }}
          >
            {t("exportXLSX")}
          </Button>
        ) : null
      }
      breadcrumbs={[
        {
          text: t("history"),
          link: "/history",
        },
      ]}
    >
      <SyncOverlay loading={pageLoading} />
      <ModalEdit
        visible={modalEditShow}
        onCancel={() => {
          setModalEditShow(false);
        }}
        onSuccess={() => {
          setModalEditShow(false);
          message.success("Success Edit Data");
        }}
        id={modalEditData}
      />

      {utils.renderWithPermission(
        userInfo.permissions,
        <ModalExport
          visible={modalExportShow}
          onCancel={() => setModalExportShow(false)}
          exportType={EXPORT_TYPE}
        />,
        "export@xlsx",
      )}
      <Row className="mb-3" gutter={12}>
        <Col></Col>
      </Row>

      <Row gutter={16}>
        {utils.renderWithPermission(
          userInfo.permissions,
          <Col xs={24} lg={6} xl={6}>
            <Card size="small">
              <SectionHeading title={"Filter"} withDivider />
              <Form form={form} onFinish={applyFilter} layout="vertical" className="form-filter">
                <Form.Item className="mb-1" label={t("searchPO")} name="search_PO">
                  <Input placeholder={t("searchPO")} />
                </Form.Item>
                <Form.Item className="mb-1" label={t("transactionDate")} name="transaction_date">
                  <DatePicker.RangePicker
                    style={{ width: "100%" }}
                    {...utils.FORM_RANGEPICKER_PROPS}
                  />
                </Form.Item>
                <Form.Item className="mb-1" label={t("supplier")} name="supplier_id">
                  <Select
                    showSearch
                    placeholder={t("select")}
                    options={suppliersOptionList}
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
          </Col>,
          "ppic@view",
        )}
        <Col xs={24} lg={18} xl={18}>
          <>{renderTable()}</>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default withRouter(Transaction);
