import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:eye_app/providers/notification_provider.dart';

class NotificationBadge extends StatelessWidget {
  final Widget child;
  final double? size;
  final Color? badgeColor;
  final Color? textColor;

  const NotificationBadge({
    Key? key,
    required this.child,
    this.size,
    this.badgeColor,
    this.textColor,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Consumer<NotificationProvider>(
      builder: (context, notificationProvider, _) {
        final unreadCount = notificationProvider.unreadCount;

        return Stack(
          children: [
            child,
            if (unreadCount > 0)
              Positioned(
                right: 8,
                top: 8,
                child: Container(
                  padding: const EdgeInsets.all(2),
                  decoration: BoxDecoration(
                    color: badgeColor ?? Colors.red,
                    borderRadius: BorderRadius.circular(size ?? 10),
                  ),
                  constraints: BoxConstraints(
                    minWidth: size ?? 16,
                    minHeight: size ?? 16,
                  ),
                  child: Text(
                    unreadCount > 99 ? '99+' : '$unreadCount',
                    style: TextStyle(
                      color: textColor ?? Colors.white,
                      fontSize: (size ?? 16) * 0.6,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
          ],
        );
      },
    );
  }
}
