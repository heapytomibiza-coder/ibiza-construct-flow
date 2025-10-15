import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      spacing: {
        // 8-pt grid system for consistency
        '0.5': '0.125rem', // 2px
        '1': '0.25rem',    // 4px
        '1.5': '0.375rem', // 6px
        '2': '0.5rem',     // 8px
        '3': '0.75rem',    // 12px
        '4': '1rem',       // 16px
        '5': '1.25rem',    // 20px
        '6': '1.5rem',     // 24px
        '8': '2rem',       // 32px
        '10': '2.5rem',    // 40px
        '11': '2.75rem',   // 44px (minimum touch target)
        '12': '3rem',      // 48px
        '16': '4rem',      // 64px
        '20': '5rem',      // 80px
        '24': '6rem',      // 96px
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Sage Green Eco Palette
        sage: {
          DEFAULT: "hsl(var(--sage))",
          light: "hsl(var(--sage-light))",
          dark: "hsl(var(--sage-dark))",
          muted: "hsl(var(--sage-muted))",
          'muted-light': "hsl(var(--sage-muted-light))",
          'muted-dark': "hsl(var(--sage-muted-dark))",
        },
        'sage-deep': {
          DEFAULT: "hsl(var(--sage-deep))",
          light: "hsl(var(--sage-deep-light))",
          dark: "hsl(var(--sage-deep-dark))",
        },
        // Earth Tones
        earth: {
          DEFAULT: "hsl(var(--earth))",
          dark: "hsl(var(--earth-dark))",
        },
        mint: "hsl(var(--mint))",
        forest: {
          DEFAULT: "hsl(var(--forest))",
          deep: "hsl(var(--forest-deep))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        display: "var(--font-display)",
        body: "var(--font-body)",
      },
      backgroundImage: {
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-card': 'var(--gradient-card)',
        'gradient-premium': 'var(--gradient-premium)',
        'gradient-nature': 'var(--gradient-nature)',
        'gradient-sage': 'var(--gradient-sage)',
        'gradient-earth': 'var(--gradient-earth)',
      },
      boxShadow: {
        'luxury': 'var(--shadow-luxury)',
        'card': 'var(--shadow-card)',
        'elegant': 'var(--shadow-elegant)',
        'hover': 'var(--shadow-hover)',
        // Interactive states
        'focus': '0 0 0 3px hsl(var(--sage) / 0.25)',
        'active': '0 5px 10px -3px hsl(var(--sage) / 0.3)',
        // Micro-interaction shadows
        'micro': '0 2px 4px -1px hsl(var(--sage) / 0.1)',
        'micro-hover': '0 4px 8px -2px hsl(var(--sage) / 0.15)',
      },
      transitionTimingFunction: {
        'luxury': 'var(--transition-luxury)',
        'smooth': 'var(--transition-smooth)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "micro-bounce": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        "micro-scale": {
          "0%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" },
        },
        "micro-fade": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "skeleton-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // Micro-interactions (<120ms for instant feel)
        "micro-bounce": "micro-bounce 0.1s ease-out",
        "micro-scale": "micro-scale 0.08s ease-out",
        "micro-fade": "micro-fade 0.1s ease-out",
        // Standard interactions
        "fade-in": "fade-in 0.2s ease-out",
        "slide-up": "slide-up 0.2s ease-out",
        "slide-down": "slide-down 0.2s ease-out",
        "scale-in": "scale-in 0.15s ease-out",
        // Skeleton loaders
        "skeleton-pulse": "skeleton-pulse 1.5s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      transitionDuration: {
        'micro': '80ms',
        'fast': '150ms',
        'normal': '200ms',
        'smooth': '300ms',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
