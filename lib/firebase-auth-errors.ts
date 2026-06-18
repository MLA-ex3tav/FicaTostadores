import { FirebaseError } from "firebase/app";

export function getFirebaseAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/unauthorized-domain":
        return "Dominio no autorizado en Firebase. En Authentication → Configuración → Dominios autorizados, agregue localhost y, si usa la red local, su IP (ej. 192.168.3.107).";
      case "auth/popup-closed-by-user":
        return "Inicio de sesión cancelado.";
      case "auth/popup-blocked":
        return "El navegador bloqueó la ventana de Google. Permita ventanas emergentes para este sitio.";
      case "auth/cancelled-popup-request":
        return "Espere a que termine el inicio de sesión anterior.";
      default:
        return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "No se pudo iniciar sesión con Google.";
}
