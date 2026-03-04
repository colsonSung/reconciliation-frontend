<template>
  <div class="dashboard">
    <!-- 统计卡片区域 -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="(stat, index) in statsData" :key="index">
        <el-card shadow="never" class="stat-card apple-card">
          <div class="stat-content">
            <div class="stat-icon" :style="{ background: stat.color }">
              <el-icon size="24"><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 内容区域 -->
    <el-row :gutter="20" style="margin-top: 24px">
      <el-col :span="12">
        <el-card shadow="never" class="apple-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">最近对账记录</span>
              <el-button type="primary" link>查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentRecords" height="320" :row-style="{ transition: 'all 0.2s' }">
            <el-table-column prop="date" label="对账日期" width="130" />
            <el-table-column prop="channel" label="通道" />
            <el-table-column prop="totalCount" label="总笔数" width="100" />
            <el-table-column prop="matchCount" label="匹配" width="80" />
            <el-table-column prop="mismatchCount" label="差异" width="80">
              <template #default="{ row }">
                <span :style="{ color: row.mismatchCount > 0 ? '#FF3B30' : '#34C759' }">
                  {{ row.mismatchCount }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '完成' ? 'success' : 'warning'" size="small" round>
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" class="apple-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">通道交易趋势</span>
            </div>
          </template>
          <div class="chart-placeholder">
            <div class="chart-icon">
              <el-icon size="48"><TrendCharts /></el-icon>
            </div>
            <div class="chart-text">图表区域</div>
            <div class="chart-subtext">可集成 ECharts 实现数据可视化</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrendCharts } from '@element-plus/icons-vue'

const statsData = ref([
  { icon: 'Money', value: '¥12,580,000', label: '总交易金额', color: 'linear-gradient(135deg, #0071E3 0%, #00A0E3 100%)' },
  { icon: 'SuccessFilled', value: '15,680', label: '成功笔数', color: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)' },
  { icon: 'WarningFilled', value: '23', label: '差异笔数', color: 'linear-gradient(135deg, #FF9500 0%, #FF9F0A 100%)' },
  { icon: 'Clock', value: '5', label: '待处理', color: 'linear-gradient(135deg, #FF3B30 0%, #FF453A 100%)' }
])

const recentRecords = ref([
  { date: '2026-03-03', channel: '支付宝', totalCount: 5200, matchCount: 5195, mismatchCount: 5, status: '完成' },
  { date: '2026-03-03', channel: '微信支付', totalCount: 4800, matchCount: 4798, mismatchCount: 2, status: '完成' },
  { date: '2026-03-02', channel: '银联', totalCount: 3200, matchCount: 3195, mismatchCount: 5, status: '完成' },
  { date: '2026-03-02', channel: '支付宝', totalCount: 5100, matchCount: 5100, mismatchCount: 0, status: '完成' },
  { date: '2026-03-01', channel: '微信支付', totalCount: 4600, matchCount: 4595, mismatchCount: 5, status: '完成' }
])
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.stat-card {
  border: none;
  border-radius: 18px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: #1D1D1F;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #86868B;
  margin-top: 4px;
  font-weight: 500;
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

.chart-placeholder {
  height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #A1A1A6;
  background: linear-gradient(180deg, #F9F9F9 0%, #F5F5F7 100%);
  border-radius: 12px;
}

.chart-icon {
  opacity: 0.4;
  margin-bottom: 12px;
}

.chart-text {
  font-size: 16px;
  font-weight: 500;
}

.chart-subtext {
  font-size: 13px;
  color: #A1A1A6;
  margin-top: 4px;
}
</style>
