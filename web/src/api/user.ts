import { UserState } from '@/store/modules/user/types'
import axios from 'axios'
import type { RouteRecordNormalized } from 'vue-router'

export interface LoginData {
  username: string
  password: string
}

export interface LoginRes {
  token: string
}
export function login(data: LoginData) {
  return axios.post<LoginRes>('/api/user/login', data)
}

export function logout() {
  return axios.post<LoginRes>('/api/user/logout')
}

export function getUserInfo() {
  return axios.get<UserState>('/api/user/current')
}

export function getMenuList() {
  return axios.post<RouteRecordNormalized[]>('/api/user/menu')
}

export interface UserInfo extends LoginData {
  type: string;
}
export function registerUser(param: UserInfo) {
  return axios.post('/api/user/register', param)
}

export function getUserList() {
  return axios.get<UserState[]>('/api/user/list')
}

export function deleteUser(id) {
  return axios.delete(`/api/user/${id}`)
} 