// A small unit test for the Task model's JSON parsing.
import 'package:flutter_test/flutter_test.dart';
import 'package:taskflow_mobile/models/task.dart';

void main() {
  test('Task.fromJson parses the API JSON correctly', () {
    final task = Task.fromJson({
      'id': 'abc123',
      'title': 'Buy groceries',
      'completed': true,
      'createdAt': '2026-06-14T14:47:01.507Z',
    });

    expect(task.id, 'abc123');
    expect(task.title, 'Buy groceries');
    expect(task.completed, true);
    expect(task.createdAt.year, 2026);
  });
}
