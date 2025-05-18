export type RoleType = '' | '*' | 'admin' | 'saler' | 'leader' | 'writer'
export interface UserState {
  username?: string
  createdDate?:number
   role: RoleType
  // avatar?: string
  // job?: string
  // organization?: string
  // location?: string
  // email?: string
  // introduction?: string
  // personalWebsite?: string
  // jobName?: string
  // organizationName?: string
  // locationName?: string
  // phone?: string
  // registrationDate?: string
  // accountId?: string
  // certification?: number
 
}
