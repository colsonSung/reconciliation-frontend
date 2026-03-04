<template>
  <div class="export">
    <el-card shadow="never" class="apple-card">
      <template #header>
        <span class="card-title">Excel 导出</span>
      </template>
      
      <el-form :model="form" label-width="120px" class="apple-form">
        <el-form-item label="选择数据范围">
          <el-radio-group v-model="form.rangeType">
            <el-radio-button label="today">今日数据</el-radio-button>
            <el-radio-button label="yesterday">昨日数据</el-radio-button>
            <el-radio-button label="custom">自定义范围</el-radio-button>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="自定义日期" v-if="form.rangeType === 'custom'">
          <el-date-picker
            v-model="form.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="选择通道">
          <el-select v-model="form.channel" placeholder="全部通道" clearable style="width: 100%">
            <el-option label="全部通道" value="" />
            <el-option label="支付宝" value="支付宝" />
            <el-option label="微信支付" value="微信支付" />
            <el-option label="银联" value="银联" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="对账状态">
          <el-select v-model="form.status" placeholder="全部状态" clearable style="width: 100%">
            <el-option label="全部状态" value="" />
            <el-option label="已匹配" value="matched" />
            <el-option label="差异" value="mismatch" />
            <el-option label="待处理" value="pending" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="导出字段">
          <el-checkbox-group v-model="form.fields" class="field-checkbox-group">
            <el-checkbox label="orderNo">订单号</el-checkbox>
            <el-checkbox label="channel">通道</el-checkbox>
            <el-checkbox label="amount">金额</el-checkbox>
            <el-checkbox label="channelStatus">通道状态</el-checkbox>
            <el-checkbox label="systemStatus">系统状态</el-checkbox>
            <el-checkbox label="result">对账结果</el-checkbox>
            <el-checkbox label="createTime">交易时间</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-form-item label="文件名称">
          <el-input v-model="form.fileName" placeholder="对账数据导出" style="width: 300px">
            <template #append>.xlsx</template>
          </el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleExport" :loading="exporting" style="height: 44px; padding: 0 32px; font-size: 15px;">
            <el-icon><Download /></el-icon>
            导出 Excel
          </el-button>
          <el-button @click="handlePreview" style="height: 44px; padding: 0 24px;">
            <el-icon><View /></el-icon>
            预览数据
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="apple-card" style="margin-top: 24px" v-if="previewData.length">
      <template #header>
        <span class="card-title">数据预览 (前10条)</span>
      </template>
      <el-table :data="previewData" stripe max-height="400" :header-cell-style="{ background: '#F2F2F7', fontWeight: 600 }">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column v-for="col in selectedColumns" :key="col.prop" :prop="col.prop" :label="col.label" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
import { Download, View } from '@element-plus/icons-vue'

interface Form {
  rangeType: string
  dateRange: string[]
  channel: string
  status: string
  fields: string[]
  fileName: string
}

const form = ref<Form>({
  rangeType: 'today',
  dateRange: [],
  channel: '',
  status: '',
  fields: ['orderNo', 'channel', 'amount', 'result', 'createTime'],
  fileName: '对账数据导出'
})

const exporting = ref(false)
const previewData = ref<any[]>([])

interface Column {
  prop: string
  label: string
}

const columnMap: Record<string, Column> = {
  orderNo: { prop: 'orderNo', label: '订单号' },
  channel: { prop: 'channel', label: '通道' },
  amount: { prop: 'amount', label: '金额' },
  channelStatus: { prop: 'channelStatus', label: '通道状态' },
  systemStatus: { prop: 'systemStatus', label: '系统状态' },
  result: { prop: 'result', label: '对账结果' },
  createTime: { prop: 'createTime', label: '交易时间' }
}

const selectedColumns = computed((): Column[] => {
  return form.value.fields.map(f => columnMap[f]).filter((col): col is Column => col !== undefined)
})

const generateMockData = () => {
  const statuses = ['成功', '失败']
  const results = ['匹配', '差异', '待处理']
  const data = []
  for (let i = 0; i < 20; i++) {
    const item: Record<string, any> = {
      orderNo: `ORD${Date.now()}${i}`,
      channel: ['支付宝', '微信支付', '银联'][Math.floor(Math.random() * 3)],
      amount: (Math.random() * 10000).toFixed(2),
      channelStatus: statuses[Math.floor(Math.random() * 2)],
      systemStatus: statuses[Math.floor(Math.random() * 2)],
      result: results[Math.floor(Math.random() * results.length)],
      createTime: `2026-03-03 ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`
    }
    data.push(item)
  }
  return data
}

const handlePreview = () => {
  previewData.value = generateMockData()
  ElMessage.success(`预览 ${previewData.value.length} 条数据`)
}

const handleExport = async () => {
  if (!previewData.value.length) {
    handlePreview()
  }
  
  if (!form.value.fileName) {
    ElMessage.warning('请输入文件名称')
    return
  }

  exporting.value = true
  
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const ws = XLSX.utils.json_to_sheet(previewData.value)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '对账数据')
  
  XLSX.writeFile(wb, `${form.value.fileName}.xlsx`)
  
  exporting.value = false
  ElMessage.success('导出成功')
}
</script>

<style scoped>
.export {
  max-width: 1200px;
  margin: 0 auto;
}

.card-title {
  font-size: 17px;
  font-weight: 600;
  color: #1D1D1F;
}

.apple-form :deep(.el-radio-button__inner) {
  border-radius: 8px !important;
}

.apple-form :deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 8px !important;
}

.apple-form :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 8px !important;
}

.field-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.field-checkbox-group :deep(.el-checkbox) {
  margin-right: 0;
}
</style>
