// lib/screens/splash_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:eye_app/providers/auth_provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:eye_app/utils/AppColor.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({Key? key}) : super(key: key);

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> {
  bool _isChecking = true;

  @override
  void initState() {
    super.initState();
    // Delay the auth check slightly to ensure the splash screen is visible
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkAuthentication();
    });
  }

  Future<void> _checkAuthentication() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    await authProvider.checkAuth();

    // Set a minimum display time for the splash screen (1.5 seconds)
    await Future.delayed(const Duration(milliseconds: 1500));

    if (mounted) {
      setState(() {
        _isChecking = false;
      });
    }
  }

  void _navigateToLogin() {
    Navigator.pushReplacementNamed(context, '/login');
  }

  void _navigateToDashboard() {
    Navigator.pushReplacementNamed(context, '/patient_dashboard');
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: primaryGradient,
          ),
        ),
        child: SafeArea(
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // App logo with animation
                AnimatedContainer(
                  duration: const Duration(milliseconds: 500),
                  curve: Curves.easeInOut,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.medical_services,
                    size: 100,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 32),

                // App name with animation
                AnimatedOpacity(
                  duration: const Duration(milliseconds: 500),
                  opacity: _isChecking ? 0 : 1,
                  child: Text(
                    'Eye Clinic',
                    style: GoogleFonts.poppins(
                      color: Colors.white,
                      fontSize: 36,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),

                const SizedBox(height: 12),

                // Tagline with animation
                AnimatedOpacity(
                  duration: const Duration(milliseconds: 500),
                  opacity: _isChecking ? 0 : 1,
                  child: Text(
                    'Your Vision, Our Priority',
                    style: GoogleFonts.poppins(
                      color: Colors.white.withOpacity(0.9),
                      fontSize: 18,
                    ),
                  ),
                ),

                const SizedBox(height: 48),

                // Loading indicator or buttons
                _isChecking
                    ? const CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      )
                    : AnimatedOpacity(
                        duration: const Duration(milliseconds: 500),
                        opacity: _isChecking ? 0 : 1,
                        child: Column(
                          children: [
                            if (authProvider.isAuthenticated)
                              _buildButton(
                                onPressed: _navigateToDashboard,
                                text: 'Continue',
                                icon: Icons.arrow_forward,
                              )
                            else
                              _buildButton(
                                onPressed: _navigateToLogin,
                                text: 'Get Started',
                                icon: Icons.login,
                              ),
                          ],
                        ),
                      ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildButton({
    required VoidCallback onPressed,
    required String text,
    required IconData icon,
  }) {
    return Container(
      width: 200,
      height: 50,
      decoration: BoxDecoration(
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.white,
          foregroundColor: primaryColor,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(25),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              text,
              style: GoogleFonts.poppins(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(width: 8),
            Icon(icon),
          ],
        ),
      ),
    );
  }
}
