import Link from "next/link";
import { companyInfo } from "@/lib/company";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-steel-dark/30 bg-panel">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="font-display text-xl tracking-widest text-orange">
              FICA TOSTADORES
            </p>
            <p className="mt-2 text-base text-steel-mid">
              {companyInfo.legalName}. Maquinaria industrial para tostado de
              café, frutos secos, granos y semillas. Fabricado en Chile, IX
              Región.
            </p>
          </div>

          <div>
            <p className="flex items-center gap-2.5 text-sm uppercase tracking-widest text-steel-dark">
              <span className="h-px w-5 bg-orange" aria-hidden="true" />
              Navegación
            </p>
            <ul className="mt-4 space-y-2 text-base text-steel-mid">
              <li>
                <Link
                  href="/"
                  className="transition-colors hover:text-orange hover:underline underline-offset-4"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/productos"
                  className="transition-colors hover:text-orange hover:underline underline-offset-4"
                >
                  Productos
                </Link>
              </li>
              <li>
                <Link
                  href="/contacto"
                  className="transition-colors hover:text-orange hover:underline underline-offset-4"
                >
                  Cotizar
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="flex items-center gap-2.5 text-sm uppercase tracking-widest text-steel-dark">
              <span className="h-px w-5 bg-orange" aria-hidden="true" />
              Contacto
            </p>
            <ul className="mt-4 space-y-2 text-base text-steel-mid">
              <li>
                <a
                  href={`mailto:${companyInfo.emailVentas}`}
                  className="transition-colors hover:text-orange hover:underline underline-offset-4"
                >
                  {companyInfo.emailVentas}
                </a>
              </li>
              {companyInfo.phones.map((phone) => (
                <li key={phone.href}>
                  <a
                    href={phone.href}
                    className="transition-colors hover:text-orange hover:underline underline-offset-4"
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
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-steel-mid">
            <Link href="/privacidad" className="hover:text-orange transition-colors">
              Política de privacidad
            </Link>
            <Link href="/terminos" className="hover:text-orange transition-colors">
              Términos y condiciones
            </Link>
          </div>
          <p className="text-center text-sm text-steel-dark">
            © {new Date().getFullYear()} {companyInfo.brand}. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
