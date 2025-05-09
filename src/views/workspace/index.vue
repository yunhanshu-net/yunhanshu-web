<script setup lang="ts">
import { ref, onMounted, watch, reactive, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, View, Star, Coin, CollectionTag, Cpu } from '@element-plus/icons-vue'
import workspaceApi, {
  IWorkspace,
  IServiceTreeNode,
  ICreateServiceTreeParams,
  ICreateRunnerFuncParams
} from '@/api/workspace'
import FunctionRenderer from '@/components/FunctionRenderer.vue'

// 导入自定义图标
// @ts-ignore - 忽略图片模块的类型检查
import directoryIcon from '@/assets/directory.png'
// @ts-ignore
import functionIcon from '@/assets/fx.png'
// @ts-ignore
import moreIcon from '@/assets/more.png'

// 格式化日期函数
const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 树节点数据类型定义
interface TreeNodeData {
  id: number;
  label: string;
  name: string;
  type: 'package' | 'function';
  children?: TreeNodeData[];
  hasChildren: boolean;
  item: IServiceTreeNode;
  isRoot?: boolean;
}

// 函数详情接口返回的数据类型
interface IFunctionDetail {
  id: number
  created_at: string
  updated_at: string
  created_by: string
  updated_by: string
  deleted_by: string
  title: string
  name: string
  description: string
  tags: string
  request: {
    children: Array<{
      code: string
      desc: string
      name: string
      widget: {
        mode: string
        type: string
        widget: string
        example: string
        text_limit: string
        placeholder: string
        number_limit: string
        default_value: string
      }
      required: boolean
    }>
    render_type: string
  }
  response: {
    children: Array<{
      code: string
      name: string
      widget: {
        mode: string
        type: string
        widget: string
        example: string
        text_limit: string
        placeholder: string
        number_limit: string
        default_value: string
      }
    }>
    render_type: string
  }
  callbacks: string
  use_tables: string
  is_public: boolean
  user: string
  tree_id: number
  runner_id: number
  fork_from_version: string
  fork_from_id: number | null
  method: string
  path: string
}

// 组件状态
const route = useRoute()
const loading = ref(false)
const treeLoading = ref(false)

// 当前工作空间信息
const workspace = ref<IWorkspace | null>(null)

// 服务目录树数据
const treeData = ref<TreeNodeData[]>([])
const currentNodeKey = ref<number>(0)
const loadedNodes = ref<Set<number>>(new Set()) // 用于记录已加载的节点
const expandedKeys = ref<number[]>([]) // 存储展开的节点keys

// 创建服务目录相关
const createDialogVisible = ref(false)
const creatingDirectory = ref(false)
const selectedNode = ref<TreeNodeData | null>(null)
const newDirectory = reactive<{
  title: string;
  name: string;
}>({
  title: '',
  name: ''
})

// 创建云函数相关
const createFuncDialogVisible = ref(false)
const creatingFunc = ref(false)
const newFunc = reactive<{
  title: string;
  name: string;
  desc: string;
  code?: string;
}>({
  title: '',
  name: '',
  desc: '',
  code: ''
})

// 搜索过滤相关
const searchKeyword = ref('')
const filteredNodes = ref<TreeNodeData[]>([])

// 过滤后的树数据
const filteredTreeData = computed(() => {
  if (!searchKeyword.value) {
    return treeData.value;
  }

  // 使用关键词过滤树节点
  return filterTreeNodes(treeData.value, searchKeyword.value.toLowerCase());
})

// 递归过滤树节点
const filterTreeNodes = (nodes: TreeNodeData[], keyword: string): TreeNodeData[] => {
  const result: TreeNodeData[] = [];

  for (const node of nodes) {
    // 创建节点副本以避免修改原始数据
    const newNode = { ...node };

    // 判断当前节点是否匹配
    const isMatch =
      newNode.label.toLowerCase().includes(keyword) ||
      newNode.name.toLowerCase().includes(keyword);

    // 递归过滤子节点
    if (newNode.children && newNode.children.length > 0) {
      newNode.children = filterTreeNodes(newNode.children, keyword);
    }

    // 如果当前节点匹配或者有匹配的子节点，则保留该节点
    if (isMatch || (newNode.children && newNode.children.length > 0)) {
      result.push(newNode);
    }
  }

  return result;
}

