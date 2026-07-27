import {
  CreditCard,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { authService } from '../../services/auth-service'

const whatsappNumber =
  import.meta.env.VITE_MANAGER_WHATSAPP ?? '553488560330'
const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`
const displayPhone = '(34) 98856-0330'

const paymentMethods = ['PIX']

export function Footer() {
  const isAuthenticated = authService.isAuthenticated()

  return (
    <footer className="mt-10 border-t border-white/10 bg-black text-white">
      {!isAuthenticated && <div className="bg-brand-orange">
        <div className="container-store flex flex-col items-center gap-4 py-5 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-sm font-black">Novidades do universo 3D</p>
            <p className="mt-0.5 text-xs text-white/75">
              Lançamentos, reposições e dicas para imprimir melhor.
            </p>
          </div>
          <Link
              to="/cadastro"
              className="inline-flex h-10 w-fit items-center rounded-lg bg-white px-5 text-xs font-black text-brand-navy transition hover:-translate-y-0.5"
            >
              Criar minha conta
            </Link>
        </div>
      </div>}

      <div className="container-store grid gap-9 py-10 text-center sm:grid-cols-2 sm:text-left lg:grid-cols-[1.35fr_0.8fr_0.8fr_1.15fr]">
        <div>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-3 sm:justify-start"
          >
            <span className="grid size-12 place-items-center overflow-hidden rounded-xl bg-white p-1">
              <img
                src="/brand/logo-toffbr.jpeg"
                alt="Toff Brasil"
                className="size-full object-contain"
              />
            </span>
            <span>
              <strong className="block text-lg font-black tracking-tight">
                Toff Brasil
              </strong>
              <small className="mt-1 block text-[9px] font-bold tracking-[0.14em] text-white/40 uppercase">
                Impressão 3D
              </small>
            </span>
          </Link>
          <p className="mx-auto mt-4 max-w-sm text-xs leading-6 text-white/55 sm:mx-0">
            Filamentos, impressoras, peças e acessórios com curadoria técnica,
            envio nacional e atendimento especializado.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-xs font-black text-white transition hover:bg-emerald-600"
          >
            <MessageCircle className="size-4" />
            Falar no WhatsApp
          </a>
        </div>

        <div>
          <h2 className="text-xs font-black tracking-[0.14em] text-brand-orange uppercase">
            Categorias
          </h2>
          <nav className="mt-4 flex flex-col items-center gap-3 text-xs font-semibold text-white/60 sm:items-start">
            <Link to="/catalogo?material=PLA" className="hover:text-white">
              Filamentos PLA
            </Link>
            <Link to="/catalogo?material=PETG" className="hover:text-white">
              Filamentos PETG
            </Link>
            <Link
              to="/catalogo?grupo=IMPRESSORAS"
              className="hover:text-white"
            >
              Impressoras 3D
            </Link>
            <Link
              to="/catalogo?grupo=ACESSORIOS"
              className="hover:text-white"
            >
              Peças e acessórios
            </Link>
            <Link to="/catalogo?prevenda=1" className="hover:text-white">
              Pré-venda
            </Link>
          </nav>
        </div>

        <div>
          <h2 className="text-xs font-black tracking-[0.14em] text-brand-orange uppercase">
            Ajuda
          </h2>
          <nav className="mt-4 flex flex-col items-center gap-3 text-xs font-semibold text-white/60 sm:items-start">
            <Link to="/conta" className="hover:text-white">
              Minha conta
            </Link>
            <Link to="/pedidos" className="hover:text-white">
              Meus pedidos
            </Link>
            <Link to="/carrinho" className="hover:text-white">
              Carrinho
            </Link>
            {!isAuthenticated && (
              <Link to="/login" className="hover:text-white">
                Entrar
              </Link>
            )}
            <span>Trocas e devoluções</span>
          </nav>
        </div>

        <div>
          <h2 className="text-xs font-black tracking-[0.14em] text-brand-orange uppercase">
            Dados de contato
          </h2>
          <div className="mt-4 space-y-3 text-xs leading-5 text-white/60">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-start justify-center gap-2 hover:text-white sm:justify-start"
            >
              <Phone className="mt-0.5 size-4 shrink-0 text-brand-orange" />
              {displayPhone}
            </a>
            <a
              href="mailto:contato@toffbr.com.br"
              className="flex items-start justify-center gap-2 hover:text-white sm:justify-start"
            >
              <Mail className="mt-0.5 size-4 shrink-0 text-brand-orange" />
              contato@toffbr.com.br
            </a>
            <p className="flex items-start justify-center gap-2 sm:justify-start">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand-orange" />
              Atendimento e envio para todo o Brasil
            </p>
            <p>Segunda a sexta, das 8h às 18h.</p>
          </div>
        </div>
      </div>

      <div className="border-y border-white/10 bg-white/[0.025]">
        <div className="container-store grid gap-6 py-6 text-center md:grid-cols-3 md:text-left">
          <div>
            <p className="flex items-center justify-center gap-2 text-[10px] font-black tracking-[0.13em] text-white/45 uppercase md:justify-start">
              <CreditCard className="size-4 text-brand-orange" />
              Formas de pagamento
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
              {paymentMethods.map((method) => (
                <span
                  key={method}
                  className="rounded-md bg-white px-2.5 py-1.5 text-[9px] font-black text-brand-navy"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="flex items-center justify-center gap-2 text-[10px] font-black tracking-[0.13em] text-white/45 uppercase md:justify-start">
              <Truck className="size-4 text-brand-orange" />
              Meios de envio
            </p>
            <div className="mt-3 flex justify-center gap-2 md:justify-start">
              {['Correios', 'Transportadora'].map((method) => (
                <span
                  key={method}
                  className="rounded-md border border-white/15 px-2.5 py-1.5 text-[9px] font-bold text-white/70"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="flex items-center justify-center gap-2 text-[10px] font-black tracking-[0.13em] text-white/45 uppercase md:justify-start">
              <ShieldCheck className="size-4 text-brand-orange" />
              Segurança
            </p>
            <p className="mt-3 text-[10px] leading-5 font-semibold text-white/60">
              Compra protegida e dados transmitidos com segurança.
            </p>
          </div>
        </div>
      </div>

      <div className="container-store flex flex-col items-center gap-3 py-5 text-center text-[10px] text-white/35 sm:flex-row sm:justify-between sm:text-left">
        <p>
          © {new Date().getFullYear()} Toff Brasil. Todos os direitos reservados.
        </p>
        <div className="flex gap-5">
          <span>Termos de uso</span>
          <span>Política de privacidade</span>
        </div>
      </div>
    </footer>
  )
}
