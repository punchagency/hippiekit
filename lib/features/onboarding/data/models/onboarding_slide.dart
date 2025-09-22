class OnboardingSlide {
  final String title;
  final String subtitle;
  final String description;
  final String backgroundImage;
  final String? icon;

  const OnboardingSlide({
    required this.title,
    required this.subtitle,
    required this.description,
    required this.backgroundImage,
    this.icon,
  });
}

class OnboardingData {
  static const List<OnboardingSlide> slides = [
    OnboardingSlide(
      title: 'Welcome to HippieKit',
      subtitle: 'Your Sustainable Journey Starts Here',
      description: 'Discover eco-friendly products, track your carbon footprint, and join a community committed to sustainable living.',
      backgroundImage: 'assets/images/onboarding_1.png',
      icon: '🌱',
    ),
    OnboardingSlide(
      title: 'Scan & Discover',
      subtitle: 'Know What You Buy',
      description: 'Scan product barcodes to instantly see their environmental impact, ingredients, and sustainable alternatives.',
      backgroundImage: 'assets/images/onboarding_2.png',
      icon: '📱',
    ),
    OnboardingSlide(
      title: 'Track Your Impact',
      subtitle: 'Make Every Choice Count',
      description: 'Monitor your environmental footprint, set sustainability goals, and celebrate your green achievements.',
      backgroundImage: 'assets/images/onboarding_3.png',
      icon: '📊',
    ),
    OnboardingSlide(
      title: 'Join the Community',
      subtitle: 'Together We Make a Difference',
      description: 'Connect with like-minded individuals, share tips, and be part of the global movement towards sustainability.',
      backgroundImage: 'assets/images/onboarding_4.png',
      icon: '🤝',
    ),
  ];
}
