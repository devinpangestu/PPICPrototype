import React from "react";
import { withRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Modal, Input, Form } from "antd";
import constant from "constant";

const ModalConfirm = (props) => {
  const [t] = useTranslation();
  const { values, isEdit, visible, onCancel, onOk } = props;
  const action = isEdit ? t("edit") : t("create");

  if (!values) return null;

  return (
    <Modal
      title={`${action} ${t("offer")} ${t("Confirmation")}`}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      centered
    >
      <Form labelCol={{ span: 8 }}>
        <Form.Item label={t("transportir")} className="mb-0">
          {values.transportir && <Input value={values.transportir} bordered={false} />}
        </Form.Item>
        <Form.Item label={t("type")} className="mb-0">
          {values.type && <Input value={values.type} bordered={false} />}
        </Form.Item>
        <Form.Item label={t("route")} className="mb-0">
          {values.route && <Input value={values.route} bordered={false} />}
        </Form.Item>
        <Form.Item label={t("budget")} className="mb-0">
          {values.budget && <Input value={values.budget} bordered={false} />}
        </Form.Item>
        {values.type &&
          values.type.toLowerCase() === constant.TRANSPORTIR_TYPE_SHIP&&
          values.ship && (
            <Form.Item label={t("ship")} className="mb-0">
              {values.ship && <Input value={values.ship} bordered={false} />}
            </Form.Item>
          )}

        <Form.Item label={t("quantity")} className="mb-0">
          {values.quantity && <Input value={values.quantity} bordered={false} />}
        </Form.Item>
        <Form.Item label={t("price")} className="mb-0">
          {values.price && <Input value={values.price} bordered={false} />}
        </Form.Item>
        {/* <Form.Item label={`${t("Estimated")} ${t("loadingDate")}`} className="mb-0">
          {values.loading_date && <Input value={values.loading_date} bordered={false} />}
        </Form.Item>
        <Form.Item label={t("etaWarehouse")} className="mb-0">
          {values.eta_warehouse && <Input value={values.eta_warehouse} bordered={false} />}
        </Form.Item> */}
      </Form>
    </Modal>
  );
};

export default withRouter(ModalConfirm);
