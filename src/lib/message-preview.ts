export const getMessagePreview = (content: string): string => {
  try {
    const parsed = JSON.parse(content);
    if (parsed.type === "offer") {
      return `Offer: $${(parsed.price_cents / 100).toFixed(0)} - ${parsed.package_name || "Package"}`;
    }
    if (parsed.type === "inquiry") {
      return `Inquiry: $${(parsed.proposed_budget_cents / 100).toFixed(0)} - ${(parsed.package_type || "").replace(/_/g, " ")}`;
    }
    if (parsed.type === "counter_offer") {
      return `Counter offer: $${(parsed.proposed_budget_cents / 100).toFixed(0)}`;
    }
    if (parsed.type === "package_inquiry") {
      return `Package inquiry: ${parsed.package_name || "Package"}`;
    }
    if (parsed.type === "agreement") {
      return `Agreement sent`;
    }
    return content;
  } catch {
    return content;
  }
};
