export function sanitizeFileName(input: string): string {
  // caractères interdits Windows: \ / : * ? " < > |
  const forbidden = /[\\\/:*?"<>|]/g;
  let clean = input.replace(forbidden, "_");

  // enlever espaces inutiles au début/fin
  clean = clean.trim();

  // remplacer plusieurs espaces par 1 seul
  clean = clean.replace(/\s+/g, " ");

  // éviter que ça finisse par . ou espace
  clean = clean.replace(/[. ]+$/, "");

  // éviter les noms réservés Windows
  const reserved = [
    "CON","PRN","AUX","NUL",
    "COM1","COM2","COM3","COM4","COM5","COM6","COM7","COM8","COM9",
    "LPT1","LPT2","LPT3","LPT4","LPT5","LPT6","LPT7","LPT8","LPT9"
  ];
  if (reserved.includes(clean.toUpperCase())) {
    clean = "_" + clean;
  }

  return clean || "";
}