import { constant } from "../../../constant/index.js";
import moment from "moment";

export const PPICProcSentences = (offer) => {
  let sentences = ``;

  for (let i = 0; i < offer.length; i++) {
    const scheduleSentence = `<p style="margin: 0; word-break: break-word;">No. PO&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;: ${
      offer[i]?.po_number
    }</p>
   <p style="margin: 0; word-break: break-word;">Nama Barang&nbsp; &nbsp; &nbsp;: ${
     offer[i].sku_name
   }</p>
   <p style="margin: 0; word-break: break-word;">Nama Supplier&nbsp; &nbsp;: ${
     offer[i].supplier?.name
   }</p>
   <p style="margin: 0; word-break: break-word;">Qty PO&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; : ${
     offer[i]?.po_qty
   }</p>
   <p style="margin: 0; word-break: break-word;">Outstanding PO : ${
     offer[i].po_outs
   }</p>
   <p style="margin: 0; word-break: break-word;">Qty Pengiriman&nbsp; : ${
     offer[i].qty_delivery
   }</p>
   <p style="margin: 0; word-break: break-word;">Tanggal Kirim&nbsp; &nbsp; &nbsp;: ${moment(
     offer[i].est_delivery
   ).format(constant.FORMAT_DISPLAY_DATE)}</p>
   <p style="margin: 0; word-break: break-word;">Notes&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;: ${
     JSON.parse(offer[i].notes).init?.notes ?? "(Tidak ada catatan)"
   }</p>
   <p style="margin: 0; word-break: break-word;">&nbsp;</p>`;
    sentences += scheduleSentence;
    // You can add more conditions or concatenate more data as needed
  }
  return sentences;
};
