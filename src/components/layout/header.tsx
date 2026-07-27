import { Container } from "@/components/shared/container"
import { Logo } from "@/components/shared/logo"
import { ThemeToggle } from "@/components/shared/theme-toggle"

export function Header() {
  return (
    <header className="border-border border-b">
      <Container className="flex h-16 items-center justify-between">
        <Logo />
        <ThemeToggle />
      </Container>
    </header>
  )
}
