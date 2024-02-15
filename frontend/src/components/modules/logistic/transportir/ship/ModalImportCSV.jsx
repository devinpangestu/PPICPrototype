import React, { useState, useEffect } from "react";
import { Form, Button, Modal, Table, Checkbox, Upload, Space, Divider, Typography } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import configs from "configs";
import * as CSV from "csv-string";

const { Title } = Typography;

function ModalImportCSV({ visible, onCancel, onSuccess, exportType, transportirId, id }) {
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
    console.log("massCreateReq");
    console.log(massCreateReq);

    api.logistic.ships
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
          if (r.length !== 3) {
            continue;
          }
          if (tempMassCreateFileContent.find((el) => el.ship_id === r[0])) {
            // skip duplicate ship_id
            continue;
          }
          tempMassCreateFileContent.push({
            transportir_id: transportirId,
            ship_id: r[0],
            name: r[1],
            capacity: Number(r[2]),
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
  ];

  const isPreview = dataSource && dataSource.length > 0;

  const btnCancel = (
    <Button type="secondary" onClick={onCancel}>
      {t("cancel")}
    </Button>
  );

  return (
    <Modal open={visible} onCancel={onCancel} footer={null} title={t("importFromCSV")}>
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
