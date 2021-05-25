/* eslint-disable */
require('script-loader!file-saver');
require('./Blob.js');
require('script-loader!xlsx/dist/xlsx.core.min');
import XLSX from "xlsx-style";

function generateArray(table) {
    var out = [];
    var rows = table.querySelectorAll('tr');
    var ranges = [];
    for (var R = 0; R < rows.length; ++R) {
        var outRow = [];
        var row = rows[R];
        var columns = row.querySelectorAll('td');
        for (var C = 0; C < columns.length; ++C) {
            var cell = columns[C];
            var colspan = cell.getAttribute('colspan');
            var rowspan = cell.getAttribute('rowspan');
            var cellValue = cell.innerText;
            if (cellValue !== "" && cellValue == +cellValue) cellValue = +cellValue;

            //Skip ranges
            ranges.forEach(function (range) {
                if (R >= range.s.r && R <= range.e.r && outRow.length >= range.s.c && outRow.length <= range.e.c) {
                    for (var i = 0; i <= range.e.c - range.s.c; ++i) outRow.push(null);
                }
            });

            //Handle Row Span
            if (rowspan || colspan) {
                rowspan = rowspan || 1;
                colspan = colspan || 1;
                ranges.push({s: {r: R, c: outRow.length}, e: {r: R + rowspan - 1, c: outRow.length + colspan - 1}});
            }
            ;

            //Handle Value
            outRow.push(cellValue !== "" ? cellValue : null);

            //Handle Colspan
            if (colspan) for (var k = 0; k < colspan - 1; ++k) outRow.push(null);
        }
        out.push(outRow);
    }
    return [out, ranges];
};

function datenum(v, date1904) {
    if (date1904) v += 1462;
    var epoch = Date.parse(v);
    return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
}

function sheet_from_array_of_arrays(data, opts) {
    var ws = {};
    var range = {s: {c: 10000000, r: 10000000}, e: {c: 0, r: 0}};
    for (var R = 0; R != data.length; ++R) {
        for (var C = 0; C != data[R].length; ++C) {
            if (range.s.r > R) range.s.r = R;
            if (range.s.c > C) range.s.c = C;
            if (range.e.r < R) range.e.r = R;
            if (range.e.c < C) range.e.c = C;
            var cell = {v: data[R][C]};
            if (cell.v == null) continue;
            var cell_ref = XLSX.utils.encode_cell({c: C, r: R});

            if (typeof cell.v === 'number') cell.t = 'n';
            else if (typeof cell.v === 'boolean') cell.t = 'b';
            else if (cell.v instanceof Date) {
                cell.t = 'n';
                cell.z = XLSX.SSF._table[14];
                cell.v = datenum(cell.v);
            } else cell.t = 's';

            ws[cell_ref] = cell;
        }
    }
    if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
    return ws;
}

function Workbook() {
    if (!(this instanceof Workbook)) return new Workbook();
    this.SheetNames = [];
    this.Sheets = {};
}

function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}

export function export_table_to_excel(id) {
    var theTable = document.getElementById(id);
    var oo = generateArray(theTable);
    var ranges = oo[1];

    /* original data */
    var data = oo[0];
    var ws_name = "SheetJS";

    var wb = new Workbook(), ws = sheet_from_array_of_arrays(data);

    /* add ranges to worksheet */
    // ws['!cols'] = ['apple', 'banan'];
    ws['!merges'] = ranges;

    /* add worksheet to workbook */
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;

    var wbout = XLSX.write(wb, {bookType: 'xlsx', bookSST: false, type: 'binary'});

    saveAs(new Blob([s2ab(wbout)], {type: "application/octet-stream"}), "test.xlsx")
}

