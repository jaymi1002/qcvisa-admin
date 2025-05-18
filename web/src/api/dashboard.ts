import type { TableData } from '@arco-design/web-vue/es/table/interface'
import axios from 'axios'

export interface ContentDataRecord {
  x: string
  y: number
}

export function queryContentData() {
  return axios.get<ContentDataRecord[]>('/api/content-data')
}

export interface PopularRecord {
  key: number
  clickNumber: string
  title: string
  increases: number
}

export function queryPopularList(params: { type: string }) {
  return axios.get<TableData[]>('/api/popular/list', { params })
}


export function getNewOrderCode() {
  return  axios.get<string>('/api/order/getNewOrderCode');
}

export function createOrder(params) {
  return axios.post('/api/order/create', params)
}

export function getOrderList(params = {}) {
  return axios.get('/api/order/list', { params})
}

export function updateOrder(id, params = {}) {
  return axios.put(`/api/order/${id}`, params)
}

export function updateOrderStatus(id, params = {}) {
  return axios.post(`/api/order/updateStatus/${id}`, params)
}

export function deleteOrder(id) {
  return axios.delete(`/api/order/${id}`)
}

export function getOrder(id) {
  return axios.get(`/api/order/${id}`)
}


export function getRankMoney(params) {
  return axios.get('/api/order/rank/money', {params});
}

export function getRankCount(params) {
  return axios.get('/api/order/rank/count', {params});
}