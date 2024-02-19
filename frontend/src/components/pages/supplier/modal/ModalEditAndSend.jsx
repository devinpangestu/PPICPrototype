import React, { useState, useEffect, useRef } from "react";
import {
  Row,
  Col,
  Card,
  Divider,
  Form,
  Button,
  Modal,
  InputNumber,
  Input,
  Space,
  DatePicker,
  Typography,
  Descriptions,
} from "antd";
import moment from "moment";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import constant from "constant";
import configs from "configs";

function ModalEditAndSend(props) {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const { visible, onCancel, onSuccess, data } = props;
  const isMobile = utils.isMobile();
  let formItemCls = "mb-0";
  const [processing, setProcessing] = useState(false);
  const { Text, Link } = Typography;
  const [splits, setSplits] = useState([]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const schedules = data.map((item) => ({
      id: item.id,
      submission_date: moment(item.submission_date),
      supplier_id: item.supplier_id,
      po_number: item.po_number,
      po_outs: item.po_outs,
      sku_code: item.sku_code,
      sku_name: item.sku_name,
      split_from_id: item.split_from_id,
      edit_from_id: item.edit_from_id,
      flag_status: item.flag_status,
      est_delivery: moment(item.est_delivery),
      qty_delivery: item.qty_delivery,
    }));
    form.setFieldsValue({ schedules });
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOnSubmit = (values) => {
    setProcessing(true);
    for (let key in data) {
      values.schedules[key].id = data[key].id;
      values.schedules[key].supplier_id = parseInt(data[key].supplier_id);
      values.schedules[key].po_qty = data[key].po_qty;
      values.schedules[key].max_qty = data[key].po_qty;
    }
    api.suppliers
      .editComplex(data, values.schedules)
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
    data && (
      <Modal
        title={`EDIT SCHEDULE - ${data[0].supplier.name} - ${data[0].po_number} `}
        open={visible}
        onCancel={onCancel}
        footer={null}
        centered
        style={{ minWidth: "50%" }}
      >
        <Form form={form} onFinish={handleOnSubmit}>
          <Card className="price-input">
            <Form.List name="schedules">
              {(fields, { add, remove }) => (
                <Row>
                  <Col span={24}>
                    {fields.map(({ key, name, ...restField }) => {
                      let removeLbl = undefined;
                      let showLabel = false;
                      if (key === 0) {
                        // first row
                        showLabel = true;
                        removeLbl = <>&nbsp;</>;
                      }
                      let labelColSpan = 8;
                      let removeBtnCol = undefined;
                      let removeBtnBlock = false;
                      let removeBtnText = undefined;
                      let dividerClsName = "d-none";

                      if (isMobile) {
                        labelColSpan = 11;
                        removeLbl = undefined;
                        showLabel = true;
                        removeBtnBlock = true;
                        removeBtnCol = 24;
                        removeBtnText = t("remove");
                        dividerClsName = "my-3";
                      }

                      return (
                        <>
                          <Row>
                            <Col flex="auto" span={24}>
                              <Form.Item
                                {...restField}
                                name={[name, "est_delivery"]}
                                className={formItemCls}
                                label={`${t("Estimated")} ${t("Delivery")} ${t("Date")}`}
                                rules={[
                                  {
                                    required: true,
                                    message: t("required"),
                                  },
                                ]}
                                labelCol={{ span: labelColSpan }} // Set the width of the label column
                                wrapperCol={{ span: 11 }} // Set the width of the wrapper column
                              >
                                <DatePicker
                                  allowClear={false}
                                  inputReadOnly={true}
                                  disabledDate={(current) => {
                                    return current < moment(data[key].est_delivery);
                                  }}
                                  {...utils.FORM_DATEPICKER_PROPS}
                                  style={{ width: "100%" }}
                                  disabled={data[key].flag_status !== constant.FLAG_STATUS_SUPPLIER}
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          <Row>
                            <Col flex="auto" span={24}>
                              <Form.Item
                                {...restField}
                                className={formItemCls}
                                name={[name, "qty_delivery"]}
                                label={`${t("Delivery")} ${t("Quantity")} `}
                                rules={[
                                  {
                                    required: true,
                                    message: t("required"),
                                  },
                                ]}
                                labelCol={{ span: labelColSpan }} // Set the width of the label column
                                wrapperCol={{ span: 11 }}
                              >
                                <InputNumber
                                  {...configs.FORM_MONEY_DEFAULT_PROPS}
                                  style={{ width: "100%" }}
                                  placeholder={`${t("input")} ${t("qtyDelivery")}`}
                                  disabled={
                                    fields.length === 1 ||
                                    data[key].flag_status ===
                                      constant.FLAG_STATUS_COMPLETE_SCHEDULE ||
                                    data[key].flag_status !== constant.FLAG_STATUS_SUPPLIER
                                  }
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                          <Row>
                            <Col flex="auto" span={24}>
                              <Form.Item
                                {...restField}
                                name={[name, "notes"]}
                                className={formItemCls}
                                label={t("notes")}
                                rules={[
                                  {
                                    message: `${t("input")} ${t("notes")}`,
                                  },
                                  {
                                    type: "string",
                                    min: 6,
                                    message: t("Notes must be at least 6 characters"),
                                  },
                                ]}
                                labelCol={{ span: labelColSpan }} // Set the width of the label column
                                wrapperCol={{ span: 11 }}
                              >
                                <Input.TextArea
                                  placeholder={`${t("input")} ${t("notes")}`}
                                  rows={constant.FORM_TEXT_AREA_ROW}
                                  maxLength={constant.FORM_TEXT_AREA_LIMIT}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                          <br />
                        </>
                      );
                    })}

                    <Row>
                      <Col span={24} className="text-right">
                        <Space>
                          <Form.Item className="mb-0">
                            <Button
                              onClick={() => {
                                onCancel();
                              }}
                            >
                              {t("back")}
                            </Button>
                          </Form.Item>
                          <Form.Item className="mb-0">
                            <Button type="primary" htmlType="submit">
                              {t("submit")}
                            </Button>
                          </Form.Item>
                        </Space>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              )}
            </Form.List>
          </Card>
        </Form>
      </Modal>
    )
  );
}

export default ModalEditAndSend;
