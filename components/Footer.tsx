import Link from "next/link";
import { companyInfo } from "@/lib/company";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-steel-dark/30 bg-panel">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="rivet-divider mb-8">
          <span />
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="font-display text-lg tracking-widest text-orange">
              FICA TOSTADORES
            </p>
            <p className="mt-2 text-sm text-steel-mid">
              {companyInfo.legalName}. Maquinaria industrial para tostado de
              café, frutos secos, granos y semillas. Fabricado en Chile, IX
              Región.
            </p>
          </div>

          <div>
            <p className="mb-3 text-xs uppercase tracking-widest text-steel-dark">
              Navegación
            </p>
            <ul className="space-y-2 text-sm text-steel-mid">
              <li>
                <Link href="/" className="hover:text-orange transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/productos"
                  className="hover:text-orange transition-colors"
                >
                  Productos
                </Link>
              </li>
              <li>
                <Link
                  href="/contacto"
                  className="hover:text-orange transition-colors"
                >
                  Cotizar
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs uppercase tracking-widest text-steel-dark">
              Contacto
            </p>
            <ul className="space-y-2 text-sm text-steel-mid">
              <li>
                <a
                  href={`mailto:${companyInfo.emailVentas}`}
                  className="hover:text-orange transition-colors"
                >
                  {companyInfo.emailVentas}
                </a>
              </li>
              {companyInfo.phones.map((phone) => (
                <li key={phone.href}>
                  <a
                    href={phone.href}
                    className="hover:text-orange transition-colors"
                  >
                    {phone.value}
                  </a>
                </li>
              ))}
              <li>{companyInfo.phoneLandline}</li>
              <li>{companyInfo.address}</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 border-t border-steel-dark/20 pt-8">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-steel-mid">
            <Link href="/privacidad" className="hover:text-orange transition-colors">
              Política de privacidad
            </Link>
            <Link href="/terminos" className="hover:text-orange transition-colors">
              Términos y condiciones
            </Link>
          </div>
          <p className="text-center text-xs text-steel-dark">
            © {new Date().getFullYear()} {companyInfo.brand}. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
