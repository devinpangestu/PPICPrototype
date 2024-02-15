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

func dalianHeader(c *gin.Context, f *excelize.File, styles CustomStyles, fromDate time.Time, toDate time.Time) (sheetName string, startRow int, err error) {
	sheetName = constant.EXPORT_SHEET_DALIAN
	startRow = 4

	f.SetCellStyle(sheetName, "A1", "A2", styles.Heading.Plain)
	f.SetCellValue(sheetName, "A1", "Dalian Market Price")
	f.SetCellValue(sheetName, "A2", fmt.Sprintf("%s - %s", fromDate.Format(constant.FORMAT_DATE), toDate.Format(constant.FORMAT_DATE)))

	return
}

func dalianData(c *gin.Context, f *excelize.File, styles CustomStyles, sheetName string, currDate time.Time, startRow *int, tableHeadRow *int) (err error) {
	dalianPrices := getPriceResDalian(c, currDate)
	if err != nil {
		controllers.ResponseErr(c, controllers.ErrorMapping.DatabaseError, err)
		return
	}
	dalianDateCell := fmt.Sprintf("A%d", *startRow)
	f.SetCellStyle(sheetName, dalianDateCell, dalianDateCell, styles.Heading.Plain)
	f.SetCellValue(sheetName, dalianDateCell, currDate.Format(constant.FORMAT_DATE))

	err = writeDalian(c, f, styles, sheetName, tableHeadRow, dalianPrices)
	if err != nil {
		return
	}
	*startRow = *tableHeadRow - 1

	return
}

func writeDalian(c *gin.Context, f *excelize.File, styles CustomStyles, sheetName string, tableHeadRow *int, prices map[string]map[int]priceDalianWithProg) (err error) {
	if len(prices) == 0 {
		return
	}

	// set column title to be centered
	err = f.SetCellStyle(sheetName, fmt.Sprintf("A%d", *tableHeadRow), fmt.Sprintf("G%d", *tableHeadRow), styles.TableHead.Bordered)
	if err != nil {
		controllers.ResponseErr(c, controllers.ErrorMapping.UnexpectedError, err)
		return
	}

	f.SetColWidth(sheetName, "A", "G", constant.EXPORT_WIDTH_PRICE)
	f.SetCellValue(sheetName, fmt.Sprintf("A%d", *tableHeadRow), "Commodity")
	f.SetCellValue(sheetName, fmt.Sprintf("B%d", *tableHeadRow), "Month")
	f.SetCellValue(sheetName, fmt.Sprintf("C%d", *tableHeadRow), "USD to RMB")
	f.SetCellValue(sheetName, fmt.Sprintf("D%d", *tableHeadRow), "Price RMB")
	f.SetCellValue(sheetName, fmt.Sprintf("E%d", *tableHeadRow), "RMB(+-)")
	f.SetCellValue(sheetName, fmt.Sprintf("F%d", *tableHeadRow), "Price USD")
	f.SetCellValue(sheetName, fmt.Sprintf("G%d", *tableHeadRow), "USD(+-)")

	currRow := *tableHeadRow + 1
	commodityOrder := []string{"rbd_oln", "soy_oil", "soy_bean"}
	numCellStart := currRow
	for _, commodity := range commodityOrder {
		commodityCellStart := fmt.Sprintf("A%d", currRow)
		if _, exist := prices[commodity]; exist {
			priceDalianArr := []priceDalianWithProg{}
			for _, v := range prices[commodity] {
				priceDalianArr = append(priceDalianArr, v)
			}
			sort.Slice(priceDalianArr, func(i, j int) bool {
				return priceDalianArr[j].MonthIndex > priceDalianArr[i].MonthIndex
			})

			for _, v := range priceDalianArr {
				f.SetCellValue(sheetName, fmt.Sprintf("A%d", currRow), constant.GetCommodityDalianDesc(commodity))
				f.SetCellValue(sheetName, fmt.Sprintf("B%d", currRow), time.Month(v.MonthIndex+1).String())
				f.SetCellDefault(sheetName, fmt.Sprintf("C%d", currRow), v.USDToRMB.String())
				f.SetCellDefault(sheetName, fmt.Sprintf("D%d", currRow), v.PriceRMB.String())
				f.SetCellDefault(sheetName, fmt.Sprintf("E%d", currRow), v.PriceRMBProgressive.String())
				f.SetCellDefault(sheetName, fmt.Sprintf("F%d", currRow), v.PriceUSD.String())
				if v.PriceUSDProgressive != "" {
					f.SetCellStyle(sheetName, fmt.Sprintf("G%d", currRow), fmt.Sprintf("G%d", currRow), styles.Numeric.Bordered)
					f.SetCellDefault(sheetName, fmt.Sprintf("G%d", currRow), v.PriceUSDProgressive)
				} else {
					f.SetCellStyle(sheetName, fmt.Sprintf("G%d", currRow), fmt.Sprintf("G%d", currRow), styles.EmptyProgressive.Bordered)
					f.SetCellDefault(sheetName, fmt.Sprintf("G%d", currRow), constant.PROG_NOT_FOUND)
				}
				currRow++
			}
			commodityCellEnd := fmt.Sprintf("A%d", currRow-1)
			f.MergeCell(sheetName, commodityCellStart, commodityCellEnd)
		}
	}

	f.SetCellStyle(sheetName, fmt.Sprintf("A%d", numCellStart), fmt.Sprintf("B%d", currRow-1), styles.String.Bordered)  // for commodity + month
	f.SetCellStyle(sheetName, fmt.Sprintf("C%d", numCellStart), fmt.Sprintf("F%d", currRow-1), styles.Numeric.Bordered) // for numbers

	*tableHeadRow = currRow + 2
	return
}