// 搜索节点
const searchNodes = (nodes: TreeNodeData[], keyword: string) => {
  if (!nodes || nodes.length === 0) return

  filteredNodes.value = []

  // 深度优先搜索所有节点
  const searchDFS = (nodeList: TreeNodeData[]) => {
    for (const node of nodeList) {
      // 检查节点是否匹配
      if (
        node.label.toLowerCase().includes(keyword) ||
        node.name.toLowerCase().includes(keyword)
      ) {
        filteredNodes.value.push(node)
      }

      // 递归搜索子节点
      if (node.children && node.children.length > 0) {
        searchDFS(node.children)
      }
    }
  }

  searchDFS(nodes)

  console.log('搜索结果:', filteredNodes.value)
}

// 清除搜索
const clearSearch = () => {
  searchKeyword.value = ''
  filteredNodes.value = []
}

// 高亮显示匹配节点
const highlightNode = (id: number) => {
  currentNodeKey.value = id

  // 确保所有父节点都展开
  const node = findNodeById(treeData.value, id)
  if (node) {
    ensureParentExpanded(node)
  }
}

// 查找指定ID的节点
const findNodeById = (nodes: TreeNodeData[], id: number): TreeNodeData | null => {
  for (const node of nodes) {
    if (node.id === id) {
      return node
    }

    if (node.children && node.children.length > 0) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }

  return null
}

// 确保父节点展开
const ensureParentExpanded = (node: TreeNodeData) => {
  // 分析节点的full_id_path获取所有父节点ID
  const pathParts = node.item.full_id_path.split('/').map(Number)

  // 将所有父节点ID添加到展开键列表中
  expandedKeys.value = [...new Set([...expandedKeys.value, ...pathParts])]
}

// 添加加载锁
const isLoading = ref(false)

// 从路由获取工作空间信息
const fetchWorkspaceInfo = async () => {
  const { user, name } = route.params
  if (!user || !name) {
    ElMessage.error('缺少工作空间参数')
    return
  }

  if (loading.value) return // 防止重复加载

  loading.value = true
  try {
    // 使用新接口直接获取指定工作空间的详情
    const workspaceDetail = await workspaceApi.getDetailByName(user as string, name as string)

    if (workspaceDetail) {
      // 检查当前路由是否与工作空间匹配
      if (workspaceDetail.user === user && workspaceDetail.name === name) {
        workspace.value = workspaceDetail
        console.log('获取工作空间详情:', workspace.value)

        // 获取服务目录树
        await fetchServiceTree()
      } else {
        console.warn('工作空间信息与路由不匹配')
        ElMessage.error('工作空间信息不匹配')
      }
    } else {
      ElMessage.error('未找到该工作空间')
    }
  } catch (error) {
    console.error('获取工作空间信息失败', error)
    ElMessage.error('获取工作空间信息失败')
  } finally {
    loading.value = false
  }
}

// 获取服务目录树数据
const fetchServiceTree = async () => {
  if (!workspace.value || isLoading.value) return

  isLoading.value = true
  treeLoading.value = true

  try {
    // 完全重置所有状态
    treeData.value = []
    loadedNodes.value.clear()
    expandedKeys.value = []
    currentNodeKey.value = 0
    searchKeyword.value = ''
    filteredNodes.value = []

    // 等待状态重置
    await nextTick()

    // 构建根节点
    const rootNode: TreeNodeData = {
      id: workspace.value.tree_id,
      label: `${workspace.value.title} (${workspace.value.name})`,
      name: workspace.value.name,
      type: 'package',
      children: [],
      hasChildren: true,
      item: {
        id: workspace.value.tree_id,
        title: workspace.value.title,
        name: workspace.value.name,
        parent_id: 0,
        type: 'package',
        runner_id: workspace.value.id,
        level: 1,
        sort: 0,
        full_id_path: workspace.value.tree_id.toString(),
        full_name_path: workspace.value.name,
        user: workspace.value.user,
        created_at: workspace.value.created_at,
        updated_at: workspace.value.updated_at,
        created_by: workspace.value.created_by,
        updated_by: workspace.value.updated_by,
        deleted_by: '',
        children_count: 0,
        fork_from_id: null
      },
      isRoot: true
    }

    // 设置根节点
    treeData.value = [rootNode]
    expandedKeys.value = [workspace.value.tree_id]

    // 等待状态更新
    await nextTick()

    // 加载根节点的子节点
    const children = await workspaceApi.getServiceTreeChildren(workspace.value.tree_id)
    const formattedChildren = formatTreeData(children)

    // 更新根节点的子节点
    if (treeData.value.length > 0) {
      treeData.value[0].children = formattedChildren
      treeData.value[0].hasChildren = formattedChildren.length > 0
    }

    // 标记根节点为已加载
    loadedNodes.value.add(workspace.value.tree_id)

  } catch (error) {
    console.error('初始化服务目录树失败', error)
    ElMessage.error('初始化服务目录树失败')
  } finally {
    treeLoading.value = false
    isLoading.value = false
  }
}

