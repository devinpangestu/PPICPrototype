package v1

import (
	"fmt"
	"time"

	"github.com/360EntSecGroup-Skylar/excelize/v2"
	"github.com/gin-gonic/gin"
	"gitlab.com/ivanruslimcdohl/bkp-approval-api/constant"
	"gitlab.com/ivanruslimcdohl/bkp-approval-api/controllers"
)

func kpbHeader(c *gin.Context, f *excelize.File, styles CustomStyles, fromDate time.Time, toDate time.Time) (kpbSheet string, kpb2Sheet string, startRow int, err error) {
	kpbSheet = constant.EXPORT_SHEET_KPB
	startRow = 4

	f.NewSheet(kpbSheet)

	err = setListColsStyle(c, f, kpbSheet, []ColsStyle{
		{
			Cols:    []string{"A"},
			StyleID: styles.String.Plain,
		},
		{
			Cols:    []string{"B:C"},
			StyleID: styles.Price.Plain,
		},
	})
	if err != nil {
		controllers.ResponseErr(c, controllers.ErrorMapping.UnexpectedError, err)
		return
	}
	f.SetCellStyle(kpbSheet, "A1", "A2", styles.Heading.Plain)
	f.SetCellValue(kpbSheet, "A1", "KPB Price")
	f.SetCellValue(kpbSheet, "A2", fmt.Sprintf("%s - %s", fromDate.Format(constant.FORMAT_DATE), toDate.Format(constant.FORMAT_DATE)))

	// kpb 2
	kpb2Sheet = fmt.Sprintf("%s(2)", constant.EXPORT_SHEET_KPB)
	f.NewSheet(kpb2Sheet)

	err = setListColsStyle(c, f, kpb2Sheet, []ColsStyle{
		{
			Cols:    []string{"A"},
			StyleID: styles.String.Plain,
		},
		{
			Cols:    []string{"B:C"},
			StyleID: styles.Price.Plain,
		},
	})
	if err != nil {
		controllers.ResponseErr(c, controllers.ErrorMapping.UnexpectedError, err)
		return
	}
	f.SetColWidth(kpb2Sheet, "A", "C", 15)
	f.SetCellValue(kpb2Sheet, "A1", "Date")
	f.SetCellValue(kpb2Sheet, "B1", "Price")
	f.SetCellValue(kpb2Sheet, "C1", "Price Include")
	f.SetCellStyle(kpb2Sheet, "A1", "A1", styles.String.Bordered)
	f.SetCellStyle(kpb2Sheet, "B1", "B1", styles.String.Bordered)
	f.SetCellStyle(kpb2Sheet, "C1", "C1", styles.String.Bordered)

	return
}

func kpbData(c *gin.Context, f *excelize.File, styles CustomStyles, kpbSheet string, currDate time.Time, startRow *int, tableHeadRow *int, kpb2Sheet string, kpb2Row *int) (err error) {
	kpbPrices := getPriceResKPB(c, currDate)
	if err != nil {
		controllers.ResponseErr(c, controllers.ErrorMapping.DatabaseError, err)
		return
	}
	kpbDateCell := fmt.Sprintf("A%d", *startRow)
	f.SetCellStyle(kpbSheet, kpbDateCell, kpbDateCell, styles.Heading.Plain)
	f.SetCellValue(kpbSheet, kpbDateCell, currDate.Format(constant.FORMAT_DATE))

	err = writeKPB(c, f, kpbSheet, styles, tableHeadRow, kpbPrices)
	if err != nil {
		return
	}
	*startRow = *tableHeadRow - 1

	err = kpb2Data(c, f, styles, kpb2Sheet, kpbPrices, kpb2Row)

	return
}

