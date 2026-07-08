import { AtSign, Box, Camera, Code2 } from 'lucide-react'
import { Link } from 'react-router-dom'

type FooterProps = {
  compact?: boolean
}

export function Footer({ compact = false }: FooterProps) {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div
        className={
          compact
            ? 'flex flex-col gap-4 px-5 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8'
            : 'mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-[1.4fr_1fr_1fr]'
        }
      >
        {compact ? (
          <>
            <p>© {new Date().getFullYear()} Toff Brasil. Todos os direitos reservados.</p>
            <div className="flex gap-5">
              <Link to="/" className="hover:text-brand-orange">
                Início
              </Link>
              <Link to="/login" className="hover:text-brand-orange">
                Suporte
              </Link>
              <button className="hover:text-brand-orange">Privacidade</button>
            </div>
          </>
        ) : (
          <>
            <div>
              <Link to="/" className="inline-flex items-center gap-3">
                <img
                  src="/brand/logo-toffbr.jpeg"
                  alt="Toff Brasil"
                  className="size-12 rounded-xl bg-white object-contain p-1"
                />
                <span className="text-xl font-bold text-brand-navy">Toff Brasil</span>
              </Link>
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
                Impressões 3D feitas para transformar ideias em objetos úteis,
                criativos e personalizados.
              </p>
              <div className="mt-5 flex gap-2">
                {[Camera, Code2, AtSign].map((Icon, index) => (
                  <button
                    key={index}
                    aria-label="Rede social da Toff Brasil"
                    className="grid size-10 place-items-center rounded-full border text-slate-500 transition hover:border-orange-200 hover:text-brand-orange"
                  >
                    <Icon className="size-4" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-brand-navy">Navegação</h2>
              <nav className="mt-4 flex flex-col gap-3 text-sm text-slate-500">
                <a href="#catalogo" className="hover:text-brand-orange">
                  Catálogo
                </a>
                <a href="#como-funciona" className="hover:text-brand-orange">
                  Como funciona
                </a>
                <Link to="/login" className="hover:text-brand-orange">
                  Entrar
                </Link>
                <Link to="/cadastro" className="hover:text-brand-orange">
                  Criar conta
                </Link>
              </nav>
            </div>

            <div>
              <h2 className="font-semibold text-brand-navy">Atendimento</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-500">
                <p>Segunda a sexta, das 8h às 18h.</p>
                <p>contato@toffbr.com.br</p>
                <p className="flex items-center gap-2">
                  <Box className="size-4 text-brand-orange" />
                  Produção sob demanda
                </p>
              </div>
            </div>

            <div className="border-t pt-6 text-sm text-slate-400 md:col-span-3 md:flex md:items-center md:justify-between">
              <p>© {new Date().getFullYear()} Toff Brasil. Todos os direitos reservados.</p>
              <div className="mt-3 flex gap-5 md:mt-0">
                <button className="hover:text-brand-orange">Termos de uso</button>
                <button className="hover:text-brand-orange">
                  Política de privacidade
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </footer>
  )
}
