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
import ModalEditAndSend from "./modal/ModalEditAndSend";
import ModalClosePO from "./modal/ModalClosePO";
import {
  authorizationCheck,
  isAccessTokenValid,
  isMobile,
  isSessionTabValid,
  passwordChangedCheck,
} from "utils/auth";
import { usePageStore } from "state/pageState";

const SupplierView = (props) => {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const userInfo = utils.getUserInfo();

  const pageSize = configs.pageSize.supplier.dashboard;

  const [offers, setOffers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [totalData, setTotalData] = useState(0);
  const [search, setSearch] = useState("");

  const { pageLoading, setPageLoading } = usePageStore();

  const [modalSplitScheduleShow, setModalSplitScheduleShow] = useState(false);
  const [modalSplitScheduleData, setModalSplitScheduleData] = useState(null);
  const [modalClosePOShow, setModalClosePOShow] = useState(false);
  const [modalClosePOData, setModalClosePOData] = useState(null);
  const [modalEditAndSendShow, setModalEditAndSendShow] = useState(false);
  const [modalEditAndSendData, setModalEditAndSendData] = useState(null);
  const [previewRowChecked, setPreviewRowChecked] = useState([]);
  const [arrayOfMerge, setArrayOfMerge] = useState([]);
  const [toggleCheckboxTitle, setToggleCheckboxTitle] = useState(true);

  const [expandable, setExpandable] = useState({
    expandedRowRender: (record) => {
      if (record.flag_status === constant.FLAG_STATUS_SUPPLIER) {
        return (
          <p style={{ margin: 0, fontSize: "1rem" }}>
            {`${moment(JSON.parse(record.notes)?.init?.created_at).format(
              constant.FORMAT_DISPLAY_DATETIME,
            )}`}
            <strong>
              {`${JSON.parse(record.notes)?.init?.created_by} : ${
                JSON.parse(record.notes)?.init?.notes
              }`}
            </strong>
          </p>
        );
      }
    },
    rowExpandable: (record) => {
      const checkFlagStatus = (record) =>
        record.flag_status === constant.FLAG_STATUS_SUPPLIER &&
        JSON.parse(record.notes)?.init?.notes;
      return checkFlagStatus(record);
    },
  });

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      loadOffers();
      authorizationCheck(userInfo);
      passwordChangedCheck(userInfo);
      isAccessTokenValid(localStorage.getItem(constant.ACCESS_TOKEN));
      isSessionTabValid(sessionStorage.getItem(constant.ACCESS_TOKEN));
    }
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCheckboxChange = (index, initialChecked) => {
    setPreviewRowChecked((prevChecked) => {
      const updatedPreviewRowChecked = prevChecked.map((isChecked, i) =>
        i === index ? !isChecked : isChecked,
      );

      // If the title checkbox is checked, update all checkboxes

      // If the rows are merged, update the next row's checkbox state

      if (initialChecked) {
        return updatedPreviewRowChecked;
      }
      return updatedPreviewRowChecked;
    });
  };

  const loadOffers = () => {
    setPageLoading(true);
    api.suppliers
      .list(search, 1000, 1)
      .then(function (response) {
        const rsBody = response.data.rs_body;
        setOffers(rsBody.offer);
        setTotalData(rsBody.total);
        if (rsBody.offer && rsBody.offer.length > 0) {
          setPreviewRowChecked(
            rsBody.offer
              .filter((item) => item.flag_status !== constant.FLAG_STATUS_COMPLETE_SCHEDULE)
              .map(() => false),
          );

          setArrayOfMerge(
            rsBody.offer.map((currRow, index) => {
              const nextRow = rsBody.offer[index + 1];
              const shouldMerge =
                nextRow &&
                currRow.supplier_id === nextRow.supplier_id &&
                currRow.po_number === nextRow.po_number &&
                currRow.flag_status === nextRow.flag_status &&
                currRow.sku_code === nextRow.sku_code;
              return shouldMerge;
            }),
          );
        } else {
          // Handle the case when rsBody.offer is empty
          setPreviewRowChecked([]);
          setArrayOfMerge([]);
        }
      })
      .catch(function (error) {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(function () {
        setPageLoading(false);
      });
  };

  const dataSource = [];
  if (offers && offers.length > 0) {
    for (let i = 0; i < offers.length; i++) {
      const d = offers[i];
      dataSource.push({
        key: i + 1,
        ...d,
      });
    }
  }

  const tableProps = {
    expandable,
  };
  const getCellConfig = (arrayOfMerge, index) => {
    if (arrayOfMerge[index] === false && arrayOfMerge[index - 1] === true) {
      return { rowSpan: 0 };
    } else if (arrayOfMerge[index] === false && arrayOfMerge[index - 1] === false) {
      return {};
    } else {
      // count the next true value and break the loop after false,
      // and if the true is counted, ignore them
      let count = 0;
      if (arrayOfMerge[index - 1] === true) {
        return { rowSpan: 0 };
      }
      for (let i = index; i < arrayOfMerge.length; i++) {
        if (arrayOfMerge[i] === true) {
          count++;
        } else {
          break;
        }
      }
      return { rowSpan: count + 1 };
    }
  };
  const columns = [
    {
      title: (_v, record, index) => {
        const isDataComplete = (record) => {
          if (record.flag_status === constant.FLAG_STATUS_SUPPLIER) {
            return record.flag_status !== constant.FLAG_STATUS_COMPLETE_SCHEDULE;
          } else {
            return (
              record.po_number && record.flag_status !== constant.FLAG_STATUS_COMPLETE_SCHEDULE
            );
          }
        };
        return (
          <>
            <Checkbox
              checked={previewRowChecked.every((item) => {
                return item && item.flag_status !== constant.FLAG_STATUS_COMPLETE_SCHEDULE;
              })}
              style={{ justifyContent: "center", display: "flex" }}
              onChange={(e) => {
                const isChecked = e.target.checked;
                const updatedPreviewRowChecked = previewRowChecked.map(
                  (_, i) =>
                    isChecked &&
                    isDataComplete(offers[i]) &&
                    toggleCheckboxTitle &&
                    offers[i].flag_status !== constant.FLAG_STATUS_COMPLETE_SCHEDULE,
                );
                setPreviewRowChecked(updatedPreviewRowChecked);
              }}
              onClick={(e) => {
                e.stopPropagation();
                setToggleCheckboxTitle(!toggleCheckboxTitle);
              }}
            />
          </>
        );
      },
      dataIndex: "check",
      key: "check",

      render: (_v, record, index) => {
        if (record.flag_status === constant.FLAG_STATUS_COMPLETE_SCHEDULE) return;
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
      title: t("supplierName"),
      dataIndex: "supplier_name",
      key: "supplier_name",
      onCell: (_, index) => ({
        ...getCellConfig(arrayOfMerge, index),
      }),
      render: (_, row, index) => {
        return row?.supplier?.name;
      },
    },
    {
      title: t("No PR/PO"),
      dataIndex: "po_number",
      key: "po_number",
      onCell: (_, index) => ({
        ...getCellConfig(arrayOfMerge, index),
      }),
    },
    {
      title: t("Qty PR/PO"),
      dataIndex: "po_qty",
      key: "po_qty",
      onCell: (_, index) => ({
        ...getCellConfig(arrayOfMerge, index),
      }),
      render: (_, row) => {
        return utils.thousandSeparator(row.po_qty);
      },
    },
    {
      title: t("Outs PR/PO"),
      dataIndex: "po_outs",
      key: "po_outs",
      onCell: (_, index) => ({
        ...getCellConfig(arrayOfMerge, index),
      }),
      render: (_, row) => {
        return utils.thousandSeparator(row.po_outs);
      },
    },
    {
      title: t("SKUCode"),
      dataIndex: "sku_code",
      key: "sku_code",
      onCell: (_, index) => ({
        ...getCellConfig(arrayOfMerge, index),
      }),
    },
    {
      title: t("SKUName"),
      dataIndex: "sku_name",
      key: "sku_name",
      onCell: (_, index) => ({
        ...getCellConfig(arrayOfMerge, index),
      }),
    },
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
      title: t("sendSupplierDate"),
      dataIndex: "send_supplier_date",
      key: "send_supplier_date",
      render: (_, row) => {
        return row.send_supplier_date
          ? moment(row.send_supplier_date).format(constant.FORMAT_DISPLAY_DATE)
          : "-";
      },
    },
    // {
    //   title: t("revisedQty"),
    //   dataIndex: "revised_qty",
    //   key: "revised_qty",
    //   render: (_, row) => {
    //     return utils.thousandSeparator(row.revised_qty);
    //   },
    // },
    // {
    //   title: t("revisedDate"),
    //   dataIndex: "est_revised_date",
    //   key: "est_revised_date",
    //   render: (_, row) => {
    //     return row.est_revised_date
    //       ? moment(row.est_revised_date).format(constant.FORMAT_DISPLAY_DATE)
    //       : "-";
    //   },
    // },
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
      width: "auto",
      render: (_, row) => {
        let btnSplit;
        let btnConfirm;
        let btnClosePO;
        let tagStatus;
        let tagHutangKirim;
        const renderTag = (color, text) => (
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

        tagHutangKirim = row?.hutang_kirim ? renderTag("error", "Hutang Kirim") : null;
        if (row.flag_status === constant.FLAG_STATUS_SUPPLIER) {
          btnSplit = (
            <Button
              className="mr-1 mb-1"
              size="small"
              onClick={() => {
                setModalSplitScheduleData(row);
                setModalSplitScheduleShow(true);
              }}
            >
              {t("Split")}
            </Button>
          );
          btnConfirm = (
            <Button
              className="mr-1 mb-1"
              size="small"
              type="primary"
              onClick={() => {
                Modal.confirm({
                  ...constant.MODAL_SUCCESS_DEFAULT_PROPS,
                  content: `Confirm the shipment schedule ?`,
                  onOk: () => {
                    api.suppliers
                      .confirm(row.id, false)
                      .then((res) => {
                        message.success("Success");
                      })
                      .catch((err) => {
                        utils.swal.Error({ msg: utils.getErrMsg(err) });
                      })
                      .finally(() => {
                        loadOffers();
                      });
                  },
                });
              }}
              style={{ whiteSpace: "normal", width: "auto", height: "auto", margin: "0 auto" }}
            >
              {t("Confirm Schedule")}
            </Button>
          );
          if (row.hutang_kirim) {
            tagHutangKirim = renderTag("error", "Hutang Kirim");
            btnClosePO = (
              <Button
                className="mr-1 mb-1"
                size="small"
                type="warning"
                onClick={() => {
                  // setModalClosePOData(row);
                  // setModalClosePOShow(true);
                  Modal.confirm({
                    ...constant.MODAL_SUCCESS_DEFAULT_PROPS,
                    content: `Request for close this PO ?`,
                    onOk: () => {
                      api.suppliers
                        .closePO(row.id, false)
                        .then((res) => {
                          message.success("Success");
                        })
                        .catch((err) => {
                          utils.swal.Error({ msg: utils.getErrMsg(err) });
                        })
                        .finally(() => {
                          loadOffers();
                        });
                    },
                  });
                }}
                style={{ whiteSpace: "normal", width: "auto", height: "auto", margin: "0 auto" }}
              >
                {t("Close PO Request")}
              </Button>
            );
          }
        }

        return (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {tagHutangKirim}
            {btnSplit}
            {btnClosePO}
            {btnConfirm}
          </div>
        );
      },
    },
    {
      title: `${t("mass")} ${t("action")}`,
      dataIndex: "bulk_action",
      fixed: "right",
      key: "bulk_action",
      width: "auto",
      onCell: (_, index) => {
        if (arrayOfMerge[index] === false && arrayOfMerge[index - 1] === true) {
          return { rowSpan: 0 };
        } else if (arrayOfMerge[index] === false && arrayOfMerge[index - 1] === false) {
          return;
        } else {
          //count the next true value and break the loop after false and if the true is counted, ignore them
          let count = 0;
          if (arrayOfMerge[index - 1] === true) {
            return { rowSpan: 0 };
          }
          for (let i = index; i < arrayOfMerge.length; i++) {
            if (arrayOfMerge[i] === true) {
              count++;
            } else {
              break;
            }
          }
          return { rowSpan: count + 1 };
        }
      },
      render: (_, row, index) => {
        let tagStatus;
        let btnConfirm;
        let btnEditAndSend;
        const countOffer = () => {
          if (arrayOfMerge[index] === false && arrayOfMerge[index - 1] === true) {
            return 1;
          } else if (arrayOfMerge[index] === false && arrayOfMerge[index - 1] === false) {
            return 1;
          } else {
            let count = 0;
            if (arrayOfMerge[index - 1] === true) {
              return 1;
            }
            for (let i = index; i < arrayOfMerge.length; i++) {
              if (arrayOfMerge[i] === true) {
                count++;
              } else {
                break;
              }
            }
            return count + 1;
            //count the next true value and break the loop after false and if the true is counted, ignore them
          }
        };
        const renderTag = (color, text) => (
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
        if (row.flag_status === constant.FLAG_STATUS_PPIC_REQUEST) {
          tagStatus = renderTag("warning", "Request (PPIC)");
        }
        if (row.flag_status === constant.FLAG_STATUS_PROCUREMENT_REQUEST) {
          tagStatus = renderTag("warning", "Request (Procurement)");
        }
        if (row.flag_status === constant.FLAG_STATUS_COMPLETE_SCHEDULE) {
          tagStatus = renderTag("success", "Complete Schedule");
        }
        if (row.flag_status === constant.FLAG_STATUS_SUPPLIER) {
          btnEditAndSend = (
            <Button
              className="mr-1 mb-1"
              size="small"
              onClick={() => {
                setPageLoading(true);
                api.suppliers
                  .getAllPODetails(row.po_number, row.sku_code)
                  .then((res) => {
                    const data = res.data.rs_body;

                    setModalEditAndSendData(
                      data.filter(
                        (item) =>
                          item.is_split === false &&
                          item.is_edit === false &&
                          (item.flag_status === constant.FLAG_STATUS_SUPPLIER ||
                            item.flag_status === constant.FLAG_STATUS_PROCUREMENT_REQUEST ||
                            item.flag_status === constant.FLAG_STATUS_PPIC_REQUEST ||
                            item.flag_status === constant.FLAG_STATUS_COMPLETE_SCHEDULE),
                      ),
                    );
                    setModalEditAndSendShow(true);
                  })
                  .catch((err) => {
                    utils.swal.Error({ msg: utils.getErrMsg(err) });
                  })
                  .finally(() => {
                    setPageLoading(false);
                  });
              }}
            >
              {t("Edit")}
            </Button>
          );

          if (countOffer() > 1) {
            btnConfirm = (
              <Button
                className=""
                size="small"
                type="primary"
                onClick={() => {
                  Modal.confirm({
                    ...constant.MODAL_SUCCESS_DEFAULT_PROPS,
                    content: `Confirm ${countOffer()} shipment schedule ?`,
                    onOk: () => {
                      api.suppliers
                        .confirm(row.id, true)
                        .then((res) => {
                          message.success("Success");
                        })
                        .catch((err) => {
                          utils.swal.Error({ msg: utils.getErrMsg(err) });
                        })
                        .finally(() => {
                          loadOffers();
                        });
                    },
                  });
                }}
                style={{ whiteSpace: "normal", width: "auto", height: "auto", margin: "0 auto" }}
              >
                {`Confirm ${countOffer()} Schedule`}
              </Button>
            );
          }
        }
        return (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {tagStatus}
            {btnEditAndSend}
            {btnConfirm}
          </div>
        );
      },
    },
  ];

  // Filter `option.label` match the user type `input`
  let scrollX = "100vw";
  if (isMobile) scrollX = 1300;
  return (
    <PageContainer
      title={`${t("Material Schedule")} - ${userInfo?.supplier?.name || userInfo?.user_name}`}
    >
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
      <ModalClosePO
        visible={modalClosePOShow}
        onCancel={() => {
          setModalClosePOShow(false);
        }}
        onSuccess={() => {
          setModalClosePOShow(false);
          message.success("Offer Splitted Successfully");
          loadOffers();
        }}
        data={modalClosePOData}
      />
      <ModalEditAndSend
        visible={modalEditAndSendShow}
        onCancel={() => {
          setModalEditAndSendShow(false);
        }}
        onSuccess={() => {
          setModalEditAndSendShow(false);
          message.success("Offer Edited and Sent Successfully");
          loadOffers();
        }}
        data={modalEditAndSendData}
      />
      <SyncOverlay loading={pageLoading} />
      {arrayOfMerge && arrayOfMerge.length > 0 && offers.some((value) => value) ? (
        <>
          <Space style={{ marginBottom: "1rem" }}>
            <Button
              type="primary"
              onClick={() => {
                if (previewRowChecked.filter((item) => item).length === 0) {
                  Modal.error({
                    content: "Please select at least one data",
                  });
                } else {
                  Modal.confirm({
                    ...constant.MODAL_SUCCESS_DEFAULT_PROPS,
                    content: `There are ${previewRowChecked.filter((item) => item).length} out of ${
                      previewRowChecked.length
                    } data to be sent.}`,
                    onOk: () => {
                      setPageLoading(true);
                      const data = offers.filter((offer, index) => previewRowChecked[index]);
                      api.suppliers
                        .confirmSelected(data)
                        .then((res) => {
                          message.success("Success");
                        })
                        .catch((err) => {
                          utils.swal.Error({ msg: utils.getErrMsg(err) });
                        })
                        .finally(() => {
                          setPageLoading(false);
                          loadOffers();
                          Modal.success({
                            content: `Schedule information has been sent to Bina Karya Prima`,
                          });
                        });
                    },
                  });
                }
              }}
            >
              Confirm the selected schedule
            </Button>
          </Space>
          <Table
            {...tableProps}
            dataSource={dataSource}
            columns={columns}
            pagination={{
              ...configs.TABLE_PAGINATION_SINGLEPAGE,
              total: totalData,
              pageSize: pageSize,
            }}
            scroll={{ x: scrollX, y: "60vh" }}
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

export default withRouter(SupplierView);
