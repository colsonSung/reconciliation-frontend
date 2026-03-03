<template>
  <LayoutWrapper>
    <div class="dashboard">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-card">
              <div class="stat-icon" style="background: #409eff">
                <el-icon size="30"><Money /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalAmount }}</div>
                <div class="stat-label">总交易金额</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-card">
              <div class="stat-icon" style="background: #67c23a">
                <el-icon size="30"><SuccessFilled /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.successCount }}</div>
                <div class="stat-label">成功笔数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-card">
              <div class="stat-icon" style="background: #f56c6c">
                <el-icon size="30"><WarningFilled /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.mismatchCount }}</div>
                <div class="stat-label">差异笔数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-card">
              <div class="stat-icon" style="background: #e6a23c">
                <el-icon size="30"><Clock /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.pendingCount }}</div>
                <div class="stat-label">待处理</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>最近对账记录</span>
            </template>
            <el-table :data="recentRecords" height="300">
              <el-table-column prop="date" label="对账日期" width="120" />
              <el-table-column prop="channel" label="通道" />
              <el-table-column prop="totalCount" label="总笔数" width="100" />
              <el-table-column prop="matchCount" label="匹配" width="80" />
              <el-table-column prop="mismatchCount" label="差异" width="80" />
              <el-table-column prop="status" label="状态" width="80">
                <template #default="{ row }">
                  <el-tag :type="row.status === '完成' ? 'success' : 'warning'">
                    {{ row.status }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>通道交易趋势</span>
            </template>
            <div style="height: 300px; display: flex; align-items: center; justify-content: center; color: #999;">
              图表区域 (可集成 ECharts)
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </LayoutWrapper>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Money, SuccessFilled, WarningFilled, Clock } from '@element-plus/icons-vue'
import LayoutWrapper from '../components/LayoutWrapper.vue'

const stats = ref({
  totalAmount: '¥12,580,000',
  successCount: 15680,
  mismatchCount: 23,
  pendingCount: 5
})

const recentRecords = ref([
  { date: '2026-03-03', channel: '支付宝', totalCount: 5200, matchCount: 5195, mismatchCount: 5, status: '完成' },
  { date: '2026-03-03', channel: '微信支付', totalCount: 4800, matchCount: 4798, mismatchCount: 2, status: '完成' },
  { date: '2026-03-02', channel: '银联', totalCount: 3200, matchCount: 3195, mismatchCount: 5, status: '完成' },
  { date: '2026-03-02', channel: '支付宝', totalCount: 5100, matchCount: 5100, mismatchCount: 0, status: '完成' },
  { date: '2026-03-01', channel: '微信支付', totalCount: 4600, matchCount: 4595, mismatchCount: 5, status: '完成' }
])
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  gap: 15px;
}
.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}
.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 5px;
}
</style>
