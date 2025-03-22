import { showHUD } from "@raycast/api";
import { useLocalStorage } from "@raycast/utils";

export default async function main() {
  const { setValue} = useLocalStorage("startTime", new Date());
  const now = new Date();
  setValue(now);
  
  await showHUD("Timing started at: " + now.toLocaleString());
}
