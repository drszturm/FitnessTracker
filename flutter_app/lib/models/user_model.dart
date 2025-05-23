class User {
  final int id;
  final String username;
  final String? email;
  final String? provider;
  final String? providerUserId;
  final String? profilePhotoUrl;
  final DateTime createdAt;

  User({
    required this.id,
    required this.username,
    this.email,
    this.provider,
    this.providerUserId,
    this.profilePhotoUrl,
    required this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as int,
      username: json['username'] as String,
      email: json['email'] as String?,
      provider: json['provider'] as String?,
      providerUserId: json['providerUserId'] as String?,
      profilePhotoUrl: json['profilePhotoUrl'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'provider': provider,
      'providerUserId': providerUserId,
      'profilePhotoUrl': profilePhotoUrl,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}