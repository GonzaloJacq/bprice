import { Container } from "@/components/shared/container"
import { Section } from "@/components/shared/section"

/**
 * Placeholder mínimo — necesario para que la app compile y arranque.
 * No es una pantalla de feature: las pantallas reales se construyen
 * en una iteración futura, sobre la arquitectura ya definida.
 */
export default function Home() {
  return (
    <Container>
      <Section className="flex flex-col items-center justify-center gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">BPrice</h1>
        <p className="text-muted-foreground text-sm">
          Arquitectura base lista. Las pantallas se construyen en una próxima
          iteración.
        </p>
      </Section>
    </Container>
  )
}
