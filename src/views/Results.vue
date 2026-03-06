<template>
  <div class="results">
    <!-- 搜索筛选区域 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-left">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            class="date-picker"
            prefix-icon="Calendar"
          />
          <el-select v-model="channelFilter" placeholder="选择通道" clearable class="channel-select">
            <el-option label="全部" value="" />
            <el-option label="支付宝" value="支付宝">
              <div class="channel-option">
                <span class="channel-dot alipay"></span>
                支付宝
              </div>
            </el-option>
            <el-option label="微信支付" value="微信支付">
              <div class="channel-option">
                <span class="channel-dot wechat"></span>
                微信支付
              </div>
            </el-option>
            <el-option label="银联" value="银联">
              <div class="channel-option">
                <span class="channel-dot unionpay"></span>
                银联
              </div>
            </el-option>
          </el-select>
          <el-button type="primary" @click="handleSearch" class="search-btn">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
        </div>
        <div class="filter-right">
          <el-button class="export-btn">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </div>
      </div>
    </div>

    <!-- 标签页 -->
    <div class="tabs-section">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="finance-tabs">
        <el-tab-pane name="all">
          <template #label>
            <span class="tab-label">全部</span>
            <span class="tab-count">128</span>
          </template>
        </el-tab-pane>
        <el-tab-pane name="matched">
          <template #label>
            <span class="tab-label">已匹配</span>
            <span class="tab-count success">105</span>
          </template>
        </el-tab-pane>
        <el-tab-pane name="mismatch">
          <template #label>
            <span class="tab-label">差异</span>
            <span class="tab-count danger">23</span>
          </template>
        </el-tab-pane>
        <el-tab-pane name="pending">
          <template #label>
            <span class="tab-label">待处理</span>
            <span class="tab-count warning">5</span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <el-table :data="tableData" stripe height="520" class="results-table" :header-cell-style="headerCellStyle">
        <el-table-column type="index" label="序号" width="70">
          <template #header>
            <span class="序号">序号</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderNo" label="订单号" min-width="200">
          <template #default="{ row }">
            <div class="order-cell">
              <span class="order-no">{{ row.orderNo }}</span>
              <el-icon class="copy-icon" :size="14"><CopyDocument /></el-icon>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="channel" label="通道" width="120">
          <template #default="{ row }">
            <div class="channel-badge" :class="getChannelClass(row.channel)">
              {{ row.channel }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="140" align="right">
          <template #default="{ row }">
            <span class="amount-cell numeric">¥{{ row.amount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="channelStatus" label="通道状态" width="110">
          <template #default="{ row }">
            <div class="status-badge" :class="row.channelStatus === '成功' ? 'success' : 'failed'">
              <span class="status-dot"></span>
              {{ row.channelStatus }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="systemStatus" label="系统状态" width="110">
          <template #default="{ row }">
            <div class="status-badge" :class="row.systemStatus === '成功' ? 'success' : 'failed'">
              <span class="status-dot"></span>
              {{ row.systemStatus }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="result" label="对账结果" width="110">
          <template #default="{ row }">
            <div class="result-badge" :class="row.result">
              <el-icon v-if="row.result === '匹配'"><CircleCheck /></el-icon>
              <el-icon v-else-if="row.result === '差异'"><Warning /></el-icon>
              <el-icon v-else><Clock /></el-icon>
              {{ row.result }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="annotation" label="标注状态" width="110">
          <template #default="{ row }">
            <div v-if="row.annotation" class="annotation-badge">
              <el-icon><EditPen /></el-icon>
              已标注
            </div>
            <span v-else class="no-annotation">未标注</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="交易时间" width="180" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button type="primary" link @click="handleDetail(row)">详情</el-button>
              <el-button 
                v-if="row.result === '差异'" 
                type="warning" 
                link 
                @click="handleAnnotate(row)"
              >
                标注
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <div class="page-info">
          共 <span class="highlight">{{ total }}</span> 条记录
        </div>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </div>

    <!-- 订单详情对话框 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="640px" :close-on-click-modal="false" class="detail-dialog">
      <div class="detail-header" v-if="currentDetail">
        <div class="detail-order">{{ currentDetail.orderNo }}</div>
        <div class="detail-amount numeric">¥{{ currentDetail.amount.toFixed(2) }}</div>
      </div>
      <el-descriptions :column="2" border v-if="currentDetail" class="detail-descriptions">
        <el-descriptions-item label="订单号">{{ currentDetail.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="通道">
          <div class="channel-badge" :class="getChannelClass(currentDetail.channel)">
            {{ currentDetail.channel }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="金额" content-class="numeric">¥{{ currentDetail.amount.toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="交易时间">{{ currentDetail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="通道状态">
          <div class="status-badge" :class="currentDetail.channelStatus === '成功' ? 'success' : 'failed'">
            {{ currentDetail.channelStatus }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="系统状态">
          <div class="status-badge" :class="currentDetail.systemStatus === '成功' ? 'success' : 'failed'">
            {{ currentDetail.systemStatus }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="对账结果">
          <div class="result-badge" :class="currentDetail.result">
            {{ currentDetail.result }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="差异原因" v-if="currentDetail.result === '差异'">
          {{ currentDetail.reason || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="标注状态" v-if="currentDetail.annotation" :span="2">
          <div class="annotation-badge">
            <el-icon><EditPen /></el-icon>
            {{ currentDetail.annotation }}
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 标注对话框 -->
    <el-dialog v-model="annotationVisible" title="差异原因标注" width="520px" :close-on-click-modal="false" class="annotation-dialog">
      <div class="annotation-header">
        <span class="annotation-order">{{ currentAnnotation?.orderNo }}</span>
        <span class="annotation-amount numeric">¥{{ currentAnnotation?.amount?.toFixed(2) }}</span>
      </div>
      <el-form label-width="80px" class="annotation-form">
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
import { Search, Download, CopyDocument, CircleCheck, Warning, Clock, EditPen } from '@element-plus/icons-vue'

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

const headerCellStyle = {
  background: '#F7F9FC',
  fontWeight: '600',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: '#697386'
}

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

const getChannelClass = (channel: string) => {
  const map: Record<string, string> = {
    '支付宝': 'alipay',
    '微信支付': 'wechat',
    '银联': 'unionpay'
  }
  return map[channel] || ''
}

const generateData = () => {
  const statuses = ['成功', '失败']
  const results = ['匹配', '差异', '待处理']
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
      annotation: hasAnnotation ? '金额不一致' : '',
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
    await new Promise(resolve => setTimeout(resolve, 500))
    
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
  max-width: 1600px;
  margin: 0 auto;
}

/* 筛选区域 */
.filter-section {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-picker {
  width: 280px;
}

.channel-select {
  width: 160px;
}

.channel-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.channel-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.channel-dot.alipay { background: #1677FF; }
.channel-dot.wechat { background: #07C160; }
.channel-dot.unionpay { background: #FF6B35; }

.search-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 标签页 */
.tabs-section {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 0 24px;
  margin-bottom: 20px;
}

.finance-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
}

.finance-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.tab-label {
  font-weight: 600;
  margin-right: 8px;
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.tab-count.success {
  background: rgba(50, 213, 131, 0.12);
  color: #0D9668;
}

.tab-count.danger {
  background: rgba(246, 103, 7, 0.12);
  color: #D95004;
}

.tab-count.warning {
  background: rgba(255, 171, 0, 0.12);
  color: #CC8800;
}

/* 表格区域 */
.table-section {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 24px;
}

.results-table :deep(th.el-table__cell) {
  background: #F7F9FC !important;
}

.order-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.order-no {
  font-family: 'DM Mono', monospace;
  font-weight: 600;
  color: var(--text-primary);
}

.copy-icon {
  color: var(--text-tertiary);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.order-cell:hover .copy-icon {
  opacity: 1;
}

.channel-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.channel-badge.alipay {
  background: rgba(22, 119, 255, 0.1);
  color: #1677FF;
}

.channel-badge.wechat {
  background: rgba(7, 193, 96, 0.1);
  color: #07C160;
}

.channel-badge.unionpay {
  background: rgba(255, 107, 53, 0.1);
  color: #FF6B35;
}

.amount-cell {
  font-weight: 700;
  color: var(--text-primary);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-badge.success {
  color: #0D9668;
}

.status-badge.success .status-dot {
  background: #32D583;
}

.status-badge.failed {
  color: #D95004;
}

.status-badge.failed .status-dot {
  background: #F76707;
}

.result-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.result-badge.匹配 {
  background: rgba(50, 213, 131, 0.1);
  color: #0D9668;
}

.result-badge.差异 {
  background: rgba(246, 103, 7, 0.1);
  color: #D95004;
}

.result-badge.待处理 {
  background: rgba(255, 171, 0, 0.1);
  color: #CC8800;
}

.annotation-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(99, 91, 255, 0.1);
  color: #635BFF;
}

.no-annotation {
  color: var(--text-tertiary);
  font-size: 12px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.page-info {
  font-size: 14px;
  color: var(--text-secondary);
}

.page-info .highlight {
  color: var(--text-primary);
  font-weight: 600;
}

/* 详情对话框 */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #635BFF 0%, #8B83FF 100%);
  border-radius: 12px;
  margin-bottom: 20px;
  color: #fff;
}

.detail-order {
  font-family: 'DM Mono', monospace;
  font-weight: 600;
  font-size: 15px;
}

.detail-amount {
  font-size: 24px;
  font-weight: 700;
}

.detail-descriptions :deep(.el-descriptions__label) {
  background: #F7F9FC;
  font-weight: 600;
}

/* 标注对话框 */
.annotation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--bg-tertiary);
  border-radius: 10px;
  margin-bottom: 20px;
}

.annotation-order {
  font-family: 'DM Mono', monospace;
  font-weight: 600;
}

.annotation-amount {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}
</style>
