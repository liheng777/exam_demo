<template>
    <div>
        <bk-form :label-width="200" style="margin-bottom: 20px">
            <bk-form-item label="选择业务">
                <bk-select v-model="bkBizId" style="width: 250px;"
                           placeholder="请选择业务"
                           clearable
                           ext-cls="select-custom"
                           ext-popover-cls="select-popover-custom">
                    <bk-option v-for="item in bizIdList"
                               :key="item.bk_biz_id"
                               :id="item.bk_biz_id"
                               :name="item.bk_biz_name">
                    </bk-option>
                </bk-select>
            </bk-form-item>
            <bk-form-item label="日期">
                <bk-date-picker
                    v-model="initDateTimeRange"
                    :placeholder="'选择日期时间范围'"
                    format="yyyy-MM-dd HH:mm:ss"
                    :type="'datetimerange'">
                </bk-date-picker>
            </bk-form-item>
            <bk-form-item>
                <bk-button :theme="'primary'" :title="'主要按钮'" class="mr10" @click="init">查询</bk-button>
            </bk-form-item>
        </bk-form>
        <div>
            <bk-table
                v-bkloading="{ isLoading: isLoading, zIndex: 10 }"
                :data="data"
                :size="size"
                :outer-border="false"
                :header-border="false"
                @selection-change="selectChange"
                :header-cell-style="{ background: '#fff' }">
                <bk-table-column type="selection" width="60"></bk-table-column>
                <bk-table-column type="index" label="序列" width="60"></bk-table-column>
                <bk-table-column label="业务ID" prop="bk_biz_name"></bk-table-column>
                <bk-table-column label="用户名" prop="username"></bk-table-column>
                <bk-table-column label="作业ID" prop="bk_job_id"></bk-table-column>
                <bk-table-column label="操作时间" prop="created">
                </bk-table-column>
                <bk-table-column label="作业状态" prop="bk_cloud_id">
                    <template slot-scope="scope">
                        <span v-if="scope.row.status === 9">执行成功</span>
                        <span v-else>执行失败</span>
                    </template>
                </bk-table-column>
                <bk-table-column label="作业日志" prop="log">
                </bk-table-column>
            </bk-table>
            <bk-pagination
                style="margin-top: 20px"
                size="small"
                :current.sync="pagingConfigOne.current"
                :limit="pagingConfigOne.limit"
                :count="pagingConfigOne.count"
                :align="pagingConfigOne.align"
                :show-limit="pagingConfigOne.showLimit"
                @change="handlePageChange">
            </bk-pagination>
        </div>
        <bk-dialog
            v-model="exampleSetting.visible"
            :header-position="exampleSetting.headerPosition"
            :loading="exampleSetting.loading"
            @confirm="confirm"
            @cancel="cancel"
            title="执行作业">
            是否执行作业？
        </bk-dialog>
    </div>
</template>

<script>

