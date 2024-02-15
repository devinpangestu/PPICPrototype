import React from "react";
import { withRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Modal, Input, Form } from "antd";
import moment from "moment";

const SearchBRModalConfirm = (props) => {
  const [t] = useTranslation();
  const { values, isEdit, visible, onCancel, onOk } = props;

  if (!values) return null;

  return (
    <Modal
      className="modal-compact"
      title={`CONFIRM THE BLANKET RELEASE INFORMATION`}
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
      centered
    >
      <Form labelCol={{ span: 8 }} size="small">
        <Form.Item label={t("PO Number")} className="mb-0">
          {values.po_number && <Input value={values.po_number} bordered={false} />}
        </Form.Item>
        <Form.Item label={t("Release Number")} className="mb-0">
          {values.release_num && <Input value={values.release_num} bordered={false} />}
        </Form.Item>

        <Form.Item label={t("Release Date")} className="mb-0">
          {values.br_date && <Input value={moment(values.br_date)} bordered={false} />}
          
        </Form.Item>
        <Form.Item label={t("Quantity Received")} className="mb-0">
          {values.br_quantity && <Input value={values.br_quantity} bordered={false} />}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default withRouter(SearchBRModalConfirm);
