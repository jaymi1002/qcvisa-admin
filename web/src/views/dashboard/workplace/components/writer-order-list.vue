<template>
  <a-spin :loading="loading" style="width: 100%">
    <a-card class="general-card" :header-style="{ paddingBottom: '0' }" :body-style="{ padding: '17px 20px 21px 20px' }">
      <template #title>
        订单认领
      </template>
      <template #extra>
        <!-- <a-link>{{ $t('workplace.viewMore') }}</a-link> -->
      </template>
      <a-space direction="vertical" :size="10" fill>
        <a-row  justify="space-between">
          <a-row align="center">
            <a-radio-group v-model:model-value="type" type="button" @change="typeChange">
              <a-radio value="TODO">
                  待认领
              </a-radio>
              <a-radio value="DOING">
                  我认领的
              </a-radio>
              <a-radio value="DONE">
                  已完成
              </a-radio>
            </a-radio-group>
          </a-row>
          <a-row align="center">
            <a-button type="primary" style="margin-left: 12px;" @click="exportOrder">导出</a-button>
          </a-row>
        </a-row>
        <a-row align="center">
          <span>关键字搜索：</span>
          <a-input style="width: 250px" placeholder="支持标题、客户、订单编码搜索" v-model="state.keyword"></a-input>
          <span style="margin-left: 24px;">登记日期：</span>
          <a-range-picker
            allow-clear
            v-model="state.registrationValue"
            value-format="timestamp"
            @change="onDateChange"
            style="width: 254px;"
          />
          <template v-if="type === 'DOING' || type === 'DONE'">
            <span style="margin-left: 24px;">认领日期：</span>
            <a-range-picker
              allow-clear
              v-model="state.recipientValue"
              value-format="timestamp"
              @change="onDateChange"
              style="width: 254px;"
            />
          </template>
          <template v-if="type === 'DONE'">
            <span style="margin-left: 24px;">完成日期：</span>
            <a-range-picker
              allow-clear
              v-model="state.completeValue"
              value-format="timestamp"
              @change="onDateChange"
              style="width: 254px;"
            />
          </template>
          <a-button style="margin-left: 24px;" type="primary" @click="fetchData">搜索</a-button>
        </a-row>
        
        <a-table :data="renderList" :pagination="true" :bordered="false"  size="small" :scroll="{ x: '140%' }">
          <template #columns>
            <a-table-column ellipsis tooltip fixed="left" title="订单编号" data-index="orderCode">
            </a-table-column>
            <a-table-column ellipsis tooltip title="标题" data-index="title"></a-table-column>
            <a-table-column ellipsis tooltip title="登记日期" data-index="registrationDate" v-if="type ==='TODO'">
              <template #cell="{ record }">
                {{ moment(record.registrationDate).format('YYYY-MM-DD') }}
              </template>
            </a-table-column>
            <a-table-column ellipsis tooltip title="完成日期" data-index="completeDate" v-if="type ==='DONE'">
              <template #cell="{ record }">
                {{ record.completeDate && moment(record.completeDate).format('YYYY-MM-DD') }}
              </template>
            </a-table-column>
            <a-table-column ellipsis tooltip title="认领日期" data-index="recipientDate" v-if="type ==='DOING' || type === 'DONE'">
              <template #cell="{ record }">
                {{ record.recipientDate && moment(record.recipientDate).format('YYYY-MM-DD') }}
              </template>
            </a-table-column>
            <a-table-column ellipsis tooltip title="客户名称" data-index="customer"></a-table-column>
            <a-table-column ellipsis tooltip title="办理国家" data-index="country"></a-table-column>
            <a-table-column ellipsis tooltip title="办理类型" data-index="type"></a-table-column>
            <a-table-column ellipsis tooltip title="签单金额" data-index="orderMoney"></a-table-column>
            <a-table-column ellipsis tooltip title="到账金额" data-index="receivedMoney"></a-table-column>
            <a-table-column ellipsis tooltip title="咨询老师" data-index="creator"></a-table-column>
            <a-table-column ellipsis tooltip title="办理状态" data-index="status">
              <template #cell="{ record }">
                {{ getStatusText(record.status) }}
              </template>
            </a-table-column>
            <a-table-column ellipsis tooltip title="操作费" data-index="operateMoney"></a-table-column>
            <a-table-column ellipsis tooltip title="登记月份" data-index="registrationDate">
              <template #cell="{ record }">
                {{ moment(record.registrationDate).format('YYYY-MM') }}
              </template>
            </a-table-column>
            <a-table-column ellipsis tooltip title="备注" data-index="comment"></a-table-column>
            <a-table-column title="操作" width="220" fixed="right" data-index="operator">
              <template #cell="{ record }">
                <a-space>
                  <a-button type="text" @click="review(record)">查看</a-button>
                  <a-button v-if="record.status === 'TODO'" type="text" status="danger" @click="doIt(record)" >认领</a-button>
                  <a-button v-if="record.status === 'DOING'" type="text" status="danger" @click="done(record)" >完成</a-button>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-space>
    </a-card>
  </a-spin>
