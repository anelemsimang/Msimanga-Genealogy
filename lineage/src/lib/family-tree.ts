/**
 * The Msimanga family tree — structured data.
 *
 * Source: "The Msimanga Family Tree — Okhokho Bethu Esiphuma Kubo (Our
 * Ancestors, From Whom We Descend)", an English translation and reorganisation
 * of the original isiXhosa family record compiled and circulated by
 * J.M. Mtatyana (Mangolong, P.O. Box 52, Mount Fletcher), tracing the
 * descendants of Hlomza Msimanga.
 *
 * This is a static, source-backed dataset used to render the interactive family
 * tree until the collaborative, database-backed people directory (Build Order
 * steps 2-6) is in place. Names are kept exactly as they appear in the record.
 *
 * Kinship conventions preserved from the source:
 *  - "Ma-" names (e.g. Mamashiya, Mankosi) are customary married names — a wife
 *    referred to by her own maiden clan name or the house she married into.
 *  - In-marrying wives are often identified by their father's house rather than
 *    a given name ("a daughter of the [X] house").
 */

export type Gender = "male" | "female" | "unknown";

export interface FamilyMember {
  /** Stable slug-style id, unique across the whole tree. */
  id: string;
  /** Full name as recorded in the source. */
  name: string;
  gender: Gender;
  /** Spouse / marriage description, kept in the source's phrasing. */
  spouse?: string;
  /** Ordering / honorific note, e.g. "eldest son", "last-born", "twins". */
  order?: string;
  /** Narrative note translated from the original record. */
  note?: string;
  /** Branch / house label this person heads, if any. */
  house?: string;
  children?: FamilyMember[];
}

