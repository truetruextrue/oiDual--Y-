/*<script>*/
/* KOBLLUX · Inline Loader */

(function () {
  const BASE =
    "https://kodux78k.github.io/oiDual--Y-/M0D/kob-DH0/js/m0ds/";

  const INLINE_INDEXES = [
    0, 1, 2, 3, 4,
    6, 8, 9,
    12,
    16, 17, 18,
    20, 21, 22,
    24, 25, 26, 27, 28, 29,
    30, 31,
    39
  ];

  INLINE_INDEXES.forEach(n => {
    const s = document.createElement("script");
    s.src = `${BASE}inline-${n}.js`;
    s.defer = true;
    document.head.appendChild(s);
  });
})();
/*</script>*/
