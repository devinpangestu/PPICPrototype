import React, { useState, useEffect} from "react";
import { Form, Button, Modal, Input, DatePicker } from "antd";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import constant from "constant";
import moment from "moment";
import ModalUpload from "components/ModalUpload";

function ModalDelivery(props) {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const { visible, onCancel, onSuccess, id, data } = props;
  const { transType, fileBL } = data;

  let isSEA = false;
  if (!transType || (transType && transType === "sea")) {
    isSEA = true;
    form.setFieldsValue({ date: moment(), bl: fileBL && fileBL.url ? fileBL.url : undefined });
  }

  // upload
  const [modalUploadShow, setModalUploadShow] = useState(false);

  const [processing, setProcessing] = useState(false);

  useEffect(() => {}, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOnSubmit = (values) => {
    setProcessing(true);

    console.log("values.date");
    console.log(values.date);
    api.logistic.offers
      .delivery(id, moment(values.date).format(constant.FORMAT_API_DATE))
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
    <>
      {isSEA && (
        <ModalUpload
          visible={modalUploadShow}
          onCancel={() => {
            setModalUploadShow(false);
          }}
          onOk={() => {
            setModalUploadShow(false);
            onSuccess();
          }}
          data={{
            type: constant.FILE_TYPE_BL,
            type_text: constant.FILE_TYPE_BL.toUpperCase(),
            unique_id: id,
            prefix: fileBL ? t("edit") : undefined,
          }}
          existingFile={fileBL}
        />
      )}

      <Modal
        title={`${t("start")} ${t("delivery")} `}
        open={visible}
        onCancel={onCancel}
        footer={null}
        centered
        style={{ maxWidth: "300px" }}
      >
        <Form
          form={form}
          onFinish={handleOnSubmit}
          // initialValues={{ date: moment(), bl: fileBL && fileBL.url ? fileBL.url : undefined }}
          layout="vertical"
        >
          {isSEA && (
            <>
              <Form.Item
                name="bl"
                className="custom-hidden"
                rules={[
                  {
                    required: true,
                    message: `${t("please")} ${t("upload")} ${t("BL")}`,
                  },
                ]}
              >
                <Input hidden />
              </Form.Item>

              <Form.Item>
                {fileBL ? (
                  <Button
                    type="primary"
                    onClick={() => {
                      setModalUploadShow(true);
                    }}
                  >
                    BL
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setModalUploadShow(true);
                    }}
                  >
                    Upload BL
                  </Button>
                )}
              </Form.Item>
            </>
          )}

          <Form.Item
            name="date"
            label={t("date")}
            rules={[
              {
                required: true,
                message: `${t("required")}`,
              },
            ]}
          >
            <DatePicker
              allowClear={false}
              inputReadOnly={true}
             
              {...utils.FORM_DATEPICKER_PROPS}
            />
          </Form.Item>

          <Form.Item
            name="date"
            label={t("date")}
            rules={[
              {
                required: true,
                message: `${t("required")}`,
              },
            ]}
          >
            <DatePicker
              allowClear={false}
              inputReadOnly={true}
           
              {...utils.FORM_DATEPICKER_PROPS}
            />
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

export default ModalDelivery;
