import {
  describe,
  expect,
  it,
} from "vitest";

import {
  splitSchoolListWithSections,
} from "@/lib/ocr/splitSchoolList";

describe(
  "splitSchoolListWithSections",
  () => {
    it(
      "preserves textbook and stationery sections while keeping quantity continuations attached",
      () => {
        const text = `
KG (1) BOOKS & STATIONARIES LIST
Text Books
1. OWOP Golden Series
2. Creativity Masterman Arts (KG1)
3. Numeracy KG1 Active Kids
4. Writing Active Kids
5. Language & Literacy Masterman (KG1)
6. Phonics- Best Brain (KG 1)
7. Unique Field Kindertgen 2 Comprehension
Stationaries
1. Note One
(5)
2. Note Three
(3)
3. G
(5)
Big Size
4. Al
(8)
Big Size
5. D1
(5)
Big Size
6. Coloured Paped
1 Ream
7. Nataraj Pencil
2 packs
8. Eraser
10 pieces
9. Cutter
2 pieces
10. Poster Colour
-
1 box
11. Crayon
12. Ruler
13. Blue Pen
-
2 packs (big)
3 pieces
5 pieces
`;

        const result =
          splitSchoolListWithSections(
            text
          );

        expect(
          result
        ).toHaveLength(
          20
        );

        expect(
          result.slice(0, 7)
        ).toEqual([
          {
            text:
              "OWOP Golden Series",
            section:
              "TEXTBOOKS",
          },
          {
            text:
              "Creativity Masterman Arts (KG1)",
            section:
              "TEXTBOOKS",
          },
          {
            text:
              "Numeracy KG1 Active Kids",
            section:
              "TEXTBOOKS",
          },
          {
            text:
              "Writing Active Kids",
            section:
              "TEXTBOOKS",
          },
          {
            text:
              "Language & Literacy Masterman (KG1)",
            section:
              "TEXTBOOKS",
          },
          {
            text:
              "Phonics- Best Brain (KG 1)",
            section:
              "TEXTBOOKS",
          },
          {
            text:
              "Unique Field Kindertgen 2 Comprehension",
            section:
              "TEXTBOOKS",
          },
        ]);

        expect(
          result.slice(7)
        ).toEqual([
          {
            text:
              "Note One (5)",
            section:
              "STATIONERY",
          },
          {
            text:
              "Note Three (3)",
            section:
              "STATIONERY",
          },
          {
            text:
              "G (5) Big Size",
            section:
              "STATIONERY",
          },
          {
            text:
              "Al (8) Big Size",
            section:
              "STATIONERY",
          },
          {
            text:
              "D1 (5) Big Size",
            section:
              "STATIONERY",
          },
          {
            text:
              "Coloured Paped 1 Ream",
            section:
              "STATIONERY",
          },
          {
            text:
              "Nataraj Pencil 2 packs",
            section:
              "STATIONERY",
          },
          {
            text:
              "Eraser 10 pieces",
            section:
              "STATIONERY",
          },
          {
            text:
              "Cutter 2 pieces",
            section:
              "STATIONERY",
          },
          {
            text:
              "Poster Colour 1 box",
            section:
              "STATIONERY",
          },
          {
            text:
              "Crayon 2 packs (big)",
            section:
              "STATIONERY",
          },
          {
            text:
              "Ruler 3 pieces",
            section:
              "STATIONERY",
          },
          {
            text:
              "Blue Pen 5 pieces",
            section:
              "STATIONERY",
          },
        ]);
      }
    );

    it(
      "parses the real KG2 OCR into seven textbooks and fourteen stationery items without keeping the final instruction",
      () => {
        const text = `
KG (2) BOOKS & STATIONARIES LIST
Text Books
1. OWOP - Best Brain Series
2. Creativity Masterman Arts
3. Numeracy - Active Kids
4. Writing Skills - Active Kids
(KG 2)
5. Language & Literacy - Masterman (KG 2)
6. Phonics - Best Brain
-
7. Unique field – Comprehension (KG2)
Stationaries (All Stationaries for a Year)
1. Note one
2. Note Three
3. G - Big size
4. A1- Big size
5. D1- Big size
6. Coloured Paper
7. Nataraj Pencil
8. Eraser
9. Sharpener/cutter
10. Postal colour
11. Crayon
12. Ruler
13. Marker
14. Blue Pen
-
-
-
10
3
5
10
10
1 Ream
3 packs
2 packs
1 pack / 2 pieces
-
-
1 pack
Big Size
long 3
1 Packs
5 pieces
NB Please all books must be covered.
`;

        const result =
          splitSchoolListWithSections(
            text
          );

        expect(
          result
        ).toHaveLength(
          21
        );

        expect(
          result.filter(
            (item) =>
              item.section ===
              "TEXTBOOKS"
          )
        ).toHaveLength(
          7
        );

        expect(
          result.filter(
            (item) =>
              item.section ===
              "STATIONERY"
          )
        ).toHaveLength(
          14
        );

        expect(
          result.slice(0, 7)
        ).toEqual([
          {
            text:
              "OWOP - Best Brain Series",
            section:
              "TEXTBOOKS",
          },
          {
            text:
              "Creativity Masterman Arts",
            section:
              "TEXTBOOKS",
          },
          {
            text:
              "Numeracy - Active Kids",
            section:
              "TEXTBOOKS",
          },
          {
            text:
              "Writing Skills - Active Kids (KG 2)",
            section:
              "TEXTBOOKS",
          },
          {
            text:
              "Language & Literacy - Masterman (KG 2)",
            section:
              "TEXTBOOKS",
          },
          {
            text:
              "Phonics - Best Brain",
            section:
              "TEXTBOOKS",
          },
          {
            text:
              "Unique field – Comprehension (KG2)",
            section:
              "TEXTBOOKS",
          },
        ]);

        expect(
          result.slice(7)
        ).toEqual([
          {
            text:
              "Note one (10)",
            section:
              "STATIONERY",
          },
          {
            text:
              "Note Three (3)",
            section:
              "STATIONERY",
          },
          {
            text:
              "G - Big size (5)",
            section:
              "STATIONERY",
          },
          {
            text:
              "A1- Big size (10)",
            section:
              "STATIONERY",
          },
          {
            text:
              "D1- Big size (10)",
            section:
              "STATIONERY",
          },
          {
            text:
              "Coloured Paper 1 Ream",
            section:
              "STATIONERY",
          },
          {
            text:
              "Nataraj Pencil 3 packs",
            section:
              "STATIONERY",
          },
          {
            text:
              "Eraser 2 packs",
            section:
              "STATIONERY",
          },
          {
            text:
              "Sharpener/cutter 1 pack / 2 pieces",
            section:
              "STATIONERY",
          },
          {
            text:
              "Postal colour 1 pack",
            section:
              "STATIONERY",
          },
          {
            text:
              "Crayon Big Size",
            section:
              "STATIONERY",
          },
          {
            text:
              "Ruler long 3",
            section:
              "STATIONERY",
          },
          {
            text:
              "Marker 1 Packs",
            section:
              "STATIONERY",
          },
          {
            text:
              "Blue Pen 5 pieces",
            section:
              "STATIONERY",
          },
        ]);

        expect(
          result.some(
            (item) =>
              /please all books must be covered/i.test(
                item.text
              )
          )
        ).toBe(
          false
        );
      }
    );
  }
);