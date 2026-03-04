<template>
  <div class="settlement">
    <el-card shadow="never" class="apple-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">结算管理</span>
          <el-button type="primary" @click="handleRequestPayment">
            <el-icon><Plus /></el-icon>
            手动请款
          </el-button>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" class="apple-tabs">
        <el-tab-pane label="待结算" name="pending">
          <el-table :data="pendingList" stripe :header-cell-style="{ background: '#F2F2F7', fontWeight: 600 }">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="channelName" label="通道" />
            <el-table-column prop="amount" label="待结算金额" width="160">
              <template #default="{ row }">
                <span style="color: #FF9500; font-weight: 600; font-size: 15px;">¥{{ row.amount.toLocaleString() }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="fee" label="手续费" width="130">
              <template #default="{ row }">
                <span style="color: #86868B;">¥{{ row.fee.toLocaleString() }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="actualAmount" label="实际到账" width="160">
              <template #default="{ row }">
                <span style="color: #34C759; font-weight: 600; font-size: 15px;">¥{{ row.actualAmount.toLocaleString() }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="生成时间" width="180" />
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="handleSettle(row)">确认结算</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="结算记录" name="records">
          <el-table :data="settlementRecords" stripe :header-cell-style="{ background: '#F2F2F7', fontWeight: 600 }">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="channelName" label="通道" />
            <el-table-column prop="amount" label="结算金额" width="160">
              <template #default="{ row }">
                <span style="font-weight: 600;">¥{{ row.amount.toLocaleString() }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="fee" label="手续费" width="130">
              <template #default="{ row }">
                <span style="color: #86868B;">¥{{ row.fee.toLocaleString() }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="actualAmount" label="实际到账" width="160">
              <template #default="{ row }">
                <span style="color: #34C759; font-weight: 600;">¥{{ row.actualAmount.toLocaleString() }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="settleTime" label="结算时间" width="180" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag size="small" round :type="row.status === '成功' ? 'success' : 'info'">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="requestDialogVisible" title="手动请款" width="500px" :close-on-click-modal="false">
      <el-form :model="requestForm" label-width="100px" class="apple-form">
        <el-form-item label="选择通道">
          <el-select v-model="requestForm.channelId" placeholder="请选择通道" style="width: 100%">
            <el-option label="支付宝" :value="1" />
            <el-option label="微信支付" :value="2" />
            <el-option label="银联" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="请款金额">
          <el-input-number v-model="requestForm.amount" :min="0" :step="1000" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="requestForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="requestDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRequest">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="settleDialogVisible" title="确认结算" width="420px" :close-on-click-modal="false">
      <div class="settle-confirm">
        <div class="settle-item">
          <span class="settle-label">通道</span>
          <span class="settle-value">{{ currentSettle?.channelName }}</span>
        </div>
        <div class="settle-item">
          <span class="settle-label">结算金额</span>
          <span class="settle-value highlight-orange">¥{{ currentSettle?.amount.toLocaleString() }}</span>
        </div>
        <div class="settle-item">
          <span class="settle-label">手续费</span>
          <span class="settle-value">¥{{ currentSettle?.fee.toLocaleString() }}</span>
        </div>
        <div class="settle-item">
          <span class="settle-label">实际到账</span>
          <span class="settle-value highlight-green">¥{{ currentSettle?.actualAmount.toLocaleString() }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="settleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSettle">确认结算</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

interface PendingItem {
  id: number
  channelName: string
  amount: number
  fee: number
  actualAmount: number
  createTime: string
}

interface SettlementRecord {
  id: number
  channelName: string
  amount: number
  fee: number
  actualAmount: number
  settleTime: string
  status: string
  remark: string
}

const activeTab = ref('pending')

const pendingList = ref<PendingItem[]>([
  { id: 1, channelName: '支付宝', amount: 158000, fee: 1580, actualAmount: 156420, createTime: '2026-03-03 23:59:00' },
  { id: 2, channelName: '微信支付', amount: 85600, fee: 856, actualAmount: 84744, createTime: '2026-03-03 23:59:00' },
  { id: 3, channelName: '银联', amount: 235000, fee: 1175, actualAmount: 233825, createTime: '2026-03-03 23:59:00' }
])

const settlementRecords = ref<SettlementRecord[]>([
  { id: 1, channelName: '支付宝', amount: 150000, fee: 1500, actualAmount: 148500, settleTime: '2026-03-02 02:30:00', status: '成功', remark: '日结' },
  { id: 2, channelName: '微信支付', amount: 78000, fee: 780, actualAmount: 77220, settleTime: '2026-03-02 02:30:00', status: '成功', remark: '日结' },
  { id: 3, channelName: '银联', amount: 210000, fee: 1050, actualAmount: 208950, settleTime: '2026-03-02 02:30:00', status: '成功', remark: '日结' },
  { id: 4, channelName: '支付宝', amount: 520000, fee: 5200, actualAmount: 514800, settleTime: '2026-02-28 03:00:00', status: '成功', remark: '周结' }
])

const requestDialogVisible = ref(false)
const settleDialogVisible = ref(false)
const currentSettle = ref<PendingItem | null>(null)

const requestForm = reactive({
  channelId: 0,
  amount: 0,
  remark: ''
})

const handleRequestPayment = () => {
  requestForm.channelId = 0
  requestForm.amount = 0
  requestForm.remark = ''
  requestDialogVisible.value = true
}

const submitRequest = () => {
  if (!requestForm.channelId || !requestForm.amount) {
    ElMessage.warning('请选择通道并输入金额')
    return
  }
  ElMessage.success('请款申请已提交')
  requestDialogVisible.value = false
}

const handleSettle = (row: PendingItem) => {
  currentSettle.value = row
  settleDialogVisible.value = true
}

const confirmSettle = () => {
  if (currentSettle.value) {
    const record: SettlementRecord = {
      id: currentSettle.value.id,
      channelName: currentSettle.value.channelName,
      amount: currentSettle.value.amount,
      fee: currentSettle.value.fee,
      actualAmount: currentSettle.value.actualAmount,
      settleTime: new Date().toLocaleString(),
      status: '成功',
      remark: '手动结算'
    }
    settlementRecords.value.unshift(record)
    pendingList.value = pendingList.value.filter(item => item.id !== currentSettle.value!.id)
    ElMessage.success('结算成功')
  }
  settleDialogVisible.value = false
}
</script>

<style scoped>
.settlement {
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

.apple-tabs :deep(.el-tabs__item) {
  font-weight: 500;
}

.settle-confirm {
  padding: 8px 0;
}

.settle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #E5E5EA;
}

.settle-item:last-child {
  border-bottom: none;
}

.settle-label {
  color: #86868B;
  font-size: 14px;
}

.settle-value {
  font-weight: 600;
  font-size: 15px;
  color: #1D1D1F;
}

.settle-value.highlight-orange {
  color: #FF9500;
  font-size: 18px;
}

.settle-value.highlight-green {
  color: #34C759;
  font-size: 18px;
}

.apple-form :deep(.el-input-number) {
  width: 100%;
}
</style>
