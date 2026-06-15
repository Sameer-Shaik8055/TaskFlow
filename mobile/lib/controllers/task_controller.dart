import 'package:get/get.dart';
import '../models/task.dart';
import '../services/api_service.dart';

class TaskController extends GetxController {
  final ApiService _api = ApiService();

  // Observable list — the UI rebuilds whenever it changes.
  final tasks = <Task>[].obs;
  final isLoading = false.obs;

  // onInit runs once, automatically, when this controller is created.
  @override
  void onInit() {
    super.onInit();
    loadTasks();
  }

  Future<void> loadTasks() async {
    isLoading.value = true;
    try {
      final result = await _api.getTasks();
      tasks.assignAll(result); // replace the whole list
    } catch (e) {
      Get.snackbar('Error', 'Could not load your tasks.');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> addTask(String title) async {
    if (title.trim().isEmpty) return;
    try {
      final task = await _api.createTask(title.trim());
      tasks.insert(0, task); // newest on top
    } catch (e) {
      Get.snackbar('Error', 'Could not add the task.');
    }
  }

  Future<void> toggleTask(Task task) async {
    try {
      final updated = await _api.updateTask(task.id, completed: !task.completed);
      final i = tasks.indexWhere((t) => t.id == task.id);
      if (i != -1) tasks[i] = updated; // swap in the updated task
    } catch (e) {
      Get.snackbar('Error', 'Could not update the task.');
    }
  }

  Future<void> deleteTask(Task task) async {
    try {
      await _api.deleteTask(task.id);
      tasks.removeWhere((t) => t.id == task.id);
    } catch (e) {
      Get.snackbar('Error', 'Could not delete the task.');
    }
  }
}
