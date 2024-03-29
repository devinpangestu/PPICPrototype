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

function ModalImportCSV({ visible, onCancel, onSuccess, exportType, id }) {
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
          if (r.length !== 9) {
            continue;
          }
          if (tempMassCreateFileContent.find((el) => el.po_number === r[0])) {
            // skip duplicate transportir_id
            continue;
          }
          tempMassCreateFileContent.push({
            submission_date: sendToApiFormat(r[0]),
            supplier_name: r[1],
            po_number: r[2],
            po_qty: utils.convertSeparateValueToNumericValue(r[3]),
            po_outs: utils.convertSeparateValueToNumericValue(r[4]),
            sku_code: r[5],
            sku_name: r[6],
            qty_delivery: utils.convertSeparateValueToNumericValue(r[7]),
            est_delivery: sendToApiFormat(r[8]),
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
    <Button type="secondary" onClick={onCancel}>
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
        <Button icon={<UploadOutlined />}>{t("uploadCSV")}</Button>
      </Upload>
      <Divider />
      {isPreview ? (
        <>
          <Title level={5}>{t("preview")}</Title>
          <Form form={form} onFinish={handleOnSubmit} autoComplete="off">
            <Table
              className="mb-6"
              dataSource={dataSource}
              columns={columns}
              {...configs.TABLE_SINGLEPAGE}
            />
            <Form.Item wrapperCol={{ span: 24 }} className="text-right mb-0">
              <Space>
                {btnCancel}
                <Button type="primary" htmlType="submit" disabled={isUploading}>
                  {isUploading ? "Uploading..." : t("upload")}
                </Button>
              </Space>
            </Form.Item>
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
