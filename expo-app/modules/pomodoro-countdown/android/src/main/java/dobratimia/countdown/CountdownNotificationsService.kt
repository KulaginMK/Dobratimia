package dobratimia.countdown

import android.content.Context
import android.os.Build
import expo.modules.notifications.notifications.model.Notification
import expo.modules.notifications.notifications.model.NotificationBehaviorRecord
import expo.modules.notifications.service.NotificationsService
import expo.modules.notifications.service.delegates.ExpoPresentationDelegate
import expo.modules.notifications.service.interfaces.PresentationDelegate

/**
 * Приёмник expo-notifications с обратным отсчётом для таймера Pomodoro (src/features/reminders/schedule.ts).
 * Уведомление с полем countdownTo в data показывает отсчёт до этого момента — его ведёт сам Android,
 * приложению не нужно обновлять уведомление каждую секунду, — и исчезает, когда время вышло, даже если приложение закрыто.
 * Остальные уведомления показываются как обычно.
 */
class CountdownNotificationsService : NotificationsService() {
  override fun getPresentationDelegate(context: Context): PresentationDelegate = CountdownPresentationDelegate(context)
}

private class CountdownPresentationDelegate(context: Context) : ExpoPresentationDelegate(context) {
  override suspend fun createNotification(
    notification: Notification,
    notificationBehavior: NotificationBehaviorRecord?
  ): android.app.Notification {
    val built = super.createNotification(notification, notificationBehavior)
    val endsAt = notification.notificationRequest.content.body?.optLong("countdownTo") ?: 0L
    if (endsAt <= 0L) return built
    return android.app.Notification.Builder.recoverBuilder(context, built)
      .setWhen(endsAt)
      .setShowWhen(true)
      .setUsesChronometer(true)
      .setChronometerCountDown(true)
      .apply {
        // До Android 8 убрать само не получится: уберёт приложение при следующем изменении таймера.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          setTimeoutAfter(maxOf(1L, endsAt - System.currentTimeMillis()))
        }
      }
      .build()
  }
}
