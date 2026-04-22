/*<script>*/
/* KOBLLUX · Inline Loader */

(function () {
  const BASE =
    "https://kodux78k.github.io/oiDual--Y-/M0D/HubUno/js/modules/";

  const INLINE_INDEXES = [
    0, 1, 2, 3, 4,
    6, 8, 9,10,11,
    12,13,14,15
    16, 17, 18,19

  ];

  INLINE_INDEXES.forEach(n => {
    const s = document.createElement("script");
    s.src = `${BASE}inline-${n}.js`;
    s.defer = true;
    document.head.appendChild(s);
  });
})();
/*</script>*/
