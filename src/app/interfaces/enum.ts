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

export enum ProductTypes{
  Rol = 1,
  lol = 2,
  tol = 3,
  mol = 4, 
  col = 5,
  agol = 6, 
  vol = 7
}

export enum Options
{
  hidePrice = 1,
  rr = 2,
  Ged = 3,
  GedPoste = 4
}


