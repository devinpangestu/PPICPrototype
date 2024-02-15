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


const Transaction = (props) => {
  const userInfo = utils.getUserInfo();
  const [form] = Form.useForm();
  const [pageLoading, setPageLoading] = useState(false);

  const [t] = useTranslation();
  const ppn = utils.getPPN();
  const [warehouses, setWarehouses] = useState([]);

  const pageSize = configs.pageSize.transaction;

  // filter
  const [filterStatus, setFilterStatus] = useState(constant.STATUS_APPROVED);

  const [suppliers, setSuppliers] = useState([]);
  const [dealers, setDealers] = useState([]);

  const otifOptions = [
    { label: "OTIF", value: true },
    { label: "N-OTIF", value: false },
  ];
  const BRStatus = [
    { label: "BR Completed", value: "true" },
    { label: "BR Not Completed", value: "false" },
  ];
  const GRStatus = [
    { label: "GR Completed", value: "true" },
    { label: "GR Not Completed", value: "false" },
  ];
  const DocumentsStatus = [
    { label: "Documents Completed", value: "true" },
    { label: "Documents Not Completed", value: "false" },
  ];
  const LTruckStatus = [
    { label: "Trucking Fulfilled (ONLY LOCO LUAR PULAU)", value: "true" },
    { label: "Trucking Not Fulfilled (ONLY LOCO LUAR PULAU)", value: "false" },
  ];
  const ShipStatus = [
    { label: "Ship Fulfilled", value: "true" },
    { label: "Ship Not Fulfilled", value: "false" },
  ];
  const DTruckStatus = [
    { label: "Discharge Fulfilled", value: "true" },
    { label: "Discharge Not Fulfilled", value: "false" },
  ];

  const [filterValue, setFilterValue] = useState({});
  // filter

  const [pageNumber, setPageNumber] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [transactions, setTransactions] = useState([]);

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalDeliveredShow, setModalDeliveredShow] = useState(false);
  const [modalSupplierHistoryShow, setModalSupplierHistoryShow] = useState(false);
  const [modalPriceDataShow, setModalPriceDataShow] = useState(false);

  const [modalExportShow, setModalExportShow] = useState(false);
  const EXPORT_TYPE = "transaction_history";

  useEffect(() => {
    if (utils.havePermission(userInfo.permissions, "supplier@view")) {
      handler.getSuppliers(setPageLoading, setSuppliers);
    }
    if (utils.havePermission(userInfo.permissions, "user@view")) {
      handler.getDealers(setPageLoading, setDealers);
    }
    handler.getWarehouses(setPageLoading, setWarehouses);
  }, []);

  useEffect(() => {
    const intervalId = handler.setupAuthorizationCheck(userInfo);
    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [userInfo]);

  useEffect(() => {
    if (filterStatus === constant.STATUS_APPROVED) {
      loadTransactions();
    } else if (filterStatus === constant.STATUS_REJECTED) {
      loadRejected();
    }
  }, [filterStatus, pageNumber, filterValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyFilter = (values) => {
    if (!values) {
      return;
    }
    console.log("values");
    console.log(values);
    let newFilterValue = {};
    if (values.supplier_id) {
      newFilterValue.supplier_id = values.supplier_id;
    }
    if (values.dealer_id) {
      newFilterValue.dealer_id = values.dealer_id;
    }
    if (values.warehouse_id) {
      newFilterValue.warehouse_id = values.warehouse_id;
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
    if (values.br_status) {
      newFilterValue.br_status = values.br_status;
    }
    if (values.gr_status) {
      newFilterValue.gr_status = values.gr_status;
    }
    if (values.documents_status) {
      newFilterValue.documents_status = values.documents_status;
    }
    if (values.lTruck_status) {
      newFilterValue.lTruck_status = values.lTruck_status;
    }
    if (values.ship_status) {
      newFilterValue.ship_status = values.ship_status;
    }
    if (values.dTruck_status) {
      newFilterValue.dTruck_status = values.dTruck_status;
    }
    if (values.search_PO) {
      newFilterValue.search_PO = values.search_PO;
    }
    if (values.is_otif) {
      newFilterValue.is_otif = values.is_otif;
    }
    if (values.price_min) {
      newFilterValue.price_min = values.price_min;
    }
    if (values.price_max) {
      newFilterValue.price_max = values.price_max;
    }
    if (values.quality_ffa_min) {
      newFilterValue.quality_ffa_min = values.quality_ffa_min;
    }
    if (values.quality_ffa_max) {
      newFilterValue.quality_ffa_max = values.quality_ffa_max;
    }
    if (values.quality_mi_min) {
      newFilterValue.quality_mi_min = values.quality_mi_min;
    }
    if (values.quality_mi_max) {
      newFilterValue.quality_mi_max = values.quality_mi_max;
    }
    if (values.quality_dobi_min) {
      newFilterValue.quality_dobi_min = values.quality_dobi_min;
    }
    if (values.quality_dobi_max) {
      newFilterValue.quality_dobi_max = values.quality_dobi_max;
    }
    if (values.handover_date) {
      if (values.handover_date[0]) {
        newFilterValue.handover_from_date = moment(values.handover_date[0]).format(
          constant.FORMAT_API_DATE,
        );
      }
      if (values.handover_date[1]) {
        newFilterValue.handover_to_date = moment(values.handover_date[1]).format(
          constant.FORMAT_API_DATE,
        );
      }
    }
    if (values.delivered_date) {
      if (values.delivered_date[0]) {
        newFilterValue.delivered_from_date = moment(values.delivered_date[0]).format(
          constant.FORMAT_API_DATE,
        );
      }
      if (values.delivered_date[1]) {
        newFilterValue.delivered_to_date = moment(values.delivered_date[1]).format(
          constant.FORMAT_API_DATE,
        );
      }
    }
    setFilterValue(newFilterValue);
  };

  const resetFilter = () => {
    form.resetFields();
    setFilterValue({});
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

  const isFilesComplete = (files, term) => {
    const requiredFileTypes = constant.FILE_TYPE_NEEDED_MAP[term];

    // Get the types of files present in the given array
    const presentFileTypes = files.map((file) => file.type);

    // Check if all required file types are present in the array
    return requiredFileTypes.every((fileType) => presentFileTypes.includes(fileType));
  };

  const renderTable = () => {
    if (transactions.length > 0) {
      return (
        <div>
          {transactions &&
            transactions.map((transaction, index) => {
              if (filterStatus === constant.STATUS_APPROVED) {
                if (!transaction.offer) {
                  return null;
                }
                const statusBadges = [
                  <Tag
                    key={`${index}_status`}
                    className="mr-1"
                    color={utils.getOfferStatusColor(transaction.offer.status)}
                  >
                    {utils.snakeToTitleCase(transaction.offer.status)}
                  </Tag>,
                ];
                if (transaction && transaction.offer.terms_of_handover === "loco_luar_pulau") {
                  if (transaction.lTruck_fulfilled) {
                    statusBadges.push(
                      <Tag key={`${index}_lTruck`} color="success">
                        {"Trucking Fulfilled"}
                      </Tag>,
                    );
                  } else {
                    statusBadges.push(
                      <Tag key={`${index}_lTruck`} color="error">
                        {"Trucking Not Fulfilled"}
                      </Tag>,
                    );
                  }
                }
                if (
                  transaction &&
                  (transaction.offer.terms_of_handover === "loco_luar_pulau" ||
                    transaction.offer.terms_of_handover === "fob" ||
                    transaction.offer.terms_of_handover === "cif")
                ) {
                  if (transaction.ship_fulfilled) {
                    statusBadges.push(
                      <Tag key={`${index}_ship`} color="success">
                        {"Ship Fulfilled"}
                      </Tag>,
                    );
                  } else {
                    statusBadges.push(
                      <Tag key={`${index}_ship`} color="error">
                        {"Ship Not Fulfilled"}
                      </Tag>,
                    );
                  }
                }
                if (transaction && transaction.offer.terms_of_handover !== "franco") {
                  if (transaction.dTruck_fulfilled) {
                    statusBadges.push(
                      <Tag key={`${index}_dTruck`} color="success">
                        {"Discharge Fulfilled"}
                      </Tag>,
                    );
                  } else {
                    statusBadges.push(
                      <Tag key={`${index}_dTruck`} color="error">
                        {"Discharge Not Fulfilled"}
                      </Tag>,
                    );
                  }
                }

                if (
                  transaction &&
                  transaction.offer.lOffers &&
                  transaction.offer.lOffers.length > 0
                ) {
                  if (transaction.gr_fulfilled) {
                    statusBadges.push(
                      <Tag key={`${index}_gr`} color="success">
                        {"GR Fulfilled"}
                      </Tag>,
                    );
                  } else {
                    statusBadges.push(
                      <Tag key={`${index}_gr`} color="error">
                        {"GR Not Fulfilled"}
                      </Tag>,
                    );
                  }
                  if (transaction.br_fulfilled) {
                    statusBadges.push(
                      <Tag key={`${index}_br`} color="success">
                        {"BR Fulfilled"}
                      </Tag>,
                    );
                  } else {
                    statusBadges.push(
                      <Tag key={`${index}_br`} color="error">
                        {"BR Not Fulfilled"}
                      </Tag>,
                    );
                  }
                  if (transaction.documents_fulfilled) {
                    statusBadges.push(
                      <Tag key={`${index}_documents`} color="success">
                        {"Documents Completed"}
                      </Tag>,
                    );
                  } else {
                    statusBadges.push(
                      <Tag key={`${index}_documents`} color="error">
                        {"Documents Not Completed"}
                      </Tag>,
                    );
                  }
                }

                if (transaction) {
                  if (transaction.is_otif) {
                    statusBadges.push(
                      <Tag key={`${index}_otif`} color="success">
                        OTIF
                      </Tag>,
                    );
                  } else if (!transaction.is_otif) {
                    if (transaction.is_otif === false) {
                      statusBadges.push(
                        <Tag key={`${index}_otif`} color="error">
                          Not OTIF
                        </Tag>,
                      );
                    } else {
                      statusBadges.push(
                        <Tag key={`${index}_otif`} color="error">
                          N/A
                        </Tag>,
                      );
                    }
                  }
                }

                let actionEl = [];
                // if (
                //   userInfo.role.id === constant.ROLE_SUPER_ADMIN ||
                //   transaction.offer.dealer.employee_id === userInfo.employee_id ||
                //   userInfo.role.id === 5 //admin
                // ) {
                actionEl.push(
                  utils.renderWithPermission(
                    userInfo.permissions,

                    <Link
                      key={`${index}_manage_logistics`}
                      to={`/logistic/offers/create?commodity_offer=${transaction.offer.id}`}
                    >
                      <Button
                        // variant="warning"
                        className={!transaction.delivered_datetime ? "mr-2" : ""}
                        type="primary"
                      >
                        {t("manageLogistic")}
                      </Button>
                    </Link>,
                    "transaction@view",
                  ),
                );

                actionEl.push(
                  utils.renderWithPermission(
                    userInfo.permissions,

                    <Link key={`${index}_revise`} to={`/offers/${transaction.offer.id}/edit`}>
                      <Button
                        // variant="warning"
                        className={!transaction.delivered_datetime ? "mr-2" : ""}
                      >
                        {t("revise")}
                      </Button>
                    </Link>,
                    "offer@view",
                    "offer@create",
                  ),
                );

                // }

                return (
                  <TrnCard
                    ppn={ppn}
                    key={`${transaction.offer.id}_${index}`}
                    transaction={transaction}
                    setSelected={setSelectedTransaction}
                    setModalSupplierHistoryShow={setModalSupplierHistoryShow}
                    setModalPriceDataShow={setModalPriceDataShow}
                    statusEl={statusBadges}
                    actionEl={actionEl}
                  />
                );
              } else if (filterStatus === constant.STATUS_REJECTED) {
                // when rejected, transaction is offer object
                if (transaction.offer) {
                  return null;
                }
                return (
                  <TrnCard
                    ppn={ppn}
                    key={`${transaction.id}_${index}`}
                    offer={transaction}
                    setSelected={setSelectedTransaction}
                    setModalSupplierHistoryShow={setModalSupplierHistoryShow}
                    setModalPriceDataShow={setModalPriceDataShow}
                    statusEl={
                      transaction &&
                      transaction.status && (
                        <h5 className="mb-0">
                          <Tag color={utils.getOfferStatusColor(transaction.status)}>
                            {utils.snakeToTitleCase(transaction.status)}
                          </Tag>
                        </h5>
                      )
                    }
                  />
                );
              }

              // invalid, not approved & rejected
              return null;
            })}
        </div>
      );
    }
    return <TableNotFoundNotice />;
  };

  return (
    <PageContainer
      title={t("transactionHistory")}
      btnAction={
        filterStatus === constant.STATUS_APPROVED &&
        transactions &&
        transactions.length > 0 &&
        utils.havePermission(userInfo.permissions, "export@xlsx") ? (
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
      <ModalDelivered
        visible={modalDeliveredShow}
        onCancel={() => setModalDeliveredShow(false)}
        onSuccess={() => {
          setModalDeliveredShow(false);
          loadTransactions();
        }}
        transaction={selectedTransaction}
      />
      <ModalSupplierHistory
        visible={modalSupplierHistoryShow}
        onCancel={() => setModalSupplierHistoryShow(false)}
        supplierId={
          selectedTransaction && selectedTransaction.offer && selectedTransaction.offer.spplr
            ? selectedTransaction.offer.spplr.supplier_id
            : ""
        }
      />
      <ModalPriceData
        visible={modalPriceDataShow}
        onCancel={() => setModalPriceDataShow(false)}
        date={selectedTransaction && moment(selectedTransaction.datetime)}
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
        <Col>
          <Tag
            className="text-center pointer mb-1 mb-sm-0"
            color={filterStatus === constant.STATUS_APPROVED ? "success" : "default"}
            onClick={() => {
              setFilterStatus(constant.STATUS_APPROVED);
              setPageNumber(1);
            }}
          >
            {t("Approved")}
          </Tag>

          <Tag
            className="text-center pointer mb-1 mb-sm-0"
            color={filterStatus === constant.STATUS_REJECTED ? "error" : "default"}
            onClick={() => {
              setFilterStatus(constant.STATUS_REJECTED);
              setPageNumber(1);
            }}
          >
            {t("Rejected")}
          </Tag>
        </Col>
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
                    options={suppliers}
                    {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                  />
                </Form.Item>
                <Form.Item className="mb-1" label={t("dealer")} name="dealer_id">
                  <Select
                    showSearch
                    placeholder={t("select")}
                    options={dealers}
                    {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                  />
                </Form.Item>
                <Form.Item className="mb-1" label={t("warehouse")} name="warehouse_id">
                  <Select
                    showSearch
                    placeholder={t("select")}
                    options={warehouses}
                    {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                  />
                </Form.Item>
                {filterStatus === constant.STATUS_APPROVED && (
                  <Form.Item className="mb-1" label={t("brStatus")} name="br_status">
                    <Select
                      showSearch
                      placeholder={t("select")}
                      options={BRStatus}
                      {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                    />
                  </Form.Item>
                )}
                {filterStatus === constant.STATUS_APPROVED && (
                  <Form.Item className="mb-1" label={t("grStatus")} name="gr_status">
                    <Select
                      showSearch
                      placeholder={t("select")}
                      options={GRStatus}
                      {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                    />
                  </Form.Item>
                )}
                {filterStatus === constant.STATUS_APPROVED && (
                  <Form.Item className="mb-1" label={t("documentsStatus")} name="documents_status">
                    <Select
                      showSearch
                      placeholder={t("select")}
                      options={DocumentsStatus}
                      {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                    />
                  </Form.Item>
                )}
                {filterStatus === constant.STATUS_APPROVED && (
                  <Form.Item className="mb-1" label={t("lTruckStatus")} name="lTruck_status">
                    <Select
                      showSearch
                      placeholder={t("select")}
                      options={LTruckStatus}
                      {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                    />
                  </Form.Item>
                )}
                {filterStatus === constant.STATUS_APPROVED && (
                  <Form.Item className="mb-1" label={t("shipStatus")} name="ship_status">
                    <Select
                      showSearch
                      placeholder={t("select")}
                      options={ShipStatus}
                      {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                    />
                  </Form.Item>
                )}
                {filterStatus === constant.STATUS_APPROVED && (
                  <Form.Item className="mb-1" label={t("dTruckStatus")} name="dTruck_status">
                    <Select
                      showSearch
                      placeholder={t("select")}
                      options={DTruckStatus}
                      {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                    />
                  </Form.Item>
                )}

                {filterStatus === constant.STATUS_APPROVED && (
                  <Form.Item className="mb-1" label={t("otifStatus")} name="is_otif">
                    <Select
                      showSearch
                      placeholder={t("select")}
                      options={otifOptions}
                      {...configs.FORM_SELECT_SEARCHABLE_PROPS}
                    />
                  </Form.Item>
                )}
                <Form.Item className="mb-1" label={t("handoverDate")} name="handover_date">
                  <DatePicker.RangePicker
                    style={{ width: "100%" }}
                    {...utils.FORM_RANGEPICKER_PROPS}
                  />
                </Form.Item>
                {filterStatus === constant.STATUS_APPROVED && (
                  <Form.Item className="mb-1" label={t("deliveredDate")} name="delivered_date">
                    <DatePicker.RangePicker
                      style={{ width: "100%" }}
                      {...utils.FORM_RANGEPICKER_PROPS}
                    />
                  </Form.Item>
                )}
                <Form.Item className="mb-1" label={t("price")}>
                  <Row gutter={8}>
                    <Col span={12}>
                      <Form.Item name="price_min" className="mb-0">
                        <InputNumber
                          style={{ width: "100%" }}
                          placeholder={t("min")}
                          {...configs.FORM_MONEY_DEFAULT_PROPS}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="price_max" className="mb-0">
                        <InputNumber
                          style={{ width: "100%" }}
                          placeholder={t("max")}
                          {...configs.FORM_MONEY_DEFAULT_PROPS}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form.Item>
                {/* <Form.Item className="mb-1" label={`${t("quality")}(FFA)`}>
                  <Row gutter={8}>
                    <Col span={12}>
                      <Form.Item name="quality_ffa_min" className="mb-0">
                        <InputNumber
                          style={{ width: "100%" }}
                          placeholder={t("min")}
                          {...configs.FORM_MONEY_DEFAULT_PROPS}
                          max={100}
                          maxLength={5}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="quality_ffa_max" className="mb-0">
                        <InputNumber
                          style={{ width: "100%" }}
                          placeholder={t("min")}
                          {...configs.FORM_MONEY_DEFAULT_PROPS}
                          max={100}
                          maxLength={5}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form.Item>
                <Form.Item className="mb-1" label={`${t("quality")}(M+I)`}>
                  <Row gutter={8}>
                    <Col span={12}>
                      <Form.Item name="quality_mi_min" className="mb-0">
                        <InputNumber
                          style={{ width: "100%" }}
                          placeholder={t("min")}
                          {...configs.FORM_MONEY_DEFAULT_PROPS}
                          max={100}
                          maxLength={5}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="quality_mi_max" className="mb-0">
                        <InputNumber
                          style={{ width: "100%" }}
                          placeholder={t("min")}
                          {...configs.FORM_MONEY_DEFAULT_PROPS}
                          max={100}
                          maxLength={5}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form.Item>
                <Form.Item className="mb-1" label={`${t("quality")}(DOBI)`}>
                  <Row gutter={8}>
                    <Col span={12}>
                      <Form.Item name="quality_dobi_min" className="mb-0">
                        <InputNumber
                          style={{ width: "100%" }}
                          placeholder={t("min")}
                          {...configs.FORM_MONEY_DEFAULT_PROPS}
                          max={100}
                          maxLength={5}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="quality_dobi_max" className="mb-0">
                        <InputNumber
                          style={{ width: "100%" }}
                          placeholder={t("min")}
                          {...configs.FORM_MONEY_DEFAULT_PROPS}
                          max={100}
                          maxLength={5}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form.Item> */}
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
          "transaction@filter",
        )}
        <Col xs={24} lg={18} xl={18}>
          <>
            {renderTable()}
            {totalData > 0 && (
              <Pagination
                className="text-right"
                current={pageNumber}
                total={totalData}
                {...configs.TABLE_PAGINATION}
                pageSize={pageSize}
                onChange={(selectedPage) => {
                  setPageNumber(selectedPage);
                  utils.scrollToTop();
                }}
              />
            )}
          </>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default withRouter(Transaction);
