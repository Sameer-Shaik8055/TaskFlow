// A Dart model mirroring the Task JSON our API returns.
class Task {
  final String id;
  final String title;
  final bool completed;
  final DateTime createdAt;

  Task({
    required this.id,
    required this.title,
    required this.completed,
    required this.createdAt,
  });

  // A "factory" constructor that builds a Task from a decoded JSON map.
  // e.g. { "id": "...", "title": "...", "completed": false, "createdAt": "..." }
  factory Task.fromJson(Map<String, dynamic> json) {
    return Task(
      id: json['id'] as String,
      title: json['title'] as String,
      completed: json['completed'] as bool,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}
