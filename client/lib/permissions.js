'use client';

import React from 'react';
import { useAuth } from './auth';

// Atomic Permission Name Constants
export const PERMISSIONS = {
  REPORT_VIEW: 'report.view',
  HALL_MANAGE: 'hall.manage',
  CATEGORY_MANAGE: 'category.manage',
  VENDOR_MANAGE: 'vendor.manage',
  STAFF_MANAGE: 'staff.manage',
  BOOKING_VIEW: 'booking.view',
  BOOKING_CREATE: 'booking.create',
  BOOKING_EDIT: 'booking.edit',
  BOOKING_DELETE: 'booking.delete',
  PAYMENT_VIEW: 'payment.view',
  PAYMENT_CREATE: 'payment.create',
  STAFF_VIEW_OWN: 'staff.view_own_jobs',
  VENDOR_VIEW_OWN: 'vendor.view_own',
  RBAC_MANAGE: 'rbac.manage',
};

/**
 * Declarative UI Authorization Guard: <Can permission="booking.create"> ... </Can>
 */
export function Can({ permission, fallback = null, children }) {
  const { permissions = [] } = useAuth();
  const hasPermission = Array.isArray(permissions) && permissions.includes(permission);

  if (!hasPermission) return fallback;
  return <>{children}</>;
}
