import 'package:get/get.dart';
import '../services/api_service.dart';
import '../screens/login_screen.dart';
import '../screens/task_list_screen.dart';

// GetX controller = holds state + logic, separate from the UI.
class AuthController extends GetxController {
  final ApiService _api = ApiService();

  // `.obs` makes this "observable" — any Obx() widget watching it
  // rebuilds automatically when the value changes.
  final isLoading = false.obs;

  // Handles BOTH login and register based on `isRegister`.
  Future<void> submit({
    required bool isRegister,
    required String email,
    required String password,
  }) async {
    if (email.trim().isEmpty || password.isEmpty) {
      Get.snackbar('Missing info', 'Please enter an email and password.');
      return;
    }

    isLoading.value = true;
    try {
      if (isRegister) {
        await _api.register(email.trim(), password);
      } else {
        await _api.login(email.trim(), password);
      }
      // Success → replace the whole screen stack with the task list.
      Get.offAll(() => const TaskListScreen());
    } catch (e) {
      Get.snackbar('Oops', _clean(e));
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> logout() async {
    await _api.clearToken();
    Get.offAll(() => const LoginScreen());
  }

  // Turn `Exception: message` into just `message`.
  String _clean(Object e) => e.toString().replaceFirst('Exception: ', '');
}
