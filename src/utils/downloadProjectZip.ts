import { PROJECT_ZIP_BASE64, DIST_ZIP_BASE64 } from './zipData';

export function downloadProjectZip(filename: string = 'proyecto-demo.zip') {
  return triggerDownload(PROJECT_ZIP_BASE64, filename);
}

export function downloadDistZip(filename: string = 'web-lista-github-pages.zip') {
  return triggerDownload(DIST_ZIP_BASE64, filename);
}

function triggerDownload(base64Data: string, filename: string): boolean {
  try {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (error) {
    console.error('Error al descargar ZIP:', error);
    return false;
  }
}
