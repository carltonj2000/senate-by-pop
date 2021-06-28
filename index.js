const fs = require("fs");

const abbrText = fs.readFileSync("abbreviations.txt", "utf-8");
const populationText = fs.readFileSync("population.txt", "utf-8");
const partyText = fs.readFileSync("senators.txt", "utf-8");

const abbr = abbrText
  .trim()
  .split("\n")
  .reduce((acc, line) => {
    const words = line.split(/\t+/);
    if (words.length < 3) return null;
    const state = words[0].trim().replace("[D]", "");
    const abbr = words[1].trim();
    const newAcc = { ...acc, [state]: abbr };
    return newAcc;
  }, {});

const population = populationText
  .trim()
  .split("\n")
  .reduce((a, line) => {
    const words = line.split(/\t+/);
    if (words.length < 3) return null;
    const state = words[2].trim();
    if (!abbr[state]) return a;
    return { ...a, [abbr[state]]: parseInt(words[3].replace(/,/g, "").trim()) };
  }, {});

const total = Object.values(population).reduce((a, v) => a + v);
//console.dir(population);
console.log("total", total);

const party = partyText
  .trim()
  .split("\n")
  .reduce((a, line) => {
    const words = line.match(/.+\((.)-(.{2})\).+/);
    const state = words[2];
    const party = words[1];
    if (a[state]) {
      return { ...a, [state]: [...a[state], party] };
    } else {
      return { ...a, [state]: [party] };
    }
  }, {});

//console.dir(party);

const popByParty = Object.keys(party).reduce(
  (a, k) => {
    const pop = population[k] / 2;
    const sPop = party[k].reduce(
      (a2, p) => {
        const D = p === "D" ? a2.D + pop : a2.D;
        const R = p === "R" ? a2.R + pop : a2.R;
        const I = p === "I" ? a2.I + pop : a2.I;
        return { R, D, I };
      },
      { R: 0, D: 0, I: 0 }
    );
    return { R: sPop.R + a.R, D: sPop.D + a.D, I: sPop.I + a.I };
  },
  { R: 0, D: 0, I: 0 }
);

console.dir(popByParty);
const { R, D } = popByParty;
console.log("Delta", D - R);

const percByParty = Object.keys(popByParty).reduce(
  (a, p) => ({ ...a, [p]: Math.round((100 * popByParty[p]) / total) }),
  {}
);

console.dir(percByParty);
