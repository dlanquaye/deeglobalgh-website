export type SchoolListSection =
  | "TEXTBOOKS"
  | "STATIONERY"
  | null;

export interface SchoolListItemWithSection {
  text: string;
  section: SchoolListSection;
}

export function splitSchoolListWithSections(
  text: string
): SchoolListItemWithSection[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) =>
      line.trim()
    )
    .filter(Boolean);

  const items:
    SchoolListItemWithSection[] = [];

  let currentItem = "";

  let section:
    SchoolListSection = null;

  /*
   * Some OCR layouts output all stationery names first,
   * then output their quantities vertically afterwards.
   *
   * Store the indexes of stationery rows that still have
   * no quantity so a later quantity block can be mapped
   * back to them in the original order.
   */
  const pendingStationeryItems:
    number[] = [];

  /*
   * True only when a separator after a stationery item
   * indicates that OCR has moved into a trailing quantity
   * / modifier block.
   *
   * This distinction is important because KG1 also has
   * inline continuations such as:
   *
   * G
   * (5)
   * Big Size
   *
   * Those must remain attached to the current item rather
   * than being distributed to later stationery rows.
   */
  let inStationeryContinuationBlock =
    false;

  function hasQuantity(
    value: string
  ): boolean {
    return (
      /\(\s*\d+\s*\)/.test(
        value
      ) ||
      /\b\d+\s*(?:reams?|packs?|pieces?|pcs?|boxes?|box|piece|pack)\b/i.test(
        value
      )
    );
  }

  function isExplicitQuantityOnly(
    value: string
  ): boolean {
    return (
      /^\(\s*\d+\s*\)$/.test(
        value
      ) ||
      /^\d+\s*(?:reams?|packs?|pieces?|pcs?|boxes?|box|piece|pack)(?:\s*\([^)]*\))?$/i.test(
        value
      ) ||
      /^\d+\s*pack\s*\/\s*\d+\s*pieces?$/i.test(
        value
      )
    );
  }

  function isBareNumericQuantity(
    value: string
  ): boolean {
    return /^\d+$/.test(
      value
    );
  }

  function isStationeryModifierOnly(
    value: string
  ): boolean {
    return (
      /^big\s+size$/i.test(
        value
      ) ||
      /^long\s+\d+$/i.test(
        value
      )
    );
  }

  function isInstructionLine(
    value: string
  ): boolean {
    return (
      /^nb\b/i.test(
        value
      ) ||
      /^please\b/i.test(
        value
      ) ||
      /^note\s*:/i.test(
        value
      ) ||
      /\brequired\s+to\s+purchase\b.*\bunder\s+listed\s+books\b/i.test(
        value
      ) ||
      /\bunder\s+listed\s+books\b.*\bbookshop\b/i.test(
        value
      )
    );
  }

  function isDocumentTitleLine(
    value: string
  ): boolean {
    return (
      /^kg\b.*books?\s*&\s*stationar.*list$/i.test(
        value
      ) ||
      /^books?\s*&\s*stationar.*list$/i.test(
        value
      ) ||
      /\bnext\s+term\b.*\bkindergarten\b/i.test(
        value
      )
    );
  }

  /*
   * Some photographed school lists contain no numbering and
   * no explicit "Text Books" heading. Google Vision still
   * preserves each printed book as its own OCR line.
   *
   * Example:
   *
   * Activities in numeracy - Masterman Series
   * Activities in OWOP - Essential Series
   * Comprehensive Reader - Excellence Series
   * Writing - Fun series
   *
   * Those are already complete book identities and must not
   * be concatenated merely because no numbered prefix exists.
   *
   * Keep this deliberately narrow: require a dash followed
   * somewhere by "Series". This avoids treating ordinary OCR
   * prose as separate products.
   */
  function isUnnumberedBookSeriesLine(
    value: string
  ): boolean {
    return /\s[-–—]\s.+\bseries\b/i.test(
      value
    );
  }

  function flushCurrentItem() {
    const value =
      currentItem.trim();

    if (!value) {
      currentItem = "";

      return;
    }

    const newIndex =
      items.length;

    items.push({
      text:
        value,

      section,
    });

    if (
      section ===
        "STATIONERY" &&
      !hasQuantity(
        value
      )
    ) {
      pendingStationeryItems.push(
        newIndex
      );
    }

    currentItem = "";
  }

  function appendToNextPendingStationery(
    value: string
  ): boolean {
    const pendingIndex =
      pendingStationeryItems.shift();

    if (
      pendingIndex ===
      undefined
    ) {
      return false;
    }

    /*
     * Convert a bare numeric OCR quantity into the
     * parenthesised form already understood by the
     * downstream quantity extractor.
     *
     * Example:
     *
     * Note one
     * 10
     *
     * becomes:
     *
     * Note one (10)
     */
    const continuation =
      isBareNumericQuantity(
        value
      )
        ? `(${value})`
        : value;

    items[pendingIndex] = {
      ...items[pendingIndex],

      text:
        `${items[pendingIndex].text} ${continuation}`.trim(),
    };

    return true;
  }

  for (
    const line of lines
  ) {
    /*
     * ==========================================
     * DOCUMENT TITLE
     * ==========================================
     */
    if (
      isDocumentTitleLine(
        line
      )
    ) {
      flushCurrentItem();

      continue;
    }

    /*
     * ==========================================
     * SECTION HEADINGS
     * ==========================================
     */
    if (
      /^text\s*books?$/i.test(
        line
      ) ||
      /^textbooks?$/i.test(
        line
      )
    ) {
      flushCurrentItem();

      section =
        "TEXTBOOKS";

      inStationeryContinuationBlock =
        false;

      continue;
    }

    /*
     * Accept both plain headings and descriptive
     * variants such as:
     *
     * Stationaries (All Stationaries for a Year)
     */
    if (
      /^stationar(?:y|ies|ys)(?:\s*\([^)]*\))?$/i.test(
        line
      ) ||
      /^stationeries(?:\s*\([^)]*\))?$/i.test(
        line
      )
    ) {
      flushCurrentItem();

      section =
        "STATIONERY";

      inStationeryContinuationBlock =
        false;

      continue;
    }

    /*
     * ==========================================
     * DOCUMENT INSTRUCTIONS
     * ==========================================
     *
     * These are customer instructions rather than
     * products to quote.
     *
     * Examples:
     *
     * NB Please all books must be covered.
     *
     * Pupils are required to purchase the under
     * listed books from any bookshop nearby.
     */
    if (
      isInstructionLine(
        line
      )
    ) {
      flushCurrentItem();

      continue;
    }

    /*
     * ==========================================
     * STANDALONE VISUAL SEPARATOR
     * ==========================================
     *
     * Use ASCII-only matching here to avoid the
     * previous source-file encoding corruption.
     *
     * Inside stationery, a separator after a current
     * item can indicate the start of a late vertical
     * quantity block. Flush the item so it joins the
     * pending stationery queue.
     */
    if (
      /^-+$/.test(
        line
      )
    ) {
      if (
        section ===
          "STATIONERY" &&
        currentItem
      ) {
        flushCurrentItem();

        if (
          pendingStationeryItems.length >
          0
        ) {
          inStationeryContinuationBlock =
            true;
        }
      }

      continue;
    }

    /*
     * ==========================================
     * NEW NUMBERED ITEM
     * ==========================================
     *
     * Require punctuation after the number.
     *
     * This prevents:
     *
     * 1 Ream
     * 2 packs
     *
     * from being interpreted as new numbered rows.
     */
    const numberedItemMatch =
      line.match(
        /^(\d+)[.)]\s*(.+)$/
      );

    if (
      numberedItemMatch
    ) {
      flushCurrentItem();

      currentItem =
        numberedItemMatch[2]
          .trim();

      /*
       * A newly numbered stationery row means we
       * are back in the main stationery list rather
       * than consuming a trailing quantity block.
       */
      if (
        section ===
        "STATIONERY"
      ) {
        inStationeryContinuationBlock =
          false;
      }

      continue;
    }

    /*
     * Ignore standalone author labels.
     */
    if (
      /^by\s*:/i.test(
        line
      )
    ) {
      continue;
    }

    /*
     * ==========================================
     * STATIONERY QUANTITY / MODIFIER
     * ==========================================
     */
    if (
      section ===
        "STATIONERY" &&
      (
        isExplicitQuantityOnly(
          line
        ) ||
        isBareNumericQuantity(
          line
        ) ||
        isStationeryModifierOnly(
          line
        )
      )
    ) {
      /*
       * INLINE MODE
       *
       * KG1 examples:
       *
       * G
       * (5)
       * Big Size
       *
       * Coloured Paper
       * 1 Ream
       *
       * When we still have a current numbered item and
       * have not entered a late quantity block, append
       * the continuation directly to that item.
       */
      if (
        currentItem &&
        !inStationeryContinuationBlock
      ) {
        const continuation =
          isBareNumericQuantity(
            line
          )
            ? `(${line})`
            : line;

        currentItem +=
          ` ${continuation}`;

        continue;
      }

      /*
       * LATE VERTICAL BLOCK
       *
       * KG2 example:
       *
       * Note one
       * Note Three
       * ...
       * Blue Pen
       * -
       * 10
       * 3
       * 5
       * ...
       *
       * Assign each continuation to the next pending
       * stationery row in original order.
       */
      if (
        appendToNextPendingStationery(
          line
        )
      ) {
        inStationeryContinuationBlock =
          true;

        continue;
      }

      continue;
    }

    /*
     * ==========================================
     * UNNUMBERED TEXTBOOK ROW
     * ==========================================
     *
     * Some school lists have no explicit textbook
     * heading or numbering. When OCR gives us a
     * complete "Title - Series" line, preserve that
     * line as its own textbook item.
     */
    if (
      section !==
        "STATIONERY" &&
      isUnnumberedBookSeriesLine(
        line
      )
    ) {
      flushCurrentItem();

      if (
        section ===
        null
      ) {
        section =
          "TEXTBOOKS";
      }

      items.push({
        text:
          line,

        section:
          "TEXTBOOKS",
      });

      continue;
    }

    /*
     * ==========================================
     * STRAY NUMERIC OCR NOISE
     * ==========================================
     *
     * Outside stationery, a standalone number such
     * as a handwritten price or OCR artefact is not
     * a safe school-list item.
     */
    if (
      section !==
        "STATIONERY" &&
      isBareNumericQuantity(
        line
      )
    ) {
      flushCurrentItem();

      continue;
    }

    /*
     * ==========================================
     * CONTINUATION OF CURRENT ITEM
     * ==========================================
     *
     * Handles ordinary OCR fragments such as:
     *
     * Writing Skills - Active Kids
     * (KG 2)
     */
    if (
      currentItem
    ) {
      currentItem +=
        ` ${line}`;

      continue;
    }

    /*
     * Preserve useful unnumbered content rather
     * than silently discarding it.
     */
    currentItem =
      line;
  }

  flushCurrentItem();

  return items;
}

export function splitSchoolList(
  text: string
): string[] {
  return splitSchoolListWithSections(
    text
  ).map(
    (item) =>
      item.text
  );
}