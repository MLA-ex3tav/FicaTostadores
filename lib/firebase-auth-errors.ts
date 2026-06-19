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
        return "El navegador bloqueó la ventana de Google. Permita ventanas emergentes para este sitio.";
      default:
        return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "No se pudo iniciar sesión con Google.";
}
