import { forwardRef } from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
  glass?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", children, hover = false, glass = false, ...props }, ref) => {
    const baseStyles = "relative rounded-xl border border-border p-6";
    const bgStyles = glass ? "glass" : "bg-surface";
    const hoverStyles = hover
      ? "hover-lift cursor-pointer"
      : "";

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${bgStyles} ${hoverStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// Card header for consistent styling
export function CardHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

// Card title
export function CardTitle({
  children,
  className = "",
  as: Component = "h3",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "h2" | "h3" | "h4";
}) {
  return (
    <Component className={`text-lg font-semibold text-foreground ${className}`}>
      {children}
    </Component>
  );
}

// Card description
export function CardDescription({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={`text-muted leading-relaxed ${className}`}>{children}</p>;
}

// Card content
export function CardContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

// Feature card with icon
export function FeatureCard({
  icon: Icon,
  title,
  description,
  className = "",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <Card hover className={`group ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 group-hover:border-accent/40 transition-colors">
          <Icon className="h-6 w-6 text-accent" />
        </div>
        <div>
          <CardTitle className="group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          <CardDescription className="mt-2">{description}</CardDescription>
        </div>
      </div>
    </Card>
  );
}
