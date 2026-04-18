import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SosButton } from "@/features/safety/sos-button";

export const metadata = { title: "SOS" };

export default function SosPage() {
  return (
    <div className="mx-auto max-w-xl">
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Urgence</CardTitle>
          <CardDescription>
            En cas d'urgence vitale, composez le <strong>15</strong> (SAMU) ou <strong>112</strong>. Le
            bouton ci-dessous prévient vos contacts de confiance avec votre position.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SosButton />
        </CardContent>
      </Card>
    </div>
  );
}
