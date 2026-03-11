import { type SVGProps } from 'react';

interface BrandIconProps extends SVGProps<SVGSVGElement> {
  path: string;
}

export const BrandIcon = ({ path, className, ...props }: BrandIconProps) => (
  <svg
    viewBox='0 0 24 24'
    fill='currentColor'
    className={className}
    xmlns='http://w3.org'
    {...props}>
    <path d={path} />
  </svg>
);
