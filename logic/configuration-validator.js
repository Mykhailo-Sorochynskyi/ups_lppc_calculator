export function overallConfigurationStatus(checks) {
  if (checks.some((check) => check === "ERROR" || check === "NOT COMPLIANT")) return "NOT COMPLIANT";
  if (checks.some((check) => check === "WARNING")) return "WARNING";
  return "OK";
}
