import handover_location from "./master_handover_location";
import warehouse from "./master_warehouse";
import commodity from "./master_commodity";
import budget_transportir from "./master_budget_transportir";
import config from "./master_config";
import changelog from "./master_changelog";
import shipmentBudgets from "./master_route_location";

const master = {
  handover_location,
  warehouse,
  budget_transportir,
  config,
  changelog,
  commodity,
  shipmentBudgets,
};

export default master;
