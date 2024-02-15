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

func reutersHeader(c *gin.Context, f *excelize.File, styles CustomStyles, fromDate time.Time, toDate time.Time) (reutersSheet string, startRow int, err error) {
	reutersSheet = constant.EXPORT_SHEET_REUTERS
	startRow = 7

	f.NewSheet(reutersSheet)

	f.SetColWidth(reutersSheet, "A", "A", constant.EXPORT_WIDTH_TEXT)
	f.SetCellStyle(reutersSheet, "A1", "A2", styles.Heading.Plain)
	f.SetCellValue(reutersSheet, "A1", "Reuters Market Price")
	f.SetCellValue(reutersSheet, "A2", fmt.Sprintf("%s - %s", fromDate.Format(constant.FORMAT_DATE), toDate.Format(constant.FORMAT_DATE)))
	f.SetCellValue(reutersSheet, "A4", "Date")
	f.MergeCell(reutersSheet, "A4", "A6")
	f.SetCellValue(reutersSheet, "B4", "Month")
	f.MergeCell(reutersSheet, "B4", "B6")

	f.SetCellValue(reutersSheet, "C4", "Reuters Pagi")
	f.MergeCell(reutersSheet, "C4", "T4")

	f.SetCellValue(reutersSheet, "U4", "Reuters Siang")
	f.MergeCell(reutersSheet, "U4", "AJ4")

	commodityColIdx := 2 // will be converted using constant.MAP_ALPHABET
	commodityRow := 5
	for _, listPerType := range [][]constant.Commodity{constant.COMMODITY_LIST_REUTERS_MORNING, constant.COMMODITY_LIST_REUTERS_AFTERNOON} {
		for _, v := range listPerType {
			cellStart := fmt.Sprintf("%s%d", constant.GetAlhpabet(commodityColIdx), commodityRow)
			cellEnd := fmt.Sprintf("%s%d", constant.GetAlhpabet(commodityColIdx+1), commodityRow)
			f.SetCellValue(reutersSheet, cellStart, v.Desc)
			f.MergeCell(reutersSheet, cellStart, cellEnd)
			priceFieldStr := "USD/MT"
			if v.ID == "soy_oil" {
				priceFieldStr = "EUR/MT"
			} else if v.ID == "cpo_fob_malaysia" || v.ID == "cpko_fob_malaysia" {
				priceFieldStr = "MYR/MT"
			}
			f.SetCellValue(reutersSheet, fmt.Sprintf("%s%d", constant.GetAlhpabet(commodityColIdx), commodityRow+1), priceFieldStr)
			f.SetCellValue(reutersSheet, fmt.Sprintf("%s%d", constant.GetAlhpabet(commodityColIdx+1), commodityRow+1), "Rp/kg")
			commodityColIdx += 2
		}
	}

	return
}

func reutersData(c *gin.Context, f *excelize.File, styles CustomStyles, reutersSheet string, currDate time.Time, startRow *int) (err error) {
	reutersPrices := getPriceResReuters(c, currDate, nil)
	if err != nil {
		controllers.ResponseErr(c, controllers.ErrorMapping.DatabaseError, err)
		return
	}

	if len(reutersPrices.PriceInfo) > 0 {
		reutersDateCell := fmt.Sprintf("A%d", *startRow)

		err = f.SetCellStyle(reutersSheet, "A4", "AJ6", styles.TableHead.Bordered)
		if err != nil {
			controllers.ResponseErr(c, controllers.ErrorMapping.UnexpectedError, err)
			return
		}
		f.SetColWidth(reutersSheet, "C", "AJ", constant.EXPORT_WIDTH_PRICE)
		f.SetCellValue(reutersSheet, reutersDateCell, currDate.Format(constant.FORMAT_DATE))

		monthsExist := make(map[int]bool)
		for _, priceType := range constant.REUTERS_TYPES {
			if priceInfo, priceInfoExist := reutersPrices.PriceInfo[priceType]; priceInfoExist {
				if commodities, typeExist := constant.COMMODITY_LIST_REUTERS_MAP[priceType]; typeExist {
					for _, v := range commodities {
						if prices, exist := priceInfo.Prices[v.ID]; exist {
							var monthIndexes []int
							for monthIdx := range prices {
								monthIndexes = append(monthIndexes, monthIdx)
							}

							for _, monthIdx := range monthIndexes {
								if _, exist := monthsExist[monthIdx]; !exist {
									monthsExist[monthIdx] = true
								}
							}
						}
					}
				}
			}
		}

		var monthIndexes []int
		for monthIdx := range monthsExist {
			monthIndexes = append(monthIndexes, monthIdx)
		}
		sort.Ints(monthIndexes)

		numCellStart := *startRow
		for _, monthIdx := range monthIndexes {
			startRowTmp := *startRow
			startColIdxReuters := 2
			for _, priceType := range constant.REUTERS_TYPES {
				if priceInfo, priceInfoExist := reutersPrices.PriceInfo[priceType]; priceInfoExist {
					if commodities, typeExist := constant.COMMODITY_LIST_REUTERS_MAP[priceType]; typeExist {
						for _, v := range commodities {
							if prices, exist := priceInfo.Prices[v.ID]; exist {
								if price, monthIdxExist := prices[monthIdx]; monthIdxExist {
									priceUSDCell := fmt.Sprintf("%s%d", constant.GetAlhpabet(startColIdxReuters), startRowTmp)
									priceIDRCell := fmt.Sprintf("%s%d", constant.GetAlhpabet(startColIdxReuters+1), startRowTmp)
									f.SetCellDefault(reutersSheet, priceUSDCell, price.Price.String())
									f.SetCellDefault(reutersSheet, priceIDRCell, price.PriceIDRFinal.String())
								}
							}
							startColIdxReuters += 2
						}
					}
				}
			}

			f.SetCellValue(reutersSheet, fmt.Sprintf("B%d", *startRow), time.Month(monthIdx+1).String())
			*startRow++
			startRowTmp++
		}
		f.MergeCell(reutersSheet, reutersDateCell, fmt.Sprintf("A%d", *startRow-1))

		f.SetCellStyle(reutersSheet, fmt.Sprintf("A%d", numCellStart), fmt.Sprintf("B%d", *startRow-1), styles.String.Bordered)   // for date + month
		f.SetCellStyle(reutersSheet, fmt.Sprintf("C%d", numCellStart), fmt.Sprintf("AJ%d", *startRow-1), styles.Numeric.Bordered) // for numbers
	}
	return
}
