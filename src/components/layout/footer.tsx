import { Container } from "@/components/shared/container"
import { APP_CONFIG } from "@/shared/constants/config"

export function Footer() {
  return (
    <footer className="border-border border-t">
      <Container className="text-muted-foreground flex h-16 items-center justify-center text-sm">
        © {new Date().getFullYear()} {APP_CONFIG.siteName}
      </Container>
    </footer>
  )
}
