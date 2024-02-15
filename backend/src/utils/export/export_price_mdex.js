package v1

import (
	"fmt"
	"sort"
	"time"

	"github.com/360EntSecGroup-Skylar/excelize/v2"
	"github.com/gin-gonic/gin"
	"gitlab.com/ivanruslimcdohl/bkp-approval-api/constant"
	"gitlab.com/ivanruslimcdohl/bkp-approval-api/controllers"
)

func mdexHeader(c *gin.Context, f *excelize.File, styles CustomStyles, fromDate time.Time, toDate time.Time) (mdexSheet string, startRow int, err error) {
	mdexSheet = constant.EXPORT_SHEET_MDEX
	startRow = 6

	f.NewSheet(mdexSheet)

	f.SetCellStyle(mdexSheet, "A1", "A2", styles.Heading.Plain)
	f.SetCellValue(mdexSheet, "A1", "Mdex Market Price")
	f.SetCellValue(mdexSheet, "A2", fmt.Sprintf("%s - %s", fromDate.Format(constant.FORMAT_DATE), toDate.Format(constant.FORMAT_DATE)))
	f.SetCellValue(mdexSheet, "A4", "Date")
	f.MergeCell(mdexSheet, "A4", "A5")
	f.SetCellValue(mdexSheet, "B4", "Month")
	f.MergeCell(mdexSheet, "B4", "B5")

	f.SetCellValue(mdexSheet, "C4", "1st Opening")
	f.MergeCell(mdexSheet, "C4", "D4")
	f.SetCellValue(mdexSheet, "C5", "MYR/MT")
	f.SetCellValue(mdexSheet, "D5", "Rp/kg")

	f.SetCellValue(mdexSheet, "E4", "1st Closing")
	f.MergeCell(mdexSheet, "E4", "F4")
	f.SetCellValue(mdexSheet, "E5", "MYR/MT")
	f.SetCellValue(mdexSheet, "F5", "Rp/kg")

	f.SetCellValue(mdexSheet, "G4", "2nd Opening")
	f.MergeCell(mdexSheet, "G4", "H4")
	f.SetCellValue(mdexSheet, "G5", "MYR/MT")
	f.SetCellValue(mdexSheet, "H5", "Rp/kg")

	f.SetCellValue(mdexSheet, "I4", "2nd Closing")
	f.MergeCell(mdexSheet, "I4", "J4")
	f.SetCellValue(mdexSheet, "I5", "MYR/MT")
	f.SetCellValue(mdexSheet, "J5", "Rp/kg")

	return
}

func mdexData(c *gin.Context, f *excelize.File, styles CustomStyles, mdexSheet string, currDate time.Time, startRow *int) (err error) {
	mdexPrices := getPriceInfoMdex(c, currDate, nil)
	if err != nil {
		controllers.ResponseErr(c, controllers.ErrorMapping.DatabaseError, err)
		return
	}

	if len(mdexPrices) > 0 {
		mdexDateCell := fmt.Sprintf("A%d", *startRow)

		err = f.SetCellStyle(mdexSheet, "A4", "J5", styles.TableHead.Bordered)
		if err != nil {
			controllers.ResponseErr(c, controllers.ErrorMapping.UnexpectedError, err)
			return
		}
		f.SetColWidth(mdexSheet, "C", "J", constant.EXPORT_WIDTH_PRICE)
		f.SetCellValue(mdexSheet, mdexDateCell, currDate.Format(constant.FORMAT_DATE))

		monthsExistMdex := make(map[int]bool)
		for _, v := range constant.MDEX_TYPES {
			if priceInfo, exist := mdexPrices[v]; exist {
				var monthIndexes []int
				for monthIdx := range priceInfo.Prices {
					monthIndexes = append(monthIndexes, monthIdx)
				}
				sort.Ints(monthIndexes)

				for _, monthIdx := range monthIndexes {
					if _, exist := monthsExistMdex[monthIdx]; !exist {
						monthsExistMdex[monthIdx] = true
					}
				}
			}
		}

		var monthIndexesMdex []int
		for monthIdx := range monthsExistMdex {
			monthIndexesMdex = append(monthIndexesMdex, monthIdx)
		}
		sort.Ints(monthIndexesMdex)

		numCellStart := *startRow
		for _, monthIdx := range monthIndexesMdex {
			startColIdxMdex := 2
			startRowTmp := *startRow
			for _, priceType := range constant.MDEX_TYPES {
				if priceInfo, exist := mdexPrices[priceType]; exist {
					priceMYRCell := fmt.Sprintf("%s%d", constant.GetAlhpabet(startColIdxMdex), startRowTmp)
					priceIDRCell := fmt.Sprintf("%s%d", constant.GetAlhpabet(startColIdxMdex+1), startRowTmp)
					f.SetCellDefault(mdexSheet, priceMYRCell, priceInfo.Prices[monthIdx].Price.String())
					f.SetCellDefault(mdexSheet, priceIDRCell, priceInfo.Prices[monthIdx].PriceIDRFinal.String())
				}
				startColIdxMdex += 2
			}
			f.SetCellValue(mdexSheet, fmt.Sprintf("B%d", *startRow), time.Month(monthIdx+1).String())
			startRowTmp++
			*startRow++
		}
		f.MergeCell(mdexSheet, mdexDateCell, fmt.Sprintf("A%d", *startRow-1))

		f.SetCellStyle(mdexSheet, fmt.Sprintf("A%d", numCellStart), fmt.Sprintf("B%d", *startRow-1), styles.String.Bordered)  // for date + month
		f.SetCellStyle(mdexSheet, fmt.Sprintf("C%d", numCellStart), fmt.Sprintf("J%d", *startRow-1), styles.Numeric.Bordered) // for numbers
	}

	return
}
