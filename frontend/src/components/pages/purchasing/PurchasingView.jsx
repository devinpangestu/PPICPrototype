import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, withRouter } from "react-router-dom";
import { PageContainer } from "components/layout";
import { useSearchFilterStore } from "state/purchasing/searchFilterState";
import { useDataStore } from "state/purchasing/dataState";
import { TableNotFoundNotice, SyncOverlay } from "components";
import {
  Row,
  Col,
  Form,
  Button,
  Tabs,
  Input,
  DatePicker,
  Tag,
  message,
  Pagination,
  Badge,
  Modal,
  Select,
  Checkbox,
  Space,
  Table,
} from "antd";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import configs from "configs";
import constant from "constant";

import ModalImportCSV from "./modal/ModalImportCSV";
import ModalSplitSchedule from "./modal/ModalSplitSchedule";
import ModalEdit from "./modal/ModalEdit";
import ModalCreate from "./modal/ModalCreate";

import moment from "moment";

import handler from "handler";
import ModalReturSchedule from "./modal/ModalReturSchedule";
import { authorizationCheck, isMobile } from "utils/auth";

const EditableContext = React.createContext(null);
const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};
const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  handleCancel,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const [currentDate, setCurrentDate] = useState(null);
  const [originalDate, setOriginalDate] = useState(null);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);

  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    if (
      record.flag_status === constant.FLAG_STATUS_COMPLETE_SCHEDULE ||
      record.flag_status === constant.FLAG_STATUS_PROCUREMENT_REQUEST
    ) {
      setEditing(false);
      Modal.error({
        content: "This data is already completed or in negotiation process",
      });
      return;
    }
    setEditing(!editing);
    const fieldValue = record[dataIndex];
    const isDateType = moment(fieldValue, "YYYY-MM-DDTHH:mm:ss.SSSZ", true).isValid();
    if (!editing) {
      // If entering edit mode, store the original date
      if (isDateType) {
        setOriginalDate(fieldValue);
        form.setFieldsValue({ [dataIndex]: moment(fieldValue) });
      } else {
        form.setFieldsValue({ [dataIndex]: fieldValue });
      }
    } else {
      // If canceling edit mode, revert to the original date

      if (isDateType) {
        setCurrentDate(originalDate);
        form.setFieldsValue({ [dataIndex]: originalDate });
      } else {
        form.setFieldsValue({ [dataIndex]: fieldValue });
      }
    }
  };
  const handleDateChange = (newDate) => {
    setCurrentDate(newDate);
  };
  const save = async () => {
    try {
      const values = await form.validateFields();

      if (values[dataIndex] === null) {
      } else {
        toggleEdit();
        handleSave({
          ...record,
          ...values,
        });
      }
    } catch (errInfo) {
      console.log("Save failed:", errInfo, "restore the data");
    }
  };

  let childNode = children;
  if (editable) {
    const fieldValue = record[dataIndex];
    // Check if fieldValue is a valid Date
    const isDateType = moment(fieldValue, "YYYY-MM-DDTHH:mm:ss.SSSZ", true).isValid();

    childNode = editing ? (
      isDateType ? (
        <Form.Item
          style={{
            margin: 0,
          }}
          initialValue={currentDate}
          name={dataIndex}
        >
          <DatePicker
            allowClear={false}
            inputReadOnly={true}
            {...utils.FORM_DATEPICKER_PROPS}
            ref={inputRef}
            onPressEnter={save}
            onBlur={save}
            onChange={handleDateChange}
          />
        </Form.Item>
      ) : (
        <Form.Item
          style={{
            margin: 0,
          }}
          name={dataIndex}
          initialValue={record[dataIndex]}
        >
          <Input ref={inputRef} onPressEnter={save} onBlur={save} />
        </Form.Item>
      )
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const PurchasingView = (props) => {
  const statusMapping = {
    B: "Schedule from PPIC",
    D: "Revised from PPIC",
    F: "Negotiation from Supplier",
    X: "Completed",
  };

  const userInfo = utils.getUserInfo();
  const [pageLoading, setPageLoading] = useState(false);

  const [t] = useTranslation();
  const [form] = Form.useForm();

  const pageSize = configs.pageSize.offer;

  let defaultFilterStatus = null;
  let defaultActiveTab = "all";
  if (userInfo.role.id === 2) {
    defaultFilterStatus = constant.FLAG_STATUS_PPIC_INIT;
    defaultActiveTab = defaultFilterStatus;
  } else if (userInfo.role.id === 3) {
    defaultFilterStatus = constant.FLAG_STATUS_PROCUREMENT_FROM_PPIC;
    defaultActiveTab = defaultFilterStatus;
  } else if (userInfo.role.id === 4) {
    defaultFilterStatus = constant.FLAG_STATUS_SUPPLIER;
    defaultActiveTab = defaultFilterStatus;
  }
  const [expandable, setExpandable] = useState({
    expandedRowRender: (record) => {
      if (record.edit_from_id !== null) {
        return (
          <p style={{ margin: 0 }}>
            {`${moment(JSON.parse(record.notes)?.updated_at).format(
              constant.FORMAT_DISPLAY_DATETIME,
            )} ${JSON.parse(record.notes)?.updated_by} : ${JSON.parse(record.notes)?.edit_req_sup}`}
          </p>
        );
      } else if (record.split_from_id !== null) {
        return (
          <p style={{ margin: 0 }}>
            {`${moment(JSON.parse(record.notes)?.updated_at).format(
              constant.FORMAT_DISPLAY_DATETIME,
            )} ${JSON.parse(record.notes)?.updated_by} : ${
              JSON.parse(record.notes)?.split_req_sup
            } `}
          </p>
        );
      } else {
        return null;
      }
    },
    rowExpandable: (record) => {
      const checkFlagStatus = (record) =>
        record.flag_status === constant.FLAG_STATUS_PROCUREMENT_REQUEST &&
        (JSON.parse(record.notes)?.edit_req_sup || JSON.parse(record.notes)?.split_req_sup);
      return checkFlagStatus(record);
    },
  });

  const {
    modalImportCSVShow,
    setModalImportCSVShow,
    modalCreateShow,
    setModalCreateShow,
    modalSplitScheduleShow,
    setModalSplitScheduleShow,
    modalSplitScheduleData,
    setModalSplitScheduleData,
    modalReturScheduleShow,
    setModalReturScheduleShow,
    modalReturScheduleData,
    setModalReturScheduleData,
    modalEditShow,
    setModalEditShow,
    modalEditData,
    setModalEditData,
    suppliersSearch,
    setSuppliersSearch,
    usersSearch,
    setUsersSearch,
    editTableMode,
    setEditTableMode,
    search,
    setSearch,
    minDateLoaded,
    setMinDateLoaded,
    // arrayOfMerge,
    // setArrayOfMerge,
    dataSource,
    setDataSource,
    oldDataSource,
    setOldDataSource,
    editedData,
    setEditedData,
    cancelClicked,
    setCancelClicked,
    filteredInfo,
    setFilteredInfo,
    sortedInfo,
    setSortedInfo,
    toggleCheckboxTitle,
    setToggleCheckboxTitle,
  } = useDataStore();

  const [arrayOfMerge, setArrayOfMerge] = useState([]);

  const {
    dateRange,
    setDateRange,
    suppliers,
    setSuppliers,
    PPICs,
    setPPICs,
    filterStatus,
    setFilterStatus,
    pageNumber,
    setPageNumber,
    totalData,
    setTotalData,
    offerSummaryTotal,
    setOfferSummaryTotal,
    offerSummary,
    setOfferSummary,
    offers,
    setOffers,
    previewRowChecked,
    setPreviewRowChecked,
  } = useSearchFilterStore();

  // const [previewRowChecked, setPreviewRowChecked] = useState([]);

  const fetchData = async (params) => {
    let errMsg;
    setPageLoading(true);

    try {
      const responseList = await api.purchasing.list(search, 1000, 1, params);

      const rsBodyList = responseList.data.rs_body;

      setOffers(rsBodyList.offer);
      setTotalData(rsBodyList.total);
      setOldDataSource(rsBodyList.offer.map((offer, index) => ({ key: index + 1, ...offer })));
      setDataSource(rsBodyList.offer.map((offer, index) => ({ key: index + 1, ...offer })));

      if (rsBodyList.offer && rsBodyList.offer.length > 0) {
        setPreviewRowChecked(
          rsBodyList.offer
            .filter(
              (item) =>
                item.flag_status !== constant.FLAG_STATUS_COMPLETE_SCHEDULE &&
                item.flag_status !== constant.FLAG_STATUS_PROCUREMENT_REQUEST,
            )
            .map(() => false),
        );
        setArrayOfMerge(
          rsBodyList.offer.map((currRow, index) => {
            const nextRow = rsBodyList.offer[index + 1];
            return (
              nextRow &&
              currRow.supplier_id === nextRow.supplier_id &&
              currRow.po_number === nextRow.po_number &&
              currRow.sku_code === nextRow.sku_code &&
              currRow.po_qty === nextRow.po_qty &&
              currRow.split_from_id === nextRow.split_from_id
            );
          }),
        );

        setEditTableMode(false);
      } else {
        setPreviewRowChecked([]);
        setArrayOfMerge([]);
      }
    } catch (error) {
      utils.swal.Error({ msg: utils.getErrMsg(error) });
    } finally {
      setPageLoading(false);
    }
  };

  const fetchSummary = async (params) => {
    setPageLoading(true);
    try {
      const responseSummary = await api.purchasing.summary(params);
      const total = Object.values(responseSummary.data.rs_body).reduce(
        (acc, curr) => acc + curr,
        0,
      );
      setOfferSummaryTotal(total);
      setOfferSummary(responseSummary.data.rs_body);
    } catch (error) {
      utils.swal.Error({ msg: utils.getErrMsg(error) });
    } finally {
      setPageLoading(false);
    }
  };
  const handleChange = (pagination, filters, sorter) => {
    console.log("Various parameters", pagination, filters, sorter);
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };
  const loadSuppliersOption = () => {
    handler.getSuppliersOptionList(setPageLoading, setSuppliers);
    handler.getPPICs(setPageLoading, setPPICs);
  };
  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const handleCheckboxChange = (index, initialChecked, status) => {
    const updatedPreviewRowChecked = previewRowChecked.map((isChecked, i) => {
      return i === index ? !isChecked : isChecked;
    });
    // if (arrayOfMerge[index]) {
    //   updatedPreviewRowChecked[index + 1] = !updatedPreviewRowChecked[index + 1];
    // }
    if (!initialChecked) {
      if (
        status === constant.FLAG_STATUS_PROCUREMENT_FROM_PPIC ||
        status === constant.FLAG_STATUS_PPIC_SEND_RETUR_PROCUREMENT
      ) {
        Modal.error({
          content: "Please fill PO Number first",
        });
      }

      if (status === constant.FLAG_STATUS_COMPLETE_SCHEDULE) {
        Modal.error({
          content: "This data is already completed",
        });
      }
    }
    setPreviewRowChecked(updatedPreviewRowChecked);
  };
  const onChangeSupplierList = (value) => {
    setPageLoading(true);
    setSuppliersSearch(value);
    const otherParams = {
      from_date: moment(dateRange[0]).format(constant.FORMAT_API_DATE),
      to_date: moment(dateRange[1]).format(constant.FORMAT_API_DATE),
      supplier_id: value ?? null,
      user_id: usersSearch ?? null,
      status: filterStatus,
    };
    fetchData(otherParams);
    fetchSummary(otherParams);
  };
  const onChangeUserList = async (value) => {
    setPageLoading(true);
    setUsersSearch(value);
    const otherParams = {
      from_date: moment(dateRange[0]).format(constant.FORMAT_API_DATE),
      to_date: moment(dateRange[1]).format(constant.FORMAT_API_DATE),
      supplier_id: suppliersSearch ?? null,
      user_id: value ?? null,
      status: filterStatus,
    };
    fetchData(otherParams);
    fetchSummary(otherParams);
  };
  const onResetFilter = async () => {
    setPageLoading(true);
    setUsersSearch(null);
    setSuppliersSearch(null);
    form.setFieldsValue({ user_list: null, supplier_list: null });
    const otherParams = {
      from_date: moment(dateRange[0]).format(constant.FORMAT_API_DATE),
      to_date: moment(dateRange[1]).format(constant.FORMAT_API_DATE),
      supplier_id: null,
      user_id: null,
      status: filterStatus,
    };
    fetchData(otherParams);
    fetchSummary(otherParams);
  };

  useEffect(() => {
    api.purchasing
      .needActionMinDate()
      .then(function (response) {
        const rsBody = response.data.rs_body;
        setDateRange([moment(rsBody.min_date), moment()]);
        const otherParams = {
          from_date: moment(rsBody.min_date).format(constant.FORMAT_API_DATE),
          to_date: moment().format(constant.FORMAT_API_DATE),
          supplier_id: suppliersSearch ?? null,
          user_id: usersSearch ?? null,
          status: filterStatus,
        };
        fetchSummary(otherParams);
      })
      .catch(function (error) {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(function () {
        setPageLoading(false);
        setMinDateLoaded(true);
      });
    loadSuppliersOption();
    authorizationCheck(userInfo);
    return () => {
      setFilterStatus(null);
      setOffers([]);
      setDataSource([]);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (minDateLoaded) {
      loadOffers();
    }
  }, [minDateLoaded, filterStatus, pageNumber, dateRange, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadOffers = async () => {
    let errMsg;

    const otherParams = {
      from_date: moment(dateRange[0]).format(constant.FORMAT_API_DATE),
      to_date: moment(dateRange[1]).format(constant.FORMAT_API_DATE),
    };
    if (filterStatus) otherParams.status = filterStatus;
    if (suppliersSearch) otherParams.supplier_id = suppliersSearch;
    if (usersSearch) otherParams.user_id = usersSearch;
    if (search) otherParams.search = search;

    fetchData(otherParams);
    if (errMsg) {
      setPageLoading(false);
      utils.swal.Error({ msg: errMsg });
      return;
    }
  };

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
  const handleSave = (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });

    const editedDataIndex = editedData.findIndex((item) => item.id === row.id);
    if (editedDataIndex !== -1) {
      editedData.splice(editedDataIndex, 1);
    }
    setEditedData([...editedData, row]);
    setDataSource(newData);
  };
  const handleCancel = () => {
    // Your cancel logic here
    setDataSource(oldDataSource);
    return cancelClicked;
  };
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const defaultColumns = [
    {
      title: (_, record, index) => {
        if (editTableMode) return;
        if (filterStatus === constant.FLAG_STATUS_COMPLETE_SCHEDULE) return;
        if (filterStatus === constant.FLAG_STATUS_PROCUREMENT_REQUEST) return;
        const isDataComplete = (record) => {
          const flagStatus = record?.flag_status;
          const poNumber = record?.po_number;
          switch (filterStatus) {
            case constant.FLAG_STATUS_PROCUREMENT_FROM_PPIC:
              return !(
                flagStatus === constant.FLAG_STATUS_COMPLETE_SCHEDULE ||
                flagStatus === constant.FLAG_STATUS_PROCUREMENT_REQUEST ||
                flagStatus === constant.FLAG_STATUS_PPIC_SEND_RETUR_PROCUREMENT ||
                utils.isNull(poNumber)
              );
            case constant.FLAG_STATUS_PPIC_SEND_RETUR_PROCUREMENT:
              return !(
                flagStatus === constant.FLAG_STATUS_COMPLETE_SCHEDULE ||
                flagStatus === constant.FLAG_STATUS_PROCUREMENT_REQUEST ||
                flagStatus === constant.FLAG_STATUS_PROCUREMENT_FROM_PPIC ||
                utils.isNull(poNumber)
              );
            case constant.FLAG_STATUS_PROCUREMENT_REQUEST:
              return !(
                flagStatus === constant.FLAG_STATUS_COMPLETE_SCHEDULE ||
                flagStatus === constant.FLAG_STATUS_PROCUREMENT_FROM_PPIC ||
                flagStatus === constant.FLAG_STATUS_PPIC_SEND_RETUR_PROCUREMENT ||
                utils.isNull(poNumber)
              );
            default:
              return !(
                flagStatus === constant.FLAG_STATUS_COMPLETE_SCHEDULE ||
                flagStatus === constant.FLAG_STATUS_PROCUREMENT_REQUEST ||
                poNumber === ""
              );
          }
        };
        return (
          <>
            <Checkbox
              checked={previewRowChecked.every((item) => item)}
              style={{ justifyContent: "center", display: "flex" }}
              onChange={(e) => {
                const isChecked = e.target.checked;
                const updatedPreviewRowChecked = previewRowChecked.map(
                  (_, i) => isChecked && isDataComplete(offers[i]) && toggleCheckboxTitle,
                );
                setPreviewRowChecked(updatedPreviewRowChecked);
              }}
              onClick={(e) => {
                e.stopPropagation();
                setToggleCheckboxTitle(!toggleCheckboxTitle);
                console.log(previewRowChecked);
              }}
            />
          </>
        );
      },
      dataIndex: "check",
      key: "check",

      render: (_, record, index) => {
        if (editTableMode) return;
        if (filterStatus === constant.FLAG_STATUS_COMPLETE_SCHEDULE) return;
        if (filterStatus === constant.FLAG_STATUS_PROCUREMENT_REQUEST) return;
        if (
          !filterStatus &&
          (record?.flag_status === constant.FLAG_STATUS_COMPLETE_SCHEDULE ||
            record?.flag_status === constant.FLAG_STATUS_PROCUREMENT_REQUEST)
        )
          return;
        const isDataComplete = (record) => {
          const poNumber = record?.po_number;
          const flagStatus = record?.flag_status;

          return !(utils.isNull(poNumber) || flagStatus === constant.FLAG_STATUS_COMPLETE_SCHEDULE);
        };
        const initialChecked = isDataComplete(record);

        return (
          <>
            {record?.po_number !== "" ? (
              <Checkbox
                checked={previewRowChecked[index]}
                style={{ justifyContent: "center", display: "flex" }}
                onChange={() => {
                  handleCheckboxChange(index, initialChecked, record?.flag_status);
                }}
                onClick={() => {
                  console.log(previewRowChecked);
                }}
              />
            ) : (
              // Render something else, or nothing, when po_number is null
              <Tag color="error">Fill PO</Tag>
            )}
          </>
        );
      },
    },
    {
      title: t("submissionDate"),
      dataIndex: "submission_date",
      key: "submission_date",
      onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),
      render: (_, row) => {
        return moment(row.submission_date).format(constant.FORMAT_DISPLAY_DATE);
      },
    },
    {
      title: t("supplierName"),
      dataIndex: "supplier_name",
      key: "supplier_name",
      render: (_, row) => {
        return row?.supplier?.name;
      },
      onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),
    },
    {
      title: t("No PR/PO"),
      dataIndex: "po_number",
      key: "po_number",
      width: "10vw",
      editable: editTableMode,
      onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),
      filteredValue: filteredInfo?.po_number || null,
      onFilter: (value, record) => record.po_number.replace(/^\W*POF/, "").includes(value),
      sorter: (a, b) => {
        const numericA = parseInt(a.po_number.replace(/^\W*POF/, ""), 10);
        const numericB = parseInt(b.po_number.replace(/^\W*POF/, ""), 10);

        return numericA - numericB;
      },
      sortOrder: sortedInfo.columnKey === "po_number" ? sortedInfo.order : null,
      render: (_, row) => {
        if (editTableMode) {
          return row?.po_number || <Tag color="red">Please Fill PO Number</Tag>;
        }
        return utils.renderNullable(row?.po_number);
      },
    },
    {
      title: t("Qty PR/PO"),
      dataIndex: "po_qty",
      key: "po_qty",
      // editable: editTableMode,
      onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),
      render: (_, row) => {
        const poQty = utils.thousandSeparator(row.po_qty);
        return poQty;
      },
    },
    {
      title: t("Outs PR/PO"),
      dataIndex: "po_outs",
      key: "po_outs",
      // editable: editTableMode,
      onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),
      render: (_, row) => {
        return utils.thousandSeparator(row.po_outs);
      },
    },
    {
      title: t("SKUCode"),
      dataIndex: "sku_code",
      key: "sku_code",
      width: 150,
      onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),
    },
    {
      title: t("SKUName"),
      dataIndex: "sku_name",
      key: "sku_name",
      onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),
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

      onCell: (_, index) => {
        if (
          filterStatus === constant.FLAG_STATUS_PROCUREMENT_FROM_PPIC ||
          filterStatus === constant.FLAG_STATUS_PPIC_SEND_RETUR_PROCUREMENT ||
          (!filterStatus &&
            dataSource[index]?.flag_status !== constant.FLAG_STATUS_PROCUREMENT_REQUEST)
        )
          return;
        return { ...getCellConfig(arrayOfMerge, index) };
      },
      render: (_, row) => {
        let btnEdit;
        let btnSplit;
        let btnRetur;
        let tagStatus;
        let btnAcceptSplit;
        let btnRejectSplit;
        let btnAcceptEdit;
        let btnRejectEdit;
        const flagStatus = row.flag_status;
        const renderConfirmationModal = (api, text) => {
          Modal.confirm({
            ...constant.MODAL_CONFIRM_DEFAULT_PROPS,
            content: text,
            onOk: () => {
              setPageLoading(true);
              api(row.id)
                .then((res) => {
                  message.success("Success");
                })
                .catch((err) => {
                  utils.swal.Error({ msg: utils.getErrMsg(err) });
                })
                .finally(() => {
                  loadOffers();
                  setPageLoading(false);
                  const otherParams = {
                    from_date: moment(dateRange[0]).format(constant.FORMAT_API_DATE),
                    to_date: moment(dateRange[1]).format(constant.FORMAT_API_DATE),
                    supplier_id: suppliersSearch ?? null,
                    user_id: usersSearch ?? null,
                    status: filterStatus,
                  };
                  fetchSummary(otherParams);
                });
            },
          });
        };
        const renderStatusTag = (color, text) => (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Tag color={color}>{text}</Tag>
          </div>
        );
        if (flagStatus === constant.FLAG_STATUS_COMPLETE_SCHEDULE) {
          return renderStatusTag("success", "Completed");
        }
        if (
          flagStatus === constant.FLAG_STATUS_PROCUREMENT_REQUEST &&
          row.split_from_id !== null &&
          editTableMode
        ) {
          return renderStatusTag("warning", "Split Request");
        }
        if (
          flagStatus === constant.FLAG_STATUS_PROCUREMENT_REQUEST &&
          row.edit_from_id !== null &&
          editTableMode
        ) {
          return renderStatusTag("warning", "Edit Request");
        }
        if (editTableMode) return;
        if (
          flagStatus === constant.FLAG_STATUS_PROCUREMENT_FROM_PPIC ||
          flagStatus === constant.FLAG_STATUS_PPIC_SEND_RETUR_PROCUREMENT
        ) {
          btnEdit = (
            <Button
              className="mr-1 mb-1"
              size="small"
              type="primary"
              onClick={() => {
                setModalEditData(row.id);
                setModalEditShow(true);
              }}
              style={{ justifyContent: "center", display: "flex" }}
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
              style={{ justifyContent: "center", display: "flex" }}
            >
              {t("Split")}
            </Button>
          );
          btnRetur = (
            <Button
              className="mr-1 mb-1"
              size="small"
              type="danger"
              style={{ justifyContent: "center", display: "flex" }}
              onClick={() => {
                setModalReturScheduleShow(true);
                setModalReturScheduleData(row);
              }}
            >
              {t("Retur")}
            </Button>
          );
          return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {/* {btnSplit} */}
              {/* {btnEdit} */}
              {btnRetur}
            </div>
          );
        }

        if (row.flag_status === constant.FLAG_STATUS_PROCUREMENT_REQUEST && !editTableMode) {
          if (row.split_from_id !== null) {
            tagStatus = <Tag color="warning">Split Request</Tag>;
            btnAcceptSplit = (
              <Button
                className="mr-1 mt-2"
                size="small"
                type="primary"
                style={{ whiteSpace: "normal" }}
                onClick={() =>
                  renderConfirmationModal(
                    api.purchasing.acceptSplit,
                    `Are you sure to accept this split request and forward to PPIC?`,
                  )
                }
              >
                {`Accept Split Request`}
              </Button>
            );
            btnRejectSplit = (
              <Button
                className="mr-1 mt-2"
                size="small"
                type="danger"
                style={{ whiteSpace: "normal" }}
                onClick={() =>
                  renderConfirmationModal(
                    api.purchasing.rejectSplit,
                    `Are you sure to reject this split request?`,
                  )
                }
              >
                {`Reject Split Request`}
              </Button>
            );
          } else if (row.edit_from_id !== null) {
            tagStatus = <Tag color="warning">Edit Request</Tag>;
            btnAcceptEdit = (
              <Button
                className="mr-1 mt-2"
                size="small"
                type="primary"
                style={{ whiteSpace: "normal" }}
                onClick={() =>
                  renderConfirmationModal(
                    api.purchasing.acceptEdit,
                    `Are you sure to accept this edit request and forward to PPIC?`,
                  )
                }
              >
                {`Accept Edit Request`}
              </Button>
            );
            btnRejectEdit = (
              <Button
                className="mr-1 mt-2"
                size="small"
                type="danger"
                style={{ whiteSpace: "normal" }}
                onClick={() =>
                  renderConfirmationModal(
                    api.purchasing.rejectEdit,
                    `Are you sure to reject this edit request?`,
                  )
                }
              >
                Reject Edit Request
              </Button>
            );
          }
          return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {tagStatus}
              {btnAcceptSplit}
              {btnRejectSplit}
              {btnAcceptEdit}
              {btnRejectEdit}
            </div>
          );
        }
      },
    },
  ];

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    //if filterstatus is F then dont show the dataIndex check

    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
        handleCancel,
      }),
    };
  });

  const onSearch = (values) => {
    if (values) {
      if (values.search === "") {
        setSearch(null);
      } else {
        setSearch(values.search);
      }
    }
  };

  const renderTable = () => {
    let scrollX = "100vw";
    if (isMobile) scrollX = 1300;
    return (
      <>
        {offers && offers.length > 0 ? (
          <>
            <Space style={{ marginBottom: "1rem" }}>
              {(!filterStatus ||
                filterStatus === constant.FLAG_STATUS_PROCUREMENT_FROM_PPIC ||
                filterStatus === constant.FLAG_STATUS_PPIC_SEND_RETUR_PROCUREMENT) &&
                !editTableMode && (
                  <>
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
                            content: `There are ${
                              previewRowChecked.filter((item) => item).length
                            } out of ${previewRowChecked.length} data to be sent.}`,
                            onOk: () => {
                              setPageLoading(true);
                              const data = offers.filter(
                                (offer, index) => previewRowChecked[index],
                              );
                              api.purchasing
                                .sendToSupplier(data)
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
                                    content: `Email sent to supplier`,
                                  });
                                  const otherParams = {
                                    from_date: moment(dateRange[0]).format(
                                      constant.FORMAT_API_DATE,
                                    ),
                                    to_date: moment(dateRange[1]).format(constant.FORMAT_API_DATE),
                                    supplier_id: suppliersSearch ?? null,
                                    user_id: usersSearch ?? null,
                                    status: filterStatus,
                                  };
                                  fetchSummary(otherParams);
                                });
                            },
                          });
                        }
                      }}
                      disabled={previewRowChecked.filter((item) => item === true).length === 0}
                    >
                      Send Schedule to Supplier
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => {
                        setDataSource(oldDataSource);
                        setEditTableMode(!editTableMode);
                        setPreviewRowChecked(dataSource.map(() => false));
                      }}
                    >
                      Change to Edit Mode
                    </Button>
                  </>
                )}
              {editTableMode && (
                <>
                  <Button
                    type="primary"
                    onClick={() => {
                      setPageLoading(true);
                      setDataSource(dataSource);
                      setOldDataSource(dataSource);
                      setArrayOfMerge(
                        dataSource.map((currRow, index) => {
                          const nextRow = dataSource[index + 1];
                          const shouldMerge =
                            nextRow &&
                            currRow.supplier_id === nextRow.supplier_id &&
                            currRow.po_number === nextRow.po_number &&
                            currRow.sku_code === nextRow.sku_code &&
                            currRow.po_qty === nextRow.po_qty &&
                            currRow.split_from_id === nextRow.split_from_id;
                          return shouldMerge;
                        }),
                      );
                      setEditTableMode(!editTableMode);
                      api.purchasing
                        .edit(editedData)
                        .then((res) => {
                          message.success("Success");
                        })
                        .catch((err) => {})
                        .finally(() => {
                          setPageLoading(false);
                        });
                    }}
                  >
                    Save Changes
                  </Button>
                  <Button
                    type="danger"
                    onClick={() => {
                      setDataSource(oldDataSource);
                      setEditTableMode(!editTableMode);
                      setCancelClicked(true);
                    }}
                  >
                    Cancel Edit
                  </Button>
                </>
              )}
            </Space>

            <Table
              {...tableProps}
              dataSource={dataSource}
              components={components}
              rowClassName={() => "editable-row"}
              columns={columns}
              pagination={{
                ...configs.TABLE_PAGINATION_SINGLEPAGE,
                total: totalData,
                pageSize: pageSize,
              }}
              scroll={{ x: scrollX, y: "60vh" }}
              sticky={true}
              size="small"
              onChange={handleChange}
            />
          </>
        ) : (
          <TableNotFoundNotice />
        )}
      </>
    );
  };

  const onTabChanged = (key) => {
    if (key === "all") {
      setFilterStatus(null);
      setToggleCheckboxTitle(true);
    } else {
      setFilterStatus(key);
      setToggleCheckboxTitle(true);
    }
    setPageNumber(1);
  };

  const tabPanes = [
    <Tabs.TabPane
      tab={
        <>
          <span className="mr-1">{t("all")}</span>
          {offerSummaryTotal ? <Badge count={offerSummaryTotal} /> : null}
        </>
      }
      key="all"
    >
      {filterStatus === null && renderTable()}
    </Tabs.TabPane>,
  ];
  for (const status in statusMapping) {
    tabPanes.push(
      <Tabs.TabPane
        tab={
          <>
            <span className="mr-1">{utils.snakeToTitleCase(statusMapping[status])}</span>
            {offerSummary && offerSummary[status] && <Badge count={offerSummary[status]} />}
          </>
        }
        key={status}
      >
        {filterStatus && filterStatus === status && <>{renderTable()}</>}
      </Tabs.TabPane>,
    );
  }

  if (!minDateLoaded) return null;

  return (
    <PageContainer
      title={`${t("procurement")} ${t("schedule")}`}
      additionalAction={utils.renderWithPermission(
        userInfo.permissions,
        <Link to="/offers/create">
          <Button size="small">{`${t("add")} ${t("offer")}`}</Button>
        </Link>,
        "offer@create",
      )}
      // btnAction={utils.renderWithPermission(
      //   userInfo.permissions,
      //   <Button
      //     size="small"
      //     onClick={() => {
      //       setModalExportShow(true);
      //     }}
      //     disabled
      //   >
      //     {t("exportXLSX")} ???
      //   </Button>,
      //   "export@xlsx",
      // )}
      breadcrumbs={[
        {
          text: t("Procurement"),
          link: "/procurement/dashboard",
        },
      ]}
    >
      <ModalImportCSV
        visible={modalImportCSVShow}
        onCancel={() => setModalImportCSVShow(false)}
        setPageLoading={setPageLoading}
        onSuccess={() => {
          loadOffers();
          setModalImportCSVShow(false);
          message.success(
            `${t("new")} ${t("schedule")} ${t("toastSuffixSuccess")} ${t("toastImported")}`,
          );
        }}
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

      <SyncOverlay loading={pageLoading} />
      <Form className="mb-2 w-100" form={form} onFinish={onSearch}>
        <Row gutter={12}>
          <Col xs={24} lg={9} xl={7}>
            <Form.Item className="mb-2" name="date" wrapperCol={{ flex: "auto" }}>
              <DatePicker.RangePicker
                defaultValue={dateRange}
                value={dateRange}
                style={{ width: "100%" }}
                {...utils.FORM_RANGEPICKER_PROPS}
                onChange={(dates, dateStrings) => {
                  setDateRange(dates);
                }}
                allowClear={false}
              />
            </Form.Item>
          </Col>
          <Col xs={24} lg={12} xl={4}>
            <Form.Item name="supplier_list" className="mb-2">
              <Select
                showSearch
                // mode="multiple"
                placeholder="Select Supplier"
                optionFilterProp="children"
                onChange={onChangeSupplierList}
                style={{ width: "100%" }}
                filterOption={filterOption}
                options={suppliers}
                defaultValue={null}
              />
            </Form.Item>
          </Col>
          <Col xs={24} lg={12} xl={4}>
            <Form.Item name="user_list" className="mb-2">
              <Select
                showSearch
                placeholder="Select User"
                optionFilterProp="children"
                onChange={onChangeUserList}
                style={{ width: "100%" }}
                filterOption={filterOption}
                options={PPICs}
                defaultValue={userInfo.user_name}
              />
            </Form.Item>
          </Col>
          <Col xs={24} lg={12} xl={4}>
            <Button type="primary" onClick={onResetFilter}>
              Reset Filter
            </Button>
          </Col>
        </Row>
      </Form>
      {console.log(previewRowChecked)}
      <Tabs defaultActiveKey={defaultActiveTab} onChange={onTabChanged}>
        {tabPanes}
      </Tabs>
    </PageContainer>
  );
};

export default withRouter(PurchasingView);
