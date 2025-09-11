import { customAlert } from '../components/customAlert';


// Fonction utilitaire pour valider une URL
function isValidUrl(urlString: string): boolean {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
}

export function Verify( urlInput : HTMLInputElement | null): string{
    if (!urlInput) {
      //console.error("Input URL introuvable (selector: input.url-input)");
      customAlert(
        {
          title: "URL Input Not Found",
          subtitle: "Cannot detect the input field",
          message: `The URL input field could not be found on this page (selector: input.url-input).
      Please make sure the input exists and try again.`
        },
        10000,   // Durée un peu plus longue pour lecture
        "error" // Type : fond rouge
      );


      return 'Input URL introuvable';
    }

    const url = urlInput.value.trim();

    if (!url) {
      customAlert(
        {
          title: "No URL Detected",
          subtitle: "Cannot proceed with download",
          message: `No URL could be found on this page. 
      Please check that you have copied a valid URL and try again.`
        },
        10000,   // Durée un peu plus longue pour lecture
        "error" // Type : fond rouge
      );
      urlInput.focus();
      return 'URL Not Detected';
    }

    if (!isValidUrl(url)) {
      customAlert(
        {
          title: "Invalid URL",
          subtitle: "Download cannot proceed",
          message: `The URL you entered is not valid or cannot be processed.
          Please check the URL and try again. Make sure it points to a valid video or supported resource.`
        },
      10000, // un peu plus longtemps pour que l'utilisateur ait le temps de lire
        "error"
      );

      urlInput.focus();
      return 'Invalid URL';
    }

    return url
}