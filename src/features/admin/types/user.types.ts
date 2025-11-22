/**
 * Types for User Management
 * 
 * Interfaces and types for Global Admins, Operational Admins, and Washers
 */

export enum UserRole {
  GLOBAL_ADMIN = 'GLOBAL_ADMIN',
  OPERATIONAL_ADMIN = 'OPERATIONAL_ADMIN',
  WASHER = 'WASHER',
}

/**
 * Base User interface with common fields
 */
export interface BaseUser {
  id: number
  email: string
  full_name: string
  phone: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  last_login: string | null
}

/**
 * Global Administrator
 */
export interface GlobalAdmin extends BaseUser {
  role: UserRole.GLOBAL_ADMIN
}

/**
 * Operational Administrator
 */
export interface OperationalAdmin extends BaseUser {
  role: UserRole.OPERATIONAL_ADMIN
}

/**
 * Washer (Car Wash Worker)
 */
export interface Washer extends BaseUser {
  role: UserRole.WASHER
  commission_percentage: number
}

/**
 * Union type for any user
 */
export type User = GlobalAdmin | OperationalAdmin | Washer

/**
 * Request payload for creating a Global Admin
 */
export interface CreateGlobalAdminRequest {
  email: string
  password: string
  full_name: string
  phone?: string
}

/**
 * Request payload for creating an Operational Admin
 */
export interface CreateOperationalAdminRequest {
  email: string
  password: string
  full_name: string
  phone?: string
}

/**
 * Request payload for creating a Washer
 */
export interface CreateWasherRequest {
  email: string
  password: string
  full_name: string
  phone?: string
  commission_percentage?: number
}

/**
 * Request payload for updating a Global Admin
 */
export interface UpdateGlobalAdminRequest {
  full_name?: string
  phone?: string
  is_active?: boolean
}

/**
 * Request payload for updating an Operational Admin
 */
export interface UpdateOperationalAdminRequest {
  full_name?: string
  phone?: string
  is_active?: boolean
}

/**
 * Request payload for updating a Washer
 */
export interface UpdateWasherRequest {
  full_name?: string
  phone?: string
  commission_percentage?: number
  is_active?: boolean
}

/**
 * Generic create request type
 */
export type CreateUserRequest =
  | CreateGlobalAdminRequest
  | CreateOperationalAdminRequest
  | CreateWasherRequest

/**
 * Generic update request type
 */
export type UpdateUserRequest =
  | UpdateGlobalAdminRequest
  | UpdateOperationalAdminRequest
  | UpdateWasherRequest
