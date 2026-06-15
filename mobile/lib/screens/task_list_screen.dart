import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/auth_controller.dart';
import '../controllers/task_controller.dart';

class TaskListScreen extends StatefulWidget {
  const TaskListScreen({super.key});

  @override
  State<TaskListScreen> createState() => _TaskListScreenState();
}

class _TaskListScreenState extends State<TaskListScreen> {
  // Get.put creates the TaskController (its onInit auto-loads tasks).
  final taskController = Get.put(TaskController());
  final authController = Get.find<AuthController>();
  final inputController = TextEditingController();

  void _submitNew() {
    taskController.addTask(inputController.text);
    inputController.clear();
  }

  @override
  void dispose() {
    inputController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Tasks'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Log out',
            onPressed: authController.logout,
          ),
        ],
      ),
      body: Column(
        children: [
          // Add-task row
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: inputController,
                    decoration: const InputDecoration(
                      hintText: 'What needs doing?',
                      border: OutlineInputBorder(),
                    ),
                    onSubmitted: (_) => _submitNew(),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _submitNew,
                  child: const Text('Add'),
                ),
              ],
            ),
          ),
          // The list (Obx rebuilds when tasks or isLoading change)
          Expanded(
            child: Obx(() {
              if (taskController.isLoading.value) {
                return const Center(child: CircularProgressIndicator());
              }
              if (taskController.tasks.isEmpty) {
                return const Center(
                  child: Text(
                    'No tasks yet. Add your first one above! ✨',
                    style: TextStyle(color: Colors.grey),
                  ),
                );
              }
              return RefreshIndicator(
                onRefresh: taskController.loadTasks, // pull-to-refresh
                child: ListView.builder(
                  itemCount: taskController.tasks.length,
                  itemBuilder: (context, index) {
                    final task = taskController.tasks[index];
                    return ListTile(
                      leading: Checkbox(
                        value: task.completed,
                        onChanged: (_) => taskController.toggleTask(task),
                      ),
                      title: Text(
                        task.title,
                        style: TextStyle(
                          decoration: task.completed
                              ? TextDecoration.lineThrough
                              : null,
                          color: task.completed ? Colors.grey : null,
                        ),
                      ),
                      trailing: IconButton(
                        icon: const Icon(Icons.delete_outline),
                        onPressed: () => taskController.deleteTask(task),
                      ),
                    );
                  },
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}
