import { View, Text } from 'react-native';
import { Check } from 'lucide-react-native';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps): JSX.Element {
  return (
    <View className="flex-row items-center justify-center px-4">
      {steps.map((label, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <View key={label} className="flex-row items-center">
            <View className="items-center">
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  isCompleted
                    ? 'bg-brand-success'
                    : isCurrent
                      ? 'bg-brand-primary'
                      : 'bg-brand-muted/30'
                }`}
              >
                {isCompleted ? (
                  <Check size={16} color="#F8FAFB" />
                ) : (
                  <Text
                    className={`font-sans font-bold text-sm ${
                      isCurrent ? 'text-brand-bg' : 'text-brand-muted'
                    }`}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text
                className={`font-sans text-xs mt-1 ${
                  isCurrent ? 'text-brand-text' : 'text-brand-muted'
                }`}
              >
                {label}
              </Text>
            </View>

            {index < steps.length - 1 && (
              <View
                className={`h-0.5 w-8 mx-1 ${
                  isCompleted ? 'bg-brand-success' : 'bg-brand-muted/30'
                }`}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}
