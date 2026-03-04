<template>
  <el-container class="layout-container">
    <el-aside width="240px" class="sidebar">
      <div class="logo">
        <div class="logo-icon">💰</div>
        <span>财务对账</span>
      </div>
      <el-menu
        :default-active="$route.path"
        router
        class="sidebar-menu"
      >
        <el-menu-item index="/">
          <el-icon><Odometer /></el-icon>
          <span>对账看板</span>
        </el-menu-item>
        <el-menu-item index="/channels">
          <el-icon><Connection /></el-icon>
          <span>通道管理</span>
        </el-menu-item>
        <el-menu-item index="/task-schedule">
          <el-icon><Clock /></el-icon>
          <span>任务调度</span>
        </el-menu-item>
        <el-menu-item index="/report-config">
          <el-icon><Folder /></el-icon>
          <span>报告配置</span>
        </el-menu-item>
        <el-menu-item index="/settlement">
          <el-icon><Wallet /></el-icon>
          <span>结算管理</span>
        </el-menu-item>
        <el-menu-item index="/results">
          <el-icon><Document /></el-icon>
          <span>对账结果</span>
        </el-menu-item>
        <el-menu-item index="/templates">
          <el-icon><Tickets /></el-icon>
          <span>结果模板</span>
        </el-menu-item>
        <el-menu-item index="/export">
          <el-icon><Download /></el-icon>
          <span>Excel导出</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-title">{{ pageTitle }}</div>
        <div class="header-user">
          <div class="user-avatar">{{ username.charAt(0).toUpperCase() }}</div>
          <span class="user-name">{{ username }}</span>
          <el-button type="primary" size="small" @click="handleLogout">退出</el-button>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Odometer, Connection, Clock, Wallet, Document, Download, Folder, Tickets } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const username = computed(() => localStorage.getItem('username') || 'Admin')

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/': '对账看板',
    '/channels': '通道管理',
    '/task-schedule': '任务调度',
    '/report-config': '报告配置',
    '/settlement': '结算管理',
    '/results': '对账结果',
    '/templates': '结果模板',
    '/export': 'Excel导出'
  }
  return titles[route.path] || '财务对账系统'
})

const handleLogout = () => {
  localStorage.clear()
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background: #FFFFFF;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(135deg, #0071E3 0%, #00A0E3 100%);
  color: #fff;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.5px;
}

.logo-icon {
  font-size: 22px;
}

.sidebar-menu {
  border-right: none;
  background: transparent;
  padding: 12px 8px;
}

.sidebar-menu .el-menu-item {
  height: 44px;
  line-height: 44px;
  border-radius: 10px;
  margin-bottom: 4px;
  color: #5E5E66;
  font-weight: 500;
  transition: all 0.2s ease;
}

.sidebar-menu .el-menu-item:hover {
  background: #F2F2F7;
  color: #1D1D1F;
}

.sidebar-menu .el-menu-item.is-active {
  background: linear-gradient(135deg, #0071E3 0%, #00A0E3 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.3);
}

.sidebar-menu .el-menu-item .el-icon {
  font-size: 18px;
}

.header {
  background: #FFFFFF;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 28px;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #1D1D1F;
  letter-spacing: -0.5px;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #34C759 0%, #30D158 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.user-name {
  font-weight: 500;
  color: #5E5E66;
}

.main-content {
  background: #F5F5F7;
  padding: 24px;
}
</style>
