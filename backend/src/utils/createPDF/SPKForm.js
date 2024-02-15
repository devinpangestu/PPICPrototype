import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import fetch from "node-fetch";

// Create a new PDFDocument
export const genSPK = async (shipName, approvedDate, data, isBongkar) => {
  let tipeSPK = "SPK PEMBONGKARAN";
  if (!isBongkar) {
    tipeSPK = "SPK PEMUATAN";
  }

  const pdfDoc = await PDFDocument.create();
  // Embed the Times Roman font

  const promiseIconBKP = fs.promises.readFile(
    path.join("public/images/OIP.jpeg")
  );
  const bufferIconBKP = await Promise.resolve(promiseIconBKP).then((buffer) => {
    return buffer;
  });
  const headerIconBKP = await pdfDoc.embedJpg(bufferIconBKP);

  try {
    const page = pdfDoc.addPage();

    const fontSize = 30;
    let { width, height } = page.getSize();

    pdfDoc.registerFontkit(fontkit);
    const Helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const HelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const nomorSPK = `${data.SPKNumber}`;
    const textWidth =
      Helvetica.widthOfTextAtSize(tipeSPK, fontSize / 3) >
      Helvetica.widthOfTextAtSize(nomorSPK, fontSize / 3)
        ? Helvetica.widthOfTextAtSize(tipeSPK, fontSize / 3)
        : Helvetica.widthOfTextAtSize(nomorSPK, fontSize / 3);
    const textHeight = Helvetica.heightAtSize(fontSize);

    page.drawImage(headerIconBKP, {
      x: 50 / 2,
      y: height - 50,
      width: 50,
      height: 25,
    });
    page.drawText(nomorSPK, {
      x:
        Helvetica.widthOfTextAtSize(tipeSPK, fontSize / 3) <
        Helvetica.widthOfTextAtSize(nomorSPK, fontSize / 3)
          ? 80
          : 80 +
            (textWidth - Helvetica.widthOfTextAtSize(nomorSPK, fontSize / 3)) /
              2,
      y: height - 1.5 * fontSize,
      size: fontSize / 3,
      font: Helvetica,
      color: rgb(0, 0, 0),
    });

    page.drawLine({
      start: { x: 80, y: height - 1.2 * fontSize },
      end: { x: textWidth + 80, y: height - 1.2 * fontSize },
      thickness: 1.5,
      color: rgb(0, 178 / 255, 0),
      opacity: 0.75,
    });

    page.drawText(tipeSPK, {
      x:
        Helvetica.widthOfTextAtSize(tipeSPK, fontSize / 3) >
        Helvetica.widthOfTextAtSize(nomorSPK, fontSize / 3)
          ? 80
          : 80 +
            (textWidth - Helvetica.widthOfTextAtSize(tipeSPK, fontSize / 3)) /
              2,
      y: height - 1.1 * fontSize,
      size: fontSize / 3,
      font: Helvetica,
      color: rgb(0, 0, 0),
    });

    const createTextRowBold = (number, desc, data, gap) => {
      const descName = `${number}  ${desc}${data}`;
      const textToBold = data + "";
      const xBoldText = 50 / 2;
      const xfixedDoubleDotEqual = width / 3;
      page.drawText(descName.replace(data, ""), {
        x: xBoldText,
        y: height - gap * fontSize,
        size: fontSize / 3,
        font: Helvetica,
        color: rgb(0, 0, 0),
      });

      page.drawText(":", {
        x: xfixedDoubleDotEqual,
        y: height - gap * fontSize,
        size: fontSize / 3,
        font: Helvetica,
        color: rgb(0, 0, 0),
      });
      // Draw the bold part
      page.drawText(textToBold, {
        x: xfixedDoubleDotEqual + 10,
        // parseFloat(
        //   Helvetica.widthOfTextAtSize(textToBold, fontSize / 3).toFixed(1)
        // ),
        y: height - gap * fontSize,
        size: fontSize / 3,
        font: HelveticaBold,
        color: rgb(0, 0, 0),
        bold: true,
      });
      gap += 0.5;
      return gap;
    };
    const createTextRowContract = (number, desc, data, gap) => {
      const descName = `${number}  ${desc}${data}`;
      const textToBold = data;
      const xBoldText = 50 / 2;
      const xfixedDoubleDotEqual = width / 3;
      page.drawText(descName.replace(data, ""), {
        x: xBoldText,
        y: height - gap * fontSize,
        size: fontSize / 3,
        font: Helvetica,
        color: rgb(0, 0, 0),
      });

      for (let key in textToBold) {
        // Draw the bold part
        page.drawText(":", {
          x: xfixedDoubleDotEqual,
          y: height - gap * fontSize,
          size: fontSize / 3,
          font: Helvetica,
          color: rgb(0, 0, 0),
        });
        page.drawText(textToBold[key], {
          x: xfixedDoubleDotEqual + 10,
          // parseFloat(
          //   Helvetica.widthOfTextAtSize(textToBold, fontSize / 3).toFixed(1)
          // ),
          y: height - gap * fontSize,
          size: fontSize / 3,
          font: HelveticaBold,
          color: rgb(0, 0, 0),
          bold: true,
        });
        gap += 0.5;
      }
      return gap;
    };
    const createTextRowArray = (number, desc, data, gap) => {
      const descName = `${number}  ${desc}${data}`;
      const textToBold = data;
      const xBoldText = 50 / 2;
      const xfixedDoubleDotEqual = width / 3;
      page.drawText(descName.replace(data, ""), {
        x: xBoldText,
        y: height - gap * fontSize,
        size: fontSize / 3,
        font: Helvetica,
        color: rgb(0, 0, 0),
      });
      page.drawText(":", {
        x: xfixedDoubleDotEqual,
        y: height - gap * fontSize,
        size: fontSize / 3,
        font: Helvetica,
        color: rgb(0, 0, 0),
      });
      for (let key in textToBold) {
        // Draw the bold part
        page.drawText(textToBold[key], {
          x: xfixedDoubleDotEqual + 10,
          // parseFloat(
          //   Helvetica.widthOfTextAtSize(textToBold, fontSize / 3).toFixed(1)
          // ),
          y: height - gap * fontSize,
          size: fontSize / 4,
          font: HelveticaBold,
          color: rgb(0, 0, 0),
          bold: true,
        });
        gap += 0.5;
      }
      return gap;
    };
    const createTextRowQuality = (number, desc, data, gap) => {
      const descName = `${number}  ${desc}${data}`;
      
      const textToBold = [data.QualityFFA, data.QualityMI, data.QualityDOBI];
      const xBoldText = 50 / 2;
      const xfixedDoubleDotEqual = width / 3;
      
      page.drawText(descName.replace(data, ""), {
        x: xBoldText,
        y: height - gap * fontSize,
        size: fontSize / 3,
        font: Helvetica,
        color: rgb(0, 0, 0),
      });

      for (let key in textToBold) {
        if (textToBold[key] != null) {
          page.drawText(":", {
            x: xfixedDoubleDotEqual,
            y: height - gap * fontSize,
            size: fontSize / 3,
            font: Helvetica,
            color: rgb(0, 0, 0),
          });
          // Draw the bold part
          page.drawText(textToBold[key], {
            x: xfixedDoubleDotEqual + 10,
            y: height - gap * fontSize,
            size: fontSize / 3,
            font: HelveticaBold,
            color: rgb(0, 0, 0),
            bold: true,
          });
          gap += 0.5;
        }
      }
      return gap;
    };
    const createTextBlob = (number, desc, data, gap) => {
      const textToBold = data.split("\n");
      let currentGap = createTextRowArray(number, desc, textToBold, gap);
      return currentGap + 1;
    };
    let gap = 3;
    gap = createTextRowBold("1", "NAMA KAPAL", data.ShipName, gap);
    gap = createTextRowBold("2", "OWNER KAPAL", data.TransportirName, gap);
    gap = createTextRowBold("3", "SUPPLIER", data.SupplierName, gap);
    gap = createTextRowContract("4", "KONTRAK", data.ContractNumbers, gap);
    gap = createTextRowBold("5", "ETA", data.ETA, gap);
    gap = createTextRowBold(
      "6",
      "TARGET LOADING DATE",
      data.LoadingDateTarget,
      gap
    );
    gap = createTextRowBold(
      "7",
      "TERMS OF HANDOVER",
      data.TermsOfHandover,
      gap
    );
    gap = createTextRowBold("8", "KUANTITI", data.Qty, gap);
    gap = createTextRowQuality("9", "KUALITAS", data, gap);
    gap = createTextRowBold("10", "TUJUAN", data.Warehouse, gap);
    gap = createTextBlob("11", "CATATAN", data.Notes, gap);

    page.drawText("Terima kasih atas kerjasamanya.", {
      x: 50 / 2,
      y: height - gap * fontSize,
      size: fontSize / 3,
      font: Helvetica,
      color: rgb(0, 0, 0),
      bold: true,
    });
    gap++;
    page.drawText("Bagian Operasional Logistic,", {
      x: width / 3,
      y: height - gap * fontSize,
      size: fontSize / 3,
      font: Helvetica,
      color: rgb(0, 0, 0),
      bold: true,
    });
    page.drawText("Bagian Adm. Logistic,", {
      x:
        width / 3 +
        Helvetica.widthOfTextAtSize(
          "Bagian Operasional Logistic",
          fontSize / 3
        ) +
        125,
      y: height - gap * fontSize,
      size: fontSize / 3,
      font: Helvetica,
      color: rgb(0, 0, 0),
      bold: true,
    });
    gap += 2;
    page.drawLine({
      start: { x: width / 3, y: height - gap * fontSize },
      end: {
        x:
          width / 3 +
          Helvetica.widthOfTextAtSize(
            "Bagian Operasional Logistic,",
            fontSize / 3
          ),
        y: height - gap * fontSize,
      },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    page.drawLine({
      start: {
        x:
          width / 3 +
          Helvetica.widthOfTextAtSize(
            "Bagian Operasional Logistic",
            fontSize / 3
          ) +
          125,
        y: height - gap * fontSize,
      },
      end: {
        x:
          width / 3 +
          Helvetica.widthOfTextAtSize(
            "Bagian Operasional Logistic",
            fontSize / 3
          ) +
          125 +
          Helvetica.widthOfTextAtSize("Bagian Adm. Logistic,", fontSize / 3),
        y: height - gap * fontSize,
      },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    gap++;
    page.drawText(approvedDate, {
      x:
        width / 3 +
        Helvetica.widthOfTextAtSize(
          "Bagian Operasional Logistic,",
          fontSize / 3
        ) +
        (width / 3 +
          Helvetica.widthOfTextAtSize(
            "Bagian Operasional Logistic",
            fontSize / 3
          ) +
          125 -
          (width / 3 +
            Helvetica.widthOfTextAtSize(
              "Bagian Operasional Logistic,",
              fontSize / 3
            ))) /
          3,
      y: height - gap * fontSize,
      size: fontSize / 3,
      font: Helvetica,
      color: rgb(0, 0, 0),
    });

    gap += 2;
    page.drawText("Note :", {
      x: 50 / 2,
      y: height - gap * fontSize,
      size: fontSize / 3,
      font: Helvetica,
      color: rgb(0, 0, 0),
    });
    gap++;
    page.drawText(
      "• Apabila ada perubahan maka akan kami informasikan kembali",
      {
        x: 50 / 2 + Helvetica.widthOfTextAtSize("Note :", fontSize / 3),
        y: height - gap * fontSize,
        size: fontSize / 3,
        font: HelveticaBold,
        color: rgb(0, 0, 0),
      }
    );

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (err) {
    
    throw err; // Rethrow the error to handle it at a higher level if needed.
  }
};
