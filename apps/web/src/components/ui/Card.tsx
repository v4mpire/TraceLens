interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  description?: string;
}

export default function Card({ title, children, className = '', description }: CardProps) {
  return (
    <div className={`card ${className}`}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