func writeKPB(c *gin.Context, f *excelize.File, sheetName string, styles CustomStyles, tableHeadRow *int, prices priceResKPB) (err error) {
	if prices.Final == nil {
		return
	}
	// set column title to be centered
	err = f.SetCellStyle(sheetName, fmt.Sprintf("A%d", *tableHeadRow), fmt.Sprintf("C%d", *tableHeadRow), styles.TableHead.Bordered)
	if err != nil {
		controllers.ResponseErr(c, controllers.ErrorMapping.UnexpectedError, err)
		return
	}

	finalPriceCell := fmt.Sprintf("A%d", *tableHeadRow)
	f.SetCellValue(sheetName, finalPriceCell, "Final Price")
	f.MergeCell(sheetName, finalPriceCell, fmt.Sprintf("A%d", *tableHeadRow+1))
	f.SetCellValue(sheetName, fmt.Sprintf("B%d", *tableHeadRow), "Price")
	f.SetCellValue(sheetName, fmt.Sprintf("C%d", *tableHeadRow), "Price Include")
	f.SetCellDefault(sheetName, fmt.Sprintf("B%d", *tableHeadRow+1), prices.Final.Price.String())
	f.SetCellDefault(sheetName, fmt.Sprintf("C%d", *tableHeadRow+1), prices.Final.PriceInclude.String())
	f.SetCellStyle(sheetName, fmt.Sprintf("A%d", *tableHeadRow+1), fmt.Sprintf("A%d", *tableHeadRow+1), styles.String.Bordered)
	f.SetCellStyle(sheetName, fmt.Sprintf("B%d", *tableHeadRow+1), fmt.Sprintf("C%d", *tableHeadRow+1), styles.Price.Bordered)

	*tableHeadRow += 3

	f.SetColWidth(sheetName, "A", "C", constant.EXPORT_WIDTH_PRICE)
	f.SetCellValue(sheetName, fmt.Sprintf("A%d", *tableHeadRow), "Competitor")
	f.SetCellValue(sheetName, fmt.Sprintf("B%d", *tableHeadRow), "Price")
	f.SetCellValue(sheetName, fmt.Sprintf("C%d", *tableHeadRow), "Price Include")
	// set column title to be centered
	err = f.SetCellStyle(sheetName, fmt.Sprintf("A%d", *tableHeadRow), fmt.Sprintf("C%d", *tableHeadRow), styles.TableHead.Bordered)
	if err != nil {
		controllers.ResponseErr(c, controllers.ErrorMapping.UnexpectedError, err)
		return
	}
	currRow := *tableHeadRow + 1
	numCellStart := currRow
	for _, v := range prices.Competitors {
		f.SetCellValue(sheetName, fmt.Sprintf("A%d", currRow), v.ID)
		f.SetCellDefault(sheetName, fmt.Sprintf("B%d", currRow), v.Price.String())
		f.SetCellDefault(sheetName, fmt.Sprintf("C%d", currRow), v.PriceInclude.String())
		currRow++
	}

	f.SetCellStyle(sheetName, fmt.Sprintf("A%d", numCellStart), fmt.Sprintf("A%d", currRow-1), styles.String.Bordered) // for competitor
	f.SetCellStyle(sheetName, fmt.Sprintf("B%d", numCellStart), fmt.Sprintf("C%d", currRow-1), styles.Price.Bordered)  // for prices
	*tableHeadRow = currRow + 3

	return
}

func kpb2Data(c *gin.Context, f *excelize.File, styles CustomStyles, kpb2Sheet string, kpbPrices priceResKPB, currRow *int) (err error) {
	if kpbPrices.Final == nil {
		return
	}
	f.SetCellValue(kpb2Sheet, fmt.Sprintf("A%d", *currRow+1), kpbPrices.Final.Date.Format(constant.FORMAT_DATE))
	f.SetCellDefault(kpb2Sheet, fmt.Sprintf("B%d", *currRow+1), kpbPrices.Final.Price.String())
	f.SetCellDefault(kpb2Sheet, fmt.Sprintf("C%d", *currRow+1), kpbPrices.Final.PriceInclude.String())
	f.SetCellStyle(kpb2Sheet, fmt.Sprintf("A%d", *currRow+1), fmt.Sprintf("A%d", *currRow+1), styles.String.Bordered)
	f.SetCellStyle(kpb2Sheet, fmt.Sprintf("B%d", *currRow+1), fmt.Sprintf("B%d", *currRow+1), styles.Price.Bordered)
	f.SetCellStyle(kpb2Sheet, fmt.Sprintf("C%d", *currRow+1), fmt.Sprintf("C%d", *currRow+1), styles.Price.Bordered)

	return
}
