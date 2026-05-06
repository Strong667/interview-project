import { DirectionsWizard } from "@/components/directions-wizard";
import { getDirections, getRoleTech } from "@/lib/db";

export default function DirectionsPage() {
  return <DirectionsWizard directions={getDirections()} roleTech={getRoleTech()} />;
}
