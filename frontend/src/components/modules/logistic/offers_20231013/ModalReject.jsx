import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Modal,  Input } from "antd";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import constant from "constant";

function ModalReject(props) {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const { visible, onCancel, onSuccess, id } = props;
  console.log("id");
  console.log(id);

  const [processing, setProcessing] = useState(false);

  const notesRef = useRef(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    notesRef.current.focus();
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOnSubmit = (values) => {
    setProcessing(true);

    api.logistic.offers
      .reject(id, values.notes)
      .then(function (response) {
        form.resetFields();
        onSuccess();
      })
      .catch(function (error) {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
        onCancel();
      })
      .finally(function () {
        setProcessing(false);
      });
  };

  return (
    <Modal
      title={`${t("reject")} ${t("offer")} `}
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      style={{ minWidth: "50%" }}
    >
      <Form form={form} onFinish={handleOnSubmit} labelCol={{ span: 6 }}>
        <Form.Item name="notes" label={t("notes")}>
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
}

export default ModalReject;
