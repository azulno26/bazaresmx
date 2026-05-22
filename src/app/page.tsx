import Image from "next/image";
import { getBazaresFromSheets } from "@/src/lib/sheets";
import Link from "next/link";

export const revalidate = 86400;

export default async function LandingPage() {
  const bazares = await getBazaresFromSheets();
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. NAVBAR */}
      <nav className="w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="text-2xl font-title font-extrabold text-[#1a1a1a] tracking-tight">
            Bazares<span className="text-accent">MX</span>
          </div>
          <Link 
            href="/publica-tu-bazar"
            className="bg-accent text-white px-6 py-2.5 rounded-full font-bold hover:brightness-110 transition shadow-lg shadow-accent/20"
          >
            Publica tu bazar
          </Link>
        </div>
      </nav>

      <main>
        {/* 2. HERO */}
        <section className="px-6 pt-16 pb-24 md:pt-24 md:pb-32 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center bg-[#D1F2E8] text-primary px-4 py-1.5 rounded-full text-sm font-bold mb-8">
            El directorio de bazares en México
          </div>
          <h1 className="font-syne font-extrabold text-6xl md:text-8xl tracking-tighter leading-none text-center text-[#1a1a1a] mb-6">
            Encuentra el bazar <br className="hidden md:block" /> que <span className="text-accent">buscabas</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto font-medium">
            Bazares, vendimias y mercados en un solo lugar.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link 
              href="/bazares"
              className="w-full sm:w-auto bg-primary text-white px-10 py-5 rounded-2xl font-extrabold text-lg hover:brightness-110 transition shadow-xl shadow-primary/20 text-center"
            >
              Explorar bazares
            </Link>
            <Link 
              href="/publica-tu-bazar"
              className="w-full sm:w-auto border-3 border-primary text-primary px-10 py-5 rounded-2xl font-extrabold text-lg hover:bg-primary/5 transition text-center"
            >
              Publica tu bazar gratis →
            </Link>
          </div>
        </section>

        {/* 3. SECCIÓN PROBLEMA */}
        <section className="bg-[#1D9E75] text-white py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-title font-extrabold text-center mb-16 tracking-tight">
              ¿Por qué existe BazaresMX?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: "📱", title: "Todo en Facebook", desc: "Los eventos se pierden entre publicaciones" },
                { icon: "🔍", title: "Difícil de encontrar", desc: "No hay un lugar donde buscar por ciudad o fecha" },
                { icon: "📣", title: "Poca visibilidad", desc: "Los organizadores no llegan a más asistentes" }
              ].map((item, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-xl p-10 rounded-3xl border border-white/20 hover:bg-white/15 transition group">
                  <div className="text-5xl mb-6 group-hover:scale-110 transition duration-300">{item.icon}</div>
                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-white/80 text-lg leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. CÓMO FUNCIONA */}
        <section className="py-32 px-6 max-w-7xl mx-auto w-full">
          <div className="text-center mb-20">
            <span className="text-accent font-black tracking-widest uppercase text-sm">Cómo funciona</span>
            <h2 className="text-5xl font-title font-extrabold mt-4 tracking-tight">Simple para todos</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-16">
            {[
              { num: "01", title: "Busca", desc: "filtra por ciudad, fecha y tipo" },
              { num: "02", title: "Descubre", desc: "horarios, ubicación, info de expositores" },
              { num: "03", title: "Asiste o vende", desc: "contacta directo al organizador" }
            ].map((step, i) => (
              <div key={i} className="border-l-[6px] border-[#9FE1CB] pl-8 py-4 relative">
                <span className="text-7xl font-title font-extrabold text-[#9FE1CB] opacity-50 block mb-6 leading-none">{step.num}</span>
                <h3 className="text-3xl font-bold mb-4 tracking-tight">{step.title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. BAZARES DESTACADOS */}
        <section className="bg-[#FFF3EC] py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <span className="text-accent font-black tracking-widest uppercase text-sm">Próximos eventos</span>
              <h2 className="text-5xl font-title font-extrabold mt-4 text-[#1a1a1a] tracking-tight">Bazares destacados</h2>
              <p className="text-xl text-gray-600 mt-4 font-medium">Los eventos más populares esta temporada</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bazares.map((bazar) => (
                <Link key={bazar.id} href={`/bazares/${bazar.slug}`}>
                  <div className="bg-white rounded-[2rem] overflow-hidden shadow-2xl shadow-accent/5 hover:shadow-accent/10 transition duration-500 group cursor-pointer h-full">
                    <div className="relative h-64 w-full overflow-hidden">
                      {bazar.imagen && bazar.imagen !== "" ? (
                        <Image 
                          src={bazar.imagen} 
                          alt={bazar.nombre} 
                          fill 
                          className="object-cover group-hover:scale-105 transition duration-700"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-lg p-4 text-center">
                          📸 Imagen próximamente
                        </div>
                      )}
                      {(bazar as any).badge === "destacado" && (
                        <div className="absolute top-4 left-4 z-10">
                          <span className="bg-[#0B5E43] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                            ⭐ Destacado
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-8">
                      <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                        {bazar.tipo}
                      </span>
                      <h3 className="text-2xl font-bold mt-5 mb-3 group-hover:text-primary transition">{bazar.nombre}</h3>
                      <div className="flex flex-col gap-2 text-gray-500 font-medium">
                        <span className="flex items-center gap-2">📍 {bazar.ciudad}, {bazar.colonia}</span>
                        <span className="flex items-center gap-2">
                          📅 {"fechas" in bazar && Array.isArray((bazar as any).fechas)
                            ? `${(bazar as any).fechas.map((f: string) => new Date(f + "T00:00:00").toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })).join(' · ')}`
                            : `${new Date(bazar.fecha + "T00:00:00").toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}`
                          }
                        </span>
                        {bazar.horario && bazar.horario !== "" && bazar.horario.toLowerCase() !== "por confirmar" && (
                          <span className="flex items-center gap-2">📅 {bazar.horario}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 6. SECCIÓN ORGANIZADORES */}
        <section className="py-32 px-6 max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="text-accent font-black tracking-widest uppercase text-sm">Para organizadores</span>
              <h2 className="text-5xl font-title font-extrabold mt-4 mb-10 tracking-tight">¿Organizas bazares?</h2>
              <ul className="space-y-6">
                {[
                  "Página propia con toda la info de tu bazar",
                  "Aparece en búsquedas de Google",
                  "Contacto directo con expositores interesados",
                  "Los primeros bazares se publican gratis*"
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-accent flex-shrink-0 flex items-center justify-center mt-1">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                    <span className="text-xl text-gray-700 font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-primary p-12 md:p-16 rounded-[3rem] text-white shadow-2xl shadow-primary/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
              <h3 className="text-4xl font-bold mb-6 relative z-10">Publica tu bazar</h3>
              <div className="inline-flex bg-yellow-brand text-[#1a1a1a] px-5 py-1.5 rounded-full font-black text-sm mb-10 relative z-10 shadow-lg">
                ✓ Gratis al inicio*
              </div>
              <Link 
                href="/publica-tu-bazar"
                className="w-full bg-white text-primary py-5 rounded-2xl font-extrabold text-xl hover:bg-gray-50 transition shadow-xl relative z-10 block text-center"
              >
                Quiero publicar mi bazar →
              </Link>
              <p className="text-[10px] md:text-xs text-white/70 text-center mt-4 relative z-10 font-medium">
                *Por tiempo limitado durante el lanzamiento de la plataforma
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* 7. FOOTER */}
      <footer className="bg-[#1a1a1a] text-white py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="text-4xl font-title font-extrabold mb-6 tracking-tight">
            Bazares<span className="text-accent">MX</span>
          </div>
          <div className="h-px w-24 bg-white/20 mb-8"></div>
          <p className="text-white/50 text-lg font-medium mb-2">
            El directorio digital de bazares en México · 2026
          </p>
          <p className="text-white/30 text-xs">
            Desarrollado por 💡 <a href="https://www.flowisolutions.com/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-bold">Flowi Solutions</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
