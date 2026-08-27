import Image from 'next/image';

interface BrandLogoProps {
  className?: string;
  priority?: boolean;
}

export function BrandLogo({ className = 'h-12 w-auto', priority = false }: BrandLogoProps) {
  return (
    <Image
      src="/logoAventure-se.png"
      alt="Aventure-se"
      width={440}
      height={256}
      className={`object-contain ${className}`}
      priority={priority}
    />
  );
}
