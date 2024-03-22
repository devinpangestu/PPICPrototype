import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Modal,
  Table,
  Checkbox,
  Upload,
  Tag,
  Space,
  Divider,
  Typography,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import moment from "moment";
import configs from "configs";
import constant from "constant";
import * as CSV from "csv-string";
import { sendToApiFormat, standardizeDate } from "utils/validation";

const { Title } = Typography;

function ModalImportCSV({ visible, onCancel, onSuccess, setPageLoading, id }) {
  const [t] = useTranslation();
  const [form] = Form.useForm();

  const [isUploading, setIsUploading] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(null);
  const [massCreateFileContent, setMassCreateFileContent] = useState([]);

  const [previewRowChecked, setPreviewRowChecked] = useState([]);

  useEffect(() => {
    setFileUploaded(null);
    setMassCreateFileContent([]);
    setPreviewRowChecked([]);
  }, [visible]);

  useEffect(() => {
    if (fileUploaded) {
      handleOnUpload();
    }
  }, [fileUploaded]);

  const handleOnSubmit = (values) => {
    setPageLoading(true);
    const massCreateReq = [];
    for (let i = 0; i < massCreateFileContent.length; i++) {
      if (previewRowChecked[i] === true) {
        massCreateReq.push(massCreateFileContent[i]);
      }
    }

    api.ppic
      .create({ mass: massCreateReq }, true)
      .then(function (response) {
        onSuccess();
      })
      .catch(function (error) {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(function () {
        setPageLoading(false);
      });
  };

  const handleOnUpload = () => {
    setIsUploading(true);

    try {
      const tempMassCreateFileContent = [];
      const reader = new FileReader();
      reader.readAsText(fileUploaded);

      reader.onloadend = (e) => {
        const rows = CSV.parse(e.target.result);
        for (const r of rows) {
          if (r.every((value) => value === "")) {
            continue;
          }
          // if (tempMassCreateFileContent.find((el) => el.po_number === r[4])) {
          //   continue;
          // }
          tempMassCreateFileContent.push({
            io_filter: r[0],
            category_filter: r[1],
            submission_date: sendToApiFormat(r[2]),
            supplier_name: r[3],
            po_number: r[4],
            po_qty: utils.convertSeparateValueToNumericValue(r[5]),
            po_outs: utils.convertSeparateValueToNumericValue(r[6]),
            sku_code: r[7],
            sku_name: r[8],
            qty_delivery: utils.convertSeparateValueToNumericValue(r[9]),
            est_delivery: sendToApiFormat(r[10]),
            notes_ppic: r[11],
          });
        }
        setMassCreateFileContent(tempMassCreateFileContent);
        setPreviewRowChecked(new Array(tempMassCreateFileContent.length).fill(true));

        if (tempMassCreateFileContent.length === 0) {
          utils.swal.Error({ msg: "Invalid CSV Format" });
          return;
        }
        setIsUploading(false);
      };
    } catch (error) {
      utils.swal.Error({ msg: utils.getErrMsg(error) });
    }
  };

  const dataSource = [];

  if (massCreateFileContent) {
    for (let i = 0; i < massCreateFileContent.length; i++) {
      const d = massCreateFileContent[i];
      dataSource.push({
        key: i + 1,
        ...d,
      });
    }
  }

  const columns = [
    {
      title: "",
      dataIndex: "check",
      key: "check",
      render: (_v, _r, index) => {
        return (
          <Checkbox
            checked={previewRowChecked[index]}
            onChange={(e) => {
              const updatedCheckedState = previewRowChecked.map((item, i) =>
                i === index ? !item : item,
              );
              setPreviewRowChecked(updatedCheckedState);
            }}
          />
        );
      },
    },
    {
      title: t("I/O Pabrik"),
      dataIndex: "io_filter",
      key: "io_filter",
      render: (_, row) => {
        return row.io_filter;
      },
    },
    {
      title: t("Category"),
      dataIndex: "category_filter",
      key: "category_filter",
      render: (_, row) => {
        return row.category_filter;
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
    { title: t("supplierName"), dataIndex: "supplier_name", key: "supplier_name" },
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
        return moment(row.est_delivery).format(constant.FORMAT_DISPLAY_DATE);
      },
    },
    {
      title: t("notes"),
      dataIndex: "notes_ppic",
      key: "notes_ppic",
      render: (_, row) => {
        return row.notes_ppic;
      },
    },
    // {
    //   title: t("transportirId"),
    //   dataIndex: "transportir_id",
    //   key: "transportir_id",
    // },
    // {
    //   title: t("types"),
    //   dataIndex: "types",
    //   key: "types",
    //   render: (_, row) => {
    //     const tags = row.types.map((el) => {
    //       const elR = el.toLowerCase();
    //       const variant = constant.TRANSPORTIR_TYPE_VARIANT_MAP[elR]
    //         ? constant.TRANSPORTIR_TYPE_VARIANT_MAP[elR]
    //         : "primary";
    //       return (
    //         <Tag key={elR} color={variant}>
    //           {utils.snakeToTitleCase(elR)}
    //         </Tag>
    //       );
    //     });
    //     return <Space>{tags}</Space>;
    //   },
    // },
    // {
    //   title: t("name"),
    //   dataIndex: "name",
    //   key: "name",
    // },
  ];

  const isPreview = dataSource && dataSource.length > 0;

  const btnCancel = (
    <Button type="secondary" onClick={onCancel} style={{ marginBottom: "1rem" }}>
      {t("cancel")}
    </Button>
  );

  return (
    <Modal width="80%" open={visible} onCancel={onCancel} footer={null} title={t("importFromCSV")}>
      <Upload
        name={"file"}
        onRemove={(file) => {
          setFileUploaded(null);
        }}
        beforeUpload={(file) => {
          setFileUploaded(file);
          return false;
        }}
        fileList={fileUploaded ? [fileUploaded] : undefined}
      >
        <Button icon={<UploadOutlined />}>{t("selectFile")}</Button>
      </Upload>
      <Divider />
      {isPreview ? (
        <>
          <Title level={5}>{t("preview")}</Title>
          <Form form={form} onFinish={handleOnSubmit} autoComplete="off">
            <Form.Item wrapperCol={{ span: 24 }} className="text-right mb-0">
              <Space>
                {btnCancel}
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={isUploading}
                  style={{ marginBottom: "1rem" }}
                >
                  {isUploading ? "Uploading..." : t("upload")}
                </Button>
              </Space>
            </Form.Item>
            <Table
              className="mb-6"
              dataSource={dataSource}
              columns={columns}
              {...configs.TABLE_SINGLEPAGE}
            />
          </Form>
        </>
      ) : (
        <Form.Item wrapperCol={{ span: 24 }} className="text-right mb-0">
          {btnCancel}
        </Form.Item>
      )}
    </Modal>
  );
}

export default ModalImportCSV;
// import React, { useState, useEffect } from "react";
// import {
//   Form,
//   Button,
//   Modal,
//   Table,
//   Checkbox,
//   Upload,
//   Tag,
//   Space,
//   Divider,
//   Typography,
// } from "antd";
// import { UploadOutlined } from "@ant-design/icons";
// import { api } from "api";
// import { useTranslation } from "react-i18next";
// import utils from "utils";
// import moment from "moment";
// import configs from "configs";
// import constant from "constant";
// import * as CSV from "csv-string";
// import { sendToApiFormat, standardizeDate } from "utils/validation";

// const { Title } = Typography;

// function ModalImportCSV({ visible, onCancel, onSuccess, setPageLoading, id }) {
//   const [t] = useTranslation();
//   const [form] = Form.useForm();

//   const [isUploading, setIsUploading] = useState(false);
//   const [fileUploaded, setFileUploaded] = useState([]);
//   const [massCreateFileContent, setMassCreateFileContent] = useState([]);

//   const [previewRowChecked, setPreviewRowChecked] = useState([]);

//   useEffect(() => {
//     setFileUploaded([]);
//     setMassCreateFileContent([]);
//     setPreviewRowChecked([]);
//   }, [visible]);

//   useEffect(() => {
//     console.log("useeffect triggered");
//     console.log(fileUploaded.length);
//     if (fileUploaded.length > 0) {
//       handleOnUpload();
//     }
//   }, [fileUploaded]);

//   const handleOnSubmit = (values) => {
//     setPageLoading(true);
//     const massCreateReq = [];
//     for (let i = 0; i < massCreateFileContent.length; i++) {
//       if (previewRowChecked[i] === true) {
//         massCreateReq.push(massCreateFileContent[i]);
//       }
//     }

//     api.ppic
//       .create({ mass: massCreateReq }, true)
//       .then(function (response) {
//         onSuccess();
//       })
//       .catch(function (error) {
//         utils.swal.Error({ msg: utils.getErrMsg(error) });
//       })
//       .finally(function () {
//         setPageLoading(false);
//       });
//   };

//   const handleOnUpload = () => {
//     setIsUploading(true);

//     try {
//       const tempMassCreateFileContent = [];
//       const reader = new FileReader();
//       for (let key = 0; key < fileUploaded.length; key++) {
//         reader.readAsText(fileUploaded[key]);
//         reader.onloadend = (e) => {
//           const rows = CSV.parse(e.target.result);
//           for (const r of rows) {
//             if (r.length !== 9) {
//               continue;
//             }
//             if (tempMassCreateFileContent.find((el) => el.po_number === r[0])) {
//               // skip duplicate transportir_id
//               continue;
//             }
//             tempMassCreateFileContent.push({
//               submission_date: sendToApiFormat(r[0]),
//               supplier_name: r[1],
//               po_number: r[2],
//               po_qty: utils.convertSeparateValueToNumericValue(r[3]),
//               po_outs: utils.convertSeparateValueToNumericValue(r[4]),
//               sku_code: r[5],
//               sku_name: r[6],
//               qty_delivery: utils.convertSeparateValueToNumericValue(r[7]),
//               est_delivery: sendToApiFormat(r[8]),
//             });
//           }
//           setMassCreateFileContent([...massCreateFileContent, ...tempMassCreateFileContent]);
//           setPreviewRowChecked(
//             new Array([...massCreateFileContent, ...tempMassCreateFileContent].length).fill(true),
//           );

//           if ([...massCreateFileContent, ...tempMassCreateFileContent].length === 0) {
//             utils.swal.Error({ msg: "Invalid CSV Format" });
//             return;
//           }
//         };
//       }
//       setIsUploading(false);
//     } catch (error) {
//       utils.swal.Error({ msg: utils.getErrMsg(error) });
//     }
//   };

//   const dataSource = [];
//   if (massCreateFileContent) {
//     for (let i = 0; i < massCreateFileContent.length; i++) {
//       const d = massCreateFileContent[i];
//       dataSource.push({
//         key: i + 1,
//         ...d,
//       });
//     }
//   }

//   const columns = [
//     {
//       title: "",
//       dataIndex: "check",
//       key: "check",
//       render: (_v, _r, index) => {
//         return (
//           <Checkbox
//             checked={previewRowChecked[index]}
//             onChange={(e) => {
//               const updatedCheckedState = previewRowChecked.map((item, i) =>
//                 i === index ? !item : item,
//               );
//               setPreviewRowChecked(updatedCheckedState);
//             }}
//           />
//         );
//       },
//     },
//     {
//       title: t("submissionDate"),
//       dataIndex: "submission_date",
//       key: "submission_date",
//       render: (_, row) => {
//         return moment(row.submission_date).format(constant.FORMAT_DISPLAY_DATE);
//       },
//     },
//     { title: t("supplierName"), dataIndex: "supplier_name", key: "supplier_name" },
//     { title: t("No PR/PO"), dataIndex: "po_number", key: "po_number" },
//     {
//       title: t("Qty PR/PO"),
//       dataIndex: "po_qty",
//       key: "po_qty",
//       render: (_, row) => {
//         return utils.thousandSeparator(row.po_qty);
//       },
//     },
//     {
//       title: t("Outs PR/PO"),
//       dataIndex: "po_outs",
//       key: "po_outs",
//       render: (_, row) => {
//         return utils.thousandSeparator(row.po_outs);
//       },
//     },
//     { title: t("SKUCode"), dataIndex: "sku_code", key: "sku_code" },
//     { title: t("SKUName"), dataIndex: "sku_name", key: "sku_name" },
//     {
//       title: t("qtyDelivery"),
//       dataIndex: "qty_delivery",
//       key: "qty_delivery",
//       render: (_, row) => {
//         return utils.thousandSeparator(row.qty_delivery);
//       },
//     },
//     {
//       title: t("estDelivery"),
//       dataIndex: "est_delivery",
//       key: "est_delivery",
//       render: (_, row) => {
//         return moment(row.est_delivery).format(constant.FORMAT_DISPLAY_DATE);
//       },
//     },
//   ];

//   const isPreview = dataSource && dataSource.length > 0;

//   const btnCancel = (
//     <Button type="secondary" onClick={onCancel} style={{ marginBottom: "1rem" }}>
//       {t("cancel")}
//     </Button>
//   );

//   return (
//     <Modal width="80%" open={visible} onCancel={onCancel} footer={null} title={t("importFromCSV")}>
//       <Upload
//         name={"file"}
//         onRemove={(file) => {
//           setFileUploaded([]);
//         }}
//         beforeUpload={(file) => {
//           setFileUploaded([...fileUploaded, ...file]);
//           return false;
//         }}
//         fileList={fileUploaded.length > 0 ? fileUploaded : undefined}
//       >
//         <Button icon={<UploadOutlined />}>{t("selectFile")}</Button>
//       </Upload>
//       <Divider />
//       {isPreview ? (
//         <>
//           <Title level={5}>{t("preview")}</Title>
//           <Form form={form} onFinish={handleOnSubmit} autoComplete="off">
//             <Form.Item wrapperCol={{ span: 24 }} className="text-right mb-0">
//               <Space>
//                 {btnCancel}
//                 <Button
//                   type="primary"
//                   htmlType="submit"
//                   disabled={isUploading}
//                   style={{ marginBottom: "1rem" }}
//                 >
//                   {isUploading ? "Uploading..." : t("upload")}
//                 </Button>
//               </Space>
//             </Form.Item>
//             <Table
//               className="mb-6"
//               dataSource={dataSource}
//               columns={columns}
//               {...configs.TABLE_SINGLEPAGE}
//             />
//           </Form>
//         </>
//       ) : (
//         <Form.Item wrapperCol={{ span: 24 }} className="text-right mb-0">
//           {btnCancel}
//         </Form.Item>
//       )}
//     </Modal>
//   );
// }

// export default ModalImportCSV;
