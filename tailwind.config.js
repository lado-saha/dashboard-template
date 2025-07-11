// Import default theme
const { fontFamily } = require("tailwindcss/defaultTheme") // Import default theme

module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx,js,jsx,mdx}",
    "./components/**/*.{ts,tsx,js,jsx,mdx}",
    "./app/**/*.{ts,tsx,js,jsx,mdx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem", // Adjusted default padding
      screens: {
        "2xl": "1440px", // Slightly wider max width
      },
    },
    extend: {
      fontFamily: {
        // Set 'sans' to use the Montserrat variable, with fallbacks
        // sans: ["var(--font-montserrat)", ...fontFamily.sans],
      },
      colors: {
         // Add sidebar specific colors if not already defined via CSS vars
         sidebar: {
           DEFAULT: "hsl(var(--sidebar))",
           foreground: "hsl(var(--sidebar-foreground))",
           border: "hsl(var(--sidebar-border))",
           // ... add others like primary, accent if needed for sidebar theme
         },
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" }, // Use string "0"
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" }, // Use string "0"
        },
         // Add fade-in-up animation if not using tw-animate-css
         "fade-in-up": {
           "0%": {
             opacity: "0",
             transform: "translateY(10px)",
           },
           "100%": {
             opacity: "1",
             transform: "translateY(0)",
           },
         },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards", // Add fade-in-up
      },
    },
  },
  // Ensure you have the required plugins
  plugins: [
      // require("tailwindcss-animate"), // Standard animate plugin
      // require("tw-animate-css") // Remove if using tailwindcss-animate
    ],
}