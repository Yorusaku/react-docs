import { NotificationListRes } from '@/types/api'
import { request } from '@/utils/request'

export const fetchNotifications = async (): Promise<NotificationListRes> => {
    return await request.get('/notifications')
}

export const markNotificationRead = async (notificationId: string) => {
    return await request.patch(`/notifications/${notificationId}/read`)
}

export const markAllNotificationsRead = async () => {
    return await request.patch('/notifications/read-all')
}
