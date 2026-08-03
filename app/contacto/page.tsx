import ContactoPageContent from "@/components/ContactoPageContent";

import { companyInfo } from "@/lib/company";



export const metadata = {

  title: "Contacto | Fica Tostadores",

  description:

    "Contacte a Fica Tostadores para consultas sobre maquinaria industrial de tostado.",

};



export default function ContactoPage() {

  return (

    <div className="mx-auto max-w-6xl px-4 py-12 pb-16 sm:py-16 md:px-6 md:py-24">

      <ContactoPageContent>

        <div>

          <p className="text-xs uppercase tracking-[0.3em] text-steel-dark">

            Hablemos

          </p>

          <h1 className="mt-3 font-display text-4xl tracking-wide text-steel-light md:text-5xl">

            <span className="text-orange">CONTACTO</span>

          </h1>

          <p className="mt-4 text-base leading-relaxed text-steel-mid md:leading-relaxed">

            Complete el formulario con sus datos y los equipos de interés. Su

            solicitud llegará al equipo comercial para preparar la cotización.

          </p>



          <div className="lg:hidden mt-8">

            <div>

              <dl className="space-y-4 text-sm">

              <div>

                <dt className="text-sm font-medium uppercase tracking-widest text-steel-dark md:text-xs md:font-normal">

                  Correo

                </dt>

                <dd className="mt-1.5 text-steel-mid md:mt-1">

                  <a

                    href={`mailto:${companyInfo.emailVentas}`}

                    className="break-all hover:text-orange transition-colors md:break-normal"

                  >

                    {companyInfo.emailVentas}

                  </a>

                </dd>

              </div>

              {companyInfo.phones.map((phone) => (

                <div key={phone.href}>

                  <dt className="text-sm font-medium uppercase tracking-widest text-steel-dark md:text-xs md:font-normal">

                    {phone.label}

                  </dt>

                  <dd className="mt-1.5 text-steel-mid md:mt-1">

                    <a

                      href={phone.whatsapp}

                      target="_blank"

                      rel="noopener noreferrer"

                      className="inline-block min-h-11 py-1 hover:text-orange transition-colors md:inline md:min-h-0 md:py-0"

                    >

                      {phone.value}

                    </a>

                  </dd>

                </div>

              ))}

              <div>

                <dt className="text-sm font-medium uppercase tracking-widest text-steel-dark md:text-xs md:font-normal">

                  Teléfono fijo

                </dt>

                <dd className="mt-1.5 text-steel-mid md:mt-1">

                  <a

                    href={`tel:${companyInfo.phoneLandline.replace(/\s/g, "")}`}

                    className="inline-block min-h-11 py-1 hover:text-orange transition-colors md:inline md:min-h-0 md:py-0"

                  >

                    {companyInfo.phoneLandline}

                  </a>

                </dd>

              </div>

              <div>

                <dt className="text-sm font-medium uppercase tracking-widest text-steel-dark md:text-xs md:font-normal">

                  Fábrica

                </dt>

                <dd className="mt-1.5 leading-relaxed text-steel-mid md:mt-1 md:leading-normal">

                  {companyInfo.address}

                </dd>

              </div>

              </dl>

            </div>

          </div>

        </div>

      </ContactoPageContent>

    </div>

  );

}


