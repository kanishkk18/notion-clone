export const DEFAULT_USER = {
  id: 'default-user-id',
  name: 'Test User',
  email: 'test@example.com',
  image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
}

export const isTestMode = process.env.NODE_ENV === 'development' && process.env.ENABLE_TEST_USER === 'true'