/**
 * Cobertura de la campaña: nacional, una región del país o una ciudad.
 * Se usa en el nombre de archivo y como bajada en la pieza.
 */

export const NACIONAL = "Nacional";

export const REGIONS = [
  "Región Andina",
  "Región Caribe",
  "Región Pacífica",
  "Región Orinoquía",
  "Región Amazonía",
  "Región Insular",
];

export const CITIES = [
  "Bogotá",
  "Medellín",
  "Cali",
  "Barranquilla",
  "Cartagena",
  "Cúcuta",
  "Bucaramanga",
  "Pereira",
  "Santa Marta",
  "Ibagué",
  "Manizales",
  "Villavicencio",
  "Pasto",
  "Montería",
  "Neiva",
  "Armenia",
  "Popayán",
  "Sincelejo",
  "Valledupar",
  "Tunja",
  "Riohacha",
  "Florencia",
  "Yopal",
  "Quibdó",
  "Arauca",
  "Mocoa",
  "San José del Guaviare",
  "Leticia",
  "San Andrés",
  "Girardot",
  "Soacha",
  "Zipaquirá",
];

/** Todas las opciones predefinidas juntas */
export const ALL_LOCATIONS = [NACIONAL, ...REGIONS, ...CITIES];

export const LOCATION_CUSTOM = "__otra__";
