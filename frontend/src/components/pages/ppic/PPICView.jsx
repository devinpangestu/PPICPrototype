import React, { useMemo, useContext, useEffect, useRef, useState } from "react";
import { withRouter } from "react-router-dom";
import { PageContainer } from "components/layout";
import { TableNotFoundNotice, SyncOverlay } from "components";
import { usePageStore } from "state/pageState";
import {
  Row,
  Col,
  Form,
  Button,
  Tabs,
  Badge,
  DatePicker,
  message,
  Modal,
  Select,
  Checkbox,
  Space,
  Table,
  Tag,
  Input,
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
import { authorizationCheck, isMobile } from "utils/auth";
import { useSearchFilterStore } from "state/ppic/searchFilterState";
import { useDataStore } from "state/ppic/dataState";

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
      record.flag_status === "X" ||
      record.flag_status === "G" ||
      record.flag_status === "B" ||
      record.flag_status === "D" ||
      record.flag_status === "F" ||
      record.flag_status === "E"
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
    } catch (errInfo) {}
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
          name={dataIndex}
        >
          <DatePicker
            allowClear={false}
            inputReadOnly={false}
            {...utils.FORM_DATEPICKER_PROPS}
            ref={inputRef}
            onPressEnter={save}
            onBlur={save}
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

