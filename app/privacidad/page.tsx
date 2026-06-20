import LegalPageLayout, {
  LegalList,
  LegalSection,
} from "@/components/LegalPageLayout";
import { companyInfo } from "@/lib/company";
import { LEGAL_LAST_UPDATED } from "@/lib/legal";

export const metadata = {
  title: "Política de privacidad | Fica Tostadores",
  description:
    "Política de privacidad y tratamiento de datos personales de Fica Tostadores (Empresas Fica Ltda.).",
};

export default function PrivacidadPage() {
  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="POLÍTICA DE PRIVACIDAD"
      description="Información sobre cómo recopilamos, usamos y protegemos sus datos personales al utilizar nuestro sitio web y servicios de cotización."
      lastUpdated={LEGAL_LAST_UPDATED}
    >
      <LegalSection title="1. Responsable del tratamiento">
        <p>
          El responsable del tratamiento de sus datos personales es{" "}
          <strong className="text-steel-light">{companyInfo.legalName}</strong>{" "}
          (en adelante, &quot;Fica Tostadores&quot; o &quot;nosotros&quot;),
          con domicilio en {companyInfo.address}.
        </p>
        <p>
          Para consultas sobre privacidad puede escribir a{" "}
          <a
            href={`mailto:${companyInfo.emailVentas}`}
            className="text-orange hover:underline"
          >
            {companyInfo.emailVentas}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Ámbito de aplicación">
        <p>
          Esta política aplica al sitio web de Fica Tostadores (incluidas sus
          versiones en dominios propios y en plataformas de alojamiento como
          Vercel), al formulario de contacto/cotización, al inicio de sesión con
          Google para usuarios autorizados y a las interacciones relacionadas con
          nuestro catálogo de productos.
        </p>
      </LegalSection>

      <LegalSection title="3. Datos que recopilamos">
        <p>Según cómo utilice el sitio, podemos tratar las siguientes categorías de datos:</p>
        <LegalList
          items={[
            "Datos de contacto y cotización: nombre, correo electrónico (opcional), número de teléfono/WhatsApp, mensaje y productos seleccionados que usted ingresa en el formulario de contacto, almacenados en nuestra base de datos en la nube para que el equipo comercial pueda atender su solicitud.",
            "Datos de navegación y uso: dirección IP, tipo de navegador, páginas visitadas, fecha y hora de acceso, y datos técnicos similares recopilados por nuestros proveedores de hosting y seguridad.",
            "Datos de selección de productos: identificador, nombre y capacidad de productos que usted agrega a su lista de cotización, almacenados localmente en su navegador (localStorage) hasta que los elimine o limpie el almacenamiento del sitio.",
            "Datos de autenticación (solo usuarios autorizados): si inicia sesión con Google para acceder al panel de administración, tratamos nombre, correo electrónico, identificador de usuario, foto de perfil (si la provee Google) y rol de acceso (`cliente`, `editor` o `admin`) asignado en nuestros sistemas.",
            "Imágenes y contenido comercial: fotografías y fichas técnicas de productos cargadas por personal autorizado de Fica Tostadores.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Finalidades del tratamiento">
        <p>Utilizamos sus datos para las siguientes finalidades:</p>
        <LegalList
          items={[
            "Atender solicitudes de cotización e información comercial sobre maquinaria de tostado y procesamiento.",
            "Comunicarnos con usted por WhatsApp, correo electrónico o teléfono en relación con su consulta.",
            "Operar, mantener y mejorar el sitio web, el catálogo de productos y la experiencia de usuario.",
            "Gestionar el acceso al panel administrativo y verificar permisos de usuarios autorizados.",
            "Proteger el sitio frente a abusos, fraudes, ataques y usos no autorizados (incluida la aplicación de límites de solicitudes y validación de entradas).",
            "Cumplir obligaciones legales aplicables en Chile.",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Base legal">
        <p>
          El tratamiento se fundamenta, según corresponda, en su consentimiento
          (por ejemplo, al completar el formulario de contacto o iniciar sesión
          con Google), en la ejecución de medidas precontractuales a su
          solicitud (cotizaciones), en el interés legítimo de Fica Tostadores
          para operar y asegurar el sitio, y en el cumplimiento de obligaciones
          legales.
        </p>
        <p>
          Esta política se elabora considerando la normativa chilena aplicable,
          incluida la Ley N° 19.628 sobre Protección de la Vida Privada.
        </p>
      </LegalSection>

      <LegalSection title="6. Formulario de contacto y cotizaciones">
        <p>
          Al enviar el formulario de cotización, sus datos se registran de forma
          segura en nuestros sistemas (Firebase/Firestore) para que el equipo
          comercial pueda revisar la solicitud, preparar un presupuesto y
          contactarlo por teléfono, correo o WhatsApp.
        </p>
        <p>
          Si nos contacta directamente por correo, teléfono o WhatsApp, conservaremos
          la información necesaria para dar seguimiento comercial a su consulta.
        </p>
      </LegalSection>

      <LegalSection title="7. Cookies, almacenamiento local y tecnologías similares">
        <p>El sitio puede utilizar:</p>
        <LegalList
          items={[
            "localStorage del navegador para recordar los productos seleccionados en su cotización.",
            "Cookies y almacenamiento asociados a Firebase/Google para mantener sesiones de usuarios que inician sesión con Google.",
            "Cookies técnicas o de medición propias de los servicios de hosting (Vercel) y de proveedores integrados.",
          ]}
        />
        <p>
          Puede eliminar o bloquear cookies y datos locales desde la configuración
          de su navegador. Tenga en cuenta que algunas funciones (como mantener
          su lista de cotización o la sesión de administrador) podrían dejar de
          funcionar correctamente.
        </p>
      </LegalSection>

      <LegalSection title="8. Encargados y transferencias a terceros">
        <p>
          Para operar el sitio compartimos datos con proveedores que actúan como
          encargados del tratamiento o plataformas independientes, entre ellos:
        </p>
        <LegalList
          items={[
            "Google / Firebase: autenticación, base de datos de usuarios autorizados y servicios relacionados.",
            "Vercel: alojamiento del sitio web, almacenamiento de archivos (Vercel Blob) y medidas de seguridad en el edge.",
            "Meta / WhatsApp: cuando usted elige cotizar o comunicarse por esa vía.",
          ]}
        />
        <p>
          Algunos de estos proveedores pueden procesar datos fuera de Chile. En
          esos casos adoptamos medidas contractuales y técnicas razonables para
          proteger la información conforme a la normativa aplicable.
        </p>
      </LegalSection>

      <LegalSection title="9. Plazo de conservación">
        <p>
          Conservamos los datos el tiempo necesario para las finalidades
          indicadas: mientras dure una gestión comercial activa, mientras
          mantenga una cuenta de usuario autorizada, o durante los plazos exigidos
          por ley. Los datos en localStorage permanecen en su dispositivo hasta
          que usted los elimine.
        </p>
      </LegalSection>

      <LegalSection title="10. Seguridad">
        <p>
          Aplicamos medidas técnicas y organizativas razonables, como control de
          acceso al panel administrativo, validación de entradas, limitación de
          solicitudes, uso de conexiones cifradas (HTTPS) y almacenamiento en
          infraestructura de proveedores reconocidos. Ningún sistema es
          completamente infalible; le recomendamos no compartir credenciales y
          mantener actualizado su navegador.
        </p>
      </LegalSection>

      <LegalSection title="11. Sus derechos">
        <p>
          Usted puede solicitar acceso, rectificación, cancelación u oposición al
          tratamiento de sus datos personales, cuando corresponda según la ley
          chilena, escribiendo a{" "}
          <a
            href={`mailto:${companyInfo.emailVentas}`}
            className="text-orange hover:underline"
          >
            {companyInfo.emailVentas}
          </a>
          . Responderemos dentro de plazos razonables y podremos solicitar
          información para verificar su identidad.
        </p>
        <p>
          Si considera que sus derechos no han sido respetados, puede recurrir
          ante la autoridad competente en Chile.
        </p>
      </LegalSection>

      <LegalSection title="12. Menores de edad">
        <p>
          El sitio está dirigido a personas con capacidad para contratar con fines
          comerciales o industriales. No solicitamos deliberadamente datos de
          menores de 14 años. Si detectamos datos de un menor recopilados sin
          autorización parental, procederemos a eliminarlos cuando sea posible.
        </p>
      </LegalSection>

      <LegalSection title="13. Cambios a esta política">
        <p>
          Podemos actualizar esta política para reflejar cambios legales,
          técnicos o en nuestros servicios. Publicaremos la versión vigente en
          esta página e indicaremos la fecha de última actualización. Le
          recomendamos revisarla periódicamente.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
