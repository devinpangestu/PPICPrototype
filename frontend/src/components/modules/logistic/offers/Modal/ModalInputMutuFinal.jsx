import React, { useState, useEffect } from "react";
import { Form, Button, Modal, InputNumber, Row, Col } from "antd";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import configs from "configs";

function ModalInputMutuFinal(props, isEdit) {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const { visible, onCancel, onSuccess, unique_id, id } = props;
  console.log("id");
  console.log(id);
  console.log(unique_id);

  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    prepareTablePenyerahan();
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const prepareTablePenyerahan = () => {
    form.setFieldsValue({
      finalHOverQFFA: 0,
      finalHOverQMI: 0,
      finalHOverQDOBI: 0,
      finalHOverQTOTOX: 0,
      finalHOverQIV: 0,
      finalQFFA: 0,
      finalQMI: 0,
      finalQDOBI: 0,
      finalQTOTOX: 0,
      finalQIV: 0,
    });
  };

  const handleOnSubmit = (values) => {
    setProcessing(true);
    let finalParams = {
      final_qffa: values.finalQFFA,
      final_qmi: values.finalQMI,
      final_qdobi: values.finalQDOBI,
      final_qtotox: values.finalQTOTOX,
      final_qiv: values.finalQIV,
      finalhoverqffa: values.finalHOverQFFA,
      finalhoverqmi: values.finalHOverQMI,
      finalhoverqdobi: values.finalHOverQDOBI,
      finalhoverqtotox: values.finalHOverQTOTOX,
      finalhoverqiv: values.finalHOverQIV,
    };
    api.logistic.offers
      .mutuFinal(unique_id, id, finalParams)
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

  if (!visible) {
    return null;
  }

  return (
    <Modal
      title={t("inputFinalQ")}
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      style={{ maxWidth: "500px" }}
    >
      <Form form={form} onFinish={handleOnSubmit} name="finalQuality">
        <Row className="mb-4">
          <Col span={24}>
            <Row gutter={12} className="mb-2">
              <Col>Penyerahan</Col>
            </Row>
            <Row gutter={12} className="mb-2">
              <Col>
                <Form.Item
                  name="finalHOverQFFA"
                  label={`${t("finalQFFA")}`}
                  rules={[
                    {
                      required: true,
                      message: `${t("required")}`,
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder={`${t("input")} ${t("finalQFFA")} Penyerahan (${t("putZero")})`}
                    {...configs.FORM_QUANTITY_DEFAULT_PROPS}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item
                  name="finalHOverQMI"
                  label={`${t("finalQMI")}`}
                  rules={[
                    {
                      required: true,
                      message: `${t("required")}`,
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder={`${t("input")} ${t("finalQMI")} Penyerahan (${t("putZero")})`}
                    {...configs.FORM_QUANTITY_DEFAULT_PROPS}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item
                  name="finalHOverQDOBI"
                  label={`${t("finalQDOBI")}`}
                  rules={[
                    {
                      required: true,
                      message: `${t("required")}`,
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder={`${t("input")} ${t("finalQDOBI")} Penyerahan (${t("putZero")})`}
                    {...configs.FORM_QUANTITY_DEFAULT_PROPS}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item
                  name="finalHOverQTOTOX"
                  label={`${t("finalQTOTOX")}`}
                  rules={[
                    {
                      required: true,
                      message: `${t("required")}`,
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder={`${t("input")} ${t("finalQTOTOX")} Penyerahan (${t("putZero")})`}
                    {...configs.FORM_QUANTITY_DEFAULT_PROPS}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item
                  name="finalHOverQIV"
                  label={`${t("finalQIV")}`}
                  rules={[
                    {
                      required: true,
                      message: `${t("required")}`,
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder={`${t("input")} ${t("finalQIV")} Penyerahan (${t("putZero")})`}
                    {...configs.FORM_QUANTITY_DEFAULT_PROPS}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="mb-4">
          <Col span={24}>
            <Row gutter={12} className="mb-2">
              <Col>Pabrik</Col>
            </Row>
            <Row gutter={12} className="mb-2">
              <Col>
                <Form.Item
                  name="finalQFFA"
                  label={`${t("finalQFFA")}`}
                  rules={[
                    {
                      required: true,
                      message: `${t("required")}`,
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder={`${t("input")} ${t("finalQFFA")} Pabrik (${t("putZero")})`}
                    {...configs.FORM_QUANTITY_DEFAULT_PROPS}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item
                  name="finalQMI"
                  label={`${t("finalQMI")}`}
                  rules={[
                    {
                      required: true,
                      message: `${t("required")}`,
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder={`${t("input")} ${t("finalQMI")} Pabrik (${t("putZero")})`}
                    {...configs.FORM_QUANTITY_DEFAULT_PROPS}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item
                  name="finalQDOBI"
                  label={`${t("finalQDOBI")}`}
                  rules={[
                    {
                      required: true,
                      message: `${t("required")}`,
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder={`${t("input")} ${t("finalQDOBI")} Pabrik (${t("putZero")})`}
                    {...configs.FORM_QUANTITY_DEFAULT_PROPS}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item
                  name="finalQTOTOX"
                  label={`${t("finalQTOTOX")}`}
                  rules={[
                    {
                      required: true,
                      message: `${t("required")}`,
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder={`${t("input")} ${t("finalQTOTOX")} Pabrik (${t("putZero")})`}
                    {...configs.FORM_QUANTITY_DEFAULT_PROPS}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item
                  name="finalQIV"
                  label={`${t("finalQIV")}`}
                  rules={[
                    {
                      required: true,
                      message: `${t("required")}`,
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder={`${t("input")} ${t("finalQIV")} Pabrik (${t("putZero")})`}
                    {...configs.FORM_QUANTITY_DEFAULT_PROPS}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>

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
  );
}

export default ModalInputMutuFinal;
