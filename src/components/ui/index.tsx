// src/components/ui/index.tsx
// Lightweight UI primitives. No external component library needed.

import React from "react";

// ── Card ─────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  hover?: boolean;
  onClick?: () => void;
  padding?: string;
}
export function Card({ children, style, hover = false, onClick, padding = "var(--sp-6)" }: CardProps) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--white)", borderRadius: "var(--r-md)",
        boxShadow: hover && hovered ? "var(--shadow-card-hover)" : "var(--shadow-card)",
        border: "1px solid var(--border)",
        padding,
        transition: "box-shadow var(--t-med), transform var(--t-med)",
        transform: hover && hovered ? "translateY(-2px)" : "none",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = "urgent" | "high" | "normal" | "success" | "gold" | "forest";
export function Badge({ label, variant = "normal" }: { label: string; variant?: BadgeVariant }) {
  const colors: Record<BadgeVariant, { bg: string; color: string }> = {
    urgent: { bg: "#C0392B", color: "white" },
    high:   { bg: "#D68910", color: "white" },
    normal: { bg: "#7A7A7A", color: "white" },
    success:{ bg: "#1E8449", color: "white" },
    gold:   { bg: "#C9A84C", color: "white" },
    forest: { bg: "#1A3A2A", color: "white" },
  };
  const { bg, color } = colors[variant];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 10px", borderRadius: 99,
      background: bg, color, fontSize: "0.72rem",
      fontWeight: 600, letterSpacing: "0.04em",
      textTransform: "uppercase", whiteSpace: "nowrap",
      boxShadow: `0 2px 6px ${bg}40`,
    }}>
      {label}
    </span>
  );
}

// ── Button ───────────────────────────────────────────────────────────────────
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}
export function Button({ variant = "primary", size = "md", loading, icon, children, style, ...rest }: BtnProps) {
  const bg: Record<string, string> = {
    primary: "var(--forest)", secondary: "var(--white)",
    ghost: "transparent", danger: "var(--urgent)",
  };
  const color: Record<string, string> = {
    primary: "white", secondary: "var(--forest)",
    ghost: "var(--forest)", danger: "white",
  };
  const border: Record<string, string> = {
    primary: "2px solid var(--forest)", secondary: "2px solid var(--forest)",
    ghost: "2px solid transparent", danger: "2px solid var(--urgent)",
  };
  const pad: Record<string, string> = {
    sm: "6px 14px", md: "10px 20px", lg: "13px 28px",
  };
  const fsize: Record<string, string> = { sm: "0.8rem", md: "0.88rem", lg: "0.95rem" };

  return (
    <button
      disabled={loading || rest.disabled}
      style={{
        display: "inline-flex", alignItems: "center", gap: "var(--sp-2)",
        background: bg[variant], color: color[variant], border: border[variant],
        borderRadius: "var(--r-sm)", padding: pad[size],
        fontSize: fsize[size], fontWeight: 600, transition: "all var(--t-fast)",
        opacity: (loading || rest.disabled) ? 0.65 : 1,
        cursor: (loading || rest.disabled) ? "not-allowed" : "pointer",
        ...style,
      }}
      onMouseEnter={e => {
        if (!rest.disabled && !loading) {
          if (variant === "primary") e.currentTarget.style.background = "var(--forest-mid)";
          if (variant === "secondary") e.currentTarget.style.background = "var(--cream)";
          if (variant === "ghost") e.currentTarget.style.background = "rgba(26,58,42,0.06)";
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = bg[variant];
      }}
      {...rest}
    >
      {icon && icon}
      {loading ? "Loading…" : children}
    </button>
  );
}

// ── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
export function Input({ label, error, style, ...rest }: InputProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-1)" }}>
      {label && (
        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--ink-muted)" }}>
          {label}
        </label>
      )}
      <input
        style={{
          border: `1.5px solid ${error ? "var(--urgent)" : "var(--border)"}`,
          borderRadius: "var(--r-sm)", padding: "var(--sp-3) var(--sp-4)",
          fontSize: "0.9rem", color: "var(--ink)", background: "var(--white)",
          outline: "none", width: "100%", transition: "border-color var(--t-fast)",
          ...style,
        }}
        onFocus={e => e.target.style.borderColor = "var(--forest)"}
        onBlur={e => e.target.style.borderColor = error ? "var(--urgent)" : "var(--border)"}
        {...rest}
      />
      {error && <span style={{ fontSize: "0.75rem", color: "var(--urgent)" }}>{error}</span>}
    </div>
  );
}

// ── Select ───────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}
export function Select({ label, options, style, ...rest }: SelectProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-1)" }}>
      {label && (
        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--ink-muted)" }}>
          {label}
        </label>
      )}
      <select
        style={{
          border: "1.5px solid var(--border)", borderRadius: "var(--r-sm)",
          padding: "var(--sp-3) var(--sp-4)", fontSize: "0.9rem",
          color: "var(--ink)", background: "var(--white)",
          outline: "none", width: "100%", cursor: "pointer",
          appearance: "auto",
          ...style,
        }}
        {...rest}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ── Textarea ─────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}
export function Textarea({ label, style, ...rest }: TextareaProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-1)" }}>
      {label && (
        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--ink-muted)" }}>
          {label}
        </label>
      )}
      <textarea
        style={{
          border: "1.5px solid var(--border)", borderRadius: "var(--r-sm)",
          padding: "var(--sp-3) var(--sp-4)", fontSize: "0.9rem",
          color: "var(--ink)", background: "var(--white)",
          outline: "none", width: "100%", resize: "vertical", minHeight: 100,
          ...style,
        }}
        onFocus={e => e.target.style.borderColor = "var(--forest)"}
        onBlur={e => e.target.style.borderColor = "var(--border)"}
        {...rest}
      />
    </div>
  );
}

// ── PageHeader ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }: {
  title: string; subtitle?: string; action?: React.ReactNode;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", justifyContent: "space-between",
      marginBottom: "var(--sp-8)", gap: "var(--sp-4)", flexWrap: "wrap",
    }}>
      <div>
        <h1 style={{ fontSize: "1.8rem", marginBottom: "var(--sp-1)" }}>{title}</h1>
        {subtitle && <p style={{ color: "var(--ink-muted)", fontSize: "0.9rem" }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, body }: { icon: React.ReactNode; title: string; body?: string }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "var(--sp-16) var(--sp-8)", textAlign: "center",
    }}>
      <div style={{ color: "var(--border)", marginBottom: "var(--sp-4)" }}>{icon}</div>
      <h3 style={{ fontSize: "1.1rem", marginBottom: "var(--sp-2)" }}>{title}</h3>
      {body && <p style={{ color: "var(--ink-muted)", fontSize: "0.88rem", maxWidth: 320 }}>{body}</p>}
    </div>
  );
}

// ── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ margin = "var(--sp-6) 0" }: { margin?: string }) {
  return <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin }} />;
}
