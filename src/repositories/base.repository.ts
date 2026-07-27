/**
 * Contrato genérico que deben seguir todos los repositories de features.
 * Solo define la forma — cada feature aporta su propia implementación
 * (ver, por ejemplo, features/stores/repositories/store.repository.ts).
 */
export interface Repository<T, TId = string> {
  findAll(): Promise<T[]>
  findById(id: TId): Promise<T | null>
}
