export const Sanitizer = {
  slug: (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  },

  name: (text: string): string => {
    return text
      .replace(/[0-9]/g, "")
      .replace(/[^\p{L}\s-]/gu, "")
      .replace(/-+/g, "-")
      .replace(/\s+/g, " ")
      .replace(/^-+|-+$/g, "")
      .trim();
  },

  phone: (text: string): string => {
    const cleaned = text.replace(/[^\d+]/g, "");
    return cleaned.startsWith("+")
      ? "+" + cleaned.slice(1).replace(/\+/g, "")
      : cleaned.replace(/\+/g, "");
  },

  title: (text: string): string => {
    if (!text) return "";
    const cleaned = text
      .replace(/[^\p{L}\d\s-]/gu, "")
      .replace(/\s+/g, " ")
      .trim();
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  },
};
