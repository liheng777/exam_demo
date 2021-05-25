import XLSX from "xlsx";
import axios from "axios";
import ElementUI from "element-ui";

export function readExcel(file, url) {
  const files = { 0: file.raw };
  //表格导入
  if (files.length <= 0) {
    //如果没有文件名
    return false;
  } else if (!/\.(xls|xlsx)$/.test(files[0].name.toLowerCase())) {
    this.$message.error("上传格式不正确，请上传xlsx格式");
    return false;
  } else if (files.size / 1024 >= 500) {
    this.$message.error("文件大小不能超过500kb");
    return false;
  }
  const fileReader = new FileReader();
  fileReader.onload = ev => {
    try {
      const data = ev.target.result;
      const workbook = XLSX.read(data, {
        type: "binary"
      });
      const wsname = workbook.SheetNames[0]; //取第一张表
      delete workbook.Sheets[wsname][1];
      // 从第三行的单元格开始取值
      let xlsxLth = workbook.Sheets[workbook.SheetNames[0]]["!ref"];
      let stopX = xlsxLth.substr(
        xlsxLth.indexOf(":") + 1,
        workbook.Sheets[workbook.SheetNames[0]]["!ref"].length
      );
      workbook.Sheets[workbook.SheetNames[0]]["!ref"] = "A3:" + stopX;

      const sheet2JSONOpts = {
        // 单元格中没有值的时候，转成json类型时，默认不显示，
        /** Default value for null/undefined values */
        defval: "" //给defval赋值为空的字符串
      };
      const excel_files = XLSX.utils.sheet_to_json(
        workbook.Sheets[wsname],
        sheet2JSONOpts
      ); //生成json表格内容
      const dada = {
        excel_files: excel_files,
        bkObjId: wsname
        // workbook: workbook
      };
      axios
        .request({
          url: url,
          method: "post",
          data: dada
        })
        .then(res => {
          if (res.data.result) {
            ElementUI.MessageBox({
              title: "消息提示",
              message: "导入数据成功",
              type: "success"
            });
          } else {
            ElementUI.MessageBox({
              title: "消息提示",
              message: res.data.message,
              type: "warning"
            });
          }
        });
      //重写数据
      // this.$refs.upload.value = "";
    } catch (e) {
      return false;
    }
  };
  fileReader.readAsBinaryString(files[0]);
}
