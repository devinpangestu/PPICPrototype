import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Modal, Upload, message } from "antd";
import { UploadOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import constant from "constant";
import Swal from "sweetalert2";
import { getErrMsg } from "utils/errors";
import { snakeToTitleCase } from "utils/strings";
import { isEmptyObj } from "utils/validation";

function ModalUpload({ visible, onCancel, onOk, data = {}, existingFile = null }) {
  const [t] = useTranslation();
  const [processing, setProcessing] = useState(false);
  const [currFile, setCurrFile] = useState(null);
  const [currFileInfo, setCurrFileInfo] = useState(null);
  const [currFileList, setCurrFileList] = useState([]);

  const [toDelFileInfo, setToDelFileInfo] = useState(null);

  useEffect(() => {
    if (existingFile) {
      setCurrFileInfo({
        uid: existingFile.uid,
        url: existingFile.url,
      });
      setCurrFileList([
        {
          uid: existingFile.uid,
          name: existingFile.name,
          status: "done",
          url: existingFile.url,
        },
      ]);
    } else {
      setCurrFileList([]);
      setCurrFileInfo(null);
      setToDelFileInfo(null);
    }
    setCurrFile(null);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpload = async () => {
    const formData = new FormData();
    formData.set("file", currFile);
    formData.set("uid", currFile.uid);

    for (const key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        formData.set(key, data[key]);
      }
    }

    setProcessing(true);

    if (toDelFileInfo) {
      const errDel = await api.file
        .delete(toDelFileInfo.uid, toDelFileInfo.url)
        .then((res) => {
          // message.success("file deleted.");
        })
        .finally(() => {
          setCurrFileInfo(null);
          setProcessing(false);
        });
      if (errDel) {
        return;
      }
    }

    await api.file.upload
      .single(formData)
      .then((res) => {
        const resAPI = res.data.rs_body;
        setCurrFileInfo({
          ...currFileInfo,
          name: resAPI.name,
          url: resAPI.url,
        });
        setCurrFileList([
          {
            uid: currFileInfo.uid,
            name: resAPI.name,
            status: "done",
            url: resAPI.url,
          },
        ]);
      })
      .then(() => {
        message.success("upload successfully.");
        onOk();
      })
      .catch((err) => {
        message.error(`upload failed: ${getErrMsg(err)}`);
        setCurrFileInfo(null);
        setCurrFileList([]);
      })
      .finally(() => {
        setCurrFile(null);
        setProcessing(false);
      });
  };

  if (!visible || isEmptyObj(data) || !data.type || !data.unique_id) {
    return null;
  }

  let typeShow = snakeToTitleCase(data.type);
  if (data.type_text) {
    typeShow = data.type_text;
  }

  let prefix = t("upload");
  if (data.prefix !== undefined && data.prefix !== null) {
    prefix = data.prefix;
  }

  return (
    <Modal
      title={`${prefix ? prefix + " " : ""} ${typeShow}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
    >
      <Upload
        onRemove={(file) => {
          setCurrFile(null);
          setCurrFileList([]);
        }}
        beforeUpload={(file) => {
          if (currFileInfo) setToDelFileInfo({ ...currFileInfo });

          setCurrFileInfo({ ...file });
          setCurrFile(file);
          setCurrFileList([
            {
              uid: file.uid,
              name: file.name,
            },
          ]);
          return false;
        }}
        fileList={currFileList}
        showUploadList={{
          showRemoveIcon: true,
          removeIcon: (
            <CloseCircleOutlined
              onClick={(e) => {
                console.log(e, "custom removeIcon event");
              }}
            />
          ),
        }}
      >
        <Button icon={<UploadOutlined />}>Select File</Button>
      </Upload>
      <Button
        style={{ marginTop: "10px" }}
        type="primary"
        onClick={handleUpload}
        disabled={currFile === null}
        loading={processing}
      >
        {processing ? "Uploading" : "Start Upload"}
      </Button>
    </Modal>
  );
}

export default ModalUpload;
