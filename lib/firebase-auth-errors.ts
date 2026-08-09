import { FirebaseError } from "firebase/app";

export function isAuthFlowCancelled(error: unknown): boolean {
  return (
    error instanceof FirebaseError &&
    (error.code === "auth/popup-closed-by-user" ||
      error.code === "auth/cancelled-popup-request")
  );
}

/**
 * Mensajes genéricos para los flujos de correo y contraseña. No revelan si un
 * correo está registrado para evitar enumeración de cuentas.
 */
function getEmailPasswordErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "El correo o la contraseña no son correctos.";
      case "auth/too-many-requests":
        return "Demasiados intentos fallidos. Espere unos minutos e intente de nuevo.";
      case "auth/invalid-password":
      case "auth/weak-password":
        return "La contraseña debe tener al menos 6 caracteres.";
      case "auth/email-already-in-use":
        return "Ya existe una cuenta con este correo. Intente iniciar sesión o recupere su contraseña.";
      case "auth/invalid-email":
        return "Ingrese un correo electrónico válido.";
      case "auth/missing-password":
        return "Ingrese su contraseña.";
      case "auth/operation-not-allowed":
        return "El inicio de sesión con correo y contraseña no está habilitado. Actívelo en Firebase Console → Authentication → Sign-in method.";
      case "auth/network-request-failed":
        return "No se pudo conectar. Revise su conexión e intente de nuevo.";
      case "auth/insufficient-permission":
        return "No dispone de permisos para realizar esta acción. Verifique el rol del usuario.";
      default:
        return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "No se pudo completar la operación.";
}

/**
 * Mensajes específicos para el flujo de Google.
 */
export function getGoogleAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    if (isAuthFlowCancelled(error)) {
      return "";
    }

    switch (error.code) {
      case "auth/unauthorized-domain":
        return "Dominio no autorizado en Firebase. En Authentication → Configuración → Dominios autorizados, agregue localhost y, si usa la red local, su IP (ej. 192.168.3.107).";
      case "auth/popup-blocked":
        return "El navegador bloqueó la ventana de Google. Permita ventanas emergentes para este sitio o desactive el bloqueador de anuncios.";
      case "auth/internal-error":
        return "Error interno de Firebase al volver de Google. Si ve init.json 404 en la consola, ejecute «firebase deploy --only hosting» una vez (ver firebase.json en el repo).";
      case "auth/network-request-failed":
        return "No se pudo conectar con Google. Revise su conexión y desactive bloqueadores de anuncios para accounts.google.com.";
      case "auth/invalid-credential":
        return "Credenciales de Google inválidas en Firebase. En Firebase Console → Authentication → Sign-in method → Google, verifique que el Web client secret coincida con Google Cloud Console → Credentials (OAuth 2.0). Si lo regeneró, vuelva a pegarlo en Firebase o desactive y reactive el proveedor Google.";
      default:
        return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "No se pudo iniciar sesión con Google.";
}

/**
 * Mensaje de error según el origen del flujo.
 */
export function getFirebaseAuthErrorMessage(
  error: unknown,
  source?: "google" | "email",
): string {
  if (source === "email") {
    return getEmailPasswordErrorMessage(error);
  }

  if (source === "google") {
    return getGoogleAuthErrorMessage(error);
  }

  if (error instanceof FirebaseError) {
    return getGoogleAuthErrorMessage(error);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "No se pudo iniciar sesión.";
}
