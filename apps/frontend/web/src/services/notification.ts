import { MarkAllNotificationReadRes, MarkNotificationReadRes, NotificationListRes } from '@/types/api'
import { request } from '@/utils/request'

export const fetchNotifications = async (params?: {
    status?: 'all' | 'unread'
    cursor?: string
    limit?: number
}): Promise<NotificationListRes> => {
    return await request.get('/notifications', { params })
}

export const markNotificationRead = async (notificationId: string): Promise<MarkNotificationReadRes> => {
    return await request.patch(`/notifications/${notificationId}/read`)
}

export const markAllNotificationsRead = async (): Promise<MarkAllNotificationReadRes> => {
    return await request.patch('/notifications/read-all')
}
