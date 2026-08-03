import { FirebaseError } from "firebase/app";

export function isAuthFlowCancelled(error: unknown): boolean {
  return (
    error instanceof FirebaseError &&
    (error.code === "auth/popup-closed-by-user" ||
      error.code === "auth/cancelled-popup-request")
  );
}

export function getFirebaseAuthErrorMessage(error: unknown): string {
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
