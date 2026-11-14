import localFont from "next/font/local";

// Font di-host sendiri dari paket npm (@fontsource-variable): tanpa permintaan
// ke Google, lebih cepat di jaringan lambat, dan build tidak butuh internet.
export const baloo = localFont({
  src: [
    {
      path: "../node_modules/@fontsource-variable/baloo-2/files/baloo-2-latin-wght-normal.woff2",
      style: "normal",
      weight: "400 800",
    },
  ],
  variable: "--font-baloo",
  display: "swap",
});

export const jakarta = localFont({
  src: [
    {
      path: "../node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2",
      style: "normal",
      weight: "400 800",
    },
  ],
  variable: "--font-jakarta",
  display: "swap",
});

export const fraunces = localFont({
  src: [
    {
      path: "../node_modules/@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2",
      style: "normal",
      weight: "100 900",
    },
    {
      path: "../node_modules/@fontsource-variable/fraunces/files/fraunces-latin-wght-italic.woff2",
      style: "italic",
      weight: "100 900",
    },
  ],
  variable: "--font-fraunces",
  display: "swap",
});

export const instrument = localFont({
  src: [
    {
      path: "../node_modules/@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2",
      style: "normal",
      weight: "400 700",
    },
  ],
  variable: "--font-instrument",
  display: "swap",
});
