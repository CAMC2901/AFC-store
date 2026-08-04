import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'gold' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary: 'btn-primary',
  gold: 'btn-gold',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-sm',
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  children: ReactNode;
  className?: string;
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { href?: undefined };
type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & { href: string };

type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', fullWidth, loading, className, children } = props;
  const classes = cn(
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    loading && 'pointer-events-none opacity-70',
    className
  );

  const content = (
    <>
      {loading && <Spinner size={16} />}
      {children}
    </>
  );

  if (props.href) {
    const { href, ...rest } = props as ButtonAsLink;
    return (
      <Link href={href} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  const buttonProps = props as ButtonAsButton;
  return (
    <button className={classes} disabled={loading || buttonProps.disabled} {...buttonProps}>
      {content}
    </button>
  );
}
