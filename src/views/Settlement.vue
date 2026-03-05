<template>
  <div class="settlement">
    <el-card shadow="never" class="apple-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">结算管理</span>
          <el-button type="primary" @click="handleRequestPayment">
            <el-icon><Plus /></el-icon>
            发起请款
          </el-button>
        </div>
      </template>
      
      <!-- 流程状态展示 -->
      <div class="workflow-status">
        <div class="status-steps">
          <div 
            v-for="(step, index) in workflowSteps" 
            :key="step.key"
            class="status-step"
            :class="{ active: currentStep === index, completed: currentStep > index }"
          >
            <div class="step-icon">
              <el-icon v-if="currentStep > index"><Check /></el-icon>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="step-info">
              <div class="step-title">{{ step.title }}</div>
              <div class="step-desc">{{ step.desc }}</div>
            </div>
            <div v-if="index < workflowSteps.length - 1" class="step-line"></div>
          </div>
        </div>
      </div>
      
      <el-tabs v-model="activeTab" class="apple-tabs">
        <el-tab-pane label="待申请" name="pending">
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
                <el-button type="primary" @click="handleApply(row)">申请结算</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="待审批" name="approving">
          <el-table :data="approvingList" stripe :header-cell-style="{ background: '#F2F2F7', fontWeight: 600 }">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="channelName" label="通道" />
            <el-table-column prop="amount" label="申请金额" width="160">
              <template #default="{ row }">
                <span style="font-weight: 600;">¥{{ row.amount.toLocaleString() }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="applyTime" label="申请时间" width="180" />
            <el-table-column prop="applicant" label="申请人" width="120" />
            <el-table-column prop="status" label="状态" width="120">
              <template #default="{ row }">
                <el-tag size="small" round type="warning">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="success" size="small" @click="handleApprove(row)">审批通过</el-button>
                <el-button type="danger" size="small" @click="handleReject(row)">拒绝</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="待确认" name="confirmed">
          <el-table :data="confirmedList" stripe :header-cell-style="{ background: '#F2F2F7', fontWeight: 600 }">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="channelName" label="通道" />
            <el-table-column prop="amount" label="结算金额" width="160">
              <template #default="{ row }">
                <span style="font-weight: 600;">¥{{ row.amount.toLocaleString() }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="approveTime" label="审批时间" width="180" />
            <el-table-column prop="approver" label="审批人" width="120" />
            <el-table-column prop="status" label="状态" width="120">
              <template #default="{ row }">
                <el-tag size="small" round type="primary">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" @click="handleConfirm(row)">确认结算</el-button>
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
                <el-tag size="small" round :type="row.status === '已结算' ? 'success' : 'info'">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 发起请款对话框 -->
    <el-dialog v-model="requestDialogVisible" title="发起请款" width="500px" :close-on-click-modal="false">
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
        <el-form-item label="结算方式">
          <el-radio-group v-model="requestForm.settleType">
            <el-radio value="auto">自动结算</el-radio>
            <el-radio value="manual">手动结算</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="requestForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="requestDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRequest">提交申请</el-button>
      </template>
    </el-dialog>

    <!-- 审批对话框 -->
    <el-dialog v-model="approveDialogVisible" title="审批确认" width="420px" :close-on-click-modal="false">
      <div class="approve-confirm">
        <div class="confirm-item">
          <span class="confirm-label">通道</span>
          <span class="confirm-value">{{ currentApprove?.channelName }}</span>
        </div>
        <div class="confirm-item">
          <span class="confirm-label">申请金额</span>
          <span class="confirm-value highlight">¥{{ currentApprove?.amount.toLocaleString() }}</span>
        </div>
        <div class="confirm-item">
          <span class="confirm-label">手续费</span>
          <span class="confirm-value">¥{{ currentApprove?.fee.toLocaleString() }}</span>
        </div>
        <div class="confirm-item">
          <span class="confirm-label">实际到账</span>
          <span class="confirm-value highlight-green">¥{{ currentApprove?.actualAmount.toLocaleString() }}</span>
        </div>
        <el-form-item label="审批备注" style="margin-top: 16px">
          <el-input v-model="approveRemark" type="textarea" :rows="2" placeholder="审批备注（选填）" />
        </el-form-item>
      </div>
      <template #footer>
        <el-button @click="approveDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="rejectRequest">拒绝</el-button>
        <el-button type="primary" @click="confirmApprove">审批通过</el-button>
      </template>
    </el-dialog>

    <!-- 确认结算对话框 -->
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Check } from '@element-plus/icons-vue'

// 工作流步骤
const workflowSteps = [
  { key: 'pending', title: '待申请', desc: '等待发起请款' },
  { key: 'applied', title: '已申请', desc: '等待财务审批' },
  { key: 'approving', title: '审批中', desc: '等待管理层审批' },
  { key: 'approved', title: '已审批', desc: '等待确认结算' },
  { key: 'settled', title: '已结算', desc: '结算完成' }
]

const currentStep = ref(1) // 当前流程进度
const activeTab = ref('pending')

// 待申请列表
interface PendingItem {
  id: number
  channelName: string
  amount: number
  fee: number
  actualAmount: number
  createTime: string
}

interface ApplyingItem extends PendingItem {
  applyTime: string
  applicant: string
  status: string
}

interface ConfirmedItem extends PendingItem {
  approveTime: string
  approver: string
  status: string
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

const pendingList = ref<PendingItem[]>([
  { id: 1, channelName: '支付宝', amount: 158000, fee: 1580, actualAmount: 156420, createTime: '2026-03-03 23:59:00' },
  { id: 2, channelName: '微信支付', amount: 85600, fee: 856, actualAmount: 84744, createTime: '2026-03-03 23:59:00' }
])

const approvingList = ref<ApplyingItem[]>([
  { id: 3, channelName: '银联', amount: 235000, fee: 1175, actualAmount: 233825, applyTime: '2026-03-04 09:30:00', applicant: '张三', status: '审批中', createTime: '' },
  { id: 4, channelName: '支付宝', amount: 52000, fee: 520, actualAmount: 51480, applyTime: '2026-03-04 10:15:00', applicant: '李四', status: '审批中', createTime: '' }
])

const confirmedList = ref<ConfirmedItem[]>([
  { id: 5, channelName: '微信支付', amount: 120000, fee: 1200, actualAmount: 118800, approveTime: '2026-03-04 11:00:00', approver: '王五', status: '待确认', createTime: '' }
])

const settlementRecords = ref<SettlementRecord[]>([
  { id: 1, channelName: '支付宝', amount: 150000, fee: 1500, actualAmount: 148500, settleTime: '2026-03-02 02:30:00', status: '已结算', remark: '日结' },
  { id: 2, channelName: '微信支付', amount: 78000, fee: 780, actualAmount: 77220, settleTime: '2026-03-02 02:30:00', status: '已结算', remark: '日结' }
])

// Dialog states
const requestDialogVisible = ref(false)
const approveDialogVisible = ref(false)
const settleDialogVisible = ref(false)
const currentApprove = ref<ApplyingItem | null>(null)
const currentSettle = ref<ConfirmedItem | null>(null)
const approveRemark = ref('')

const requestForm = reactive({
  channelId: 0,
  amount: 0,
  settleType: 'auto',
  remark: ''
})

// 发起请款
const handleRequestPayment = () => {
  requestForm.channelId = 0
  requestForm.amount = 0
  requestForm.settleType = 'auto'
  requestForm.remark = ''
  requestDialogVisible.value = true
}

const submitRequest = async () => {
  if (!requestForm.channelId || !requestForm.amount) {
    ElMessage.warning('请选择通道并输入金额')
    return
  }
  
  const channelNames = ['', '支付宝', '微信支付', '银联']
  const newItem: ApplyingItem = {
    id: Date.now(),
    channelName: channelNames[requestForm.channelId] || '未知通道',
    amount: requestForm.amount,
    fee: Math.round(requestForm.amount * 0.01),
    actualAmount: requestForm.amount - Math.round(requestForm.amount * 0.01),
    applyTime: new Date().toLocaleString(),
    applicant: '当前用户',
    status: '审批中',
    createTime: ''
  }
  
  approvingList.value.unshift(newItem)
  
  // 更新流程状态
  pendingList.value = pendingList.value.filter(item => item.channelName !== newItem.channelName)
  currentStep.value = 2
  
  ElMessage.success('请款申请已提交')
  requestDialogVisible.value = false
}

// 申请结算
const handleApply = (row: PendingItem) => {
  ElMessageBox.confirm(
    `确认发起 ${row.channelName} 的结算申请？`,
    '确认申请',
    { type: 'info' }
  ).then(async () => {
    const newItem: ApplyingItem = {
      ...row,
      applyTime: new Date().toLocaleString(),
      applicant: '当前用户',
      status: '审批中'
    }
    
    approvingList.value.unshift(newItem)
    pendingList.value = pendingList.value.filter(item => item.id !== row.id)
    currentStep.value = 2
    
    ElMessage.success('申请已提交')
  }).catch(() => {})
}

// 审批
const handleApprove = (row: ApplyingItem) => {
  currentApprove.value = row
  approveRemark.value = ''
  approveDialogVisible.value = true
}

const confirmApprove = () => {
  if (currentApprove.value) {
    const confirmed: ConfirmedItem = {
      ...currentApprove.value,
      approveTime: new Date().toLocaleString(),
      approver: '审批人',
      status: '待确认',
      createTime: ''
    }
    
    confirmedList.value.unshift(confirmed)
    approvingList.value = approvingList.value.filter(item => item.id !== currentApprove.value!.id)
    currentStep.value = 3
    
    ElMessage.success('审批通过')
  }
  approveDialogVisible.value = false
}

const handleReject = (row: ApplyingItem) => {
  ElMessageBox.confirm(
    `确认拒绝 ${row.channelName} 的结算申请？`,
    '确认拒绝',
    { type: 'warning' }
  ).then(async () => {
    // 拒绝后移回待申请
    const pending: PendingItem = {
      id: row.id,
      channelName: row.channelName,
      amount: row.amount,
      fee: row.fee,
      actualAmount: row.actualAmount,
      createTime: new Date().toLocaleString()
    }
    
    pendingList.value.unshift(pending)
    approvingList.value = approvingList.value.filter(item => item.id !== row.id)
    currentStep.value = 1
    
    ElMessage.success('已拒绝申请')
  }).catch(() => {})
}

const rejectRequest = () => {
  if (currentApprove.value) {
    const pending: PendingItem = {
      id: currentApprove.value.id,
      channelName: currentApprove.value.channelName,
      amount: currentApprove.value.amount,
      fee: currentApprove.value.fee,
      actualAmount: currentApprove.value.actualAmount,
      createTime: new Date().toLocaleString()
    }
    
    pendingList.value.unshift(pending)
    approvingList.value = approvingList.value.filter(item => item.id !== currentApprove.value!.id)
    currentStep.value = 1
    
    ElMessage.success('已拒绝')
  }
  approveDialogVisible.value = false
}

// 确认结算
const handleConfirm = (row: ConfirmedItem) => {
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
      status: '已结算',
      remark: '结算完成'
    }
    
    settlementRecords.value.unshift(record)
    confirmedList.value = confirmedList.value.filter(item => item.id !== currentSettle.value!.id)
    currentStep.value = 4
    
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

/* 工作流状态 */
.workflow-status {
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(180deg, #F9F9F9 0%, #F5F5F7 100%);
  border-radius: 12px;
}

.status-steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.status-step {
  display: flex;
  align-items: center;
  flex: 1;
  position: relative;
}

.step-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #E5E5EA;
  color: #86868B;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
  transition: all 0.3s;
}

.status-step.active .step-icon {
  background: linear-gradient(135deg, #0071E3 0%, #00A0E3 100%);
  color: #fff;
}

.status-step.completed .step-icon {
  background: #34C759;
  color: #fff;
}

.step-info {
  margin-left: 12px;
}

.step-title {
  font-size: 14px;
  font-weight: 600;
  color: #1D1D1F;
}

.step-desc {
  font-size: 12px;
  color: #86868B;
  margin-top: 2px;
}

.step-line {
  position: absolute;
  left: 36px;
  right: 0;
  top: 18px;
  height: 2px;
  background: #E5E5EA;
}

.status-step.completed .step-line {
  background: #34C759;
}

/* 确认对话框 */
.approve-confirm, .settle-confirm {
  padding: 8px 0;
}

.confirm-item, .settle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #E5E5EA;
}

.confirm-item:last-child, .settle-item:last-child {
  border-bottom: none;
}

.confirm-label, .settle-label {
  color: #86868B;
  font-size: 14px;
}

.confirm-value, .settle-value {
  font-weight: 600;
  font-size: 15px;
  color: #1D1D1F;
}

.confirm-value.highlight, .settle-value.highlight-orange {
  color: #FF9500;
  font-size: 18px;
}

.confirm-value.highlight-green, .settle-value.highlight-green {
  color: #34C759;
  font-size: 18px;
}

.apple-form :deep(.el-input-number) {
  width: 100%;
}
</style>
