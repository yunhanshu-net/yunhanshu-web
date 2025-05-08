<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import workspaceApi, { IWorkspace, IWorkspaceCreateParams } from '@/api/workspace'

const router = useRouter()
const route = useRoute()

// 搜索相关
const searchType = ref('云函数')
const searchKeyword = ref('')

// 搜索选项
const searchOptions = [
  { label: '云函数', value: '云函数' },
  { label: '求交集', value: '求交集' },
  { label: '补集', value: '补集' }
]

// 执行搜索
const handleSearch = () => {
  console.log('搜索:', searchType.value, searchKeyword.value)
  // 实际搜索逻辑
}

// 创建工作空间弹窗
const showCreateWorkspaceDialog = ref(false)

// 退出登录
const logout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}

// 工作空间相关
const currentWorkspace = ref<IWorkspace | null>(null)
const workspaceList = ref<IWorkspace[]>([])
const loadingWorkspaces = ref(false)
const newWorkspace = ref<IWorkspaceCreateParams>({
  title: '',
  name: '',
  description: ''
})
const createLoading = ref(false)

// 工作空间颜色映射
const workspaceColors = [
  '#3C9AE8', '#52C41A', '#F5222D', '#FAAD14', '#1890FF', 
  '#722ED1', '#EB2F96', '#13C2C2', '#FA8C16', '#A0D911'
]

// 获取当前用户的所有工作空间
const fetchWorkspaces = async () => {
  loadingWorkspaces.value = true
  try {
    const result = await workspaceApi.getList({ page_size: 100 })
    workspaceList.value = result.items.map((item: IWorkspace, index: number) => ({
      ...item,
      color: workspaceColors[index % workspaceColors.length] // 为每个工作空间分配一个颜色
    }))
    
    // 如果列表不为空且没有当前选中的工作空间，则选择第一个
    if (workspaceList.value.length > 0 && !currentWorkspace.value) {
      // 检查当前路由是否匹配某个工作空间
      const { user, name } = route.params
      const matchedWorkspace = workspaceList.value.find(
        ws => ws.user === user && ws.name === name
      )

      if (matchedWorkspace) {
        // 如果找到匹配的工作空间，使用它
        currentWorkspace.value = matchedWorkspace
      } else {
        // 如果没有找到匹配的工作空间，使用第一个
        currentWorkspace.value = workspaceList.value[0]
        // 如果当前路由不是工作空间路由，更新路由
        updateWorkspaceRoute(currentWorkspace.value)
      }
    }
  } catch (error) {
    console.error('获取工作空间列表失败', error)
    ElMessage.error('获取工作空间列表失败，请检查网络连接')
  } finally {
    loadingWorkspaces.value = false
  }
}

// 切换工作空间
const switchWorkspace = (workspace: IWorkspace) => {
  currentWorkspace.value = workspace
  console.log('切换到工作空间:', workspace.name)
  
  // 更新路由
  updateWorkspaceRoute(workspace)
}

// 更新工作空间路由
const updateWorkspaceRoute = (workspace: IWorkspace) => {
  if (workspace && workspace.user && workspace.name) {
    // 检查当前路由是否已经是正确的工作空间路由
    const currentPath = route.path
    const targetPath = `/workspace/${workspace.user}/${workspace.name}`
    
    // 如果当前路由不是目标工作空间路由，则更新
    if (currentPath !== targetPath) {
      router.push(targetPath)
    }
  }
}

// 创建新工作空间
const createWorkspace = async () => {
  // 表单验证
  if (!newWorkspace.value.title || !newWorkspace.value.name || !newWorkspace.value.description) {
    ElMessage.warning('请填写所有必填字段')
    return
  }
  
  createLoading.value = true
  try {
    const createdWorkspace = await workspaceApi.create(newWorkspace.value)
    
    ElMessage.success('创建工作空间成功')
    
    // 添加颜色属性并添加到列表
    const newItem: IWorkspace = {
      ...createdWorkspace,
      color: workspaceColors[workspaceList.value.length % workspaceColors.length]
    }
    
    // 添加到列表并选中
    workspaceList.value.push(newItem)
    currentWorkspace.value = newItem
    
    // 更新路由
    updateWorkspaceRoute(newItem)
    
    // 关闭对话框
    showCreateWorkspaceDialog.value = false
    
    // 清空表单
    newWorkspace.value = { title: '', name: '', description: '' }
  } catch (error) {
    console.error('创建工作空间失败', error)
  } finally {
    createLoading.value = false
  }
}

// 组件挂载时获取工作空间列表
onMounted(() => {
  fetchWorkspaces()
})
</script>