import Vue from 'vue'
import { bkButton, bkTable, bkTableColumn, bkTooltips, bkPagination, bkDatePicker, bkDialog  } from 'bk-magic-vue'
import { export2Excel } from '../excel/Export2Excel'
import XLSX from 'xlsx'
Vue.use(bkTooltips)
export default {
  name: 'history-list',
  components: {
    bkButton,
    bkTable,
    // bkInput,
    bkTableColumn,
    bkPagination,
    bkDatePicker,
    bkDialog
  },
  data() {
    return {
      initDateTime: new Date(),
      bizIdList: [],
      bkBizId: null,
      pagingConfigOne: {    // 分页
        current: 1,
        limit: 10,
        count: 0,
        align: 'center',
        showLimit: false
      },
      isLoading: false,
      size: 'small',
      data: [],
      initDateTimeRange: [],
      exampleSetting: { // 弹出框
        visible: false,
        loading: false,
        countdown: 3,
        headerPosition: 'left',
        timer: null
      },
      // excel
      fileName: '',
      fileSize: ''
    }
  },
  mounted() {
    // this.$http.get('get_event').then((res) => {
    //   this.msg = res.data
    // })
  },
  created() {
    this.getBusiness()
    this.init()
  },
  methods: {
    confirm() { // 弹出框确定
      this.exampleSetting.loading = true
      this.exampleSetting.timer = setInterval(() => {
        this.exampleSetting.countdown -= 1
        if (this.exampleSetting.countdown === 0) {
          this.exampleSetting.visible = false
          this.exampleSetting.loading = false
          clearInterval(this.exampleSetting.timer)
        }
      }, 1000)
    },
    cancel() { // 弹出框取消
      console.warn('cancel')
    },
    handlePageChange(page) {
      this.pagingConfigOne.current = page
      this.init()
    },
    selectChange(val) {
      // 多选
      console.log(val)
    },
    getBusiness() {
      this.$http.get('get_business').then((res) => {
        if (res.data.result) {
          this.bizIdList = res.data.data.info
        }
      })
    },
    init() {
      console.log(this.initDateTimeRange)
      const data = {
        pageSize: this.pagingConfigOne.limit,
        currentPage: this.pagingConfigOne.current,
        bk_biz_id: this.bkBizId,
        start_time: this.initDateTimeRange ? this.initDateTimeRange[0] : null,
        end_time: this.initDateTimeRange ? this.initDateTimeRange[1] : null
      }
      this.data = []
      this.total = 0
      this.isLoading = true
      this.$http.get(`search_history_list?data=${JSON.stringify(data)}`).then((res) => {
        if (res.data.result) {
          this.data = res.data.items
          this.pagingConfigOne.count = res.data.count
        } else {
          this.data = []
          this.pagingConfigOne.count = 0
        }
      })
        .finally(() => {
          this.isLoading = false
        })
    },
    downloadExcel() {
      // 导出Excel
      const data = {
        bkSupplierAccount: this.bkSupplierAccount,
        bkObjId: this.bkObjId
      }
      this.$http
        .request({
          url: `/download_data?data=${JSON.stringify(data)}`,
          method: 'get'
        })
        .then((res) => {
          if (res.data.result) {
            export2Excel(this.queryParamsList, res.data.items, this.bkObjId) // 导出excel
          } else {
            this.$message.error('导出数据失败')
          }
        })
    },
    upload(file) {
      this.fileName = file.name
      this.fileSize = `${Math.round((file.size / 1024) * 100) / 100}kb` // excel文档大小保留两位有效数字
      this.readExcel(file, '/insert_data_by_excel') // excel导入
    },
    readExcel(file, url) {
      const files = { 0: file.raw }
      // 表格导入
      if (files.length <= 0) {
        // 如果没有文件名
        return false
      } if (!/\.(xls|xlsx)$/.test(files[0].name.toLowerCase())) {
        this.$message.error('上传格式不正确，请上传xlsx格式')
        return false
      } if (files.size / 1024 >= 500) {
        this.$message.error('文件大小不能超过500kb')
        return false
      }
      const fileReader = new FileReader()
      fileReader.onload = (ev) => {
        try {
          const data = ev.target.result
          const workbook = XLSX.read(data, {
            type: 'binary'
          })
          const wsname = workbook.SheetNames[0] // 取第一张表
          delete workbook.Sheets[wsname][1]
          // 从第三行的单元格开始取值
          const xlsxLth = workbook.Sheets[workbook.SheetNames[0]]['!ref']
          const stopX = xlsxLth.substr(
            xlsxLth.indexOf(':') + 1,
            workbook.Sheets[workbook.SheetNames[0]]['!ref'].length
          )
          workbook.Sheets[workbook.SheetNames[0]]['!ref'] = `A3:${stopX}`

          const sheet2JSONOpts = {
            // 单元格中没有值的时候，转成json类型时，默认不显示，
            /** Default value for null/undefined values */
            defval: '' // 给defval赋值为空的字符串
          }
          // eslint-disable-next-line camelcase
          const excel_files = XLSX.utils.sheet_to_json(
            workbook.Sheets[wsname],
            sheet2JSONOpts
          ) // 生成json表格内容
          const dada = {
            excel_files,
            bkObjId: wsname
            // workbook: workbook
          }
          this.$http
            .request({
              url,
              method: 'post',
              data: dada
            })
            .then((res) => {
              if (res.data.result) {
                this.$message({
                  title: '消息提示',
                  message: '导入数据成功',
                  type: 'success'
                })
                this.getList()
              } else {
                this.$message({
                  title: '消息提示',
                  message: res.data.message,
                  type: 'warning'
                })
              }
            })
          // 重写数据
          // this.$refs.upload.value = "";
        } catch (e) {
          return false
        }
      }
      fileReader.readAsBinaryString(files[0])
    }
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    h3 {
      margin: 40px 0 0;
    }
    ul {
      list-style-type: none;
      padding: 0;
    }
    li {
      display: inline-block;
      margin: 0 10px;
    }
    a {
      color: #42b983;
    }
     .bk-table-header .custom-header-cell {
        color: inherit;
        text-decoration: underline;
        text-decoration-style: dashed;
        text-underline-position: under;
    }
    li {
        display: block;
    }
</style>
