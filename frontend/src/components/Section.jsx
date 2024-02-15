import { Row, Col, Typography, Divider } from "antd";

const { Title } = Typography;

export const SectionHeading = ({
  style,
  actionStyle,
  title,
  additionalAction,
  btnAction,
  size = 5,
  withDivider,
}) => {
  if (!title && !btnAction) {
    return null;
  }

  return (
    <>
      <Row gutter={16}>
        <Col className="align-self-center">
          <Title level={size} className="mb-0" style={style}>
            {title}
          </Title>
        </Col>
        <Col className="align-self-center" flex={"auto"} style={actionStyle}>
          {additionalAction}
        </Col>
        {btnAction && <Col className="align-self-center text-right">{btnAction}</Col>}
      </Row>
      {withDivider && <Divider className="mt-1 mb-4" />}
    </>
  );
};
