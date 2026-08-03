import Link from "next/link";
import LegalPageLayout, {
  LegalList,
  LegalSection,
} from "@/components/LegalPageLayout";
import { companyInfo } from "@/lib/company";
import { LEGAL_LAST_UPDATED } from "@/lib/legal";

export const metadata = {
  title: "Términos y condiciones | Fica Tostadores",
  description:
    "Términos y condiciones de uso del sitio web de Fica Tostadores (Empresas Fica Ltda.).",
};

export default function TerminosPage() {
  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="TÉRMINOS Y CONDICIONES"
      description="Condiciones generales de uso del sitio web, catálogo de productos y servicios de información comercial de Fica Tostadores."
      lastUpdated={LEGAL_LAST_UPDATED}
    >
      <LegalSection title="1. Identificación">
        <p>
          El presente sitio web es operado por{" "}
          <strong className="text-steel-light">{companyInfo.legalName}</strong>,
          marca comercial <strong className="text-steel-light">{companyInfo.brand}</strong>,
          con domicilio en {companyInfo.address} (en adelante, &quot;Fica
          Tostadores&quot; o &quot;nosotros&quot;).
        </p>
        <p>
          Contacto:{" "}
          <a
            href={`mailto:${companyInfo.emailVentas}`}
            className="text-orange hover:underline"
          >
            {companyInfo.emailVentas}
          </a>
          {" · "}
          {companyInfo.phoneLandline}
        </p>
      </LegalSection>

      <LegalSection title="2. Aceptación">
        <p>
          Al acceder, navegar o utilizar este sitio web, usted declara haber
          leído y aceptado estos Términos y Condiciones y nuestra{" "}
          <Link href="/privacidad" className="text-orange hover:underline">
            Política de Privacidad
          </Link>
          . Si no está de acuerdo, debe abstenerse de usar el sitio.
        </p>
      </LegalSection>

      <LegalSection title="3. Objeto del sitio">
        <p>
          El sitio tiene fines informativos y comerciales: presentar el catálogo
          de maquinaria para tostado y procesamiento (café, frutos secos, trigo,
          equipos industriales, etc.), permitir solicitar cotizaciones y
          facilitar el contacto con nuestro equipo de ventas.
        </p>
        <p>
          Salvo acuerdo escrito distinto, el sitio no constituye una tienda en
          línea ni implica la celebración automática de contratos de compraventa.
        </p>
      </LegalSection>

      <LegalSection title="4. Uso permitido">
        <p>El usuario se compromete a utilizar el sitio de forma lícita y adecuada. Queda prohibido:</p>
        <LegalList
          items={[
            "Usar el sitio para fines fraudulentos, ilícitos o que vulneren derechos de terceros.",
            "Intentar acceder sin autorización al panel administrativo, APIs restringidas o sistemas internos.",
            "Realizar scraping masivo, ataques de denegación de servicio, pruebas de penetración no autorizadas o cualquier actividad que afecte la disponibilidad del sitio.",
            "Subir, transmitir o introducir malware, código malicioso o contenido ilegal.",
            "Reproducir, modificar o explotar comercialmente contenidos del sitio sin autorización previa y por escrito de Fica Tostadores.",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Cotizaciones e información comercial">
        <p>
          Las capacidades, especificaciones, imágenes, precios (si se publicaran)
          y descripciones de productos tienen carácter referencial. Una solicitud
          de cotización mediante el formulario, WhatsApp, correo o teléfono no
          genera obligación de venta hasta que exista una propuesta formal
          aceptada por ambas partes.
        </p>
        <p>
          Nos reservamos el derecho de modificar fichas técnicas, disponibilidad,
          configuraciones y condiciones comerciales sin previo aviso en el sitio,
          informando al cliente durante el proceso de cotización cuando corresponda.
        </p>
      </LegalSection>

      <LegalSection title="6. Propiedad intelectual">
        <p>
          El diseño del sitio, textos, logotipos, marcas, fotografías, diagramas,
          catálogos y demás contenidos son propiedad de Fica Tostadores o de sus
          licenciantes, salvo indicación contraria. Queda prohibida su reproducción,
          distribución o transformación sin autorización expresa.
        </p>
        <p>
          Las marcas de terceros mencionadas en el sitio pertenecen a sus
          respectivos titulares.
        </p>
      </LegalSection>

      <LegalSection title="7. Cuentas y acceso administrativo">
        <p>
          El acceso al panel de administración está restringido a usuarios
          expresamente autorizados por Fica Tostadores. El usuario administrador
          es responsable de mantener la confidencialidad de su cuenta Google y de
          toda actividad realizada bajo su sesión.
        </p>
        <p>
          Podemos suspender o revocar accesos ante uso indebido, incumplimiento
          de estos términos o por razones de seguridad.
        </p>
      </LegalSection>

      <LegalSection title="8. Enlaces a terceros">
        <p>
          El sitio puede contener enlaces a WhatsApp, redes sociales, Google u
          otros servicios externos. Fica Tostadores no controla ni es responsable
          del contenido, políticas o prácticas de sitios de terceros. El acceso a
          ellos es bajo su propia responsabilidad.
        </p>
      </LegalSection>

      <LegalSection title="9. Disponibilidad y modificaciones">
        <p>
          Procuramos mantener el sitio disponible y actualizado, pero no
          garantizamos operación ininterrumpida ni libre de errores. Podemos
          modificar, suspender o discontinuar funciones, contenidos o el sitio
          completo, temporal o permanentemente, con o sin aviso previo.
        </p>
      </LegalSection>

      <LegalSection title="10. Limitación de responsabilidad">
        <p>
          En la medida permitida por la ley chilena, Fica Tostadores no será
          responsable por daños indirectos, lucro cesante, pérdida de datos o
          perjuicios derivados del uso o imposibilidad de uso del sitio, de
          enlaces externos, de interrupciones del servicio o de decisiones
          tomadas exclusivamente con base en información publicada en línea sin
          confirmación comercial.
        </p>
        <p>
          Nada en estos términos limita derechos irrenunciables del consumidor
          cuando la normativa aplicable así lo exija en una relación
          contractual específica.
        </p>
      </LegalSection>

      <LegalSection title="11. Indemnidad">
        <p>
          El usuario indemnizará y mantendrá indemne a Fica Tostadores frente a
          reclamos, daños o gastos (incluidos honorarios legales razonables)
          derivados de su uso indebido del sitio o incumplimiento de estos
          términos.
        </p>
      </LegalSection>

      <LegalSection title="12. Ley aplicable y jurisdicción">
        <p>
          Estos términos se rigen por las leyes de la República de Chile. Cualquier
          controversia será sometida a los tribunales ordinarios de justicia de
          la ciudad de Temuco, salvo norma imperativa en contrario.
        </p>
      </LegalSection>

      <LegalSection title="13. Modificaciones de los términos">
        <p>
          Podemos actualizar estos Términos y Condiciones en cualquier momento.
          La versión vigente estará publicada en esta página con su fecha de
          actualización. El uso continuado del sitio después de un cambio
          implica la aceptación de la nueva versión.
        </p>
      </LegalSection>

      <LegalSection title="14. Contacto">
        <p>
          Para consultas sobre estos términos, escriba a{" "}
          <a
            href={`mailto:${companyInfo.emailVentas}`}
            className="text-orange hover:underline"
          >
            {companyInfo.emailVentas}
          </a>{" "}
          o visite nuestra página de{" "}
          <Link href="/contacto" className="text-orange hover:underline">
            contacto
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
