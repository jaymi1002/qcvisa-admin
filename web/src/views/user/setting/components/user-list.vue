<template>
  <a-card :bordered="false">
    <a-button type="primary" style="margin-bottom: 16px;" @click="visible = true">
      <template #icon>
        <icon-plus />
      </template>
      添加用户
    </a-button>
    <a-table :columns="columns" :data="userList">
      <template #role="{ rowIndex, record }">
        {{ roleList.find(item => item.value === record.role)?.label }}
      </template>
      <template #operator="{ rowIndex, record }">
        <a-button status="danger" @click="removeUser(record.id)">删除</a-button>
      </template>
    </a-table>
  </a-card>
  <a-modal v-model:visible="visible" title="添加用户" @cancel="handleCancel" @ok="handleOk" @before-ok="handleBeforeOk">
    <a-form :model="formData">
      <a-form-item field="username" label="用户名">
        <a-input v-model="formData.username" />
      </a-form-item>
      <a-form-item field="password" label="密码">
        <a-input disabled v-model="formData.password" />
      </a-form-item>
      <a-form-item field="role" label="用户角色">
        <a-select v-model="formData.role">
          <a-option value="leader">领导</a-option>
          <a-option value="saler">销售</a-option>
          <a-option value="writer">文案</a-option>
        </a-select>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, reactive} from 'vue'
import { useUserStore } from '@/store'
import { registerUser, getUserList, deleteUser } from '@/api/user'
import { Message } from '@arco-design/web-vue'

const userStore = useUserStore()
const visible = ref(false)
const formData = reactive({
  username: '',
  password: '123456',
  role: '',
})
const columns = [
  {
    title: '用户名',
    dataIndex: 'username',
  },
  {
    title: '用户角色',
    dataIndex: 'role',
    slotName:'role',
  },
  {
    title: '创建时间',
    dataIndex: 'createdDate',
  },
  {
    title: '操作',
    dataIndex: 'operator',
    slotName: 'operator'
  }
]
const roleList = [
{
  value: 'admin',
  label: '管理员',
},{
  value: 'leader',
  label: '领导',
},{
  value: 'saler',
  label: '销售',
},{
  value: 'writer',
  label: '文案',
}]
const userList = ref([]);
const getUserTableData = async () => {
  const { data } = await getUserList();
  userList.value = data;
}
const handleOk = async () => {
  try {
    await registerUser(formData)
    Message.success(`创建成功 ${formData.username}`)
    getUserTableData();
  }catch (e) {
    visible.value = true;
  }
  
}


getUserTableData();

const removeUser = async (id) => {
  await deleteUser(id);
  getUserTableData();
}
</script>

<style scoped lang="less">
.arco-card {
  padding: 14px 0 4px 4px;
  border-radius: 4px;
}
:deep(.arco-avatar-trigger-icon-button) {
  width: 32px;
  height: 32px;
  line-height: 32px;
  background-color: #e8f3ff;
  .arco-icon-camera {
    margin-top: 8px;
    color: rgb(var(--arcoblue-6));
    font-size: 14px;
  }
}
</style>
