import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/task.dart';

/// Talks to your deployed TaskFlow API and stores the JWT locally.
class ApiService {
  // 👇 YOUR deployed API base URL (no trailing slash).
  //    Will be replaced with your real Vercel URL.
  static const String baseUrl = 'https://task-flow-flax-seven.vercel.app';

  // ── Token storage (shared_preferences = small on-device key/value) ──
  static const _tokenKey = 'token';

  Future<void> _saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
  }

  // ── Auth ────────────────────────────────────────────────────────────
  // `mode` is "register" or "login" — both hit /api/auth/<mode>.
  Future<void> _authenticate(String mode, String email, String password) async {
    final res = await http.post(
      Uri.parse('$baseUrl/api/auth/$mode'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode == 200 || res.statusCode == 201) {
      await _saveToken(data['token'] as String); // remember we're logged in
    } else {
      throw Exception(data['error'] ?? 'Authentication failed');
    }
  }

  Future<void> register(String email, String password) =>
      _authenticate('register', email, password);

  Future<void> login(String email, String password) =>
      _authenticate('login', email, password);

  // ── Tasks (every call sends the token in the header) ────────────────
  Future<Map<String, String>> _authHeaders() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  Future<List<Task>> getTasks() async {
    final res = await http.get(
      Uri.parse('$baseUrl/api/tasks'),
      headers: await _authHeaders(),
    );
    if (res.statusCode != 200) throw Exception('Failed to load tasks');
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    final list = data['tasks'] as List<dynamic>;
    return list
        .map((t) => Task.fromJson(t as Map<String, dynamic>))
        .toList();
  }

  Future<Task> createTask(String title) async {
    final res = await http.post(
      Uri.parse('$baseUrl/api/tasks'),
      headers: await _authHeaders(),
      body: jsonEncode({'title': title}),
    );
    if (res.statusCode != 201) throw Exception('Failed to create task');
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    return Task.fromJson(data['task'] as Map<String, dynamic>);
  }

  Future<Task> updateTask(String id, {required bool completed}) async {
    final res = await http.patch(
      Uri.parse('$baseUrl/api/tasks/$id'),
      headers: await _authHeaders(),
      body: jsonEncode({'completed': completed}),
    );
    if (res.statusCode != 200) throw Exception('Failed to update task');
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    return Task.fromJson(data['task'] as Map<String, dynamic>);
  }

  Future<void> deleteTask(String id) async {
    final res = await http.delete(
      Uri.parse('$baseUrl/api/tasks/$id'),
      headers: await _authHeaders(),
    );
    if (res.statusCode != 200) throw Exception('Failed to delete task');
  }
}
