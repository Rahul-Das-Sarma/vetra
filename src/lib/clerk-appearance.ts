import { shadcn } from "@clerk/ui/themes";

export const clerkAppearance = {
  theme: shadcn,
  variables: {
    colorPrimary: "#5059c9",
    colorPrimaryForeground: "#ffffff",
    colorBackground: "#fcfcfc",
    colorForeground: "#0c1b2e",
    colorMuted: "#f0f0ee",
    colorMutedForeground: "#747474",
    colorBorder: "#e7e7e2",
    colorInput: "#fcfcfc",
    colorInputForeground: "#0c1b2e",
    colorRing: "#7b83eb",
    colorDanger: "#c5221f",
    colorSuccess: "#29704b",
    borderRadius: "0.75rem",
    fontFamily:
      "var(--font-sans), 'Source Sans 3', ui-sans-serif, system-ui, sans-serif",
  },
  layout: {
    logoImageUrl: "/vetra-mark.svg",
    logoPlacement: "none" as const,
    socialButtonsPlacement: "bottom" as const,
    socialButtonsVariant: "blockButton" as const,
  },
  elements: {
    rootBox: "mx-auto w-full",
    cardBox: "shadow-none",
    card: "border border-[#e7e7e2] bg-[#fcfcfc] shadow-sm",
    header: "hidden",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    logoBox: "hidden",
    footer: "bg-transparent",
    formButtonPrimary:
      "bg-[#5059c9] hover:bg-[#4b53bc] text-white shadow-none",
    footerActionLink: "text-[#5059c9] hover:text-[#4b53bc]",
  },
};
