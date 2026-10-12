import React, { useState } from 'react';
import { Download, X, Check, Rocket, Code2, AlertCircle } from 'lucide-react';
import { downloadProjectZip, downloadDistZip } from '../utils/downloadProjectZip';
import { useStore } from '../context/StoreContext';

export const ProjectDownloadModal: React.FC = () => {
  const { user, isDownloadModalOpen, setIsDownloadModalOpen, activeTab } = useStore();
  const [internalOpen, setInternalOpen] = useState(false);
  const [downloadedDist, setDownloadedDist] = useState(false);
  const [downloadedSrc, setDownloadedSrc] = useState(false);

  // STRICT REQUIREMENT: Only available on the admin side
  if (user.role !== 'admin') {
    return null;
  }

  const isOpen = isDownloadModalOpen || internalOpen;
  const handleClose = () => {
    setInternalOpen(false);
    setIsDownloadModalOpen(false);
  };

  const handleDownloadDist = () => {
    const success = downloadDistZip('web-lista-github-pages.zip');
    if (success) {
      setDownloadedDist(true);
      setTimeout(() => setDownloadedDist(false), 4000);
    }
  };

  const handleDownloadSrc = () => {
    const success = downloadProjectZip('proyecto-demo.zip');
    if (success) {
      setDownloadedSrc(true);
      setTimeout(() => setDownloadedSrc(false), 4000);
    }
  };

  return (
    <>
      {/* Floating Action Button at Bottom Right - Exclusively on Admin Side */}
      {activeTab === 'admin' && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            id="btn-open-zip-download"
            onClick={() => setInternalOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 bg-[#006241] hover:bg-[#004d33] text-white font-extrabold text-xs sm:text-sm rounded-full shadow-2xl hover:shadow-emerald-900/30 transition-all cursor-pointer border-2 border-emerald-400/40 hover:scale-105 active:scale-95"
          >
            <Rocket className="w-5 h-5 text-emerald-300 animate-pulse" />
            <span>Solución GitHub Pages & Descargas</span>
            <span className="bg-emerald-500/30 text-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-bold">
              Fix
            </span>
          </button>
        </div>
      )}

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-stone-200 space-y-5 relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1.5 pt-1">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
                <Rocket className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-stone-900">
                Solución para GitHub Pages
              </h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto">
                ¿Por qué salía la pantalla en blanco? GitHub Pages necesita los archivos compilados en JavaScript (HTML + CSS + JS), no los archivos sin compilar en TypeScript.
              </p>
            </div>

            {/* Option 1: Pre-compiled static web (Recommended) */}
            <div className="p-4 bg-emerald-50/80 rounded-2xl border-2 border-emerald-500/50 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-extrabold rounded-md uppercase">
                      Opción 1 - La más rápida
                    </span>
                    <span className="text-xs font-bold text-emerald-950">
                      Web Lista para GitHub Pages
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-900/80 mt-1 leading-relaxed">
                    Descarga el archivo <strong>web-lista-github-pages.zip</strong>. Contiene el sitio ya compilado con sus carpetas <code className="bg-emerald-100 px-1 py-0.5 rounded">assets/</code>, <code className="bg-emerald-100 px-1 py-0.5 rounded">index.html</code> y <code className="bg-emerald-100 px-1 py-0.5 rounded">.nojekyll</code>. Descomprímelo y arrastra su contenido a tu repositorio en GitHub: ¡se verá de inmediato!
                  </p>
                </div>
              </div>

              <button
                id="btn-download-dist-zip"
                onClick={handleDownloadDist}
                className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs transition-all shadow-md cursor-pointer active:scale-98"
              >
                {downloadedDist ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>¡Descargado! Revisa tu carpeta de Descargas</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-emerald-300" />
                    <span>Descargar Web Lista (web-lista-github-pages.zip)</span>
                  </>
                )}
              </button>
            </div>

            {/* Option 2: Source code with GitHub Actions */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2.5">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 bg-stone-600 text-white text-[10px] font-extrabold rounded-md uppercase">
                  Opción 2 - Automatizada
                </span>
                <span className="text-xs font-bold text-stone-800">
                  Código Fuente con GitHub Actions
                </span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Si prefieres que GitHub compile automáticamente cada cambio con Node.js, descarga este archivo con el flujo <code className="bg-stone-200 px-1 py-0.5 rounded">.github/workflows/deploy.yml</code> incluido. En GitHub ve a <strong>Settings &gt; Pages &gt; Source: GitHub Actions</strong>.
              </p>

              <button
                id="btn-download-src-zip"
                onClick={handleDownloadSrc}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs transition-all cursor-pointer"
              >
                {downloadedSrc ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>¡Descargado! Revisa tus descargas</span>
                  </>
                ) : (
                  <>
                    <Code2 className="w-4 h-4 text-stone-300" />
                    <span>Descargar Código Fuente (proyecto-demo.zip)</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Steps Guide */}
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-amber-950">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                <span>Paso a paso para ver tu tienda en darknft.github.io/demo:</span>
              </p>
              <ol className="list-decimal list-inside space-y-0.5 text-amber-800/90 pl-1 leading-relaxed">
                <li>Descarga <strong>web-lista-github-pages.zip</strong> con el botón verde de arriba.</li>
                <li>Descomprímelo en tu computadora.</li>
                <li>Entra a <a href="https://github.com/darknft/demo" target="_blank" rel="noopener noreferrer" className="underline font-bold">github.com/darknft/demo</a> y pulsa <strong>Add file &gt; Upload files</strong>.</li>
                <li>Arrastra los archivos descomprimidos (especialmente <code className="font-bold">index.html</code> y la carpeta <code className="font-bold">assets</code>) y haz commit.</li>
                <li>¡Refresca <code className="font-bold">darknft.github.io/demo/</code> y tu tienda aparecerá de inmediato!</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
