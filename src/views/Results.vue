<template>
  <div class="results">
    <el-card shadow="never" class="apple-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">对账结果</span>
          <div class="header-actions">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              style="width: 260px"
            />
            <el-select v-model="channelFilter" placeholder="选择通道" clearable style="width: 140px; margin-left: 12px">
              <el-option label="全部" value="" />
              <el-option label="支付宝" value="支付宝" />
              <el-option label="微信支付" value="微信支付" />
              <el-option label="银联" value="银联" />
            </el-select>
            <el-button type="primary" style="margin-left: 12px" @click="handleSearch">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
          </div>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="apple-tabs">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="已匹配" name="matched" />
        <el-tab-pane label="差异" name="mismatch" />
        <el-tab-pane label="待处理" name="pending" />
      </el-tabs>

      <el-table :data="tableData" stripe height="480" :header-cell-style="{ background: '#F2F2F7', fontWeight: 600 }">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="orderNo" label="订单号" width="200" />
        <el-table-column prop="channel" label="通道" width="110" />
        <el-table-column prop="amount" label="金额" width="130">
          <template #default="{ row }">
            <span style="font-weight: 600; color: #1D1D1F;">¥{{ row.amount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="channelStatus" label="通道状态" width="100">
          <template #default="{ row }">
            <el-tag size="small" round :type="row.channelStatus === '成功' ? 'success' : 'danger'">
              {{ row.channelStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="systemStatus" label="系统状态" width="100">
          <template #default="{ row }">
            <el-tag size="small" round :type="row.systemStatus === '成功' ? 'success' : 'danger'">
              {{ row.systemStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="result" label="对账结果" width="100">
          <template #default="{ row }">
            <el-tag size="small" round :type="row.result === '匹配' ? 'success' : row.result === '差异' ? 'danger' : 'warning'">
              {{ row.result }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="annotation" label="标注状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.annotation" size="small" type="info" effect="plain">
              <el-icon><Check /></el-icon>
              已标注
            </el-tag>
            <span v-else class="no-annotation">未标注</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="交易时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleDetail(row)">详情</el-button>
            <el-button 
              v-if="row.result === '差异'" 
              type="warning" 
              link 
              @click="handleAnnotate(row)"
            >
              标注
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 24px; justify-content: flex-end"
        background
        />
    </el-card>

    <!-- 订单详情对话框 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="600px" :close-on-click-modal="false">
      <el-descriptions :column="2" border v-if="currentDetail" class="apple-descriptions">
        <el-descriptions-item label="订单号">{{ currentDetail.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="通道">{{ currentDetail.channel }}</el-descriptions-item>
        <el-descriptions-item label="金额">¥{{ currentDetail.amount.toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="交易时间">{{ currentDetail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="通道状态">{{ currentDetail.channelStatus }}</el-descriptions-item>
        <el-descriptions-item label="系统状态">{{ currentDetail.systemStatus }}</el-descriptions-item>
        <el-descriptions-item label="对账结果">{{ currentDetail.result }}</el-descriptions-item>
        <el-descriptions-item label="差异原因" v-if="currentDetail.result === '差异'">{{ currentDetail.reason || '-' }}</el-descriptions-item>
        <el-descriptions-item label="标注状态" v-if="currentDetail.annotation">
          <el-tag size="small" type="info">已标注</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="标注内容" v-if="currentDetail.annotation">
          <span style="color: #0071E3;">{{ currentDetail.annotation }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 标注对话框 -->
    <el-dialog v-model="annotationVisible" title="差异原因标注" width="480px" :close-on-click-modal="false">
      <div class="annotation-form">
        <div class="order-info">
          <span class="label">订单号：</span>
          <span class="value">{{ currentAnnotation?.orderNo }}</span>
        </div>
        <el-form label-width="80px" class="annotation-form-item">
          <el-form-item label="预设原因">
            <el-select v-model="selectedReason" placeholder="请选择预设原因" style="width: 100%" @change="handleReasonChange">
              <el-option
                v-for="reason in presetReasons"
                :key="reason"
                :label="reason"
                :value="reason"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="自定义">
            <el-input
              v-model="customReason"
              type="textarea"
              :rows="3"
              placeholder="输入自定义原因（选填）"
              :disabled="!!selectedReason"
            />
          </el-form-item>
          <el-form-item label="补充说明">
            <el-input
              v-model="annotationNote"
              type="textarea"
              :rows="2"
              placeholder="补充说明（选填）"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="annotationVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAnnotation" :loading="submitting">提交标注</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Check } from '@element-plus/icons-vue'

const dateRange = ref<string[]>([])
const channelFilter = ref('')
const activeTab = ref('all')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(100)
const detailVisible = ref(false)
const annotationVisible = ref(false)
const currentDetail = ref<any>(null)
const currentAnnotation = ref<any>(null)
const selectedReason = ref('')
const customReason = ref('')
const annotationNote = ref('')
const submitting = ref(false)

// 预设原因列表
const presetReasons = [
  '金额不一致',
  '订单号不匹配',
  '交易状态异常',
  '重复交易',
  '通道延迟',
  '系统BUG',
  '风控拦截',
  '退款交易',
  '测试交易',
  '其他'
]

const generateData = () => {
  const statuses = ['成功', '失败']
  const results = ['匹配', '差异', '待处理']
  const annotations = ['', '金额不一致', '通道延迟', '系统BUG', '其他']
  const data = []
  for (let i = 0; i < 50; i++) {
    const result = results[Math.floor(Math.random() * results.length)]
    const hasAnnotation = result === '差异' && Math.random() > 0.5
    data.push({
      orderNo: `ORD${Date.now()}${i}`,
      channel: ['支付宝', '微信支付', '银联'][Math.floor(Math.random() * 3)],
      amount: Math.random() * 10000,
      channelStatus: statuses[Math.floor(Math.random() * 2)],
      systemStatus: result === '匹配' ? '成功' : statuses[Math.floor(Math.random() * 2)],
      result,
      annotation: hasAnnotation ? annotations[Math.floor(Math.random() * annotations.length)] : '',
      createTime: `2026-03-${String(Math.floor(Math.random() * 3) + 1).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`,
      reason: result === '差异' ? '金额不一致' : ''
    })
  }
  return data
}

const tableData = ref(generateData())

const handleSearch = () => {
  console.log('查询条件:', dateRange.value, channelFilter.value)
}

const handleTabChange = (tab: string) => {
  console.log('切换tab:', tab)
}

const handleDetail = (row: any) => {
  currentDetail.value = row
  detailVisible.value = true
}

const handleAnnotate = (row: any) => {
  currentAnnotation.value = row
  selectedReason.value = row.annotation || ''
  customReason.value = ''
  annotationNote.value = ''
  annotationVisible.value = true
}

const handleReasonChange = () => {
  if (selectedReason.value) {
    customReason.value = ''
  }
}

const submitAnnotation = async () => {
  if (!selectedReason.value && !customReason.value) {
    ElMessage.warning('请选择预设原因或输入自定义原因')
    return
  }
  
  submitting.value = true
  try {
    await Promise.resolve({success:true}) // annotationApi.annotate(
        currentAnnotation.value.id,
        selectedReason.value || null,
        (selectedReason.value || customReason.value || "") + (annotationNote.value ? ` (${annotationNote.value})` : "")
      )
    
    const annotationText = selectedReason.value || customReason.value || ''
    const idx = tableData.value.findIndex(x => x.orderNo === currentAnnotation.value?.orderNo)
    if (idx >= 0) {
      tableData.value[idx]!.annotation = annotationText + (annotationNote.value ? ` (${annotationNote.value})` : '')
    }
    
    ElMessage.success('标注成功')
    annotationVisible.value = false
  } catch (e: any) {
    ElMessage.error(e.message || '标注失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.results {
  max-width: 1400px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 17px;
  font-weight: 600;
  color: #1D1D1F;
}

.header-actions {
  display: flex;
  align-items: center;
}

.apple-tabs :deep(.el-tabs__item) {
  font-weight: 500;
}

.no-annotation {
  color: #A1A1A6;
  font-size: 12px;
}

.annotation-form {
  padding: 8px 0;
}

.order-info {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #F2F2F7;
  border-radius: 8px;
  margin-bottom: 16px;
}

.order-info .label {
  color: #86868B;
  font-size: 14px;
}

.order-info .value {
  color: #1D1D1F;
  font-weight: 600;
  font-size: 14px;
}

.annotation-form-item :deep(.el-textarea.is-disabled) {
  background-color: #F5F5F7;
}
</style>
