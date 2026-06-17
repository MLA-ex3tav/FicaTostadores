import ContactoPageContent from "@/components/ContactoPageContent";
import { companyInfo } from "@/lib/company";

export const metadata = {
  title: "Contacto | Fica Tostadores",
  description:
    "Contacte a Fica Tostadores para consultas sobre maquinaria industrial de tostado.",
};

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <ContactoPageContent>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-steel-dark">
            Hablemos
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-wide text-steel-light md:text-5xl">
            <span className="text-orange">CONTACTO</span>
          </h1>
          <p className="mt-4 text-steel-mid leading-relaxed">
            Complete el formulario con su nombre y WhatsApp. Le abriremos
            WhatsApp para enviar la cotización directamente.
          </p>

          <div className="rivet-divider my-8 max-w-xs">
            <span />
          </div>

          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-widest text-steel-dark">
                Correo
              </dt>
              <dd className="mt-1 text-steel-mid">
                <a
                  href={`mailto:${companyInfo.emailVentas}`}
                  className="hover:text-orange transition-colors"
                >
                  {companyInfo.emailVentas}
                </a>
              </dd>
            </div>
            {companyInfo.phones.map((phone) => (
              <div key={phone.href}>
                <dt className="text-xs uppercase tracking-widest text-steel-dark">
                  {phone.label}
                </dt>
                <dd className="mt-1 text-steel-mid">
                  <a
                    href={phone.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-orange transition-colors"
                  >
                    {phone.value}
                  </a>
                </dd>
              </div>
            ))}
            <div>
              <dt className="text-xs uppercase tracking-widest text-steel-dark">
                Teléfono fijo
              </dt>
              <dd className="mt-1 text-steel-mid">{companyInfo.phoneLandline}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-steel-dark">
                Fábrica
              </dt>
              <dd className="mt-1 text-steel-mid">{companyInfo.address}</dd>
            </div>
          </dl>
        </div>
      </ContactoPageContent>
    </div>
  );
}
