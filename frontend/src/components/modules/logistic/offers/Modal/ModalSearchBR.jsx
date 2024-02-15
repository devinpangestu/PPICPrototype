import React, { useState, useEffect } from "react";
import { Form, Button, Modal, DatePicker, Input, message, InputNumber } from "antd";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import constant from "constant";
import moment from "moment";
import configs from "configs";
import SearchBRModalConfirm from "./SearchBRModalConfirm";

function ModalSearchBR(props) {
  const [t] = useTranslation();
  console.log("handleOnConfirmAutoBR");
  const [form] = Form.useForm();
  const { visible, onCancel, isEdit, onSuccess, data, renderForm, id } = props;
  const [modalConfirmData, setModalConfirmData] = useState({});
  const [modalConfirmShow, setModalConfirmShow] = useState(false);
  const [formData, setFormData] = useState({});
  const [processing, setProcessing] = useState(false);
  form.setFieldValue("po_number", data?.cOffer?.po_number);
  useEffect(() => {
    if (!visible) {
      return;
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOnConfirm = () => {
    setProcessing(true);
    const d = formData;

    const reqBody = {
      po_number: d.po_number,
      release_num: d.release_num,
    };

    api.logistic.offers
      .putBR(d.po_number, d.release_num, id)
      .then(function (response) {
        setModalConfirmShow(false);
        setModalConfirmData({});
        renderForm();
        onSuccess();
      })
      .catch(function (error) {
        setModalConfirmShow(false);
        setModalConfirmData({});
        utils.swal.Error({ msg: utils.getErrMsg(error) });
        onCancel();
      })
      .finally(function () {
        setProcessing(false);
      });
  };

  const handleOnSubmit = async (values) => {
    setFormData(values);

    const modalConfirmObj = {
      po_number: values?.po_number,
      release_num: values?.release_num,
    };

    const dataToShow = await api.logistic.offers
      .getBR(values?.po_number, values?.release_num)
      .then(function (response) {
        modalConfirmObj.br_date = moment(response.data?.rs_body.br_date).format(
          constant.FORMAT_DISPLAY_DATETIME,
        );
        modalConfirmObj.br_quantity = response.data?.rs_body.br_quantity;
        return modalConfirmObj;
      })
      .catch(function (error) {
        setModalConfirmShow(false);
        setModalConfirmData({});
        utils.swal.Error({ msg: utils.getErrMsg(error) });
        onCancel();
      })
      .finally(function () {
        setProcessing(false);
      });

    setModalConfirmData(dataToShow);
    setModalConfirmShow(true);
  };

  if (!visible) {
    return null;
  }

  return (
    <>
      <SearchBRModalConfirm
        isEdit={false}
        values={modalConfirmData}
        visible={modalConfirmShow}
        onCancel={() => {
          setModalConfirmShow(false);
        }}
        onOk={() => {
          setModalConfirmShow(false);
          handleOnConfirm();
        }}
      />
      <Modal
        title={t("Get Blanket Release")}
        open={visible}
        onCancel={onCancel}
        footer={null}
        centered
        style={{ maxWidth: "300px" }}
      >
        <Form form={form} onFinish={handleOnSubmit} initialValues={{ date: moment() }}>
          <Form.Item
            name="po_number"
            label={`PO Number`}
            rules={[
              {
                required: true,
                message: `${t("required")}`,
              },
            ]}
          >
            <Input style={{ width: "100%" }} placeholder={`Input PO Number`} />
          </Form.Item>
          <Form.Item
            name="release_num"
            label={`Release Number`}
            rules={[
              {
                required: true,
                message: `${t("required")}`,
              },
            ]}
          >
            <InputNumber style={{ width: "100%" }} placeholder={`${t("input")} Release Number`} />
          </Form.Item>
          <Form.Item className="text-right mb-0">
            <Button type="secondary" className="mr-2" onClick={onCancel}>
              {t("cancel")}
            </Button>
            <Button type="primary" htmlType="submit" loading={processing}>
              {processing ? t("loading") : t("submit")}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default ModalSearchBR;
