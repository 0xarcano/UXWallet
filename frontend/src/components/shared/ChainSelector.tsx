import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';

interface Chain {
  chainId: number;
  name: string;
}

interface ChainSelectorProps {
  selectedChainId: number;
  onChange: (chainId: number) => void;
  chains?: Chain[];
}

const DEFAULT_CHAINS: Chain[] = [
  { chainId: 11155111, name: 'Sepolia' },
  { chainId: 84532, name: 'Base Sepolia' },
];

export function ChainSelector({
  selectedChainId,
  onChange,
  chains = DEFAULT_CHAINS,
}: ChainSelectorProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const selectedChain = chains.find((c) => c.chainId === selectedChainId);

  const handleSelect = (chainId: number): void => {
    onChange(chainId);
    setIsOpen(false);
  };

  return (
    <>
      <Pressable
        onPress={() => setIsOpen(true)}
        className="flex-row items-center bg-brand-card rounded-xl px-4 py-3"
        accessibilityRole="button"
        accessibilityLabel={`Selected chain: ${selectedChain?.name ?? 'Unknown'}`}
      >
        <Text className="flex-1 font-sans text-brand-text">
          {selectedChain?.name ?? 'Select chain'}
        </Text>
        <ChevronDown size={20} color="#8892A0" />
      </Pressable>

      <BottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Select Network"
        snapPoints={[0.35]}
      >
        {chains.map((chain) => (
          <Pressable
            key={chain.chainId}
            onPress={() => handleSelect(chain.chainId)}
            className={`flex-row items-center py-3 px-4 rounded-xl mb-2 ${
              chain.chainId === selectedChainId ? 'bg-brand-primary/10' : ''
            }`}
            accessibilityRole="button"
          >
            <Text
              className={`font-sans flex-1 ${
                chain.chainId === selectedChainId
                  ? 'text-brand-primary font-semibold'
                  : 'text-brand-text'
              }`}
            >
              {chain.name}
            </Text>
            {chain.chainId === selectedChainId && (
              <View className="w-2 h-2 rounded-full bg-brand-primary" />
            )}
          </Pressable>
        ))}
      </BottomSheet>
    </>
  );
}