<template>
  <div class="main-layout">
    <!-- 顶部导航栏 -->
    <header class="main-layout__header">
      <div class="main-layout__header-left">
        <div class="main-layout__logo">
          <img src="@/assets/logo.png" alt="Logo" class="main-layout__logo-img" />
          <span class="main-layout__logo-text">云函数平台</span>
        </div>
      </div>
      
      <div class="main-layout__header-center">
        <div class="main-layout__search">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入要搜索的内容"
            class="search-input"
          >
            <template #prepend>
              <el-select v-model="searchType" style="width: 115px">
                <el-option 
                  v-for="option in searchOptions" 
                  :key="option.value" 
                  :label="option.label" 
                  :value="option.value" 
                />
              </el-select>
            </template>
            <template #append>
              <el-button @click="handleSearch">
                <el-icon><i-ep-search /></el-icon>
              </el-button>
            </template>
          </el-input>
        </div>
      </div>
      
      <div class="main-layout__header-right">
        <div class="main-layout__user-actions">
          <el-button type="primary" class="action-button" @click="() => {}">
            <el-icon><i-ep-bell /></el-icon>
          </el-button>
          
          <div class="action-button" @click="showCreateWorkspaceDialog = true">
            <el-icon><i-ep-plus /></el-icon>
            <span>创建工作空间</span>
          </div>
          
          <el-dropdown trigger="click" @command="(command: string) => command === 'logout' && logout()">
            <el-avatar :size="36" src="@/assets/avatar.png" class="user-avatar" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item>设置</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>
    
    <!-- 主内容区 -->
    <main class="main-layout__content">
      <router-view />
    </main>
    
    <!-- 工作空间切换器 -->
    <div class="workspace-switcher" v-if="currentWorkspace">
      <el-dropdown trigger="click" placement="top-start" @command="switchWorkspace">
        <div class="workspace-current">
          <div class="workspace-icon" :style="{ backgroundColor: currentWorkspace.color }"></div>
          <span class="workspace-name">{{ currentWorkspace.title }}</span>
          <el-icon><i-ep-arrow-up /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <div class="workspace-dropdown-header">
              <span>切换工作空间</span>
            </div>
            
            <!-- 加载中显示 -->
            <div v-if="loadingWorkspaces" class="workspace-loading">
              <el-icon class="is-loading"><i-ep-loading /></el-icon>
              <span>加载中...</span>
            </div>
            
            <!-- 工作空间列表 -->
            <el-scrollbar v-else max-height="400px">
              <el-dropdown-item 
                v-for="workspace in workspaceList" 
                :key="workspace.id" 
                :command="workspace"
                :class="{ 'is-active': workspace.id === currentWorkspace.id }"
              >
                <div class="workspace-item">
                  <div class="workspace-icon" :style="{ backgroundColor: workspace.color }"></div>
                  <div class="workspace-item-details">
                    <div class="workspace-item-name">{{ workspace.title }}</div>
                    <div class="workspace-item-user">{{ workspace.user }}/{{ workspace.name }}</div>
                  </div>
                  <el-icon v-if="workspace.id === currentWorkspace.id" class="workspace-active-icon">
                    <i-ep-check />
                  </el-icon>
                </div>
              </el-dropdown-item>
            </el-scrollbar>
            
            <div class="workspace-dropdown-footer">
              <el-button type="text" size="small" @click="showCreateWorkspaceDialog = true">
                <el-icon><i-ep-plus /></el-icon>
                <span>创建工作空间</span>
              </el-button>
            </div>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    
    <!-- 创建工作空间对话框 -->
    <el-dialog
      v-model="showCreateWorkspaceDialog"
      title="创建工作空间"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form class="workspace-create-form" label-position="top">
        <div class="form-section">
          <div class="section-title">
            <el-icon><i-ep-info-filled /></el-icon>
            <span>基本信息</span>
          </div>
          
          <el-form-item label="工作空间标题" required>
            <el-input 
              v-model="newWorkspace.title" 
              placeholder="例如：清华大学科研常用工具库" 
            />
            <div class="form-tip">显示名称，用于展示</div>
          </el-form-item>
          
          <el-form-item label="工作空间名称" required>
            <el-input 
              v-model="newWorkspace.name" 
              placeholder="例如：qinghuaTools" 
            />
            <div class="form-tip">唯一标识，仅支持字母、数字、下划线和连字符</div>
          </el-form-item>
        </div>
        
        <div class="form-section">
          <div class="section-title">
            <el-icon><i-ep-document /></el-icon>
            <span>详细描述</span>
          </div>
          
          <el-form-item label="工作空间描述" required>
            <el-input
              v-model="newWorkspace.description"
              type="textarea"
              rows="3"
              placeholder="描述这个工作空间的用途..."
            />
            <div class="form-tip">详细描述工作空间的用途、适用场景等信息</div>
          </el-form-item>
        </div>
      </el-form>
      
      <template #footer>
        <el-button @click="showCreateWorkspaceDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="createWorkspace" 
          :loading="createLoading"
          :disabled="!newWorkspace.title || !newWorkspace.name || !newWorkspace.description"
        >创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss">
