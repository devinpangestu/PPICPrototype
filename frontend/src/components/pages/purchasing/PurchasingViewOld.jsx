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
  Space,
  message,
  Checkbox,
  Select,
  Tabs,
  DatePicker,
  Pagination,
  Badge,
} from "antd";
import { SyncOverlay, TableNotFoundNotice } from "components";
import ModalExport from "components/ModalExport";
import { api } from "api";
import { useTranslation } from "react-i18next";
import configs from "configs";
import utils from "utils";
// import ModalImportCSV from "./modal/ModalImportCSV";
import moment from "moment";
import constant from "constant";
import ModalSplitSchedule from "./modal/ModalSplitSchedule";
import handler from "handler";
import ModalEdit from "./modal/ModalEdit";
import ModalCreate from "./modal/ModalCreate";
import ModalReturSchedule from "./modal/ModalReturSchedule";

const PPICView = (props) => {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const userInfo = utils.getUserInfo();

  const pageSize = configs.pageSize.ppic.dashboard;

  const [offers, setOffers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [totalData, setTotalData] = useState(0);
  const [search, setSearch] = useState("");

  const [tableLoading, setTableLoading] = useState(false);
  // const [modalImportCSVShow, setModalImportCSVShow] = useState(false);

  const [modalCreateShow, setModalCreateShow] = useState(false);
  const [modalEditShow, setModalEditShow] = useState(false);
  const [modalEditData, setModalEditData] = useState(null);
  const [modalReturScheduleShow, setModalReturScheduleShow] = useState(false);
  const [modalReturScheduleData, setModalReturScheduleData] = useState(null);
  const [modalEditId, setModalEditId] = useState(null);
  const [modalSplitScheduleShow, setModalSplitScheduleShow] = useState(false);
  const [modalSplitScheduleData, setModalSplitScheduleData] = useState(null);
  const [previewRowChecked, setPreviewRowChecked] = useState(Array(offers.length).fill(true));

  useEffect(() => {
    loadSuppliersOption();
    loadOffers();
  }, [search]);

  useEffect(() => {
    loadSuppliersOption();
  }, []);

  const handleCheckboxChange = (index, initialChecked) => {
    const updatedPreviewRowChecked = previewRowChecked.map((isChecked, i) =>
      i === index ? !isChecked : isChecked,
    );
    // If the title checkbox is checked, update all checkboxes
    if (initialChecked) {
      setPreviewRowChecked(updatedPreviewRowChecked);
    }
  };

  const loadOffers = () => {
    setTableLoading(true);
    api.purchasing
      .list(search, 1000, 1)
      .then(function (response) {
        const rsBody = response.data.rs_body;
        setOffers(rsBody.offer);
        setTotalData(rsBody.total);
        setPreviewRowChecked(
          rsBody.offer.map((offer) => {
            // Assuming rsBody.offer is an array of objects and each object has a po_number property
            const poNumber = offer.po_number;
            return poNumber !== undefined && poNumber !== null && poNumber !== "";
          }),
        );
      })
      .catch(function (error) {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(function () {
        setTableLoading(false);
      });
  };

  const loadSuppliersOption = () => {
    handler.getSuppliersOptionList(setTableLoading, setSuppliers);
  };

  const dataSource = [];
  if (offers) {
    for (let i = 0; i < offers.length; i++) {
      const d = offers[i];
      dataSource.push({
        key: i + 1,
        ...d,
      });
    }
  }
  const columns = [
    {
      title: (_v, record, index) => {
        const isDataComplete = (record) => {
          const poNumber = record?.po_number;
          return poNumber !== undefined && poNumber !== null && poNumber !== "";
        };
        const initialChecked = previewRowChecked.every((isChecked, i) => isDataComplete(offers[i]));

        return (
          <>
            <Checkbox
              checked={initialChecked}
              style={{ justifyContent: "center", display: "flex" }}
              onChange={(e) => {
                const isChecked = e.target.checked;
                const updatedPreviewRowChecked = previewRowChecked.map(
                  (_, i) => isChecked && isDataComplete(offers[i]),
                );
                setPreviewRowChecked(updatedPreviewRowChecked);
              }}
            />
          </>
        );
      },
      dataIndex: "check",
      key: "check",
      render: (_v, record, index) => {
        const isDataComplete = (record) => {
          const poNumber = record.po_number;
          return poNumber !== undefined && poNumber !== null && poNumber !== "";
        };

        const initialChecked = isDataComplete(record);
        return (
          <>
            <Checkbox
              checked={previewRowChecked[index]}
              style={{ justifyContent: "center", display: "flex" }}
              onChange={() => {
                handleCheckboxChange(index, initialChecked);
              }}
            />
          </>
        );
      },
    },

    {
      title: t("submissionDate"),
      dataIndex: "submission_date",
      key: "submission_date",
      render: (_, row) => {
        return moment(row.submission_date).format(constant.FORMAT_DISPLAY_DATE);
      },
    },
    {
      title: t("supplierName"),
      dataIndex: "supplier_name",
      key: "supplier_name",
      render: (_, row) => {
        return row.supplier.name;
      },
    },
    { title: t("No PR/PO"), dataIndex: "po_number", key: "po_number" },
    {
      title: t("Qty PR/PO"),
      dataIndex: "po_qty",
      key: "po_qty",
      render: (_, row) => {
        return utils.thousandSeparator(row.po_qty);
      },
    },
    {
      title: t("Outs PR/PO"),
      dataIndex: "po_outs",
      key: "po_outs",
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
      render: (_, row) => {
        return utils.thousandSeparator(row.qty_delivery);
      },
    },
    {
      title: t("estDelivery"),
      dataIndex: "est_delivery",
      key: "est_delivery",
      render: (_, row) => {
        return moment(row.est_delivery).format(constant.FORMAT_DISPLAY_DATE) ?? "-";
      },
    },
    {
      title: t("revisedQty"),
      dataIndex: "revised_qty",
      key: "revised_qty",
      render: (_, row) => {
        return utils.thousandSeparator(row.revised_qty);
      },
    },
    {
      title: t("revisedDate"),
      dataIndex: "est_revised_date",
      key: "est_revised_date",
      render: (_, row) => {
        return row.est_revised_date
          ? moment(row.est_revised_date).format(constant.FORMAT_DISPLAY_DATE)
          : "-";
      },
    },
    {
      title: t("supplierQty"),
      dataIndex: "submitted_qty",
      key: "submitted_qty",
      render: (_, row) => {
        return utils.thousandSeparator(row.submitted_qty);
      },
    },
    {
      title: t("supplierDate"),
      dataIndex: "est_submitted_date",
      key: "est_submitted_date",
      render: (_, row) => {
        return row.est_submitted_date
          ? moment(row.est_submitted_date).format(constant.FORMAT_DISPLAY_DATE)
          : "-";
      },
    },
    {
      title: t("action"),
      dataIndex: "action",
      fixed: "right",
      key: "action",
      render: (_, row) => {
        let btnEdit;
        let btnSplit;
        let btnRetur;
        if (row.flag_status === "B") {
          btnEdit = (
            <Button
              className="mr-1 mb-1"
              size="small"
              type="primary"
              onClick={() => {
                setModalEditData(row.id);
                setModalEditShow(true);
              }}
            >
              {t("Edit")}
            </Button>
          );
          btnSplit = (
            <Button
              className="mr-1 mb-1"
              size="small"
              type="primary"
              onClick={() => {
                setModalSplitScheduleData(row);
                setModalSplitScheduleShow(true);
              }}
            >
              {t("Split")}
            </Button>
          );
          btnRetur = (
            <Button
              className="mr-1 mb-1"
              size="small"
              type="danger"
              onClick={() => {
                setModalReturScheduleShow(true);
                setModalReturScheduleData(row);
              }}
            >
              {t("Retur")}
            </Button>
          );
          return [btnSplit, btnEdit, btnRetur];
        }
      },
    },
  ];
  const onChange = (value) => {
    setTableLoading(true);
    api.purchasing
      .list(search, 1000, 1, value)
      .then(function (response) {
        const rsBody = response.data.rs_body;
        setOffers(rsBody.offer);
        setTotalData(rsBody.total);
        setPreviewRowChecked(
          rsBody.offer.map((offer) => {
            // Assuming rsBody.offer is an array of objects and each object has a po_number property
            const poNumber = offer.po_number;
            return poNumber !== undefined && poNumber !== null && poNumber !== "";
          }),
        );
      })
      .catch(function (error) {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(function () {
        setTableLoading(false);
      });
  };

  // Filter `option.label` match the user type `input`
  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  return (
    <PageContainer
      title={t("PPIC Schedule")}
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
                {`${t("add")} ${t("new")} ${t("schedule")}`}
              </Button>
              {/* <Button
                size="small"
                onClick={() => {
                  setModalImportCSVShow(true);
                }}
              >
                {t("importFromCSV")}
              </Button> */}
            </Space>,
            "purchasing@create",
          )}
        </>
      }
    >
      <ModalReturSchedule
        visible={modalReturScheduleShow}
        onCancel={() => {
          setModalReturScheduleShow(false);
        }}
        onSuccess={() => {
          setModalReturScheduleShow(false);
          message.success(
            `${t("schedule")} ${"retur"} ${t("toastSuffixSuccess")} ${t("toastImported")}`,
          );
          loadOffers();
        }}
        data={modalReturScheduleData}
      />
      <ModalSplitSchedule
        visible={modalSplitScheduleShow}
        onCancel={() => {
          setModalSplitScheduleShow(false);
        }}
        onSuccess={() => {
          setModalSplitScheduleShow(false);
          message.success("Offer Splitted Successfully");
          loadOffers();
        }}
        data={modalSplitScheduleData}
      />
      <ModalCreate
        visible={modalCreateShow}
        onCancel={() => {
          setModalCreateShow(false);
        }}
        onSuccess={() => {
          setModalCreateShow(false);
          message.success("Success Create Data");
          loadOffers();
        }}
      />
      <ModalEdit
        visible={modalEditShow}
        onCancel={() => {
          setModalEditShow(false);
        }}
        onSuccess={() => {
          setModalEditShow(false);
          message.success("Success Edit Data");
          loadOffers();
        }}
        id={modalEditData}
      />
      <SyncOverlay loading={tableLoading} />
      <Row gutter={16}>
        {utils.renderWithPermission(
          userInfo.permissions,
          <Col xs={24} lg={12} xl={12}>
            Search By Supplier{" : "}
            <Select
              showSearch
              mode="multiple"
              placeholder="Select Supplier"
              optionFilterProp="children"
              onChange={onChange}
              style={{ width: "50%" }}
              filterOption={filterOption}
              options={suppliers}
            />
          </Col>,
          "purchasing@view",
        )}
        <Col xs={24} lg={6} xl={6}>
          hehe
        </Col>
        <Col xs={24} lg={6} xl={6}>
          hehe
        </Col>
      </Row>
      {offers && offers.length > 0 ? (
        <>
          <Space>
            <Button
              type="primary"
              onClick={() => {
                Modal.confirm({
                  ...constant.MODAL_SUCCESS_DEFAULT_PROPS,
                  content: `There are ${previewRowChecked.filter((item) => item).length} out of ${
                    offers.length
                  } data to be sent.}`,
                  onOk: () => {
                    setTableLoading(true);
                    const data = offers.filter((offer, index) => previewRowChecked[index]);
                    api.purchasing
                      .sendToPurchasing(data)
                      .then((res) => {
                        message.success("Success");
                      })
                      .catch((err) => {
                        utils.swal.Error({ msg: utils.getErrMsg(err) });
                      })
                      .finally(() => {
                        setTableLoading(false);
                        loadOffers();
                      });
                  },
                });
              }}
            >
              Send Schedule
            </Button>
          </Space>
          <Table
            dataSource={dataSource}
            columns={columns}
            pagination={{
              ...configs.TABLE_PAGINATION_SINGLEPAGE,
              total: totalData,
              pageSize: pageSize,
            }}
            scroll={{ x: "100vw", y: "60vh" }}
            sticky={true}
            size="small"
          />
        </>
      ) : (
        <TableNotFoundNotice />
      )}
    </PageContainer>
  );
};

export default withRouter(PPICView);