</template>

<script lang="ts" setup>
import { ref,computed, reactive} from 'vue'
import moment from 'moment';
import useLoading from '@/hooks/loading'
import { getOrderList, createOrder, updateOrder, deleteOrder, updateOrderStatus } from '@/api/dashboard'
import type { TableData } from '@arco-design/web-vue/es/table/interface'
import { Message } from '@arco-design/web-vue';
import type { RouteMeta } from 'vue-router'
import { RouteRecordRaw, useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store'
import { getStatusText } from '@/utils/const'
import Order from '../../order/components/order.vue';

const userStore = useUserStore()
const userInfo = computed(() => {
  return {
    username: userStore.username,
  }
});
const username = computed(() => {
  return userStore.username;
})

const state = reactive({
  registrationValue: [],
  recipientValue: [],
  completeValue: [],
  keyword:''
});

const router = useRouter()
const route = useRoute()
const type = ref('DOING')
const { loading, setLoading } = useLoading()
const renderList = ref<TableData[]>()
const currentOrderData = ref();
const visible = ref(false);
const orderView = ref(true);
const orderRef = ref();

const fetchData = async () => {
  const contentType = type.value;
  let params = {...state};
  if(params.registrationValue && params.registrationValue.length) {
    const [startDate, endDate] =  params.registrationValue;
    params = {...params, startDate, endDate: endDate + 86399999};
    delete params.registrationValue;
  }
  if(params.recipientValue && params.recipientValue.length) {
    const [recipientStartDate, recipientEndDate] =  params.recipientValue;
    params = {...params, recipientStartDate, recipientEndDate: recipientEndDate + 86399999};
    delete params.recipientValue;
  }
  if(params.completeValue && params.completeValue.length) {
    const [completeStartDate, completeEndDate] =  params.completeValue;
    params = {...params, completeStartDate, completeEndDate : completeEndDate + 86399999};
    delete params.completeValue;
  }
  if(!params.keyword){
    delete params.keyword
  }
  try {
    setLoading(true)
    if(contentType === 'TODO') {
      const { data } = await getOrderList({
        status: 'TODO',
        ...params
      });
      renderList.value = data
    }
    if(contentType === 'DOING') {
      const { data } = await getOrderList({
        status: 'DOING',
        recipient: userInfo.value.username,
        ...params
      });
      renderList.value = data
    }

    if(contentType === 'DONE') {
      const { data } = await getOrderList({
        status: 'DONE',
        recipient: userInfo.value.username,
        ...params
      });
      renderList.value = data
    }
    
  } catch (err) {
    // you can report use errorHandler or other
  } finally {
    setLoading(false)
  }
}
const typeChange = (contentType: string) => {
  fetchData();
  if(contentType === 'TODO') {
    state.recipientValue = [];
    state.completeValue = [];
  }
  if(contentType === 'DOING') {
    state.completeValue = [];
  }
}
fetchData();

const review = (data) => {
  router.push( {
    path: '/dashboard/order',
    query: {
      id: data.id,
      isView: 'true'
    },

  });
}
const doIt = async (data) => {
  await updateOrderStatus(data.id, { status: 'DOING'});
  fetchData();
}

const done = async (data) => {
  await updateOrderStatus(data.id, { status: 'DONE'});
  fetchData();
}

const exportOrder = async () => {
  const contentType = type.value;
  let api = '/api/order/export';
  if(contentType === 'TODO') {
    api += `?status=TODO`;
  }
  if(contentType === 'DOING') {
    api += `?status=DOING&recipient=${userInfo.value.username}`;
  }
  if(contentType === 'DONE') {
    api += `?status=DONE&recipient=${userInfo.value.username}`;
  }
  if(state.registrationValue && state.registrationValue.length) {
    const [startDate, endDate] =  state.registrationValue;
    api += `&startDate=${startDate}&endDate=${endDate + 86399999}`;
  }

  if(state.recipientValue && state.recipientValue.length) {
    const [startDate, endDate] =  state.recipientValue;
    api += `&recipientStartDate=${startDate}&recipientEndDate=${endDate + 86399999}`;
  }

  if(state.completeValue && state.completeValue.length) {
    const [startDate, endDate] =  state.completeValue;
    api += `&completeStartDate=${startDate}&completeEndDate=${endDate + 86399999}`;
  }
  if(state.keyword) {
    const { keyword } = state;
    api += `&keyword=${keyword}`;
  }
  window.open(api);
}

const onDateChange = () =>{
  fetchData();
}
</script>

<style scoped lang="less">
.general-card {
  min-height: 395px;
}
:deep(.arco-table-tr) {
  height: 44px;
  .arco-typography {
    margin-bottom: 0;
  }
}
.increases-cell {
  display: flex;
  align-items: center;
  span {
    margin-right: 4px;
  }
}
</style>
