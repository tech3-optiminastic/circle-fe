/**
 * Shared style contract for the design system.
 *
 * Both the stock shadcn primitives and any *custom* component built directly on
 * Radix primitives compose from these fragments, so a hand-built component looks
 * identical to a stock one. Customize the look here (or in globals.css tokens)
 * once — never per-instance.
 *
 * Usage in a custom Radix component:
 *   import { ui } from '@/components/ui/styles';
 *   <Popover.Content className={cn(ui.surface, ui.motion, 'p-1')} />
 */
export const ui = {
  /** Crimson focus ring — matches Button / Input / Select. */
  focusRing:
    'outline-none focus-visible:border-ring/70 focus-visible:ring-[3px] focus-visible:ring-ring/50',

  /** Warm greige input field that lightens to card-white on focus. */
  field:
    'rounded-md border border-input bg-secondary/50 shadow-xs transition-[color,box-shadow] focus-visible:bg-card',

  /** Floating surface for menus / popovers / tooltips. */
  surface: 'rounded-md border border-border bg-popover text-popover-foreground shadow-lg',

  /** Tactile press shared by interactive controls. */
  press: 'transition-all active:translate-y-px',

  /** A single row item inside a menu/list (hover = warm accent fill). */
  item:
    'flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent',

  /** Enter/exit motion for Radix data-state components. */
  motion:
    'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
} as const;
