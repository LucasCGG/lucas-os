import { HealthAttributes } from "../attributes/HealthAttributes";

export const isHealthAttributes = (
  attributes: unknown
): attributes is HealthAttributes => {
  return (
    typeof attributes === "object" &&
    attributes !== null &&
    "getMaxHealth" in attributes &&
    typeof attributes.getMaxHealth === "function" &&
    "getCurrentHealth" in attributes &&
    typeof attributes.getCurrentHealth === "function"
  );
}
