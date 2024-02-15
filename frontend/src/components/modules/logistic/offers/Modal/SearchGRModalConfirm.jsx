import React from "react";
import { withRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Modal, Input, Form } from "antd";

const SearchGRModalConfirm = (props) => {
  const [t] = useTranslation();
  const { values, isEdit, visible, onCancel, onOk } = props;

  if (!values) return null;

  return (
    <Modal
      className="modal-compact"
      title={`CONFIRM THE GOOD RECEIVED INFORMATION`}
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

        <Form.Item label={t("GR Number")} className="mb-0">
          {values.gr_number && <Input value={values.gr_number} bordered={false} />}
        </Form.Item>
        <Form.Item label={t("Quantity Good Received")} className="mb-0">
          {values.gr_quantity && <Input value={`${values.gr_quantity} MT`} bordered={false} />}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default withRouter(SearchGRModalConfirm);