export const familyTree: FamilyMember = {
  id: "hlomza",
  name: "Hlomza Msimanga",
  gender: "male",
  order: "The root ancestor",
  note: "Our ancestor, the one from whom we descend.",
  children: [
    {
      id: "mdleleni",
      name: "Mdleleni Msimanga",
      gender: "male",
      order: "The elder son",
    },
    {
      id: "mtatyana",
      name: "Mtatyana Msimanga",
      gender: "male",
      order: "The younger son",
      children: [
        {
          id: "mthwalo",
          name: "Mthwalo Msimanga",
          gender: "male",
          spouse: "Mamashiya (First House)",
          note: "Mthwalo and Mamashiya had seven children; each of the five sons founded his own house (branch) of the family.",
          children: [
            // ---------------- Branch 1 — House of Masole ----------------
            {
              id: "masole",
              name: "Masole Msimanga",
              gender: "male",
              order: "Eldest son",
              house: "Branch 1 — House of Masole",
              note: "The eldest son of Mthwalo, remembered as the senior house overall.",
              children: [
                {
                  id: "tomas",
                  name: "Tomas Msimanga",
                  gender: "male",
                  spouse: "Maradebe (of the Ntintyila house)",
                  children: [
                    { id: "bhambhatha-allen", name: "Bhambhatha Allen Msimanga", gender: "male" },
                    { id: "zakade-brownley", name: "Zakade Brownley Msimanga", gender: "male" },
                    { id: "rebecca", name: "Rebecca Msimanga", gender: "female" },
                    { id: "nozifo", name: "Nozifo Msimanga", gender: "female" },
                  ],
                },
                {
                  id: "mqobo",
                  name: "Mqobo Msimanga",
                  gender: "male",
                  children: [
                    { id: "ndubaza-mqobo", name: "Ndubaza Msimanga", gender: "male" },
                    { id: "qhingalendlala", name: "Qhingalendlala Msimanga", gender: "male" },
                  ],
                },
                {
                  id: "matyikita-johannes",
                  name: "Matyikita Johannes Msimanga",
                  gender: "male",
                  spouse: "Mamvemve (Magasela)",
                  children: [
                    { id: "themba", name: "Themba Msimanga", gender: "male" },
                    { id: "theemba-patrick", name: "Theemba Patrick Msimanga", gender: "male" },
                    { id: "mpofukazi-matyikita", name: "Mpofukazi Msimanga", gender: "female" },
                    { id: "mziwamadoda", name: "Mziwamadoda Msimanga", gender: "male" },
                    { id: "ntombhizonke", name: "Ntombhizonke Msimanga", gender: "female" },
                  ],
                },
                {
                  id: "mapatsana",
                  name: "Mapatsana Msimanga",
                  gender: "male",
                  spouse: "Maradebe (of the Makhambha house)",
                  children: [
                    { id: "nozizwe", name: "Nozizwe Msimanga", gender: "female" },
                    { id: "thulani-mapatsana", name: "Thulani Msimanga", gender: "male" },
                    { id: "bhekimpi", name: "Bhekimpi Msimanga", gender: "male" },
                    { id: "nokulima", name: "Nokulima Msimanga", gender: "female" },
                  ],
                },
                { id: "nomagqwetha", name: "Nomagqwetha Msimanga", gender: "female" },
                { id: "ntombhendala", name: "Ntombhendala Msimanga", gender: "female" },
              ],
            },

            // ---------------- Branch 2 — House of Ndlebe ----------------
            {
              id: "ndlebe",
              name: "Ndlebe Msimanga",
              gender: "male",
              order: "Second son",
              house: "Branch 2 — House of Ndlebe",
              spouse: "Mandlela (of the Mabutyana house)",
              children: [
                {
                  id: "charley",
                  name: "Charley Msimanga",
                  gender: "male",
                  spouse: "Mankosi (of the Ludidi house)",
                  children: [
                    { id: "bhani", name: "Bhani Msimanga", gender: "male" },
                    { id: "mketsemane", name: "Mketsemane Msimanga", gender: "male" },
                    { id: "ndubaza-charley", name: "Ndubaza Msimanga", gender: "male" },
                    { id: "khehle-mthwalo-melkom", name: "Khehle Mthwalo Melkom Msimanga", gender: "male" },
                    { id: "nomama", name: "Nomama Msimanga", gender: "female" },
                    { id: "lawukazi", name: "Lawukazi Msimanga", gender: "female" },
                  ],
                },
                { id: "ntebekazi-ndlebe", name: "Ntebekazi Msimanga", gender: "female" },
              ],
            },

            // ---------------- Branch 3 — House of Gaxa James ----------------
            {
              id: "gaxa-james",
              name: "Gaxa James Msimanga",
              gender: "male",
              order: "Third son",
              house: "Branch 3 — House of Gaxa James",
              note: "Gaxa James had eleven children.",
              children: [
                {
                  id: "mfanekiso-john",
                  name: "Mfanekiso John Msimanga",
                  gender: "male",
                  spouse: "Mathiyane",
                  children: [
                    { id: "mpofukazi-mfanekiso", name: "Mpofukazi Msimanga", gender: "female" },
                  ],
                },
                {
                  id: "gilbert-herdiga",
                  name: "Gilbert Herdiga Msimanga",
                  gender: "male",
                  spouse: "Mamtolo",
                  children: [
                    { id: "vuyani", name: "Vuyani Msimanga", gender: "male" },
                    { id: "nombhuyiselo", name: "Nombhuyiselo Msimanga", gender: "female" },
                    { id: "lex", name: "Lex Msimanga", gender: "male" },
                    { id: "thamsanqa-teh", name: "Thamsanqa (\u201cTeh\u201d) Msimanga", gender: "male" },
                    { id: "thoko", name: "Thoko Msimanga", gender: "female" },
                    { id: "mthwa-gilbert", name: "Mthwa Msimanga", gender: "male" },
                  ],
                },
                {
                  id: "athur-khaleni",
                  name: "Athur Khaleni Msimanga",
                  gender: "male",
                  spouse: "Mambhele",
                  children: [
                    { id: "nofika-gretta", name: "Nofika Gretta Msimanga", gender: "female" },
                    { id: "vusumzi", name: "Vusumzi Msimanga", gender: "male" },
                  ],
                },
                {
                  id: "leonard-gwegwe",
                  name: "Leonard Gwegwe Msimanga",
                  gender: "male",
                  spouse: "Matshawe",
                  children: [
                    { id: "popayi", name: "Popayi Msimanga", gender: "male" },
                    { id: "nomaqwa", name: "Nomaqwa Msimanga", gender: "female" },
                    { id: "bhuti-bhuti", name: "Bhuti-Bhuti Msimanga", gender: "male" },
                    { id: "welile", name: "Welile Msimanga", gender: "male" },
                  ],
                },
                {
                  id: "thabizolo-geshon",
                  name: "Thabizolo Geshon Msimanga",
                  gender: "male",
                  spouse: "Mazulu",
                  children: [
                    { id: "gcinumzi", name: "Gcinumzi Msimanga", gender: "male" },
                    { id: "thulani-thabizolo", name: "Thulani Msimanga", gender: "male" },
                    { id: "nomangesi", name: "Nomangesi Msimanga", gender: "female" },
                    { id: "nobathwa", name: "Nobathwa Msimanga", gender: "female" },
                    { id: "nonzizo", name: "Nonzizo Msimanga", gender: "female" },
                    { id: "neliswa", name: "Neliswa Msimanga", gender: "female" },
                    { id: "solomzi", name: "Solomzi Msimanga", gender: "male" },
                  ],
                },
                { id: "sarah-ntebekazi", name: "Sarah Ntebekazi Msimanga", gender: "female" },
                { id: "nomthandazo-paulina", name: "Nomthandazo Paulina Msimanga", gender: "female" },
                { id: "nomahlubi-viola", name: "Nomahlubi Viola Msimanga", gender: "female" },
                { id: "nonkosi-marlif", name: "Nonkosi Marlif Msimanga", gender: "female" },
                { id: "noshow-jubilia", name: "Noshow Jubilia Msimanga", gender: "female" },
                { id: "mwelase", name: "Mwelase Msimanga", gender: "male" },
              ],
            },

            // ---------------- Branch 4 — House of Mayifuthi ----------------
            {
              id: "mayifuthi",
              name: "Mayifuthi Msimanga",
              gender: "male",
              order: "Fourth son",
              house: "Branch 4 — House of Mayifuthi",
              spouse: "Mamndila",
              children: [
                {
                  id: "mbalekelwa",
                  name: "Mbalekelwa Msimanga",
                  gender: "male",
                  spouse: "Makhwange (of the Qwidlana house)",
                  note: "They had no children.",
                },
                {
                  id: "luke",
                  name: "Luke Msimanga",
                  gender: "male",
                  spouse: "Mankosi (of the Zibi house)",
                  children: [
                    { id: "zwelitsha", name: "Zwelitsha Msimanga", gender: "male" },
                    { id: "zwelidinile", name: "Zwelidinile Msimanga", gender: "male" },
                    { id: "bhabhini", name: "Bhabhini Msimanga", gender: "male", order: "Twin, born 2002" },
                    { id: "nqeyi", name: "Nqeyi Msimanga", gender: "male", order: "Last-born twin, born 2002" },
                  ],
                },
              ],
            },

            // ---------------- Branch 5 — House of Matshakeni ----------------
            {
              id: "matshakeni",
              name: "Matshakeni Mphuthunywa Msimanga",
              gender: "male",
              order: "Fifth and last-born son",
              house: "Branch 5 — House of Matshakeni",
              spouse: "Two houses: Mamazibuko (of the Fiva/Matatiele house) and Nomagusha / Makhesa (of the Mazulu house)",
              note: "Before marrying in his own right, Matshakeni took as his wife Mamazibuko, the widow of his late elder brother Masole — a customary duty toward his brother's household. Later, advised by Chief Lidziga of the Nyaniso house that he was not yet properly married, he married Nomagusha (Makhesa) of the Mazulu house, Ludidi/Matatiele — coming upon her in the pastures where she herself was herding sheep. His descendants therefore come from two houses.",
              children: [
                // 5A — with Mamazibuko
                {
                  id: "diniso",
                  name: "Diniso Msimanga",
                  gender: "male",
                  order: "House of Mamazibuko",
                  spouse: "Mankosi (of the Matyakalana house, Luphindo)",
                  children: [
                    {
                      id: "langalibalele",
                      name: "Langalibalele Msimanga",
                      gender: "male",
                      spouse: "Majuqu (of the Bhubesi house)",
                      children: [
                        { id: "thembinkosi", name: "Thembinkosi Msimanga", gender: "male" },
                        { id: "zoleka", name: "Zoleka Msimanga", gender: "female" },
                        { id: "nomfoko", name: "Nomfoko Msimanga", gender: "female" },
                        { id: "busisiwe", name: "Busisiwe Msimanga", gender: "female" },
                        { id: "sikhumbha", name: "Sikhumbha Msimanga", gender: "male" },
                      ],
                    },
                    {
                      id: "hluphekile",
                      name: "Hluphekile Msimanga",
                      gender: "female",
                      spouse: "Married into the Mtshizana family (Mangolong, Mount Fletcher)",
                      children: [
                        { id: "nomthandazo-hluphekile", name: "Nomthandazo Msimanga", gender: "female" },
                        { id: "mzuvukile", name: "Mzuvukile Msimanga", gender: "male" },
                        { id: "simphiwe-hluphekile", name: "Simphiwe Msimanga", gender: "male" },
                        { id: "nomawethu-hluphekile", name: "Nomawethu Msimanga", gender: "female" },
                      ],
                    },
                    {
                      id: "nomtutuluzi",
                      name: "Nomtutuluzi Msimanga",
                      gender: "female",
                      spouse: "Married into the Mdluli family",
                      note: "One child, a daughter.",
                    },
                  ],
                },
                { id: "matoyi", name: "Matoyi Msimanga", gender: "male", order: "House of Mamazibuko" },
                { id: "nomabhunga", name: "Nomabhunga Msimanga", gender: "female", order: "House of Mamazibuko" },
                { id: "ntombhezincane", name: "Ntombhezincane Msimanga", gender: "female", order: "House of Mamazibuko" },

                // 5B — with Nomagusha (Makhesa)
                {
                  id: "nomasongo-mirriam",
                  name: "Nomasongo Mirriam Msimanga",
                  gender: "female",
                  order: "House of Nomagusha (Makhesa)",
                  spouse: "Married into the Msindo family",
                  children: [
                    { id: "thembhekile", name: "Thembhekile Msimanga", gender: "male" },
                    { id: "khehleni", name: "Khehleni Msimanga", gender: "male" },
                    { id: "zwelinjani", name: "Zwelinjani Msimanga", gender: "male" },
                    { id: "khawulezile", name: "Khawulezile Msimanga", gender: "male" },
                    { id: "nkosinathi", name: "Nkosinathi Msimanga", gender: "male" },
                    { id: "zwelikhanyile", name: "Zwelikhanyile Msimanga", gender: "male" },
                  ],
                },
                {
                  id: "msuthwazana-elizabeth",
                  name: "Msuthwazana Elizabeth Msimanga",
                  gender: "female",
                  order: "House of Nomagusha (Makhesa)",
                  spouse: "Married into the Mjoli family (Kok's Hill, Mzimkhulu)",
                  children: [
                    { id: "thandiwe", name: "Thandiwe Msimanga", gender: "female" },
                    { id: "celiwe-liphelo", name: "Celiwe (\u201cLiphelo\u201d) Msimanga", gender: "female" },
                    { id: "march", name: "March Msimanga", gender: "male" },
                    { id: "zwelikhantile", name: "Zwelikhantile Msimanga", gender: "male" },
                    { id: "mfana", name: "Mfana Msimanga", gender: "male" },
                  ],
                },
                {
                  id: "mthusulwana-enock",
                  name: "Mthusulwana Enock Msimanga",
                  gender: "male",
                  order: "House of Nomagusha (Makhesa)",
                  spouse: "Maxaba (of the Nyakambi house, Luyengwe, Mount Frere)",
                  children: [
                    { id: "ndodomzo", name: "Ndodomzo Msimanga", gender: "male" },
                    { id: "mncedisi", name: "Mncedisi Msimanga", gender: "male" },
                    { id: "simphiwe-mthusulwana", name: "Simphiwe Msimanga", gender: "male" },
                    { id: "thamsanqa-mthusulwana", name: "Thamsanqa Msimanga", gender: "male" },
                    { id: "ntombhifikile", name: "Ntombhifikile Msimanga", gender: "female" },
                    { id: "ntombhovuyo", name: "Ntombhovuyo Msimanga", gender: "female" },
                  ],
                },
                {
                  id: "zithulele",
                  name: "Zithulele Msimanga",
                  gender: "male",
                  order: "House of Nomagusha (Makhesa)",
                  spouse: "Mambhele (of the Nduku house, Bubesi)",
                  children: [
                    { id: "nomawethu-zithulele", name: "Nomawethu Msimanga", gender: "female" },
                    { id: "hlomza-mthetheleli", name: "Hlomza Mthetheleli Msimanga", gender: "male" },
                    { id: "nikiwe", name: "Nikiwe Msimanga", gender: "female" },
                    { id: "siyabulela-gamawele", name: "Siyabulela (\u201cGamawele\u201d) Msimanga", gender: "male" },
                    { id: "bulelwa", name: "Bulelwa Msimanga", gender: "female" },
                  ],
                },
                {
                  id: "justice",
                  name: "Justice Msimanga",
                  gender: "male",
                  order: "House of Nomagusha (Makhesa)",
                  spouse: "Mamtolo (of the Majokweni house, Sidwadweni area, Tsolo)",
                  children: [
                    { id: "vuyokazi", name: "Vuyokazi Msimanga", gender: "female" },
                    { id: "phindiwe", name: "Phindiwe Msimanga", gender: "female" },
                  ],
                },
              ],
            },

            // Mthwalo's daughters
            { id: "nomalawu", name: "Nomalawu Msimanga", gender: "female", order: "Daughter of Mthwalo" },
            { id: "nomathokazi", name: "Nomathokazi Msimanga", gender: "female", order: "Daughter of Mthwalo" },
          ],
        },
      ],
    },
  ],
};

/** Attribution shown alongside the tree. */
export const familyTreeSource = {
  title: "Okhokho Bethu Esiphuma Kubo — Our Ancestors, From Whom We Descend",
  compiler: "J.M. Mtatyana",
  place: "Mangolong, P.O. Box 52, Mount Fletcher",
  note: "Translated into English and structured from the original isiXhosa family record. Whoever receives this record is asked to add any names that were forgotten or omitted, and to pass it on so others may share this knowledge.",
} as const;

/** Total number of people represented in the tree. */
export function countMembers(node: FamilyMember = familyTree): number {
  return 1 + (node.children?.reduce((sum, c) => sum + countMembers(c), 0) ?? 0);
}
