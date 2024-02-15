import nsq from "nsqjs";
import { constant } from "../../constant/index.js";
import db from "../../models/index.js";

const handleMessage = async (msg) => {
  if (msg.body.length === 0) {
    // Returning null will automatically acknowledge the message.
    // In this case, a message with an empty body is simply ignored/discarded.
    msg.finish();
    return;
  }

  console.log("received message: " + msg.body);

  const msgData = JSON.parse(msg.body);

  for (const data of msgData.data) {
    if (!data.offer_id) {
      console.log("error: offer id is empty");
      console.log("error: po number is empty on offer: " + data.OfferID);
      continue;
    }

    let payload = { po_number: data.po_number };
    await db.OFFERS.update(payload, {
      where: {
        id: data.offer_id,
      },
    });

    const getCurrentUpdatedOffer = await db.OFFERS.findOne({
      where: { id: data.offer_id },
      attributes: ["id", "unique_id"],
    });
    //update all logistic offer

    let payloadLogOffer = { po_number: data.po_number };

    await db.LOG_OFFERS.update(payloadLogOffer, {
      where: {
        commodity_offer_id: getCurrentUpdatedOffer.unique_id,
      },
    });

    // Update the offer using data
    // Replace the following line with the appropriate code to update the offer
    // Example: Offer.updatePONumber(data.OfferID, data.PONumber);

    // Acknowledge the message to mark it as processed
    msg.finish();
  }
};

const startConsumer = () => {
  try{
  const topicName = "pcpo-po-created-dev";
  const reader = new nsq.Reader(topicName, "update-offer", {
    lookupdHTTPAddresses: "34.142.195.201:4161",
    nsqdTCPAddresses: "34.142.195.201:4150",
    maxAttempts: 0,
    heartbeatInterval: 30
  });

  reader.connect();

  reader.on("message", handleMessage);
  process.on("SIGINT", function () {
    console.log("Received SIGINT, closing NSQ reader.");
    reader.close();
  });

  process.on("SIGTERM", function () {
    console.log("Received SIGTERM, closing NSQ reader.");
    reader.close();
  });}
  catch(e){
    console.log(e)
  }
};

export default startConsumer;
