export enum CurrentState {
  inAttesa = 0,
  presaInCarico = 1,
  inlavorazione = 2,

  // STATI TEMPORANEI
  accettatoOnline = 9,
  documentoValidato = 11,

  // ERRORI
  erroreSubmit = 5,
  erroreValidazione = 6,
  erroreConfirm = 7,
  erroreGenerico = 100
}
