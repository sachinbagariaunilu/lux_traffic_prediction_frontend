"use client";

import type { ComponentProps } from "react";

/**
 * A date field whose calendar opens from ANYWHERE in the box.
 *
 * Browsers only open the native picker when the small calendar glyph is hit --
 * a ~16px target at the right edge of a control that is otherwise full width.
 * Clicking the other 95% puts a caret into a segmented text field instead,
 * which reads as the widget being broken rather than as a second input mode.
 *
 * showPicker() is the supported way to ask for it, and it is deliberately
 * fragile: it throws without a user gesture, and throws in a cross-origin
 * frame. Guarded, so a browser that refuses falls back to exactly the behaviour
 * every browser had before showPicker existed -- the field still types, still
 * validates, still honours min/max.
 *
 * CLICK ONLY, never focus. Opening on focus would fire when the field is
 * reached by Tab, putting a picker over the page of someone who was heading
 * somewhere else entirely.
 */
export default function DateInput(props: ComponentProps<"input">) {
  return (
    <input
      {...props}
      type="date"
      onClick={(e) => {
        props.onClick?.(e);
        try {
          e.currentTarget.showPicker();
        } catch {
          /* unsupported or not user-activated -- typing still works */
        }
      }}
    />
  );
}