@use '@/styles/layouts/main-layout.scss' as *;

/* 工作空间切换器样式 */
.workspace-switcher {
  position: fixed;
  left: 20px;
  bottom: 20px;
  z-index: 100;
  
  .workspace-current {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: $background-lighter;
    padding: 8px 16px;
    border-radius: 4px;
    box-shadow: $shadow-base;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background-color: rgba($primary-color, 0.15);
    }
    
    .workspace-icon {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    
    .workspace-name {
      font-size: 14px;
      color: $text-primary;
      max-width: 150px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .el-icon {
      color: $text-secondary;
      margin-left: 4px;
      font-size: 12px;
    }
  }
}

.workspace-dropdown-header {
  padding: 10px 16px;
  font-size: 12px;
  color: $text-secondary;
  border-bottom: 1px solid $border-color;
}

.workspace-dropdown-footer {
  padding: 10px 16px;
  border-top: 1px solid $border-color;
  text-align: center;
  
  .el-button {
    width: 100%;
    justify-content: center;
    
    .el-icon {
      margin-right: 4px;
    }
  }
}

.workspace-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: $text-secondary;
  
  .el-icon {
    margin-right: 8px;
  }
}

.workspace-item {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 8px;
  
  .workspace-icon {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  
  .workspace-item-details {
    flex: 1;
    overflow: hidden;
    
    .workspace-item-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: $text-primary;
      font-size: 14px;
    }
    
    .workspace-item-user {
      font-size: 12px;
      color: $text-secondary;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  
  .workspace-active-icon {
    color: $primary-color;
    font-size: 14px;
    flex-shrink: 0;
  }
}

.el-dropdown-menu__item.is-active {
  background-color: rgba($primary-color, 0.1) !important;
  color: $primary-color !important;
}

.form-tip {
  font-size: 12px;
  color: $text-secondary;
  margin-top: 4px;
}

/* 创建工作空间对话框样式优化 */
.el-dialog {
  background-color: $background-light !important;
  border-radius: 8px !important;
  overflow: hidden !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3) !important;
  border: 1px solid $border-color !important;
  
  .el-dialog__header {
    background-color: $background-lighter !important;
    margin: 0 !important;
    padding: 16px 20px !important;
    border-bottom: 1px solid $border-color !important;
    
    .el-dialog__title {
      font-size: 16px !important;
      font-weight: bold !important;
      color: $text-primary !important;
    }
    
    .el-dialog__headerbtn {
      top: 16px !important;
      right: 20px !important;
      
      .el-dialog__close {
        color: $text-secondary !important;
        
        &:hover {
          color: $primary-light !important;
        }
      }
    }
  }
  
  .el-dialog__body {
    padding: 24px !important;
    color: $text-primary !important;
    background-color: $background-light !important;
  }
  
  .el-dialog__footer {
    background-color: $background-lighter !important;
    padding: 16px 20px !important;
    border-top: 1px solid $border-color !important;
    margin-top: 0 !important;
  }
  
  .el-form-item__label {
    color: $text-primary !important;
    font-weight: 500 !important;
    padding-bottom: 4px !important;
  }
  
  .el-input__wrapper,
  .el-textarea__inner {
    background-color: $background-dark !important;
    border-color: $border-color !important;
    color: $text-primary !important;
    transition: all 0.2s !important;
    
    &:hover, &:focus {
      border-color: $primary-light !important;
    }
  }
  
  .el-button--primary {
    background-color: $primary-color !important;
    border-color: $primary-color !important;
    
    &:hover {
      background-color: $primary-light !important;
      border-color: $primary-light !important;
    }
  }
  
  .el-button--default {
    background-color: $background-lighter !important;
    border-color: $border-color !important;
    color: $text-secondary !important;
    
    &:hover {
      background-color: $background-dark !important;
      color: $text-primary !important;
    }
  }
}

.workspace-create-form {
  .el-form-item {
    margin-bottom: 20px !important;
    
    &:last-child {
      margin-bottom: 0 !important;
    }
  }
  
  .form-section {
    margin-bottom: 24px !important;
    padding-bottom: 16px !important;
    border-bottom: 1px dashed rgba($border-color, 0.5) !important;
    
    &:last-child {
      margin-bottom: 0 !important;
      padding-bottom: 0 !important;
      border-bottom: none !important;
    }
    
    .section-title {
      font-size: 14px !important;
      font-weight: bold !important;
      color: $primary-color !important;
      margin-bottom: 16px !important;
    }
  }
}

:deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}

:deep(.el-scrollbar__bar.is-horizontal) {
  display: none;
}
</style>
