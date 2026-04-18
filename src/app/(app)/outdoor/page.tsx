import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OutdoorTracker } from "@/features/outdoor/outdoor-tracker";

export const metadata = { title: "Outdoor" };

export default function OutdoorPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Outdoor live</h1>
        <p className="text-muted-foreground">Course, vélo, marche. GPS en direct, zones cardio.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Tracker</CardTitle>
          <CardDescription>
            Démarrez, pausez, arrêtez. Votre position reste privée — utilisée uniquement pendant la
            session.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OutdoorTracker />
        </CardContent>
      </Card>
    </div>
  );
}
