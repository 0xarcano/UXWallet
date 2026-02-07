import { View, Text } from 'react-native';
import { Check, AlertTriangle, Loader } from 'lucide-react-native';

import { AddressDisplay } from '@/components/shared/AddressDisplay';

interface TransactionStep {
  label: string;
  description?: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
}

interface TransactionProgressProps {
  steps: TransactionStep[];
  txHash?: string;
}

const STATUS_ICON_COLORS: Record<TransactionStep['status'], string> = {
  pending: '#8892A0',
  active: '#00D4AA',
  completed: '#34D399',
  failed: '#F87171',
};

export function TransactionProgress({
  steps,
  txHash,
}: TransactionProgressProps): JSX.Element {
  return (
    <View className="px-4">
      {steps.map((step, index) => (
        <View key={step.label} className="flex-row mb-4">
          <View className="items-center mr-3">
            <View className="w-8 h-8 rounded-full items-center justify-center bg-brand-card">
              {step.status === 'completed' && <Check size={16} color={STATUS_ICON_COLORS.completed} />}
              {step.status === 'failed' && <AlertTriangle size={16} color={STATUS_ICON_COLORS.failed} />}
              {step.status === 'active' && <Loader size={16} color={STATUS_ICON_COLORS.active} />}
              {step.status === 'pending' && (
                <View className="w-2 h-2 rounded-full bg-brand-muted" />
              )}
            </View>
            {index < steps.length - 1 && (
              <View
                className={`w-0.5 flex-1 mt-1 ${
                  step.status === 'completed' ? 'bg-brand-success' : 'bg-brand-muted/30'
                }`}
              />
            )}
          </View>

          <View className="flex-1 pt-1">
            <Text
              className={`font-sans font-semibold text-sm ${
                step.status === 'failed'
                  ? 'text-brand-error'
                  : step.status === 'pending'
                    ? 'text-brand-muted'
                    : 'text-brand-text'
              }`}
            >
              {step.label}
            </Text>
            {step.description && (
              <Text className="font-sans text-xs text-brand-muted mt-0.5">
                {step.description}
              </Text>
            )}
          </View>
        </View>
      ))}

      {txHash && (
        <View className="flex-row items-center mt-2 pt-3 border-t border-brand-muted/20">
          <Text className="font-sans text-xs text-brand-muted mr-2">Tx:</Text>
          <AddressDisplay address={txHash} className="text-xs" />
        </View>
      )}
    </View>
  );
}
