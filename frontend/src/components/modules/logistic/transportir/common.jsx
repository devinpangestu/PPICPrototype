import constant from "constant";
import utils from "utils";
import { Space, Tag } from "antd";

export const getTypesTags = (types = null) => {
  if (types == null || types.length === 0) {
    return null;
  }
  const el = [];
  for (let i = 0; i < types.length; i++) {
    let tType = types[i].toLowerCase();
    console.log(tType);
    tType == "discharged_truck" ? (tType = "discharged") : (tType = tType);
    const btnType = constant.TRANSPORTIR_TYPE_VARIANT_MAP[tType]
      ? constant.TRANSPORTIR_TYPE_VARIANT_MAP[tType]
      : "primary";
    el.push(
      <Tag key={tType} color={btnType}>
        {utils.snakeToTitleCase(tType)}
      </Tag>,
    );
  }
  return <Space>{el}</Space>;
};
