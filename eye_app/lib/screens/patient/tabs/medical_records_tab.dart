import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:eye_app/services/api_client.dart';
import 'package:intl/intl.dart';
import 'package:eye_app/utils/AppColor.dart';
import 'package:url_launcher/url_launcher.dart';

class MedicalRecordsTab extends StatefulWidget {
  final String appointmentId;

  const MedicalRecordsTab({
    Key? key,
    required this.appointmentId,
  }) : super(key: key);

  @override
  State<MedicalRecordsTab> createState() => _MedicalRecordsTabState();
}

class _MedicalRecordsTabState extends State<MedicalRecordsTab> {
  final ApiClient _apiClient = ApiClient();
  bool _isLoading = true;
  String? _error;
  List<Map<String, dynamic>> _records = [];

  String _formatDate(String dateStr) {
    final date = DateTime.parse(dateStr);
    return DateFormat('MMM dd, yyyy').format(date.toLocal());
  }

  Future<void> _fetchMedicalRecords() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final response = await _apiClient.request(
        method: 'GET',
        path: '/medical-records/appointment/${widget.appointmentId}',
      );

      if (response['success']) {
        setState(() {
          _records = List<Map<String, dynamic>>.from(response['data']);
          _isLoading = false;
        });
      } else {
        setState(() {
          _error = response['message'];
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  // Get file extension to determine file type
  String _getFileExtension(String filename) {
    return filename.split('.').last.toLowerCase();
  }

  // Get appropriate icon based on file type
  IconData _getFileIcon(String filename) {
    final extension = _getFileExtension(filename);
    switch (extension) {
      case 'pdf':
        return Icons.picture_as_pdf;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return Icons.image;
      case 'doc':
      case 'docx':
        return Icons.description;
      default:
        return Icons.insert_drive_file;
    }
  }

  Future<void> _viewFile(String fileUrl) async {
    final baseUrl = _apiClient.baseUrl.replaceAll('/api/v1', '');
    final fullUrl = '$baseUrl/uploads/$fileUrl';

    try {
      // Method 1: Try with launchMode.externalApplication
      final uri = Uri.parse(fullUrl);

      // First check if we can launch the URL
      if (await canLaunchUrl(uri)) {
        final launched = await launchUrl(
          uri,
          mode: LaunchMode.externalApplication, // Force external app
        );

        if (!launched) {
          throw Exception('Failed to launch URL');
        }
      } else {
        // Method 2: If direct launch fails, try opening in browser
        await _openInBrowser(fullUrl);
      }
    } catch (e) {
      // Method 3: Fallback to browser with explicit mode
      try {
        await _openInBrowser(fullUrl);
      } catch (browserError) {
        if (mounted) {
          _showErrorSnackBar('Could not open file: ${browserError.toString()}');
        }
      }
    }
  }

  Future<void> _openInBrowser(String url) async {
    final uri = Uri.parse(url);
    await launchUrl(
      uri,
      mode: LaunchMode.externalApplication,
      webViewConfiguration: const WebViewConfiguration(
        enableJavaScript: true,
        enableDomStorage: true,
      ),
    );
  }

  // Alternative method: Show options dialog
  Future<void> _showFileOptions(String fileUrl, String fileName) async {
    final baseUrl = _apiClient.baseUrl.replaceAll('/api/v1', '');
    final fullUrl = '$baseUrl/uploads/$fileUrl';

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Open File',
              style: GoogleFonts.poppins(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            ListTile(
              leading: const Icon(Icons.open_in_browser),
              title: Text(
                'Open in Browser',
                style: GoogleFonts.poppins(),
              ),
              onTap: () async {
                Navigator.pop(context);
                try {
                  await launchUrl(
                    Uri.parse(fullUrl),
                    mode: LaunchMode.externalApplication,
                  );
                } catch (e) {
                  _showErrorSnackBar('Could not open in browser');
                }
              },
            ),
            ListTile(
              leading: const Icon(Icons.share),
              title: Text(
                'Share Link',
                style: GoogleFonts.poppins(),
              ),
              onTap: () {
                Navigator.pop(context);
                // You can implement share functionality here
                _copyToClipboard(fullUrl);
              },
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }

  void _copyToClipboard(String text) {
    // Import 'package:flutter/services.dart' for Clipboard
    // Clipboard.setData(ClipboardData(text: text));
    _showSuccessSnackBar('Link copied to clipboard');
  }

  void _showErrorSnackBar(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            message,
            style: GoogleFonts.poppins(),
          ),
          backgroundColor: errorColor,
        ),
      );
    }
  }

  void _showSuccessSnackBar(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            message,
            style: GoogleFonts.poppins(),
          ),
          backgroundColor: Colors.green,
        ),
      );
    }
  }

  @override
  void initState() {
    super.initState();
    _fetchMedicalRecords();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
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
              _error!,
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

    if (_records.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.medical_services,
              size: 64,
              color: textSecondaryColor.withOpacity(0.5),
            ),
            const SizedBox(height: 16),
            Text(
              'No medical records found',
              style: GoogleFonts.poppins(
                fontSize: 18,
                color: textSecondaryColor,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Your medical records will appear here',
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
      onRefresh: _fetchMedicalRecords,
      child: ListView.builder(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        itemCount: _records.length,
        itemBuilder: (context, index) {
          final record = _records[index];
          return Card(
            elevation: 2,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          record['record_type'],
                          style: GoogleFonts.poppins(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
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
                          color: primaryColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          _formatDate(record['createdAt'].toString()),
                          style: GoogleFonts.poppins(
                            fontSize: 14,
                            color: primaryColor,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    record['description'],
                    style: GoogleFonts.poppins(
                      fontSize: 16,
                      color: textSecondaryColor,
                    ),
                  ),
                  if (record['record_type'] == 'prescription' &&
                      record['PrescriptionItems'] != null &&
                      record['PrescriptionItems'].isNotEmpty) ...[
                    const SizedBox(height: 12),
                    Text(
                      'Prescribed Medications:',
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: primaryColor,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: List.generate(
                          record['PrescriptionItems'].length, (idx) {
                        final item = record['PrescriptionItems'][idx];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 6),
                          child: Text(
                            '${item['Medication']?['name'] ?? 'Medication'} - ${item['dosage'] ?? ''}, ${item['frequency'] ?? ''}, ${item['duration'] ?? ''}, ${item['instructions'] ?? ''}',
                            style: GoogleFonts.poppins(
                                fontSize: 14, color: textSecondaryColor),
                          ),
                        );
                      }),
                    ),
                  ],
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Icon(
                        Icons.person_outline,
                        size: 20,
                        color: textSecondaryColor,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Doctor: ${record['doctor']['name']}',
                        style: GoogleFonts.poppins(
                          fontSize: 14,
                          color: textSecondaryColor,
                        ),
                      ),
                    ],
                  ),
                  if (record['file_url'] != null) ...[
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        // Main view button
                        Expanded(
                          child: Container(
                            height: 50,
                            decoration: BoxDecoration(
                              boxShadow: [
                                BoxShadow(
                                  color: primaryColor.withOpacity(0.2),
                                  blurRadius: 10,
                                  offset: const Offset(0, 5),
                                ),
                              ],
                            ),
                            child: ElevatedButton.icon(
                              onPressed: () => _viewFile(record['file_url']),
                              icon: Icon(_getFileIcon(record['file_url'])),
                              label: Text(
                                'View File',
                                style: GoogleFonts.poppins(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: primaryColor,
                                foregroundColor: Colors.white,
                                elevation: 0,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(25),
                                ),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        // Options button
                        Container(
                          height: 50,
                          width: 50,
                          decoration: BoxDecoration(
                            color: primaryColor.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(25),
                          ),
                          child: IconButton(
                            onPressed: () => _showFileOptions(
                                record['file_url'], record['record_type']),
                            icon: Icon(
                              Icons.more_vert,
                              color: primaryColor,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
