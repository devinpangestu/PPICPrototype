import React, { useEffect, useRef, useState } from "react";
import { withRouter } from "react-router-dom";
import { Modal, Form, Input, Button } from "antd";
import { useTranslation } from "react-i18next";
import constant from "constant";
import { api } from "api";
import utils from "utils";

const ModalCreate = ({ visible, onCancel, onSuccess, data }) => {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const notesRef = useRef(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }
    notesRef.current.focus();
  }, [visible]);

  const handleOnSubmit = (values) => {
    setProcessing(true);
    api.purchasing
      .retur(data.id, values)
      .then((res) => {
        onSuccess();
      })
      .catch((err) => {
        utils.swal.Error({
          msg: utils.getErrMsg(err),
          cbFn: () => {
            onCancel();
            return;
          },
        });
      })
      .finally(() => {
        setProcessing(false);
      });
  };

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      style={{ minWidth: "50%" }}
      title={`${t("Retur")} ${t("schedule")} ${t("Detail")}`}
    >
      <Form form={form} onFinish={handleOnSubmit} labelCol={{ span: 6 }}>
        <Form.Item
          name="notes_purchasing"
          label={t("notes")}
          rules={[
            {
              message: `${t("input")} ${t("notes")}`,
            },
            { type: "string", min: 6, message: t("Notes must be at least 6 characters") },
          ]}
        >
          <Input.TextArea
            ref={notesRef}
            placeholder={`${t("input")} ${t("notes")}`}
            rows={constant.FORM_TEXT_AREA_ROW}
            maxLength={constant.FORM_TEXT_AREA_LIMIT}
          />
        </Form.Item>
        <Form.Item wrapperCol={{ span: 24 }} className="text-right mb-0">
          <Button type="secondary" className="mr-2" onClick={onCancel}>
            {t("cancel")}
          </Button>
          <Button type="primary" htmlType="submit" loading={processing}>
            {processing ? t("loading") : t("submit")}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default withRouter(ModalCreate);
