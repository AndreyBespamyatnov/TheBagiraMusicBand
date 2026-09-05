import type { ImageMetadata } from 'astro';
import amnesia from './covers/amnesia.jpg';
import amnesiaX from './covers/amnesia-x.jpg';
import andThunder from './covers/and-thunder.jpg';
import angels from './covers/angels-and-demons.jpg';
import basicInstinct from './covers/basic-instinct.jpg';
import blackMagic from './covers/black-magic.jpg';
import brother from './covers/brother.jpg';
import byTheBlood from './covers/by-the-blood.jpg';
import chaos from './covers/chaos-and-darkness.jpg';
import covered from './covers/covered-in-metal.jpg';
import fromRussia from './covers/from-russia.jpg';
import guardian from './covers/guardian-angel.jpg';
import iCame from './covers/i-came-i-saw.jpg';
import justDontLie from './covers/just-dont-lie.jpg';
import keepFace from './covers/keep-face.jpg';
import maski from './covers/maski.jpg';
import metelitsa from './covers/metelitsa.jpg';
import nePoPuti from './covers/ne-po-puti.jpg';
import nothingSacred from './covers/nothing-sacred.jpg';
import novogodnyaya from './covers/novogodnyaya.jpg';
import rockAndRoll from './covers/rock-and-roll.jpg';
import scars from './covers/scars.jpg';
import shadow from './covers/shadow.jpg';
import taboo from './covers/taboo.jpg';
import tabooAcoustic from './covers/taboo-acoustic.jpg';
import zoo from './covers/zoo.jpg';

export const covers: Record<string, ImageMetadata> = {
  metelitsa,
  'angels-and-demons': angels,
  'chaos-and-darkness': chaos,
  'i-came-i-saw': iCame,
  'ne-po-puti': nePoPuti,
  maski,
  'black-magic': blackMagic,
  'just-dont-lie': justDontLie,
  'taboo-acoustic': tabooAcoustic,
  'and-thunder': andThunder,
  'covered-in-metal': covered,
  novogodnyaya,
  'amnesia-x': amnesiaX,
  'keep-face': keepFace,
  'nothing-sacred': nothingSacred,
  'rock-and-roll': rockAndRoll,
  taboo,
  brother,
  'guardian-angel': guardian,
  'from-russia': fromRussia,
  zoo,
  'basic-instinct': basicInstinct,
  shadow,
  scars,
  'by-the-blood': byTheBlood,
  amnesia,
};
