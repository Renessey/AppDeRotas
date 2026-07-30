export const lightColors = {
  primary: '#4F46E5',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  card: '#FFFFFF',
  notification: '#EF4444',
  statusBar: 'dark-content' as 'dark-content' | 'light-content',
};

export const darkColors = {
  primary: '#818CF8',
  background: '#111827',
  surface: '#1F2937',
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  border: '#374151',
  card: '#1F2937',
  notification: '#F87171',
  statusBar: 'light-content' as 'dark-content' | 'light-content',
};

export type AppColors = typeof lightColors;

