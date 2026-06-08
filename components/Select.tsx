'use client';

import React from 'react';
import { Select as SelectPrimitive } from 'radix-ui';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ui } from '@/components/ui/styles';

interface Opt {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

interface SelectProps {
  value?: string | number;
  onChange?: (e: { target: { value: string } }) => void;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  id?: string;
  placeholder?: string;
}

// Radix forbids an empty-string item value, so empty options round-trip through
// this sentinel and map back to '' at the API boundary.
const EMPTY = '__select_empty__';

/**
 * Bespoke Radix-powered <select> replacement. Keeps the native-style API
 * (`value`, `onChange` emitting `{ target: { value } }`, `<option>` children) so
 * every call site is unchanged, while the trigger + menu are built on Radix Select
 * and styled from the shared design contract (consistent with all other menus).
 */
export function Select({
  value,
  onChange,
  children,
  className = '',
  disabled,
  id,
  placeholder,
}: SelectProps) {
  const options: Opt[] = [];
  React.Children.toArray(children).forEach((child: any) => {
    if (child && child.type === 'option') {
      options.push({
        value: String(child.props.value ?? ''),
        label: child.props.children,
        disabled: child.props.disabled,
      });
    }
  });

  const current = String(value ?? '');
  const hasEmptyOption = options.some(o => o.value === '');
  const rootValue = current === '' ? (hasEmptyOption ? EMPTY : undefined) : current;

  return (
    <SelectPrimitive.Root
      value={rootValue}
      onValueChange={v => onChange?.({ target: { value: v === EMPTY ? '' : v } })}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        id={id}
        className={cn(
          'flex items-center justify-between gap-2 text-left cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 data-[placeholder]:text-muted-foreground',
          ui.focusRing,
          className,
        )}
      >
        <span className="truncate">
          <SelectPrimitive.Value placeholder={placeholder} />
        </span>
        <SelectPrimitive.Icon asChild>
          <ChevronDown size={13} className="shrink-0 text-gray-500 transition-transform duration-150" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className={cn(
            ui.surface,
            ui.motion,
            'z-[200] max-h-60 min-w-[var(--radix-select-trigger-width)] max-w-[280px] overflow-hidden py-1',
          )}
        >
          <SelectPrimitive.Viewport className="p-0">
            {options.map((o, i) => (
              <SelectPrimitive.Item
                key={`${o.value}-${i}`}
                value={o.value === '' ? EMPTY : o.value}
                disabled={o.disabled}
                className={cn(
                  ui.item,
                  'justify-between text-xs data-[disabled]:pointer-events-none data-[disabled]:text-gray-300 data-[state=checked]:bg-accent-50 data-[state=checked]:font-semibold data-[state=checked]:text-accent-700',
                )}
              >
                <SelectPrimitive.ItemText>{o.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator>
                  <Check size={12} className="shrink-0 text-accent-600" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

export default Select;
