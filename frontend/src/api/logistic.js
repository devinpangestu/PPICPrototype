import offers from "./logistic_offer";
import transactions from "./logistic_transaction";
import ships from "./logistic_transportir_ship";
import transportir from "./logistic_transportir";
import spk from "./logistic_spk";

const logistic = {
  transportirs: transportir,
  ships,
  offers,
  transactions,
  spk,
};

export default logistic;
