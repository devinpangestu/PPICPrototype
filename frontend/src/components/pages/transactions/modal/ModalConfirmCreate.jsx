import React from "react";
import { withRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Modal, Input, Form } from "antd";
import moment from "moment";
import constant from "constant";

const ModalConfirmCreate = (props) => {
  const [t] = useTranslation();
  const { values, isEdit, visible, onCancel, onOk } = props;

  if (!values) return null;

  return (
    <Modal
      className="modal-compact"
      title={`CONFIRM THE SCHEDULE INFORMATION DETAIL`}
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
      centered
    >
      <Form labelCol={{ span: 8 }} size="small">
        <Form.Item label={t("Submission Date")} className="mb-0">
          {values.submission_date && (
            <Input
              value={moment(values.submission_date).format(constant.FORMAT_DISPLAY_DATE)}
              bordered={false}
            />
          )}
        </Form.Item>
        <Form.Item label={t("PO Number")} className="mb-0">
          {values.po_number && <Input value={values.po_number} bordered={false} />}
        </Form.Item>
        {values.autoFill && (
          <Form.Item label={t("Line Number")} className="mb-0">
            {values.line_num && <Input value={values.line_num} bordered={false} />}
          </Form.Item>
        )}
        <Form.Item label={t("Supplier")} className="mb-0">
          {values.supplier_name && <Input value={values.supplier_name} bordered={false} />}
        </Form.Item>
        <Form.Item label={t("SKU Code")} className="mb-0">
          {values.sku_code && <Input value={values.sku_code} bordered={false} />}
        </Form.Item>
        <Form.Item label={t("SKU_Name")} className="mb-0">
          {values.sku_name && <Input value={values.sku_name} bordered={false} />}
        </Form.Item>

        <Form.Item label={t("Quantity PO")} className="mb-0">
          {values.po_qty && <Input value={values.po_qty} bordered={false} />}
        </Form.Item>
        <Form.Item label={t("Qty PO Outs")} className="mb-0">
          {values.po_outs && <Input value={values.po_outs} bordered={false} />}
        </Form.Item>
        <Form.Item label={t("Estimated Delivery")} className="mb-0">
          {values.est_delivery && (
            <Input
              value={moment(values.est_delivery).format(constant.FORMAT_DISPLAY_DATE)}
              bordered={false}
            />
          )}
        </Form.Item>
        <Form.Item label={t("Qty Delivery")} className="mb-0">
          {values.qty_delivery && <Input value={values.qty_delivery} bordered={false} />}
        </Form.Item>
        <Form.Item label={t("Buyer Name")} className="mb-0">
          {values.buyer_name && <Input value={values.buyer_name} bordered={false} />}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default withRouter(ModalConfirmCreate);
