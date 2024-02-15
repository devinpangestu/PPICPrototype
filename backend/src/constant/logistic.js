// Logistic offer status
export const LOGISTIC_STATUS_PENDING = "pending_approval";
export const LOGISTIC_STATUS_APPROVED = "approved";
export const LOGISTIC_STATUS_ADJUST = "adjust";
export const LOGISTIC_STATUS_REJECT = "reject";
export const LOGISTIC_ACTIVITY_STATUS_APPROVAL = "pending_approval";
export const LOGISTIC_ACTIVITY_STATUS_LOADING = "loading";
export const LOGISTIC_ACTIVITY_STATUS_DELIVERY = "on_the_way";
export const LOGISTIC_ACTIVITY_STATUS_DELIVERED = "arrived";
export const LOGISTIC_ACTIVITY_STATUS_DISCHARGED = "discharged";
// Transportir types
export const TRANSPORTIR_TYPE_SEA = "sea";
export const TRANSPORTIR_TYPE_LAND = "land";
export const TRANSPORTIR_TYPE_LAND_DISCHARGED = "land_discharged";

export const FILE_TYPE_NEEDED_MAP = {
  loco_luar_pulau: [
    "logistic_insurance",
    "cargo_readiness",
    "contract",
    "spal",
    "spad",
  ],
  fob: ["logistic_insurance", "cargo_readiness", "contract", "spal"],
  cif: ["logistic_insurance", "cargo_readiness", "contract"],
  franco: ["logistic_insurance", "cargo_readiness", "contract"],
};
