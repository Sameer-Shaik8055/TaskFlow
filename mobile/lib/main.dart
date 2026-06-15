import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'controllers/auth_controller.dart';
import 'services/api_service.dart';
import 'screens/login_screen.dart';
import 'screens/task_list_screen.dart';

Future<void> main() async {
  // Needed because we do async work (reading the token) before runApp.
  WidgetsFlutterBinding.ensureInitialized();

  // Register the auth controller once, app-wide, so any screen can find it.
  Get.put(AuthController());

  // "Stay logged in": if a token is already saved, start on the task list.
  final token = await ApiService().getToken();
  final loggedIn = token != null && token.isNotEmpty;

  runApp(TaskFlowApp(loggedIn: loggedIn));
}

class TaskFlowApp extends StatelessWidget {
  final bool loggedIn;
  const TaskFlowApp({super.key, required this.loggedIn});

  @override
  Widget build(BuildContext context) {
    // GetMaterialApp (not MaterialApp) enables Get navigation + snackbars.
    return GetMaterialApp(
      title: 'TaskFlow',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: loggedIn ? const TaskListScreen() : const LoginScreen(),
    );
  }
}
