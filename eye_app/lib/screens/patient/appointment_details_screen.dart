import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:eye_app/screens/patient/tabs/medical_records_tab.dart';
import 'package:eye_app/screens/patient/tabs/payments_tab.dart';
import 'package:eye_app/screens/patient/tabs/feedback_tab.dart';

class AppointmentDetailsScreen extends StatefulWidget {
  final String appointmentId;

  const AppointmentDetailsScreen({
    Key? key,
    required this.appointmentId,
  }) : super(key: key);

  @override
  State<AppointmentDetailsScreen> createState() =>
      _AppointmentDetailsScreenState();
}

class _AppointmentDetailsScreenState extends State<AppointmentDetailsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Appointment Details',
          style: GoogleFonts.poppins(
            fontWeight: FontWeight.w600,
          ),
        ),
        bottom: TabBar(
          controller: _tabController,
          tabs: [
            Tab(
              icon: const Icon(Icons.medical_services),
              text: 'Medical Records',
            ),
            Tab(
              icon: const Icon(Icons.payment),
              text: 'Payments',
            ),
            Tab(
              icon: const Icon(Icons.feedback),
              text: 'Feedback',
            ),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          MedicalRecordsTab(appointmentId: widget.appointmentId),
          PaymentsTab(appointmentId: widget.appointmentId),
          FeedbackTab(appointmentId: widget.appointmentId),
        ],
      ),
    );
  }
}
