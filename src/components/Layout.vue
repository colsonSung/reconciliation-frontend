<template>
  <el-container class="layout-container">
    <!-- 深色专业侧边栏 -->
    <el-aside width="260px" class="sidebar">
      <div class="logo-section">
        <div class="logo">
          <div class="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" stroke-width="2"/>
              <path d="M2 10H22" stroke="currentColor" stroke-width="2"/>
              <path d="M6 14H10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <span class="logo-text">财务对账</span>
        </div>
        <div class="logo-subtitle">Reconciliation Pro</div>
      </div>
      
      <el-menu
        :default-active="$route.path"
        router
        class="sidebar-menu"
        :background-color="'transparent'"
        :text-color="'#889096'"
        :active-text-color="'#FFFFFF'"
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
      
      <!-- 底部信息 -->
      <div class="sidebar-footer">
        <div class="version-info">
          <span class="version-label">版本</span>
          <span class="version-number">v1.0.0</span>
        </div>
      </div>
    </el-aside>
    
    <el-container>
      <!-- 头部 -->
      <el-header class="header">
        <div class="header-left">
          <h1 class="page-title">{{ pageTitle }}</h1>
          <div class="breadcrumb">
            <span class="breadcrumb-item">首页</span>
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-item active">{{ pageTitle }}</span>
          </div>
        </div>
        <div class="header-right">
          <!-- 快捷操作 -->
          <el-button type="primary" size="small" class="quick-action">
            <el-icon><Plus /></el-icon>
            新建对账
          </el-button>
          
          <!-- 通知 -->
          <el-badge :value="3" :max="99" class="notification-badge">
            <el-button :icon="Bell" circle size="small" class="icon-btn" />
          </el-badge>
          
          <!-- 用户信息 -->
          <div class="user-section">
            <div class="user-avatar">
              {{ username.charAt(0).toUpperCase() }}
            </div>
            <div class="user-info">
              <span class="user-name">{{ username }}</span>
              <span class="user-role">管理员</span>
            </div>
            <el-dropdown trigger="click">
              <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>个人设置</el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>
      
      <!-- 主内容区 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Odometer, Connection, Clock, Wallet, Document, Download, Folder, Tickets, Plus, Bell, ArrowDown } from '@element-plus/icons-vue'

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

/* 深色专业侧边栏 */
.sidebar {
  background: var(--sidebar-bg);
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--sidebar-border);
}

.logo-section {
  padding: 24px 20px;
  border-bottom: 1px solid var(--sidebar-border);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #635BFF 0%, #8B83FF 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
}

.logo-subtitle {
  font-size: 11px;
  color: var(--sidebar-text);
  margin-top: 4px;
  margin-left: 52px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.sidebar-menu {
  flex: 1;
  padding: 16px 12px;
  overflow-y: auto;
}

.sidebar-menu .el-menu-item {
  height: 48px;
  line-height: 48px;
  border-radius: 10px;
  margin-bottom: 4px;
  color: var(--sidebar-text);
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
}

.sidebar-menu .el-menu-item:hover {
  background: var(--sidebar-hover-bg);
  color: #FFFFFF;
}

.sidebar-menu .el-menu-item.is-active {
  background: linear-gradient(135deg, #635BFF 0%, #8B83FF 100%);
  color: #FFFFFF;
  box-shadow: 0 4px 16px rgba(99, 91, 255, 0.4);
}

.sidebar-menu .el-menu-item .el-icon {
  font-size: 18px;
  width: 20px;
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--sidebar-border);
}

.version-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.version-label {
  font-size: 12px;
  color: var(--sidebar-text);
}

.version-number {
  font-size: 12px;
  color: var(--sidebar-text);
  font-family: 'DM Mono', monospace;
}

/* 头部 */
.header {
  background: var(--header-bg);
  box-shadow: var(--header-shadow);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 32px;
  height: 72px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.5px;
  margin: 0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.breadcrumb-item {
  color: var(--text-tertiary);
}

.breadcrumb-item.active {
  color: var(--text-secondary);
}

.breadcrumb-separator {
  color: var(--text-tertiary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.quick-action {
  display: flex;
  align-items: center;
  gap: 6px;
}

.notification-badge :deep(.el-badge__content) {
  background: #F76707;
}

.icon-btn {
  border: 1px solid #E4E7ED;
  background: #fff;
}

.icon-btn:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.user-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 10px;
  background: var(--bg-tertiary);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #635BFF 0%, #8B83FF 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.2;
}

.user-role {
  font-size: 12px;
  color: var(--text-tertiary);
}

.dropdown-icon {
  color: var(--text-secondary);
  cursor: pointer;
  transition: color 0.2s;
}

.dropdown-icon:hover {
  color: var(--accent-primary);
}

/* 主内容区 */
.main-content {
  background: var(--bg-primary);
  padding: 28px 32px;
}
</style>
