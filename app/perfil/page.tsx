import ClientePerfilContent from "@/components/ClientePerfilContent";
import SectionHeader from "@/components/SectionHeader";

export const metadata = {
  title: "Mi perfil | Fica Tostadores",
  description:
    "Revise el estado de sus solicitudes de cotización en Fica Tostadores.",
};

export default function PerfilPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <div className="mb-10">
        <SectionHeader
          as="h1"
          eyebrow="Cuenta"
          title={
            <>
              MI <span className="text-orange">PERFIL</span>
            </>
          }
          description="Aquí puede ver los equipos que solicitó cotizar y el estado de cada solicitud."
        />
      </div>

      <ClientePerfilContent />
    </div>
  );
}
