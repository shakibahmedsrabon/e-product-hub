/**
 * Abstracted Link component — wraps react-router-dom's Link.
 * When migrating to Next.js, replace this single file with next/link.
 */
import { Link as RouterLink, type LinkProps as RouterLinkProps } from "react-router-dom";
import React from "react";

export interface AppLinkProps extends Omit<RouterLinkProps, 'to'> {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const AppLink = ({ href, children, ...props }: AppLinkProps) => {
  // External links
  if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }

  return (
    <RouterLink to={href} {...props}>
      {children}
    </RouterLink>
  );
};

export default AppLink;
