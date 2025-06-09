import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:eye_app/providers/appointment_provider.dart';
import 'package:eye_app/screens/patient/appointment_details_screen.dart';
import 'package:intl/intl.dart';
import 'package:eye_app/utils/AppColor.dart';

class AppointmentsTab extends StatefulWidget {
  const AppointmentsTab({Key? key}) : super(key: key);

  @override
  State<AppointmentsTab> createState() => _AppointmentsTabState();
}

class _AppointmentsTabState extends State<AppointmentsTab> {
  String _formatDate(String dateStr) {
    final date = DateTime.parse(dateStr);
    return DateFormat('MMM dd, yyyy').format(date.toLocal());
  }

  String _formatTime(String timeStr) {
    final time = DateFormat('HH:mm:ss').parse(timeStr);
    return DateFormat('HH:mm').format(time);
  }

  @override
  void initState() {
    super.initState();
    // Fetch appointments when the tab is first loaded
    Future.microtask(() =>
        Provider.of<AppointmentProvider>(context, listen: false)
            .fetchPatientAppointments());
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            backgroundColor,
            backgroundColor.withOpacity(0.8),
          ],
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Your Appointments',
              style: GoogleFonts.poppins(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: textPrimaryColor,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'View and manage your appointments',
              style: GoogleFonts.poppins(
                fontSize: 16,
                color: textSecondaryColor,
              ),
            ),
            const SizedBox(height: 24),
            Expanded(
              child: Consumer<AppointmentProvider>(
                builder: (context, appointmentProvider, child) {
                  if (appointmentProvider.isLoading) {
                    return const Center(
                      child: CircularProgressIndicator(),
                    );
                  }

                  if (appointmentProvider.error != null) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.error_outline,
                            size: 48,
                            color: errorColor,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            appointmentProvider.error!,
                            style: GoogleFonts.poppins(
                              color: errorColor,
                              fontSize: 16,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    );
                  }

                  if (appointmentProvider.appointments.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.calendar_today,
                            size: 64,
                            color: textSecondaryColor.withOpacity(0.5),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'No appointments found',
                            style: GoogleFonts.poppins(
                              fontSize: 18,
                              color: textSecondaryColor,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Your upcoming appointments will appear here',
                            style: GoogleFonts.poppins(
                              fontSize: 14,
                              color: textSecondaryColor.withOpacity(0.7),
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    );
                  }

                  return RefreshIndicator(
                    onRefresh: () =>
                        appointmentProvider.fetchPatientAppointments(),
                    child: ListView.builder(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      itemCount: appointmentProvider.appointments.length,
                      itemBuilder: (context, index) {
                        final appointment =
                            appointmentProvider.appointments[index];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 16),
                          elevation: 2,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: InkWell(
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) =>
                                      AppointmentDetailsScreen(
                                    appointmentId: appointment['id'].toString(),
                                  ),
                                ),
                              );
                            },
                            borderRadius: BorderRadius.circular(16),
                            child: Padding(
                              padding: const EdgeInsets.all(20),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          'Appointment #${appointment['id']}',
                                          style: GoogleFonts.poppins(
                                            fontSize: 18,
                                            fontWeight: FontWeight.w600,
                                            color: textPrimaryColor,
                                          ),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 12,
                                          vertical: 6,
                                        ),
                                        decoration: BoxDecoration(
                                          color: _getStatusColor(
                                                  appointment['status'])
                                              .withOpacity(0.1),
                                          borderRadius:
                                              BorderRadius.circular(20),
                                        ),
                                        child: Text(
                                          appointment['status'],
                                          style: GoogleFonts.poppins(
                                            color: _getStatusColor(
                                                appointment['status']),
                                            fontSize: 12,
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 16),
                                  _buildInfoRow(
                                    Icons.calendar_today,
                                    _formatDate(
                                        appointment['appointment_date']),
                                  ),
                                  const SizedBox(height: 12),
                                  _buildInfoRow(
                                    Icons.access_time,
                                    '${_formatTime(appointment['time_slot']['start_time'])} - ${_formatTime(appointment['time_slot']['end_time'])}',
                                  ),
                                  const SizedBox(height: 12),
                                  _buildInfoRow(
                                    Icons.person,
                                    'Dr. ${appointment['doctor']['name']}',
                                  ),
                                  const SizedBox(height: 12),
                                  _buildInfoRow(
                                    Icons.medical_services,
                                    appointment['doctor']['specialization'],
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String text) {
    return Row(
      children: [
        Icon(
          icon,
          size: 20,
          color: textSecondaryColor,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            text,
            style: GoogleFonts.poppins(
              fontSize: 14,
              color: textSecondaryColor,
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return infoColor;
      case 'completed':
        return successColor;
      case 'cancelled':
        return errorColor;
      default:
        return textSecondaryColor;
    }
  }
}
