import { Pressable, Text } from 'react-native';
import type { PressableProps } from 'react-native';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function Button({ title, variant = 'primary', ...props }: ButtonProps) {
  const baseClasses = 'items-center justify-center rounded-xl px-6 py-3';
  const variantClasses = {
    primary: 'bg-brand-primary',
    secondary: 'bg-brand-secondary',
    ghost: 'bg-transparent',
  };
  const textVariantClasses = {
    primary: 'text-brand-bg',
    secondary: 'text-white',
    ghost: 'text-brand-primary',
  };

  return (
    <Pressable className={`${baseClasses} ${variantClasses[variant]}`} {...props}>
      <Text className={`font-sans text-base font-semibold ${textVariantClasses[variant]}`}>
        {title}
      </Text>
    </Pressable>
  );
}
