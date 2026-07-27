import { Cookie, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const cookieChoiceKey = 'toffbr-cookie-choice'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(!window.localStorage.getItem(cookieChoiceKey))
  }, [])

  function saveChoice(choice: 'essential' | 'all') {
    window.localStorage.setItem(cookieChoiceKey, choice)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <aside
      aria-label="Preferências de cookies"
      className="fixed right-4 bottom-24 left-4 z-[70] mx-auto max-w-xl rounded-2xl border border-white/10 bg-black p-4 text-white shadow-2xl sm:right-auto sm:bottom-5 sm:left-5 sm:p-5 lg:bottom-6"
    >
      <button
        type="button"
        onClick={() => saveChoice('essential')}
        aria-label="Fechar aviso de cookies"
        className="absolute top-3 right-3 grid size-8 place-items-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
      >
        <X className="size-4" />
      </button>
      <div className="flex items-start gap-3 pr-8">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-orange text-white">
          <Cookie className="size-5" />
        </span>
        <div>
          <p className="text-sm font-black">Sua experiência na ToffBrasil</p>
          <p className="mt-1 text-xs leading-5 text-white/60">
            Usamos cookies essenciais para manter o carrinho e sua sessão. Com
            sua permissão, também poderemos entender como melhorar a loja.
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => saveChoice('essential')}
          className="h-10 rounded-lg border border-white/15 px-4 text-xs font-bold text-white/75 hover:bg-white/10"
        >
          Somente necessários
        </button>
        <button
          type="button"
          onClick={() => saveChoice('all')}
          className="h-10 rounded-lg bg-brand-orange px-5 text-xs font-black text-white hover:bg-brand-orange-dark"
        >
          Aceitar cookies
        </button>
      </div>
    </aside>
  )
}
