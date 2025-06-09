// lib/main.dart
import 'package:flutter/material.dart';
import 'package:eye_app/screens/auth/login_screen.dart';
import 'package:provider/provider.dart';
import 'package:eye_app/providers/auth_provider.dart';
import 'package:eye_app/providers/doctor_provider.dart';
import 'package:eye_app/providers/appointment_provider.dart';
import 'package:eye_app/screens/auth/register_screen.dart';
import 'package:eye_app/screens/welcome_screen.dart';
import 'package:eye_app/screens/patient/patient_dashboard.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => DoctorProvider()),
        ChangeNotifierProvider(create: (_) => AppointmentProvider()),
      ],
      child: Consumer<AuthProvider>(
        builder: (context, authProvider, _) {
          return MaterialApp(
            title: 'Eye Clinic',
            debugShowCheckedModeBanner: false,
            theme: ThemeData(
              colorScheme: ColorScheme.fromSeed(
                seedColor: const Color(0xFF2196F3),
                primary: const Color(0xFF2196F3),
                secondary: const Color(0xFF03A9F4),
                surface: Colors.white,
                background: const Color(0xFFF5F5F5),
              ),
              useMaterial3: true,
              appBarTheme: const AppBarTheme(
                centerTitle: true,
                elevation: 0,
              ),
              elevatedButtonTheme: ElevatedButtonThemeData(
                style: ElevatedButton.styleFrom(
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8)),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
            routes: {
              '/login': (context) => const LoginScreen(),
              '/register': (context) => const RegisterScreen(),
              '/patient_dashboard': (context) => const PatientDashboard(),
            },
            home: const WelcomeScreen(),
          );
        },
      ),
    );
  }
}