export function export_json_to_excel(th, filterVal, filterA1, jsonData, defaultTitle) {

    /* original data */

    var data = jsonData;
    data.unshift(filterVal);
    data.unshift(filterA1)
    data.unshift(th);
    var ws_name = defaultTitle;

    var wb = new Workbook(), ws = sheet_from_array_of_arrays(data);
    var autoWidth = true
    if (autoWidth) {
        /*设置worksheet每列的最大宽度*/
        const colWidth = data.map(row =>
            row.map(val => {
                /*先判断是否为null/undefined*/
                if (val == null) {
                    return {
                        wch: 13
                    };
                } else if (val.toString().charCodeAt(0) > 255) {
                    /*再判断是否为中文*/
                    return {
                        wch: val.toString().length * 2
                    };
                } else {
                    return {
                        wch: val.toString().length
                    };
                }
            })
        );
        // console.log(colWidth);
        /*以第一行为初始值*/
        let result = colWidth[0];
        colWidth[0][0]["wch"] = 13;
        // console.log(colWidth[0][0]["wch"]);
        for (let i = 1; i < colWidth.length; i++) {
            for (let j = 0; j < colWidth[i].length; j++) {
                if (result[j]["wch"] < colWidth[i][j]["wch"]) {
                    result[j]["wch"] = colWidth[i][j]["wch"];
                }
            }
        }
        ws["!cols"] = result;
    }
    /* add worksheet to workbook */
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;
    var dataInfo = wb.Sheets[wb.SheetNames[0]];
    // console.log(dataInfo)
    var tempMap = {
        0: "",
        1: "A",
        2: "B",
        3: "C",
        4: "D",
        5: "E",
        6: "F",
        7: "G",
        8: "H",
        9: "I",
        10: "J",
        11: "K",
        12: "L",
        13: "M",
        14: "N",
        15: "O",
        16: "P",
        17: "Q",
        18: "R",
        19: "S",
        20: "T",
        21: "U",
        22: "V",
        23: "W",
        24: "X",
        25: "Y",
        26: "Z"
    }
    // 标题行
    let arr = [
        "A1",
        "B1",
        "C1",
        "D1",
        "E1",
        "F1",
        "G1",
        "H1",
        "I1",
        "J1",
        "K1",
        "L1",
        "M1",
        "N1",
        "O1",
        "P1",
        "Q1",
        "R1",
        "S1",
        "T1",
    ];
    //设置主标题样式
    let style = {
        font: {
            // name: "宋体",
            // sz: 18,
            // color: {rgb: "ff0000"},    // 字体颜色
            bold: true
            // italic: false,
            // underline: false
        },
        alignment: {
            horizontal: "center",
            vertical: "center"
        },
        fill: {
            fgColor: {rgb: "3cbb59"}, // 背景颜色
        },
    }
        //设置主标题样式
    let style1 = {
        font: {
            // name: "宋体",
            // sz: 18,
            // color: {rgb: "ff0000"},    // 字体颜色
            bold: true
            // italic: false,
            // underline: false
        },
        alignment: {
            horizontal: "center",
            vertical: "center"
        },
        fill: {
            fgColor: {rgb: "85d598"}, // 背景颜色
        },
    }
            //设置主标题样式
    let style2 = {
        font: {
            // name: "宋体",
            // sz: 18,
            color: {rgb: "990000"},    // 字体颜色
            bold: true
            // italic: false,
            // underline: false
        },
        alignment: {
            horizontal: "center",
            vertical: "center"
        },
        fill: {
            fgColor: {rgb: "3cbb59"}, // 背景颜色
        },
    }
    // excel标题样式
    // for (let i = 0; i <= th.length; i++) {
    //     let int_num = parseInt(i / 26);
    //     let start_params = "";
    //     if (int_num > 0 && int_num.toString().length > 0) {
    //         for (let j = 0; j < int_num.toString().length; j++) {
    //             start_params += "A"
    //         }
    //     }
    //     let location_num = 1
    //     dataInfo[start_params + tempMap[(i + 1) % 27] + location_num].s = style;
    // }
    for (let k = 1; k <= 3; k++) {
        for (let m = 0; m <= th.length; m++) {
            let int_num = parseInt(m / 26);
            let start_params = "";
            if (int_num > 0 && int_num.toString().length > 0) {
                for (let j = 0; j < int_num.toString().length; j++) {
                    start_params += "A"
                }
            }
            let location_num = k
            if (location_num === 2 || location_num === 3) {
                dataInfo[start_params + tempMap[(m + 1) % 27] + location_num].s=style1;
            }else {
                let reg = new RegExp('（必填项）')
                if (reg.test(dataInfo[start_params + tempMap[(m + 1) % 27] + location_num].v)) {
                    dataInfo[start_params + tempMap[(m + 1) % 27] + location_num].s = style2;
                } else {
                    dataInfo[start_params + tempMap[(m + 1) % 27] + location_num].s = style;
                }

            }

        }
    }
    var wbout = XLSX.write(wb, {bookType: 'xlsx', bookSST: false, type: 'binary'});
    var title = defaultTitle || '列表'
    saveAs(new Blob([s2ab(wbout)], {type: "application/octet-stream"}), title + ".xlsx")
}


export function export2Excel(queryParamsList, data, title) {
    require.ensure([], () => {
        const tHeader = []; // 对应表格输出的中文title
        const filterVal = []; // 对应表格输出的数据
        const filterA1 = []; // 对应表格每个字段的类型
        queryParamsList.forEach(item => {
            tHeader.push(
                item.isrequired
                    ? item.bk_property_name + "（必填项）"
                    : item.bk_property_name
            ); // 判断字段是否是必填项
            filterVal.push(item.bk_property_id);
            filterA1.push(item.property_type_name);
        });
        const jsonData = formatJson(filterVal, data);// 表格data
        export_json_to_excel(
            tHeader,
            filterVal,
            filterA1,
            jsonData,
            "" + title
        ); // 对应下载文件的名字
    });
}

function formatJson(filterVal, jsonData) {
    return jsonData.map(v => filterVal.map(j => v[j]));
}