// 加载节点的子节点
const loadNodeChildren = async (nodeId: number): Promise<TreeNodeData[]> => {
  if (!workspace.value || isLoading.value) return []

  // 如果已经加载过，直接返回缓存的数据
  if (loadedNodes.value.has(nodeId)) {
    const findNode = (nodes: TreeNodeData[]): TreeNodeData | null => {
      for (const node of nodes) {
        if (node.id === nodeId) {
          return node
        }
        if (node.children && node.children.length > 0) {
          const found = findNode(node.children)
          if (found) return found
        }
      }
      return null
    }

    const node = findNode(treeData.value)
    return node?.children || []
  }

  isLoading.value = true

  try {
    const children = await workspaceApi.getServiceTreeChildren(nodeId)
    const formattedChildren = formatTreeData(children)

    // 更新节点数据
    if (nodeId === workspace.value.tree_id) {
      if (treeData.value.length > 0) {
        treeData.value[0].children = formattedChildren
        treeData.value[0].hasChildren = formattedChildren.length > 0
      }
    } else {
      updateNodeChildren(treeData.value, nodeId, formattedChildren)
    }

    loadedNodes.value.add(nodeId)
    return formattedChildren
  } catch (error) {
    console.error('获取子节点失败', error)
    ElMessage.error('获取子节点失败')
    return []
  } finally {
    isLoading.value = false
  }
}

// 递归查找并更新节点的子节点
const updateNodeChildren = (nodes: TreeNodeData[], nodeId: number, children: TreeNodeData[]) => {
  for (const node of nodes) {
    if (node.id === nodeId) {
      node.children = children
      node.hasChildren = children.length > 0
      return true
    }

    if (node.children && node.children.length > 0) {
      if (updateNodeChildren(node.children, nodeId, children)) {
        return true
      }
    }
  }

  return false
}

// 格式化API返回的数据为树节点数据
const formatTreeData = (data: IServiceTreeNode[]): TreeNodeData[] => {
  return data.map(item => ({
    id: item.id,
    label: item.title,
    name: item.name,
    type: item.type,
    children: [],
    hasChildren: item.type === 'package' && item.children_count > 0,
    item: item
  }))
}

// 懒加载树节点处理函数
const loadNode = async (node: any, resolve: (data: TreeNodeData[]) => void) => {
  // 如果是根节点，直接返回顶层数据
  if (node.level === 0) {
    resolve(treeData.value)
    return
  }

  // 如果不是package类型或已确认没有子节点，不需要加载
  if (node.data.type !== 'package' || !node.data.hasChildren) {
    resolve([])
    return
  }

  // 加载子节点
  const children = await loadNodeChildren(node.data.id)
  resolve(children)
}

// 当前选中的函数详情
const currentFunction = ref<IFunctionDetail | null>(null)

// 节点点击事件
const handleNodeClick = async (data: TreeNodeData) => {
  console.log('点击节点:', data)
  if (data.type === 'function') {
    try {
      const response = await workspaceApi.getRunnerFunc(data.id)
      console.log('获取函数信息响应:', response)
      
      if (response) {
        currentFunction.value = response
        if (workspace.value) {
          workspace.value.currentFunction = {
            id: response.id,
            request: response.request,
            response: response.response
          }
        }
      }
    } catch (error) {
      console.error('获取函数信息失败:', error)
      ElMessage.error('获取函数信息失败')
    }
  }
}

// 处理更多操作点击
// const handleMoreClick = (node: TreeNodeData, e: Event) => {
//   e.stopPropagation() // 阻止事件冒泡，避免触发节点点击
//   console.log('更多操作点击:', node)
// }

// 处理重命名操作
const handleRename = (node: TreeNodeData, e: Event) => {
  e.stopPropagation() // 阻止事件冒泡
  console.log('重命名:', node)
  ElMessage.info(`准备重命名: ${node.label}`)
}

// 处理删除操作
const handleDelete = (node: TreeNodeData, e: Event) => {
  e.stopPropagation() // 阻止事件冒泡
  console.log('删除:', node)
  ElMessage.info(`准备删除: ${node.label}`)
}

