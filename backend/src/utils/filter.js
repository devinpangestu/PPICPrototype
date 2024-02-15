export const filterDeletedDoubleFindCount = (data) => {
  const uniqueData = [];
  const seenNames = new Set();

  data.rows.forEach((item) => {
    const poNumber = item.po_number;
    const skuCode = item.sku_code;
    const supplierName = item?.supplier?.name;
    const qtyDelivery = item.qty_delivery;
    const estDelivery = item.est_delivery;
    const estSubmittedDate = item.est_submitted_date;
    const submittedQty = item.submitted_qty;
    if (
      !seenNames.has(
        poNumber +
          skuCode +
          supplierName +
          qtyDelivery +
          estDelivery +
          estSubmittedDate +
          submittedQty
      )
    ) {
      seenNames.add(
        poNumber +
          skuCode +
          supplierName +
          qtyDelivery +
          estDelivery +
          estSubmittedDate +
          submittedQty
      );
      uniqueData.push(item);
    }
  });
  return { dataFilter: uniqueData, countFilter: uniqueData.length };
};
export const filterDeletedDoubleFind = (data) => {
  const uniqueData = [];
  const seenNames = new Set();

  data.forEach((item) => {
    const poNumber = item.po_number;
    const skuCode = item.sku_code;
    const supplierName = item?.supplier?.name;
    const qtyDelivery = item.qty_delivery;
    const estDelivery = item.est_delivery;
    const estSubmittedDate = item.est_submitted_date;
    const submittedQty = item.submitted_qty;
    if (
      !seenNames.has(
        poNumber +
          skuCode +
          supplierName +
          qtyDelivery +
          estDelivery +
          estSubmittedDate +
          submittedQty
      )
    ) {
      seenNames.add(
        poNumber +
          skuCode +
          supplierName +
          qtyDelivery +
          estDelivery +
          estSubmittedDate +
          submittedQty
      );
      uniqueData.push(item);
    }
  });
  return uniqueData;
};

export const filterDoubleFindCount = (data) => {
  const uniqueData = [];
  const seenNames = new Set();

  data.rows.forEach((item) => {
    const poNumber = item.po_number;
    const skuCode = item.sku_code;
    const supplierName = item?.supplier?.name;
    const qtyDelivery = item.qty_delivery;
    const estDelivery = item.est_delivery;
    const estSubmittedDate = item.est_submitted_date;
    const submittedQty = item.submitted_qty;
    const deletedFlag = item.deleted_at;
    const key =
      poNumber +
      skuCode +
      supplierName +
      qtyDelivery +
      estDelivery +
      estSubmittedDate +
      submittedQty;

    if (!seenNames.has(key) && !deletedFlag) {
      seenNames.add(key);
      uniqueData.push(item);
    }
  });
  return { dataFilter: uniqueData, countFilter: uniqueData.length };
};
export const filterDoubleFind = (data) => {
  const uniqueData = [];
  const seenNames = new Set();

  data.forEach((item) => {
    const poNumber = item.po_number;
    const skuCode = item.sku_code;
    const supplierName = item?.supplier?.name;
    const qtyDelivery = item.qty_delivery;
    const estDelivery = item.est_delivery;
    const estSubmittedDate = item.est_submitted_date;
    const submittedQty = item.submitted_qty;
    const deletedFlag = item.deleted_at;

    const key =
      poNumber +
      skuCode +
      supplierName +
      qtyDelivery +
      estDelivery +
      estSubmittedDate +
      submittedQty;

    if (!seenNames.has(key) && !deletedFlag) {
      seenNames.add(key);
      uniqueData.push(item);
    }
  });
  return uniqueData;
};
