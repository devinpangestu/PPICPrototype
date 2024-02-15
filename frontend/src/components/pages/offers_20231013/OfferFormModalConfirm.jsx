import React from "react";
import { withRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Modal, Input, Form } from "antd";
import moment from "moment";

const OfferFormModalConfirm = (props) => {
  const [t] = useTranslation();
  const { values, isEdit, visible, onCancel, onOk } = props;
  const action = isEdit ? t("edit") : t("create");

  if (!values) return null;

  return (
    <Modal
      className="modal-compact"
      title={`${action} ${t("offer")} ${t("confirmation")}`}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      centered
    >
      <Form labelCol={{ span: 8 }} size="small">
        <Form.Item label={t("date")} className="mb-0">
          {values.date && <Input value={moment(values.date)} bordered={false} />}
        </Form.Item>
        <Form.Item label={t("commodity")} className="mb-0">
          {values.commodity && <Input value={values.commodity} bordered={false} />}
        </Form.Item>
        <Form.Item label={t("warehouse")} className="mb-0">
          {values.warehouse && <Input value={values.warehouse} bordered={false} />}
        </Form.Item>
        <Form.Item label={t("supplier")} className="mb-0">
          {values.supplier && <Input value={values.supplier} bordered={false} />}
        </Form.Item>
        <Form.Item label={t("priceExclude")} className="mb-0">
          {values.price_exclude && <Input value={values.price_exclude} bordered={false} />}
        </Form.Item>

        <Form.Item label={t("freight")} className="mb-0">
          {values.price_freight && <Input value={values.price_freight} bordered={false} />}
        </Form.Item>

        <Form.Item label={t("insurance")} className="mb-0">
          {values.price_insurance && <Input value={values.price_insurance} bordered={false} />}
        </Form.Item>

        <Form.Item label={t("susut")} className="mb-0">
          {values.price_susut && <Input value={values.price_susut} bordered={false} />}
        </Form.Item>

        <Form.Item label={t("COF")} className="mb-0">
          {values.price_cof && <Input value={values.price_cof} bordered={false} />}
        </Form.Item>
        <Form.Item label={t("priceAllIn")} className="mb-0">
          {values.price_all_in && <Input value={values.price_all_in} bordered={false} />}
        </Form.Item>
        <Form.Item label={t("quantity")} className="mb-0">
          {values.quantity && <Input value={values.quantity} bordered={false} />}
        </Form.Item>
        <Form.Item label={`${t("quality")}(FFA)`} className="mb-0">
          {values.quality_ffa && <Input value={values.quality_ffa} bordered={false} />}
        </Form.Item>
        <Form.Item label={`${t("quality")}(M+I)`} className="mb-0">
          {values.quality_mi && <Input value={values.quality_mi} bordered={false} />}
        </Form.Item>

        <Form.Item label={`${t("quality")}(DOBI)`} className="mb-0">
          {values.quality_dobi && <Input value={values.quality_dobi} bordered={false} />}
        </Form.Item>

        <Form.Item label={t("handoverDate")} className="mb-0">
          {values.handover_date && <Input value={moment(values.handover_date)} bordered={false} />}
        </Form.Item>
        <Form.Item label={t("handoverLocation")} className="mb-0">
          {values.handover_location && <Input value={values.handover_location} bordered={false} />}
        </Form.Item>
        <Form.Item label={t("handoverDescription")} className="mb-0">
          {values.handover_description && (
            <Input value={values.handover_description} bordered={false} />
          )}
        </Form.Item>

        <Form.Item label={t("termsOfHandover")} className="mb-0">
          {values.terms_of_handover && <Input value={values.terms_of_handover} bordered={false} />}
        </Form.Item>

        <Form.Item label={t("eta")} className="mb-0">
          {values.eta && <Input value={values.eta} bordered={false} />}
        </Form.Item>

        <Form.Item label={t("termsOfLoading")} className="mb-0">
          {values.terms_of_loading && <Input value={values.terms_of_loading} bordered={false} />}
        </Form.Item>

        <Form.Item label={t("termsOfPayment")} className="mb-0">
          {values.terms_of_payment && (
            <Input.TextArea autoSize={true} value={values.terms_of_payment} bordered={false} />
          )}
        </Form.Item>

        <Form.Item label={t("dealerNotes")} className="mb-0">
          {values.dealer_notes && (
            <Input.TextArea autoSize={true} value={values.dealer_notes} bordered={false} />
          )}
        </Form.Item>

        <Form.Item label={t("isRecommended")} className="mb-0">
          <Input value={values.is_recommended === true ? "Yes" : "No"} bordered={false} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default withRouter(OfferFormModalConfirm);