// 打开创建服务目录对话框
const handleCreateDirectory = (node: TreeNodeData, e: Event) => {
  e.stopPropagation() // 阻止事件冒泡
  if (node.type !== 'package') {
    ElMessage.warning('只能在服务目录下创建子目录')
    return
  }

  selectedNode.value = node
  newDirectory.title = ''
  newDirectory.name = ''
  createDialogVisible.value = true
}

// 打开创建云函数对话框
const handleCreateFunction = (node: TreeNodeData, e: Event) => {
  e.stopPropagation() // 阻止事件冒泡
  if (node.type !== 'package') {
    ElMessage.warning('只能在服务目录下创建云函数')
    return
  }

  selectedNode.value = node
  newFunc.title = ''
  newFunc.name = ''
  newFunc.desc = ''
  newFunc.code = ''
  createFuncDialogVisible.value = true
}

// 提交创建服务目录
const submitCreateDirectory = async () => {
  if (!selectedNode.value) return

  // 表单验证
  if (!newDirectory.title.trim() || !newDirectory.name.trim()) {
    ElMessage.warning('请填写完整的目录信息')
    return
  }

  creatingDirectory.value = true
  try {
    const params: ICreateServiceTreeParams = {
      parent_id: selectedNode.value.id,
      title: newDirectory.title.trim(),
      name: newDirectory.name.trim(),
      type: 'package'
    }

    // 调用API创建目录
    const result = await workspaceApi.createServiceTree(params)
    ElMessage.success('创建服务目录成功')

    // 关闭对话框
    createDialogVisible.value = false

    // 从缓存中移除当前节点，以便重新加载
    loadedNodes.value.delete(selectedNode.value.id)

    // 确保父节点展开
    if (!expandedKeys.value.includes(selectedNode.value.id)) {
      expandedKeys.value = [...expandedKeys.value, selectedNode.value.id]
    }

    // 重新加载该节点的子节点
    const children = await loadNodeChildren(selectedNode.value.id)

    // 更新父节点的子节点数量
    if (selectedNode.value.item) {
      selectedNode.value.item.children_count = (selectedNode.value.item.children_count || 0) + 1
    }
  } catch (error) {
    console.error('创建服务目录失败', error)
    ElMessage.error('创建服务目录失败')
  } finally {
    creatingDirectory.value = false
  }
}

// 提交创建云函数
const submitCreateFunction = async () => {
  if (!selectedNode.value) return

  // 表单验证
  if (!newFunc.title.trim() || !newFunc.name.trim()) {
    ElMessage.warning('请填写完整的函数信息')
    return
  }

  creatingFunc.value = true
  try {
    const params: ICreateRunnerFuncParams = {
      tree_id: selectedNode.value.id,
      title: newFunc.title.trim(),
      name: newFunc.name.trim(),
      desc: newFunc.desc.trim(),
      code: newFunc.code?.trim() || undefined
    }

    // 调用API创建云函数
    const result = await workspaceApi.createRunnerFunc(params)
    ElMessage.success('创建云函数成功')

    // 关闭对话框
    createFuncDialogVisible.value = false

    // 从缓存中移除当前节点，以便重新加载
    loadedNodes.value.delete(selectedNode.value.id)

    // 确保父节点展开
    if (!expandedKeys.value.includes(selectedNode.value.id)) {
      expandedKeys.value = [...expandedKeys.value, selectedNode.value.id]
    }

    // 重新加载该节点的子节点
    const children = await loadNodeChildren(selectedNode.value.id)

    // 更新父节点的子节点数量
    if (selectedNode.value.item) {
      selectedNode.value.item.children_count = (selectedNode.value.item.children_count || 0) + 1
    }
  } catch (error) {
    console.error('创建云函数失败', error)
    ElMessage.error('创建云函数失败')
  } finally {
    creatingFunc.value = false
  }
}

// 更新节点的子节点数量
const updateNodeChildrenCount = (nodeId: number, increment: number = 1) => {
  const updateCount = (nodes: TreeNodeData[]): boolean => {
    for (const node of nodes) {
      if (node.id === nodeId) {
        if (node.item) {
          node.item.children_count = (node.item.children_count || 0) + increment
        }
        return true
      }
      if (node.children && node.children.length > 0) {
        if (updateCount(node.children)) {
          return true
        }
      }
    }
    return false
  }

  updateCount(treeData.value)
}