const PPICView = (props) => {
  const statusMapping = {
    A: "PPIC Init",
    C: "Retur From Procurement",
    G: "Request Changes From Supplier",
    // OK: "Confirmed Schedule",
    X: "Completed",
  };

  const userInfo = utils.getUserInfo();
  const { pageLoading, setPageLoading } = usePageStore();

  const [t] = useTranslation();
  const [form] = Form.useForm();

  const pageSize = configs.pageSize.ppic.dashboard;

  let defaultFilterStatus = null;
  let defaultActiveTab = "all";
  if (userInfo.role.id === 2) {
    defaultFilterStatus = "A";
    defaultActiveTab = defaultFilterStatus;
  } else if (userInfo.role.id === 3) {
    defaultFilterStatus = "B";
    defaultActiveTab = defaultFilterStatus;
  } else if (userInfo.role.id === 4) {
    defaultFilterStatus = "E";
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
        return (
          <p style={{ margin: 0 }}>
            {`${moment(JSON.parse(record.notes)?.updated_at).format(
              constant.FORMAT_DISPLAY_DATETIME,
            )} ${JSON.parse(record.notes)?.updated_by} : ${
              JSON.parse(record.notes)?.retur_proc_ppic
            }`}
          </p>
        );
      }
    },
    rowExpandable: (record) => {
      const checkFlagStatus = (record) =>
        (record.flag_status === "C" || record.flag_status === "G") &&
        (JSON.parse(record.notes)?.retur_proc_ppic ||
          JSON.parse(record.notes)?.edit_req_sup ||
          JSON.parse(record.notes)?.split_req_sup);
      return checkFlagStatus(record);
    },
  });

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
  const {
    modalImportCSVShow,
    setModalImportCSVShow,
    modalCreateShow,
    setModalCreateShow,
    modalSplitScheduleShow,
    setModalSplitScheduleShow,
    modalSplitScheduleData,
    setModalSplitScheduleData,
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
    arrayOfMerge,
    setArrayOfMerge,
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
  //animation
  const [deletedRows, setDeletedRows] = useState([]);

  const rowClassName = (record, index) => {
    const isDeleted = deletedRows.some((deletedRow) => deletedRow?.id === record?.id);

    return isDeleted && filterStatus !== "deleted"
      ? "editable-row fade-out-exiting"
      : "editable-row";
  };

  const fetchData = async (params) => {
    setPageLoading(true);
    try {
      const responseList = await api.ppic.list(search, 1000, 1, params);

      const rsBodyList = responseList.data.rs_body;
      const offerData = rsBodyList.offer.filter((offer) => !offer.deleted_at);
      const offerDataCheckList = rsBodyList.offer.filter(
        (item) =>
          item.flag_status !== "X" &&
          item.flag_status !== "G" &&
          item.flag_status !== "B" &&
          item.flag_status !== "D" &&
          item.flag_status !== "F" &&
          item.flag_status !== "E" &&
          !item.deleted_at,
      );

      setOldDataSource(offerData.map((offer, index) => ({ key: index + 1, ...offer })));
      setDataSource([...offerData]);
      setOffers([...offerData]);
      setTotalData(offerData.length);
      setDeletedRows(rsBodyList.offer.filter((row) => row.deleted_at !== null));

      if (offerData.length > 0) {
        setPreviewRowChecked(offerDataCheckList.map(() => false));
        setArrayOfMerge(
          offerData.map((currRow, index) => {
            const nextRow = offerData[index + 1];
            return (
              nextRow &&
              currRow.supplier_id === nextRow.supplier_id &&
              currRow.po_number === nextRow.po_number &&
              currRow.sku_code === nextRow.sku_code &&
              currRow.po_qty === nextRow.po_qty &&
              currRow.flag_status === nextRow.flag_status &&
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
      const responseSummary = await api.ppic.summary(params);
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

  const fetchDeletedData = async (params) => {
    setPageLoading(true);
    try {
      const responseList = await api.ppic.list(search, 1000, 1, params);
      const responseSummary = await api.ppic.summary(params);

      const rsBodyList = responseList.data.rs_body;
      const offerData = rsBodyList.offer;
      const offerDataCheckList = rsBodyList.offer.filter(
        (item) =>
          item.flag_status !== "X" &&
          item.flag_status !== "G" &&
          item.flag_status !== "B" &&
          item.flag_status !== "D" &&
          item.flag_status !== "F" &&
          item.flag_status !== "E" &&
          !item.deleted_at,
      );

      setOldDataSource(offerData.map((offer, index) => ({ key: index + 1, ...offer })));
      setDataSource([...offerData]);
      setOffers([...offerData]);
      setTotalData(offerData.length);
      setDeletedRows(rsBodyList.offer.filter((row) => row.deleted_at !== null));

      if (offerData.length > 0) {
        setPreviewRowChecked(offerDataCheckList.map(() => false));
        setArrayOfMerge(
          offerData.map((currRow, index) => {
            const nextRow = offerData[index + 1];
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

  const handleChange = (pagination, filters, sorter, extra) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);
    setArrayOfMerge(
      extra.currentDataSource.map((currRow, index) => {
        const nextRow = extra.currentDataSource[index + 1];
        return (
          nextRow &&
          currRow.supplier_id === nextRow.supplier_id &&
          currRow.po_number === nextRow.po_number &&
          currRow.sku_code === nextRow.sku_code &&
          currRow.po_qty === nextRow.po_qty &&
          currRow.flag_status === nextRow.flag_status &&
          currRow.split_from_id === nextRow.split_from_id &&
          (currRow.flag_status !== "X" ||
            currRow.flag_status !== "G" ||
            currRow.flag_status === "B" ||
            currRow.flag_status === "D" ||
            currRow.flag_status === "F" ||
            currRow.flag_status === "E")
        );
      }),
    );
    setDataSource(extra.currentDataSource);
  };

  const loadSuppliersOption = async () => {
    await handler.getSuppliersOptionList(setPageLoading, setSuppliers);
    await handler.getPPICs(setPageLoading, setPPICs);
  };
  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const handleCheckboxChange = (index, initialChecked) => {
    const updatedPreviewRowChecked = previewRowChecked.map((isChecked, i) =>
      i === index ? !isChecked : isChecked,
    );
    // If the title checkbox is checked, update all checkboxes
    if (initialChecked) {
      setPreviewRowChecked(updatedPreviewRowChecked);
    }
  };
  const onChangeSupplierList = async (value) => {
    let errMsg;

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
    let errMsg;

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
    api.ppic
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

  //when offers change load the user that responsible for making notes

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

    if (filterStatus !== "deleted") {
      await fetchData(otherParams);
    } else {
      await fetchDeletedData(otherParams);
    }
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
    } else if (!arrayOfMerge[index] && arrayOfMerge[index - 1] === false) {
      return {};
    } else {
      // count the next true value and break the loop after false,
      // and if the true is counted, ignore them
      let count = 0;

      for (let i = index; i < arrayOfMerge.length; i++) {
        if (arrayOfMerge[i] === true) {
          count++;
        } else {
          break;
        }
      }

      if (arrayOfMerge[index - 1] === true) {
        return { rowSpan: 0 };
      }
      if (arrayOfMerge[index] === undefined) {
        return { rowSpan: 10 };
      }
      return { rowSpan: count + 1 };
    }
  };
  // const getCellConfig = useMemo(() => {
  //   return (index) => {
  //     if (arrayOfMerge[index] === false && arrayOfMerge[index - 1] === true) {
  //       return { rowSpan: 0 };
  //     } else if (arrayOfMerge[index] === false && arrayOfMerge[index - 1] === false) {
  //       return {};
  //     } else {
  //       let count = 0;
  //       if (arrayOfMerge[index - 1] === true) {
  //         return { rowSpan: 0 };
  //       }
  //       for (let i = index; i < arrayOfMerge.length; i++) {
  //         if (arrayOfMerge[i] === true) {
  //           count++;
  //         } else {
  //           break;
  //         }
  //       }
  //       return { rowSpan: count + 1 };
  //     }
  //   };
  // }, [arrayOfMerge]);

  const handleDelete = (key) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
  };
  const handleSave = (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    //check the new data and the old data, if id exist in old, remove old and replace new
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
      title: (_v, record, index) => {
        if (editTableMode || ["X", "G", "B", "D", "F", "E", "deleted"].includes(filterStatus))
          return;
        const isDataComplete = (record) => {
          const flagStatus = record?.flag_status;
          switch (filterStatus) {
            case "A":
              return !(flagStatus === "X" || flagStatus === "G" || flagStatus === "C");
            case "C":
              return !(flagStatus === "X" || flagStatus === "G" || flagStatus === "A");
            case "G":
              return !(flagStatus === "X" || flagStatus === "A" || flagStatus === "C");
            default:
              return !(flagStatus === "X" || flagStatus === "G");
          }
        };

        return (
          <>
            <Checkbox
              checked={previewRowChecked.every((item) => {
                return item;
              })}
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
              }}
            />
          </>
        );
      },
      dataIndex: "check",
      key: "check",
      render: (_v, record, index) => {
        const flagStatus = record?.flag_status;
        if (editTableMode || ["X", "G", "B", "D", "F", "E", "deleted"].includes(filterStatus))
          return;
        if (
          !filterStatus &&
          (flagStatus === "X" ||
            flagStatus === "G" ||
            flagStatus === "B" ||
            flagStatus === "D" ||
            flagStatus === "F" ||
            flagStatus === "E")
        )
          return;
        const isDataComplete = (record) => {
          return (
            record.flag_status !== "X" ||
            record.flag_status !== "G" ||
            record.flag_status !== "B" ||
            record.flag_status !== "D" ||
            record.flag_status !== "F" ||
            record.flag_status !== "E"
          );
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
              onClick={() => {
                console.log(previewRowChecked);
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
      editable: editTableMode,
      onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),

      render: (_, row) => {
        return moment(row.submission_date).format(constant.FORMAT_DISPLAY_DATE);
      },
    },
    {
      title: t("supplierName"),
      dataIndex: "supplier_name",
      key: "supplier_name",
      onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),

      render: (_, row) => {
        return row?.supplier?.name;
      },
    },
    {
      title: t("No PR/PO"),
      dataIndex: "po_number",
      key: "po_number",
      editable: editTableMode,
      onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),

      filteredValue: filteredInfo?.po_number || null,
      onFilter: (value, record) => {
        return record.po_number.replace(/^\W*POF/, "").includes(value);
      }, //filter
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
        return row?.po_number;
      },
    },
    {
      title: t("Qty PR/PO"),
      dataIndex: "po_qty",
      key: "po_qty",
      editable: editTableMode,
      onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),

      render: (_, row) => {
        return utils.thousandSeparator(row?.po_qty);
      },
    },
    {
      title: t("Outs PR/PO"),
      dataIndex: "po_outs",
      key: "po_outs",
      editable: editTableMode,
      onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),

      render: (_, row) => {
        return utils.thousandSeparator(row?.po_outs);
      },
    },
    {
      title: t("SKUCode"),
      dataIndex: "sku_code",
      key: "sku_code",
      editable: editTableMode,
      onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),
    },
    {
      title: t("SKUName"),
      dataIndex: "sku_name",
      key: "sku_name",
      editable: editTableMode,
      onCell: (_, index) => ({ ...getCellConfig(arrayOfMerge, index) }),
    },
    {
      title: t("qtyDelivery"),
      dataIndex: "qty_delivery",
      key: "qty_delivery",
      editable: editTableMode,
      render: (_, row) => {
        return utils.thousandSeparator(row?.qty_delivery);
      },
    },
    {
      title: t("estDelivery"),
      dataIndex: "est_delivery",
      key: "est_delivery",
      editable: editTableMode,
      render: (_, row) => {
        return moment(row?.est_delivery).format(constant.FORMAT_DISPLAY_DATE) ?? "-";
      },
    },
    {
      title: t("supplierQty"),
      dataIndex: "submitted_qty",
      key: "submitted_qty",
      render: (_, row) => {
        return utils.thousandSeparator(row?.submitted_qty);
      },
    },
    {
      title: t("supplierDate"),
      dataIndex: "est_submitted_date",
      key: "est_submitted_date",
      render: (_, row) => {
        return row?.est_submitted_date
          ? moment(row?.est_submitted_date).format(constant.FORMAT_DISPLAY_DATE)
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
          filterStatus === "A" ||
          filterStatus === "C" ||
          filterStatus === "X" ||
          (!filterStatus &&
            dataSource[index]?.flag_status !== "G" &&
            dataSource[index]?.flag_status !== "B" &&
            dataSource[index]?.flag_status !== "D" &&
            dataSource[index]?.flag_status !== "F" &&
            dataSource[index]?.flag_status !== "E")
        )
          return;
        return { ...getCellConfig(arrayOfMerge, index) };
      },
      render: (_, row) => {
        // let btnEdit;
        let btnSplit;
        let btnDelete;
        let tagStatus;
        let btnAcceptSplit;
        let btnRejectSplit;
        let btnAcceptEdit;
        let btnRejectEdit;
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
                  setPageLoading(false);
                  loadOffers();
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
        if (row.deleted_at !== null) return renderStatusTag("error", "Deleted");
        if (row.flag_status === "B" || row.flag_status === "D") {
          return renderStatusTag("error", "at Procurement");
        }
        if (row.flag_status === "E") {
          return renderStatusTag("error", `at Supplier ${row.supplier.name}`);
        }
        if (row.flag_status === "F" && row.split_from_id !== null) {
          return renderStatusTag("warning", "Split Request (Supplier to Procurement)");
        }
        if (row.flag_status === "F" && row.edit_from_id !== null) {
          return renderStatusTag("warning", "Edit Request (Supplier to Procurement)");
        }
        if (row.flag_status === "X") {
          return renderStatusTag("success", "Completed");
        }

        if (editTableMode) return;

        if (row.flag_status === "A" || row.flag_status === "C") {
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

          btnDelete = (
            <Button
              className="mr-1 mb-1"
              size="small"
              type="danger"
              onClick={() => {
                Modal.confirm({
                  ...constant.MODAL_SUCCESS_DEFAULT_PROPS,
                  content: `Are you sure to delete this data?`,
                  onOk: () => {
                    api.ppic
                      .delete(row.id)
                      .then((res) => {
                        message.success("Delete Success");
                        const updatedData = dataSource.filter((item) => item.id !== row.id);
                        setDeletedRows([...deletedRows, row]);
                        setTimeout(() => {
                          setDataSource(updatedData);
                        }, 500);
                      })
                      .catch((error) => {
                        utils.swal.Error({ msg: utils.getErrMsg(error) });
                      })
                      .finally(() => {
                        loadOffers();
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
              }}
            >
              {t("Delete")}
            </Button>
          );
        }
        if (row.flag_status === "G") {
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
                    api.ppic.acceptSplit,
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
                    api.ppic.rejectSplit,
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
                    api.ppic.acceptEdit,
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
                    api.ppic.rejectEdit,
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

        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {btnSplit}
            {/* {btnEdit} */}
            {btnDelete}
          </div>
        );
      },
    },
  ];

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
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
              {(!filterStatus || filterStatus === "A" || filterStatus === "C") &&
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
                              api.ppic
                                .sendToPurchasing(data)
                                .then((res) => {
                                  message.success("Success");
                                })
                                .catch((err) => {
                                  utils.swal.Error({ msg: utils.getErrMsg(err) });
                                })
                                .finally(() => {
                                  setPageLoading(false);
                                  loadOffers();
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
                      Send Schedule to Procurement
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
                            currRow.flag_status === nextRow.flag_status &&
                            currRow.split_from_id === nextRow.split_from_id;
                          return shouldMerge;
                        }),
                      );
                      setEditTableMode(!editTableMode);
                      api.ppic
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
                      setEditedData([]);
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
              rowKey="id"
              rowClassName={rowClassName}
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

  tabPanes.push(
    <Tabs.TabPane
      tab={
        <>
          {t("Deleted")}
          {offerSummary && offerSummary["deleted"] && <Badge count={offerSummary["deleted"]} />}
        </>
      }
      key="deleted"
    >
      {renderTable()}
    </Tabs.TabPane>,
  );

  if (!minDateLoaded) return null;

  return (
    <PageContainer
      title={`${t("PPIC")} ${t("schedule")}`}
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
              <Button
                size="small"
                onClick={() => {
                  setModalImportCSVShow(true);
                }}
              >
                {t("importFromCSV")}
              </Button>
            </Space>,
            "ppic@create",
          )}
        </>
      }
      breadcrumbs={[
        {
          text: t("PPIC"),
          link: "/ppic/dashboard",
        },
      ]}
    >
      <ModalImportCSV
        visible={modalImportCSVShow}
        onCancel={() => setModalImportCSVShow(false)}
        setPageLoading={setPageLoading}
        onSuccess={() => {
          setModalImportCSVShow(false);
          message.success(
            `${t("new")} ${t("schedule")} ${t("toastSuffixSuccess")} ${t("toastImported")}`,
          );
          loadOffers();
          const otherParams = {
            from_date: moment(dateRange[0]).format(constant.FORMAT_API_DATE),
            to_date: moment(dateRange[1]).format(constant.FORMAT_API_DATE),
            supplier_id: suppliersSearch ?? null,
            user_id: usersSearch ?? null,
            status: filterStatus,
          };
          fetchSummary(otherParams);
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
          const otherParams = {
            from_date: moment(dateRange[0]).format(constant.FORMAT_API_DATE),
            to_date: moment(dateRange[1]).format(constant.FORMAT_API_DATE),
            supplier_id: suppliersSearch ?? null,
            user_id: usersSearch ?? null,
            status: filterStatus,
          };
          fetchSummary(otherParams);
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
          const otherParams = {
            from_date: moment(dateRange[0]).format(constant.FORMAT_API_DATE),
            to_date: moment(dateRange[1]).format(constant.FORMAT_API_DATE),
            supplier_id: suppliersSearch ?? null,
            user_id: usersSearch ?? null,
            status: filterStatus,
          };
          fetchSummary(otherParams);
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
          const otherParams = {
            from_date: moment(dateRange[0]).format(constant.FORMAT_API_DATE),
            to_date: moment(dateRange[1]).format(constant.FORMAT_API_DATE),
            supplier_id: suppliersSearch ?? null,
            user_id: usersSearch ?? null,
            status: filterStatus,
          };
          fetchSummary(otherParams);
        }}
        id={modalEditData}
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
      {console.log("previewRowChecked", previewRowChecked)}
      <Tabs defaultActiveKey={defaultActiveTab} onChange={onTabChanged}>
        {tabPanes}
      </Tabs>
    </PageContainer>
  );
};

export default withRouter(PPICView);
