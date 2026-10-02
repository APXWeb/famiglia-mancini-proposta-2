// Headings rise line by line out of a mask. Each line's mask is a box with
// overflow: clip, as tall as the line; display type is set tight, so italic
// descenders and overhangs (the tail of a Q, a j, a final f) reach outside
// it. The masks get room around the glyphs, and once a heading has risen
// its masks stop clipping at all.
const ROOM = '0.12em';
const ROOM_BELOW = '0.28em';

export function revealHeadings(gsap, SplitText, selector) {
  document.querySelectorAll(selector).forEach((el) => {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit(self) {
        self.masks.forEach((mask) => {
          mask.style.padding = `0 ${ROOM} ${ROOM_BELOW}`;
          mask.style.margin = `0 -${ROOM} -${ROOM_BELOW}`;
        });
        return gsap.from(self.lines, {
          yPercent: 105,
          duration: 1.15,
          stagger: 0.09,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          onComplete: () => self.masks.forEach((mask) => { mask.style.overflow = 'visible'; }),
        });
      },
    });
  });
}
