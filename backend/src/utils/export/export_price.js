import xl from "excel4node";
func exportPrice(c *gin.Context, f *excelize.File, styles CustomStyles, fromDate time.Time, toDate time.Time) (err error) {
	dalianSheet, startRowDalian, err := dalianHeader(c, f, styles, fromDate, toDate)
	if err != nil {
		return
	}
	tableHeadRowDalian := startRowDalian + 1

	kpbSheet, kpb2Sheet, startRowKPB, err := kpbHeader(c, f, styles, fromDate, toDate)
	if err != nil {
		return
	}
	tableHeadRowKPB := startRowKPB + 1
	startRowKPB2 := 1

	reutersSheet, startRowReuters, err := reutersHeader(c, f, styles, fromDate, toDate)
	if err != nil {
		return
	}

	mdexSheet, startRowMdex, err := mdexHeader(c, f, styles, fromDate, toDate)
	if err != nil {
		return
	}

	dayRange := int(toDate.Sub(fromDate).Hours() / 24)
	for i := 0; i <= dayRange; i++ {
		currDate := fromDate.AddDate(0, 0, i)

		err = dalianData(c, f, styles, dalianSheet, currDate, &startRowDalian, &tableHeadRowDalian)
		if err != nil {
			return
		}

		err = kpbData(c, f, styles, kpbSheet, currDate, &startRowKPB, &tableHeadRowKPB, kpb2Sheet, &startRowKPB2)
		if err != nil {
			return
		}

		err = reutersData(c, f, styles, reutersSheet, currDate, &startRowReuters)
		if err != nil {
			return
		}

		err = mdexData(c, f, styles, mdexSheet, currDate, &startRowMdex)
		if err != nil {
			return
		}
	}

	return
}
