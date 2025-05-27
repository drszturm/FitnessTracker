# FitTrack Mobile

A beautiful and intuitive Flutter mobile app for tracking your fitness journey. This mobile companion app works seamlessly with the FitTrack web application to provide a complete fitness tracking experience.

## Features

### 🏋️‍♂️ Core Functionality
- **Dashboard Overview**: Visual charts and statistics of your fitness progress
- **Workout Management**: Create, edit, and start workout sessions
- **Exercise Library**: Browse 60+ exercises with detailed descriptions
- **Workout History**: Track your completed sessions and progress over time

### 🔐 Authentication
- **Social Login**: Sign in with Facebook, Google, or Instagram
- **Secure Sessions**: JWT-based authentication with persistent login

### 📊 Analytics & Progress
- **Weekly Stats**: Track workout frequency and goals
- **Weight Progress**: Visual charts showing strength gains
- **Personal Records**: Monitor your best performances
- **Activity Timeline**: Comprehensive workout history

### 🎨 User Experience
- **Modern UI**: Clean, Material Design 3 interface
- **Responsive Design**: Optimized for all screen sizes
- **Dark/Light Theme**: Automatic theme adaptation
- **Smooth Navigation**: Intuitive bottom navigation and routing

## Screenshots

*Screenshots will be added once the app is built and tested*

## Getting Started

### Prerequisites
- Flutter SDK (>=3.0.0)
- Dart SDK
- Android Studio / VS Code
- iOS development tools (for iOS builds)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/fittrack_mobile.git
   cd fittrack_mobile
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Configure API endpoint**
   Update the `baseUrl` in `lib/services/api_service.dart` to point to your backend:
   ```dart
   static const String baseUrl = 'https://your-api-domain.com/api';
   ```

4. **Run the app**
   ```bash
   flutter run
   ```

## Backend Integration

This mobile app is designed to work with the FitTrack backend API. Make sure you have the backend server running and accessible.

### API Configuration
- Update the API base URL in `lib/services/api_service.dart`
- Ensure CORS is properly configured on your backend
- The app expects the same API endpoints as the web version

### Authentication Setup
The app supports OAuth authentication with:
- Facebook Login
- Google Sign-In
- Instagram Login

Configure your OAuth providers in the backend and ensure the mobile app can receive authentication callbacks.

## Architecture

### State Management
- **Provider Pattern**: Used for managing app-wide state
- **Reactive UI**: Automatic updates when data changes
- **Local Storage**: Persistent authentication with SharedPreferences

### Project Structure
```
lib/
├── main.dart                 # App entry point
├── models/                   # Data models
│   ├── user_model.dart
│   ├── exercise_model.dart
│   └── workout_model.dart
├── providers/                # State management
│   ├── auth_provider.dart
│   ├── exercise_provider.dart
│   └── workout_provider.dart
├── services/                 # API and external services
│   └── api_service.dart
├── screens/                  # App screens
│   ├── splash_screen.dart
│   ├── login_screen.dart
│   ├── dashboard_screen.dart
│   ├── workouts_screen.dart
│   ├── exercises_screen.dart
│   └── history_screen.dart
└── widgets/                  # Reusable components
    ├── bottom_navigation.dart
    └── stat_card.dart
```

## Dependencies

### Core Dependencies
- `flutter`: Flutter SDK
- `provider`: State management
- `go_router`: Navigation and routing
- `http`: HTTP requests
- `shared_preferences`: Local storage

### UI & Charts
- `google_fonts`: Typography
- `fl_chart`: Beautiful charts and graphs
- `heroicons`: Icon set

### Utilities
- `intl`: Date and number formatting

## Building for Production

### Android
```bash
flutter build apk --release
# or for app bundle
flutter build appbundle --release
```

### iOS
```bash
flutter build ios --release
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Related Projects

- [FitTrack Web App](https://github.com/your-username/fittrack) - The main web application

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/your-username/fittrack_mobile/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about your environment and the issue

## Roadmap

- [ ] Offline functionality
- [ ] Apple Watch integration
- [ ] Nutrition tracking
- [ ] Social features and workout sharing
- [ ] Advanced analytics and insights
- [ ] Custom workout templates

---

Built with ❤️ using Flutter