// 监听路由变化，重新加载工作空间信息
watch(
  () => route.params,
  async (newParams, oldParams) => {
    // 只有当用户或工作空间名称变化时才重新加载
    if (newParams.user !== oldParams.user || newParams.name !== oldParams.name) {
      if (newParams.user && newParams.name) {
        // 重置工作空间信息
        workspace.value = null
        
        // 等待状态重置
        await nextTick()
        
        // 重新获取工作空间信息
        await fetchWorkspaceInfo()
      }
    }
  },
  { deep: true }
)

// 监听搜索关键词变化，触发过滤
watch(searchKeyword, (newVal) => {
  // 使用计算属性filteredTreeData自动更新过滤结果
  if (newVal) {
    // 如果有搜索词，还需要执行搜索更新filteredNodes以便显示搜索结果列表
    searchNodes(treeData.value, newVal.toLowerCase());
  } else {
    // 如果搜索词为空，清空搜索结果列表
    filteredNodes.value = [];
  }
});

// 组件挂载时获取工作空间信息
onMounted(async () => {
  await fetchWorkspaceInfo()
})
</script>

<template>
  <div class="workspace-container">
    <div v-loading="loading" class="workspace-layout">
      <!-- 左侧服务目录树 -->
      <div class="service-tree-container" v-loading="treeLoading">
        <div class="tree-header">
          <h3>服务目录</h3>

          <!-- 搜索过滤框 -->
          <div class="search-container">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索目录和函数..."
              clearable
              @clear="clearSearch"
              class="search-input"
              size="small"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>

          <!-- 搜索结果列表 -->
          <div v-if="filteredNodes.length > 0" class="search-results">
            <div class="search-result-title">搜索结果 ({{ filteredNodes.length }})</div>
            <div class="search-result-list">
              <div
                v-for="node in filteredNodes"
                :key="node.id"
                class="search-result-item"
                @click="highlightNode(node.id)"
              >
                <img
                  :src="node.type === 'package' ? directoryIcon : functionIcon"
                  class="node-icon-small"
                  alt=""
                />
                <span class="search-result-name">{{ node.label }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 使用自定义过滤逻辑 -->
        <el-tree
          v-if="treeData.length > 0"
          :data="filteredTreeData"
          :props="{
            children: 'children',
            label: 'label',
            isLeaf: (data: TreeNodeData) => data.type === 'function' || (data.type === 'package' && !data.hasChildren)
          }"
          node-key="id"
          :current-node-key="currentNodeKey || undefined"
          :default-expanded-keys="expandedKeys"
          :expanded-keys="expandedKeys"
          :load="loadNode"
          lazy
          @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <span class="tree-node">
              <!-- 根据节点类型显示不同图标 -->
              <img
                :src="data.type === 'package' ? directoryIcon : functionIcon"
                class="node-icon"
                alt=""
              />

              <span class="node-label">{{ node.label }}</span>

              <!-- 节点类型标签 - 只显示子节点数量 -->
              <span v-if="data.hasChildren" class="node-children-count">
                ({{ data.item.children_count || 0 }})
              </span>

              <!-- 更多操作按钮 - 始终显示 -->
              <el-dropdown
                trigger="click"
                @click.stop
                class="node-more-actions"
              >
                <img :src="moreIcon" class="more-icon" alt="更多" />

                <template #dropdown>
                  <el-dropdown-menu>
                    <!-- 仅对package类型显示添加目录选项 -->
                    <el-dropdown-item v-if="data.type === 'package'" @click="handleCreateDirectory(data, $event)">
                      添加服务目录
                    </el-dropdown-item>
                    <!-- 新增添加云函数选项 -->
                    <el-dropdown-item v-if="data.type === 'package'" @click="handleCreateFunction(data, $event)">
                      添加云函数
                    </el-dropdown-item>
                    <el-dropdown-item @click="handleRename(data, $event)">重命名</el-dropdown-item>
                    <el-dropdown-item @click="handleDelete(data, $event)" class="danger-item">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </span>
          </template>
        </el-tree>

        <div v-else-if="filteredNodes.length > 0" class="empty-tree">
          <el-empty description="请从搜索结果中选择" :image-size="80" />
        </div>

        <div v-else class="empty-tree">
          <el-empty description="暂无服务目录" :image-size="80" />
        </div>
      </div>

      <!-- 右侧内容区域 -->
      <div class="right-content">
        <div class="content-container">
          <div class="content-body">
            <template v-if="currentFunction">
              <div class="function-container">
                <div class="function-renderer">
                  <!-- 添加函数描述区域 -->
                  <div class="function-signature">
                    <div class="signature-title">函数签名</div>
                    <pre><code class="signature-code"><span class="keyword">function</span> <span class="function-name">{{ currentFunction.path.split('/').join('.') }}</span>(<span class="parameter">{{ currentFunction.request.children.map(p => p.name).join(', ') }}</span>) <span class="arrow">-></span> <span class="return-type">{{ currentFunction.response.children.map(p => p.name).join(', ') }}</span></code></pre>
                  </div>
                  <function-renderer
                    :request="currentFunction.request"
                    :response="currentFunction.response"
                    @update:model-value="(val) => workspace.currentFunction.requestData = val"
                  />
                </div>
                <div class="function-info">
                  <div class="info-header">
                    <el-row>
                      <el-col :span="6">
                        <el-avatar :size="50" src="https://img1.baidu.com/it/u=1465664392,2808406094&fm=253&fmt=auto&app=120&f=JPEG?w=800&h=800" />
                      </el-col>
                      <el-col :span="18">
                        <div>
                          <span class="author-name">{{ currentFunction.created_by }}</span>
                          <p class="author-desc">
                            <el-tooltip
                              class="box-item"
                              effect="dark"
                              :content="currentFunction.description"
                              placement="top-start"
                            >
                              <el-text truncated size="small" class="mx-1">{{ currentFunction.description }}</el-text>
                            </el-tooltip>
                          </p>
                        </div>
                      </el-col>
                    </el-row>

                    <el-row class="action-buttons">
                      <el-col :span="6"></el-col>
                      <el-col :span="9">
                        <el-button size="small" type="primary">+ 关注 988</el-button>
                      </el-col>
                      <el-col :span="9">
                        <el-button size="small" type="primary">打赏项目</el-button>
                      </el-col>
                    </el-row>
                  </div>

                  <el-divider border-style="double" />

                  <div class="function-detail">
                    <h2>{{ currentFunction.title }}</h2>
                    <el-row class="function-meta">
                      <el-col :span="24">
                        <div class="meta-item">
                          <span class="label">创建时间：</span>
                          <span class="value">{{ formatDate(currentFunction.created_at) }}</span>
                        </div>
                      </el-col>
                    </el-row>

                    <h3>函数简介</h3>
                    <el-text size="small" class="mx-1">{{ currentFunction.description }}</el-text>

                    <h3>相关Tag</h3>
                    <div class="function-tags">
                      <el-tag 
                        v-for="tag in (currentFunction.tags || '').split(',')" 
                        :key="tag"
                        effect="plain"
                        class="tag-item"
                      >
                        {{ tag }}
                      </el-tag>
                    </div>

                    <h3>使用说明</h3>
                    <div class="function-usage">
                      <div class="usage-item">
                        <span class="label">接口路径：</span>
                        <span class="value">{{ currentFunction.path }}</span>
                      </div>
                      <div class="usage-item">
                        <span class="label">回调函数：</span>
                        <span class="value">{{ currentFunction.callbacks }}</span>
                      </div>
                      <div class="usage-item">
                        <span class="label">使用数据表：</span>
                        <span class="value">{{ currentFunction.use_tables }}</span>
                      </div>
                    </div>
                  </div>

                  <el-row class="function-stats">
                    <el-col :span="6">
                      <div class="stat-item">
                        <el-tooltip content="300星标" placement="top-start">
                          <el-icon><Star /></el-icon>
                        </el-tooltip>
                        <span>200</span>
                      </div>
                    </el-col>
                    <el-col :span="6">
                      <div class="stat-item">
                        <el-tooltip content="300打赏" placement="top-start">
                          <el-icon><Coin /></el-icon>
                        </el-tooltip>
                        <span>200</span>
                      </div>
                    </el-col>
                    <el-col :span="6">
                      <div class="stat-item">
                        <el-tooltip content="300收藏" placement="top-start">
                          <el-icon><CollectionTag /></el-icon>
                        </el-tooltip>
                        <span>200</span>
                      </div>
                    </el-col>
                    <el-col :span="6">
                      <div class="stat-item">
                        <el-tooltip content="300次运行" placement="top-start">
                          <el-icon><Cpu /></el-icon>
                        </el-tooltip>
                        <span>200</span>
                      </div>
                    </el-col>
                  </el-row>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="welcome-info">
                <h3>欢迎使用工作空间</h3>
                <p>请从左侧服务目录选择要操作的项目</p>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建服务目录对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="创建服务目录"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form label-width="80px">
        <el-form-item label="目录名称">
          <el-input v-model="newDirectory.title" placeholder="请输入目录显示名称" />
        </el-form-item>
        <el-form-item label="标识名">
          <el-input v-model="newDirectory.name" placeholder="请输入英文标识名，如excelConv" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitCreateDirectory"
            :loading="creatingDirectory"
          >
            创建
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 创建云函数对话框 -->
    <el-dialog
      v-model="createFuncDialogVisible"
      title="创建云函数"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form label-width="80px">
        <el-form-item label="函数名称">
          <el-input v-model="newFunc.title" placeholder="请输入函数显示名称" />
        </el-form-item>
        <el-form-item label="标识名">
          <el-input v-model="newFunc.name" placeholder="请输入英文标识名，如arrayDiff" />
        </el-form-item>
        <el-form-item label="函数描述">
          <el-input
            v-model="newFunc.desc"
            type="textarea"
            :rows="4"
            placeholder="请输入函数的详细描述和用途"
          />
        </el-form-item>
        <el-form-item label="函数代码">
          <el-input
            v-model="newFunc.code"
            type="textarea"
            :rows="6"
            placeholder="请输入函数代码（可选）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createFuncDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitCreateFunction"
            :loading="creatingFunc"
          >
            创建
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
/* 工作空间容器样式 */
.workspace-container {
  padding: 0;
  height: 100%;

  .workspace-layout {
    display: flex;
    height: 100%;

    .service-tree-container {
      width: 320px;
      background-color: #262b3c;
      border-right: 1px solid #3a3f50;
      overflow: auto;

      .tree-header {
        padding: 16px;
        border-bottom: 1px solid #3a3f50;

        h3 {
          margin: 0 0 12px 0;
          font-size: 16px;
          color: #fff;
        }

        .search-container {
          margin-top: 10px;

          .search-input {
            width: 100%;

            :deep(.el-input__inner) {
              background-color: #313650;
              border: 1px solid #3a3f50;
              color: #e0e0e0;

              &::placeholder {
                color: #a1a7b7;
              }
            }

            :deep(.el-input__prefix) {
              color: #a1a7b7;
            }
          }
        }

        .search-results {
          margin-top: 12px;
          background-color: #313650;
          border-radius: 4px;
          padding: 8px;
          max-height: 200px;
          overflow-y: auto;

          .search-result-title {
            color: #a1a7b7;
            font-size: 12px;
            margin-bottom: 8px;
          }

          .search-result-list {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .search-result-item {
              display: flex;
              align-items: center;
              padding: 8px;
              border-radius: 4px;
              cursor: pointer;

              &:hover {
                background-color: #3a3f50;
              }

              .node-icon-small {
                width: 14px;
                height: 14px;
                margin-right: 8px;
              }

              .search-result-name {
                font-size: 13px;
                color: #e0e0e0;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }
          }
        }
      }

      :deep(.el-tree) {
        background-color: transparent;
        color: #e0e0e0;

        .el-tree-node__content {
          height: 36px;

          &:hover {
            background-color: #313650;
          }
        }

        .is-current .el-tree-node__content {
          background-color: #313650;
          color: #3c9ae8;
        }
      }

      .tree-node {
        display: flex;
        align-items: center;
        width: 100%;

        .node-icon {
          width: 16px;
          height: 16px;
          margin-right: 8px;
        }

        .node-label {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .node-type {
          padding: 0 6px;
          background-color: #3C9AE8;
          color: #fff;
          border-radius: 4px;
          font-size: 12px;
          margin-left: 8px;
        }

        .node-children-count {
          font-size: 12px;
          color: #a1a7b7;
          margin-left: 4px;
        }

        .node-more-actions {
          margin-left: 4px;
          opacity: 1; /* 始终显示 */
          cursor: pointer;

          .more-icon {
            width: 16px;
            height: 16px;
          }
        }
      }

      .empty-tree {
        padding: 24px 0;
        display: flex;
        justify-content: center;
      }
    }

    .right-content {
      flex: 1;
      padding: 24px;

      .content-container {
        height: 100%;
        display: flex;
        flex-direction: column;

        .content-body {
          flex: 1;
          background-color: #262b3c;
          border-radius: 4px;
          padding: 24px;

          .function-container {
            display: flex;
            gap: 24px;

            .function-renderer {
              flex: 1;

              .function-signature {
                margin-bottom: 24px;

                .signature-title {
                  color: #a1a7b7;
                  font-size: 16px;
                  font-weight: 500;
                  margin-bottom: 16px;
                }

                pre {
                  margin: 0;
                  font-family: 'Fira Code', 'Consolas', monospace;
                  font-size: 18px;
                  line-height: 1.6;
                  color: #e0e0e0;
                  white-space: pre-wrap;
                  word-break: break-all;
                  background-color: transparent;
                  padding: 0;
                  text-align: left;

                  .signature-code {
                    display: block;
                    text-align: left;
                    .keyword {
                      color: #c678dd;  // 关键字颜色（func）
                    }
                    .function-name {
                      color: #61afef;  // 函数名颜色
                    }
                    .parameter {
                      color: #e0e0e0;  // 参数颜色
                    }
                    .arrow {
                      color: #c678dd;  // 箭头颜色
                    }
                    .return-type {
                      color: #98c379;  // 返回值类型颜色
                    }
                  }
                }
              }
            }

            .function-info {
              width: 300px;
              background-color: #262b3c;
              border-radius: 4px;
              padding: 20px;

              .info-header {
                .author-name {
                  font-size: 16px;
                  color: #e0e0e0;
                  font-weight: 500;
                }

                .author-desc {
                  margin: 6px 0;
                  color: #a1a7b7;
                  font-size: 13px;
                }

                .action-buttons {
                  margin-top: 12px;

                  .el-button {
                    background-color: #3c9ae8;
                    border-color: #3c9ae8;
                    color: #fff;
                    font-size: 13px;
                    padding: 8px 16px;
                    height: 32px;

                    &:hover {
                      background-color: #4aa8f5;
                      border-color: #4aa8f5;
                    }
                  }
                }
              }

              .el-divider {
                border-color: #3a3f50;
                margin: 16px 0;
              }

              .function-detail {
                h2 {
                  font-size: 18px;
                  color: #e0e0e0;
                  margin: 16px 0;
                  font-weight: 500;
                }

                .function-meta {
                  color: #a1a7b7;
                  font-size: 13px;
                  margin-bottom: 16px;

                  .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;

                    .label {
                      color: #a1a7b7;
                    }

                    .value {
                      color: #e0e0e0;
                    }

                    .el-icon {
                      font-size: 14px;
                      color: #3c9ae8;
                    }
                  }
                }

                h3 {
                  font-size: 14px;
                  color: #e0e0e0;
                  margin: 16px 0 8px;
                  font-weight: 500;
                }

                .el-text {
                  color: #a1a7b7;
                  font-size: 13px;
                  line-height: 1.5;
                }

                .function-tags {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 8px;
                  margin-top: 8px;

                  .el-tag {
                    background-color: #313650;
                    border-color: #3a3f50;
                    color: #a1a7b7;
                    font-size: 12px;
                    padding: 0 8px;
                    height: 24px;
                    line-height: 22px;
                    margin: 0;

                    &:hover {
                      background-color: #3a3f50;
                    }
                  }
                }

                .function-usage {
                  margin-top: 12px;
                  background-color: #313650;
                  border-radius: 4px;
                  padding: 12px;

                  .usage-item {
                    display: flex;
                    margin-bottom: 8px;
                    font-size: 13px;
                    line-height: 1.5;

                    &:last-child {
                      margin-bottom: 0;
                    }

                    .label {
                      color: #a1a7b7;
                      width: 80px;
                      flex-shrink: 0;
                    }

                    .value {
                      color: #e0e0e0;
                      flex: 1;
                      word-break: break-all;
                    }
                  }
                }
              }

              .function-stats {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #3a3f50;

                .stat-item {
                  display: flex;
                  align-items: center;
                  gap: 4px;
                  color: #a1a7b7;
                  font-size: 13px;

                  .el-icon {
                    font-size: 16px;
                    color: #3c9ae8;
                  }

                  span {
                    margin-left: 2px;
                  }
                }
              }
            }
          }

          .welcome-info {
            text-align: center;
            padding: 48px 0;

            h3 {
              font-size: 20px;
              margin-bottom: 16px;
              color: #fff;
            }

            p {
              color: #a1a7b7;
            }
          }
        }
      }
    }
  }
}

:deep(.danger-item) {
  color: #f56c6c;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
