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

function ModalSplitSchedule(props) {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const { visible, onCancel, onSuccess, data } = props;
  const isMobile = utils.isMobile();
  let formItemCls = "mb-0";

  const [processing, setProcessing] = useState(false);
  const [maxSplitQty, setMaxSplitQty] = useState(data?.qty_delivery);
  const [maxQtyExistingOffer, setMaxQtyExistingOffer] = useState(data?.qty_delivery);
  const [remainingQtyFulfilled, setRemainingQtyFulfilled] = useState(0);
  const [newSplit, setNewSplit] = useState({ est_delivery: null, qty_delivery: null });
  const [splits, setSplits] = useState([]);
  const { Text, Link } = Typography;
  const qtyLoaded = useRef(null);

  useEffect(() => {
    if (!visible) {
      return;
    }
    form.setFieldsValue({
      schedules: [
        { est_delivery: moment(data.est_delivery), qty_delivery: data.qty_delivery },
        { est_delivery: null, qty_delivery: null },
      ],
    });
    // qtyLoaded.current.focus();
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOnSubmit = (values) => {
    setProcessing(true);
    for (let key in values.schedules) {
      values.schedules[key].est_delivery = moment(values.schedules[key].est_delivery).format(
        constant.FORMAT_API_DATE,
      );
    }
    api.purchasing
      .splitPurchasing(data.id, values.schedules)
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

  const handleAddSplit = (newSplit) => {
    // Validate max quantity before adding the new split
    const totalQty = splits.reduce((total, split) => total + split.qty_delivery, 0);
    if (totalQty + newSplit.qty_delivery > maxSplitQty) {
      // Display an error message or handle the validation in your preferred way
      console.error("Total quantity exceeds the maximum allowed.");
      return;
    }
    // Add the new split
    setSplits([...splits, newSplit]);
    setNewSplit({ est_delivery: null, qty_delivery: null });
  };

  const handleQuantityChange = (index, value) => {
    const newSchedules = [...splits];
    const remainingQuantity = maxSplitQty - value;

    // Update the current input field
    newSchedules[index].qty_delivery = value;

    // Calculate the remaining quantity for other input fields
    const remainingFields = newSchedules.length - 1;
    const maxOtherFields = Math.floor(remainingQuantity / remainingFields);

    // Update other input fields with the calculated maximum
    for (let i = 0; i < newSchedules.length; i++) {
      if (i !== index) {
        newSchedules[i].qty_delivery = Math.min(newSchedules[i].qty_delivery, maxOtherFields);
      }
    }

    setSplits(newSchedules);
  };

  const flexibleProps = {
    max: remainingQtyFulfilled,
  };
  return (
    data && (
      <Modal
        title={`SPLIT SCHEDULE
        ${data.supplier.name}
        ${data.po_number}
        ${data.sku_code} ${data.sku_name}
        MAX SPLIT QTY: ${data?.qty_delivery} REMAINING QTY FULFILLED: ${remainingQtyFulfilled}`}
        open={visible}
        onCancel={onCancel}
        footer={null}
        centered
        style={{ minWidth: "50%", whiteSpace: "pre-line" }}
      >
        <Form form={form} onFinish={handleOnSubmit} labelCol={{ span: 6 }}>
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

                      let removeBtnCol = 1;
                      let removeBtnBlock = false;
                      let removeBtnText = undefined;
                      let dividerClsName = "d-none";
                      let labelColSpan = 8;
                      let inputColSpan = 23;
                      if (isMobile) {
                        removeLbl = undefined;
                        showLabel = true;
                        labelColSpan = 11;
                        inputColSpan = 22;
                        removeBtnBlock = true;
                        removeBtnCol = 2;
                        removeBtnText = t("remove");
                        dividerClsName = "my-3";
                      }

                      return (
                        <>
                          <Row>
                            <Col flex="auto" span={inputColSpan}>
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
                                    return current && current < moment().startOf("day");
                                  }}
                                  {...utils.FORM_DATEPICKER_PROPS}
                                  style={{ width: "100%" }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={removeBtnCol} flex="auto">
                              <Button
                                block={removeBtnBlock}
                                disabled={key <= 1}
                                onClick={() => remove(name)}
                                icon={<MinusCircleOutlined />}
                              >
                                {removeBtnText}
                              </Button>
                            </Col>
                          </Row>
                          <Divider className={dividerClsName} />

                          <Row>
                            <Col flex="auto" span={inputColSpan}>
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
                                  onChange={(index, value) => {
                                    const { schedules } = form.getFieldsValue();
                                    form.setFieldsValue({ schedules });
                                    setSplits(schedules);
                                    setRemainingQtyFulfilled(
                                      data?.qty_delivery -
                                        schedules.reduce(
                                          (prev, curr) => prev + curr.qty_delivery,
                                          0,
                                        ),
                                    );
                                    handleQuantityChange(index, value);
                                  }}
                                  max={maxSplitQty}
                                  value={newSplit.qty_delivery || ""}
                                />
                                
                              </Form.Item>
                            </Col>
                          </Row>
                          <br />
                        </>
                      );
                    })}
                    <Row className="mb-2">
                      <Col span={24} className="text-right">
                        <Form.Item className="mb-0">
                          <Button
                            onClick={() => {
                              add();
                              handleAddSplit(newSplit);
                            }}
                            icon={<PlusOutlined />}
                          >
                            {t("add")}
                          </Button>
                        </Form.Item>
                      </Col>
                    </Row>
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

export default ModalSplitSchedule;
